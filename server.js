const fs = require('fs-extra');
const socketIO = require('socket.io');
const { Server } = require('socket.io');
const express = require('express');
const { createServer } = require('http');
const https = require('https');
const { ApiClient } = require('twitch');
const { EventSubListener } = require('twitch-eventsub');
const { NgrokAdapter } = require('twitch-eventsub-ngrok');
const { ClientCredentialsAuthProvider, RefreshableAuthProvider, StaticAuthProvider } = require('twitch-auth');
const logger = require('./src-server/logger');
const appActions = require('./src-shared/AppActions');

const appSecretsPath = './.appsecrets.json';
const userTokensPath = './.usertokens.json';

const twitchApiScopes = [
  'channel:read:redemptions',
  'channel:manage:redemptions',
  'chat:edit',
  'chat:read'
];

function objToParams(obj) {
  const paramParts = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === null) {
      paramParts.push(key);
    } else {
      paramParts.push(`${key}=${value}`);
    }
  }
  return paramParts.join('&');
}

function httpsRequest(params, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(params, resp => {
      if (resp.statusCode < 200 || resp.statusCode >= 300) {
        return reject(new Error(`status code: ${resp.statusCode}`));
      }
      let responseBody = '';
      resp.on('data', chunk => responseBody += chunk);
      resp.on('end', () => {
        try {
          const obj = JSON.parse(responseBody);
          resolve(obj);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', err => reject(err));
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

class ServerApp {
  constructor(settings) {
    this.settings = settings;
    this.appSecrets = null;
    this.userTokens = null;
    this.twitchUserClient = null;
    this.twitchAppClient = null;
    this.eventSub = null;
    this.user = null;
  }
  async init() {
    logger('Starting ServerApp');
    this.overlaySockets = [];
    this.controlSockets = [];

    if (await fs.pathExists(appSecretsPath)) {
      try {
        this.appSecrets = await fs.readJSON(appSecretsPath);
        logger('App secrets loaded');
      } catch (e) {
        logger(`Error occurred while loading app secrets: ${e.message}`);
      }
    } else {
      logger('No app secrets found');
    }

    if (await fs.pathExists(userTokensPath)) {
      try {
        this.userTokens = await fs.readJSON(userTokensPath);
        logger('User tokens loaded');
      } catch (e) {
        logger(`Error occurred while loading user tokens: ${e.message}`);
      }
    } else {
      logger('No user tokens found');
    }

    this.app = express();
    this.app.use(express.static(this.settings.staticDir));
    this.app.head('/authorize', (req, resp) => resp.status(200));
    this.app.get('/authorize', this.onGetAuthorize.bind(this));
    this.app.get('/callback', this.onGetCallback.bind(this));
    this.server = createServer(this.app);

    this.httpSocketServer = createServer();
    this.io = new Server(this.httpSocketServer, {
      cors: {
        origin: 'http://localhost:8080',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', this.onIOConnection.bind(this));
    this.server.listen(this.settings.webPort);
    logger(`Webserver listening to (${this.settings.webPort})`);
    this.httpSocketServer.listen(this.settings.socketPort);
    logger(`Server ready (sockets listening to ${this.settings.socketPort})`);
    await this.startTwitchUser();
    await this.startTwitchApp();
    await this.startEventSub();
  }

  onIOConnection(socket) {
    if (!socket.handshake.query) {
      logger('Missing socket query');
      return;
    }
    if (!socket.handshake.query.type) {
      logger('Missing type in socket query');
      return;
    }

    const socketType = socket.handshake.query.type;
    switch (socketType) {
      case 'overlay':
        this.addOverlaySocket(socket);
        logger('Overlay socket connected');
        break;
      case 'control':
        this.addControlSocket(socket);
        logger('Control socket connected');
        break;
      default:
        logger(`Type in socket query must be "overlay" or "control" (received ${socketType})`);
    }    
  }

  isAppReady() {
    // force into boolean to prevent secret leak
    return !!(this.appSecrets && this.appSecrets.clientId && this.appSecrets.clientSecret);
  }

  addOverlaySocket(socket) {
    socket.on('disconnect', reason => this.removeOverlaySocket(socket, reason));
    this.overlaySockets.push(socket);
    socket.emit(appActions.updateApp, this.isAppReady());
    socket.emit(appActions.updateEventSubReady, !!this.eventSub);
    socket.emit(appActions.updateUser, this.user);
  }

  removeOverlaySocket(socket, reason) {
    const index = this.overlaySockets.indexOf(socket);
    if (index === -1) {
      logger(`Attempted to remove a socket (id: ${socket.id}) that is not in overlaySockets (Reason: ${reason}`);
      return;
    }

    this.overlaySockets.splice(index, 1);
    logger(`Overlay socket (id: ${socket.id}) disconnected (Reason: ${reason})`);
  }

  addControlSocket(socket) {
    socket.on('disconnect', reason => this.removeControlSocket(socket, reason));
    socket.on('appsetup', this.onAppSetup.bind(this));
    this.controlSockets.push(socket);
    socket.emit(appActions.updateApp, this.isAppReady());
    socket.emit(appActions.updateEventSubReady, !!this.eventSub);
    socket.emit(appActions.updateUser, this.user);
  }

  removeControlSocket(socket, reason) {
    const index = this.controlSockets.indexOf(socket);
    if (index === -1) {
      logger(`Attempted to remove a socket (id: ${socket.id}) that is not in controlSockets (Reason: ${reason}`);
      return;
    }

    this.controlSockets.splice(index, 1);
    logger(`Control socket (id: ${socket.id}) disconnected (Reason: ${reason})`);
  }

  allEmit(eventName, ...data) {
    this.controlEmit(eventName, ...data);
    this.overlayEmit(eventName, ...data);
  }

  overlayEmit(eventName, ...data) {
    this.overlaySockets.forEach(socket => socket.emit(eventName, ...data));
  }

  controlEmit(eventName, ...data) {
    this.controlSockets.forEach(socket => socket.emit(eventName, ...data));
  }

  async onAppSetup(clientId, clientSecret) {
    this.appSecrets = {
      clientId,
      clientSecret
    };
    logger('Received app secrets');
    await fs.writeJSON(appSecretsPath, this.appSecrets);
    logger(`Written app secrets to ${appSecretsPath}`);
    this.controlEmit(appActions.updateApp, this.isAppReady());
  }

  onGetAuthorize(req, resp) {
    const redirectUri = `http://localhost:${this.settings.webPort}/callback`;
    const query = objToParams({
      client_id: this.appSecrets.clientId,
      redirect_uri: encodeURIComponent(redirectUri),
      response_type: 'code',
      scope: twitchApiScopes.join('+')
    });
    resp.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    resp.redirect(`https://id.twitch.tv/oauth2/authorize?${query}`);
  }

  async onGetCallback(req, resp) {
    resp.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    if (!req.query.code) {
      logger('Token callback: Missing code parameter');
      resp.send('Missing code parameter').status(400);
      return;
    }
    const code = req.query.code;
    const query = objToParams({
      client_id: this.appSecrets.clientId,
      client_secret: this.appSecrets.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: encodeURIComponent(`http://localhost:${this.settings.webPort}/callback`)
    });

    logger('Token callback: sending token request...');
    const tokensResponse = await httpsRequest({
      hostname: 'id.twitch.tv',
      path: `/oauth2/token?${query}`,
      method: 'POST'
    });
    
    if (tokensResponse.status && tokensResponse.status !== 200) {
      throw new Error(`${tokensResponse.status} error: ${tokensResponse.message}`);
    }
    if (!tokensResponse.access_token) {
      throw new Error('Missing access_token');
    }
    if (!tokensResponse.refresh_token) {
      throw new Error('Missing refresh_token');
    }
    const tokensData = {
      accessToken: tokensResponse.access_token,
      refreshToken: tokensResponse.refresh_token,
      expiryTimestamp: tokensResponse.expires_in ? (new Date()).getTime() + (tokensResponse.expires_in * 1000) : null
    };
    this.userTokens = tokensData;
    logger(`Writing tokens to ${userTokensPath}`);
    fs.writeJSON(userTokensPath, tokensData, 'UTF-8');
    logger(`Tokens written to ${userTokensPath}`);
    resp.send('Authorized!').end();
    await this.startTwitchUser();
    await this.startTwitchApp();
    await this.startEventSub();
  }

  async startTwitchUser() {
    if (!this.appSecrets) {
      logger('Cannot start twitch: no app secrets');
      return;
    }
    if (!this.userTokens) {
      logger('Cannot start twitch: no user tokens');
      return;
    }
    if (this.twitchUserClient) {
      logger('twitchUserClient already started');
      return;
    }
    logger('Starting twitch user...');
    const authProvider = new RefreshableAuthProvider(
      new StaticAuthProvider(this.appSecrets.clientId, this.userTokens.accessToken),
      {
        clientSecret: this.appSecrets.clientSecret,
        refreshToken: this.userTokens.refreshToken,
        onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
          const tokensData = {
            accessToken,
            refreshToken,
            expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
          };
          this.userTokens = tokensData;
          await fs.writeJSON(userTokensPath, tokensData, 'UTF-8');
          logger('User tokens refreshed');
        }
      }
    );
    this.twitchUserClient = new ApiClient({ authProvider });
    const twitchUser = await this.twitchUserClient.helix.users.getMe();
    this.user = {
      id: twitchUser.id,
      name: twitchUser.name,
      displayName: twitchUser.displayName,
      profilePictureUrl: twitchUser.profilePictureUrl
    };
    this.allEmit(appActions.updateUser, this.user);
    logger('Twitch User started');
  }

  async startTwitchApp() {
    if (!this.appSecrets) {
      logger('Cannot start twitch: no app secrets');
      return;
    }
    if (this.twitchAppClient) {
      logger('twitchAppClient already started');
      return;
    }
    logger('Starting twitch app...');
    const authProvider = new ClientCredentialsAuthProvider(this.appSecrets.clientId, this.appSecrets.clientSecret);
    this.twitchAppClient = new ApiClient({ authProvider });
    this.allEmit('updatetwitchapp', true);
    logger('Twitch App started');
  }

  async startEventSub() {
    if (!this.twitchAppClient) {
      logger(`Cannot start eventSub: twitchAppClient not ready`);
      return;
    }
    if (!this.user) {
      logger(`Cannot start eventSub: missing user (twitchUserClient started but did not get user details)`);
      return;
    }
    if (this.eventSub) {
      logger('eventSub already started');
      return;
    }
    logger('Starting eventSub...');
    this.eventSub = new EventSubListener(this.twitchAppClient, new NgrokAdapter());
    await this.eventSub.listen();
    logger('Removing old subscriptions...');
    await this.twitchAppClient.helix.eventSub.deleteAllSubscriptions();
    this.redeemSub = this.eventSub.subscribeToChannelRedemptionAddEvents(this.user.id, this.OnRedeem.bind(this));
    this.redeemUpdateSub = this.eventSub.subscribeToChannelRedemptionUpdateEvents(this.user.id, this.OnRedeemUpdate.bind(this));
    this.allEmit(appActions.updateEventSubReady, !!this.eventSub);
    logger('eventSub started');
  }

  async OnRedeem(event) {
    const payload = {
      id: event.id,
      input: event.input,
      redeemedAt: event.redeemedAt.getTime(),
      rewardCost: event.rewardCost,
      rewardId: event.rewardId,
      rewardPrompt: event.rewardPrompt,
      rewardTitle: event.rewardTitle,
      status: event.status,
      userDisplayName: event.userDisplayName,
      userId: event.userId,
      userName: event.userName
    };
    logger(payload);
    this.allEmit(appActions.addRedeem, payload);
  }

  async OnRedeemUpdate(event) {
    const payload = {
      id: event.id,
      input: event.input,
      redemptionDate: event.redemptionDate.getTime(),
      rewardCost: event.rewardCost,
      rewardId: event.rewardId,
      rewardPrompt: event.rewardPrompt,
      rewardTitle: event.rewardTitle,
      status: event.status,
      userDisplayName: event.userDisplayName,
      userId: event.userId,
      userName: event.userName
    };
    logger(payload);
    this.allEmit(appActions.updateRedeem, payload);
  }
}

(async function () {
  const settings = await fs.readJSON('./settings.json');
  logger('loaded settings.json');
  const serverApp = new ServerApp(settings);
  await serverApp.init();
}());
