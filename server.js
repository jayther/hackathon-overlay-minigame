const fs = require('fs-extra');
const { Server } = require('socket.io');
const express = require('express');
const { createServer } = require('http');
const https = require('https');
const { ApiClient } = require('twitch');
const { EventSubListener } = require('twitch-eventsub');
const { NgrokAdapter } = require('twitch-eventsub-ngrok');
const { ClientCredentialsAuthProvider, RefreshableAuthProvider, StaticAuthProvider } = require('twitch-auth');
const logger = require('./src/server/logger');
const JsonDataFile = require('./src/server/JsonDataFile');
const appActions = require('./src/shared/AppActions');
const requiredRewards = require('./src/shared/RequiredRewards');
const RandUtils = require('./src/shared/RandUtils');
const {
  characterTypes,
  characterGenders
} = require('./src/shared/CharacterParts');
const { waitForMS } = require('./src/shared/PromiseUtils');
const { has } = require('./src/shared/ObjectUtils');
const { pickExcept } = require('./src/shared/RandUtils');

const appSecretsPath = './.appsecrets.json';
const userTokensPath = './.usertokens.json';
const rewardMapPath = './.rewardmap.json';
const playerDataPath = './.playerdata.json';

const twitchApiScopes = [
  'channel:read:redemptions',
  'channel:manage:redemptions',
  'chat:edit',
  'chat:read'
];

const defaultPlayer = {
  userId: null,
  userName: null,
  userDisplayName: null,
  alive: false,
  debug: false,
  characterType: null,
  characterGender: null,
  weapon: false,
  wins: 0,
  draws: 0,
  losses: 0,
  battles: 0,
  winStreak: 0
};

const updateRedeemDelay = 1000; // ms

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

function rewardToObj(reward) {
  return {
    autoApproved: reward.autoApproved,
    cost: reward.cost,
    id: reward.id,
    isEnabled: reward.isEnabled,
    isInStock: reward.isInStock,
    isPaused: reward.isPaused,
    maxRedemptionsPerStream: reward.maxRedemptionsPerStream,
    maxRedemptionsPerUserPerStream: reward.maxRedemptionsPerUserPerStream,
    prompt: reward.propmt,
    redemptionsThisStream: reward.redemptionsThisStream,
    title: reward.title,
    userInputRequired: reward.userInputRequired
  };
}

function redeemToObj(redeem) {
  return {
    id: redeem.id,
    input: redeem.input,
    redeemedAt: redeem.redeemedAt ? redeem.redeemedAt.getTime() :
      redeem.redemptionDate ? redeem.redemptionDate.getTime() :
      0,
    rewardCost: redeem.rewardCost,
    rewardId: redeem.rewardId,
    rewardPrompt: redeem.rewardPrompt,
    rewardTitle: redeem.rewardTitle,
    status: redeem.status,
    userDisplayName: redeem.userDisplayName,
    userId: redeem.userId,
    userName: redeem.userName
  };
}

function filterAlivePlayers(player) {
  return player.alive;
}

function filterDebugPlayers(player) {
  return player.debug;
}

class ServerApp {
  constructor(settings) {
    this.settings = settings;
    this.appSecretsFile = new JsonDataFile(appSecretsPath);
    this.userTokensFile = new JsonDataFile(userTokensPath);
    this.rewardMapFile = new JsonDataFile(rewardMapPath);
    this.playerDataFile = new JsonDataFile(playerDataPath);
    this.twitchUserClient = null;
    this.twitchAppClient = null;
    this.eventSub = null;
    this.user = null;
    this.rewards = [];
    this.redeems = [];
    this.currentBattle = null;
    this.battleQueue = [];

    this.debugAutoRefund = false;
    
    this.rewardFuncMap = {};
    this.rewardFuncMap[requiredRewards.add.key] = this.addPlayer.bind(this);
  }
  async init() {
    logger('Starting ServerApp');
    this.overlaySockets = [];
    this.controlSockets = [];

    await this.appSecretsFile.load();
    await this.userTokensFile.load();
    await this.rewardMapFile.load();
    await this.playerDataFile.load();

    if (!this.playerDataFile.data.players) {
      this.playerDataFile.data.players = [];
    }
    // populate missing props
    const players = this.playerDataFile.data.players;
    for (let i = 0; i < players.length; i += 1) {
      players[i] = {
        ...defaultPlayer,
        ...players[i]
      };
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
    return !!(
      this.appSecretsFile &&
      this.appSecretsFile.data &&
      this.appSecretsFile.data.clientId &&
      this.appSecretsFile.data.clientSecret
    );
  }

  areUserTokensReady() {
    return !!(
      this.userTokensFile &&
      this.userTokensFile.data &&
      this.userTokensFile.data.accessToken
    );
  }

  addOverlaySocket(socket) {
    socket.on('disconnect', reason => this.removeOverlaySocket(socket, reason));
    this.overlaySockets.push(socket);
    socket.emit(appActions.updateApp, this.isAppReady());
    socket.emit(appActions.updateEventSubReady, !!this.eventSub);
    socket.emit(appActions.updateUser, this.user);
    socket.emit(appActions.allPlayers, this.playerDataFile.data.players.filter(filterAlivePlayers));
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
    socket.on(appActions.createReward, this.onSocketCreateReward.bind(this));
    socket.on(appActions.setRewardToAction, this.onSocketSetRewardToAction.bind(this));
    socket.on(appActions.createRewardForAction, this.onSocketCreateRewardForAction.bind(this));
    socket.on(appActions.removePlayer, this.onSocketRemovePlayer.bind(this));
    socket.on(appActions.updateDebugAutoRefund, this.onSocketUpdateDebugAutoRefund.bind(this));
    socket.on(appActions.updatePlayer, this.onSocketUpdatePlayer.bind(this));
    socket.on(appActions.addDebugPlayer, this.onSocketAddDebugPlayer.bind(this));
    socket.on(appActions.clearDebugPlayers, this.onSocketClearDebugPlayers.bind(this));
    socket.on(appActions.requestBattle, this.onSocketRequestBattle.bind(this));
    socket.on(appActions.startBattle, this.startBattle.bind(this));
    socket.on(appActions.cancelBattle, this.cancelBattle.bind(this));
    this.controlSockets.push(socket);
    socket.emit(appActions.updateApp, this.isAppReady());
    socket.emit(appActions.updateEventSubReady, !!this.eventSub);
    socket.emit(appActions.updateUser, this.user);
    socket.emit(appActions.updateRewards, this.getRewardObjs());
    socket.emit(appActions.allRedeems, this.getRedeemObjs());
    socket.emit(appActions.updateRewardMap, this.rewardMapFile.data);
    socket.emit(appActions.allPlayers, this.playerDataFile.data.players.filter(filterAlivePlayers));
    socket.emit(appActions.updateDebugAutoRefund, this.debugAutoRefund);
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
    this.appSecretsFile.data = {
      clientId,
      clientSecret
    };
    logger('Received app secrets');
    await this.appSecretsFile.save();
    this.allEmit(appActions.updateApp, this.isAppReady());
  }

  onGetAuthorize(req, resp) {
    const redirectUri = `http://localhost:${this.settings.webPort}/callback`;
    const query = objToParams({
      client_id: this.appSecretsFile.data.clientId,
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
      client_id: this.appSecretsFile.data.clientId,
      client_secret: this.appSecretsFile.data.clientSecret,
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
    this.userTokensFile.data = tokensData;
    logger(`Writing tokens to ${userTokensPath}`);
    await this.userTokensFile.save();
    resp.send('Authorized!').end();
    await this.startTwitchUser();
    await this.startTwitchApp();
    await this.startEventSub();
  }

  async startTwitchUser() {
    if (!this.isAppReady()) {
      logger('Cannot start twitch: no app secrets');
      return;
    }
    if (!this.areUserTokensReady()) {
      logger('Cannot start twitch: no user tokens');
      return;
    }
    if (this.twitchUserClient) {
      logger('twitchUserClient already started');
      return;
    }
    logger('Starting twitch user...');
    const authProvider = new RefreshableAuthProvider(
      new StaticAuthProvider(this.appSecretsFile.data.clientId, this.userTokensFile.data.accessToken),
      {
        clientSecret: this.appSecretsFile.data.clientSecret,
        refreshToken: this.userTokensFile.data.refreshToken,
        onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
          const tokensData = {
            accessToken,
            refreshToken,
            expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
          };
          this.userTokensFile.data = tokensData;
          await this.userTokensFile.save();
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
    this.rewards = await this.twitchUserClient.helix.channelPoints.getCustomRewards(this.user.id);
    this.controlEmit(appActions.updateRewards, this.rewards);
    logger('Twitch User started');
  }

  async startTwitchApp() {
    if (!this.isAppReady()) {
      logger('Cannot start twitch: no app secrets');
      return;
    }
    if (this.twitchAppClient) {
      logger('twitchAppClient already started');
      return;
    }
    logger('Starting twitch app...');
    const authProvider = new ClientCredentialsAuthProvider(this.appSecretsFile.data.clientId, this.appSecretsFile.data.clientSecret);
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
    logger('Subscribing to reward add events...');
    this.rewardAddSub = await this.eventSub.subscribeToChannelRewardAddEvents(this.user.id, this.onRewardAdd.bind(this));
    logger('Subscribing to reward remove events...');
    this.rewardRemoveSub = await this.eventSub.subscribeToChannelRewardRemoveEvents(this.user.id, this.onRewardRemove.bind(this));
    logger('Subscribing to reward update events...');
    this.rewardUpdteSub = await this.eventSub.subscribeToChannelRewardUpdateEvents(this.user.id, this.onRewardUpdate.bind(this));
    logger('Subscribing to redeem add events...');
    this.redeemSub = await this.eventSub.subscribeToChannelRedemptionAddEvents(this.user.id, this.onRedeem.bind(this));
    logger('Subscribing to redeem update events...');
    this.redeemUpdateSub = await this.eventSub.subscribeToChannelRedemptionUpdateEvents(this.user.id, this.onRedeemUpdate.bind(this));
    this.allEmit(appActions.updateEventSubReady, !!this.eventSub);
    logger('eventSub started');
  }

  /**
   * update redeem
   * @param {string} rewardId 
   * @param {(string|string[])} redeemIds 
   * @param {('CANCELED'|'FULFILLED')} status 
   * @param {boolean} [immediate=false]
   */
  async updateRedeem(rewardId, redeemIds, status, immediate = false) {
    if (!rewardId) {
      throw new Error('updateRedeem: missing rewardId');
    }
    if (!redeemIds) {
      throw new Error('updateRedeem: missing redeemIds');
    }
    const redeemIdsType = typeof redeemIds;
    if (redeemIdsType !== 'string' && !Array.isArray(redeemIds)) {
      throw new Error('updateRedeem: redeemIds must be string or array of strings');
    }
    const ids = redeemIdsType === 'string' ? [redeemIds] : redeemIds;
    const useStatus = this.debugAutoRefund ? 'CANCELED' : status;
    if (!immediate) {
      await waitForMS(updateRedeemDelay);
    }
    return await this.twitchUserClient.helix.channelPoints.updateRedemptionStatusByIds(this.user.id, rewardId, ids, useStatus);
  }

  getPlayer(userId) {
    return this.playerDataFile.data.players.find(player => userId === player.userId);
  }

  getRewardIdFromAction(actionKey) {
    for (let [rewardId, k] of Object.entries(this.rewardMapFile.data)) {
      if (k === actionKey) {
        return rewardId;
      }
    }
    return null;
  }

  async onSocketCreateReward(data) {
    await this.twitchUserClient.helix.channelPoints.createCustomReward(this.user.id, data);
  }

  async onRewardAdd(event) {
    this.rewards.push(event);
    this.controlEmit(appActions.updateRewards, this.rewards.map(rewardToObj));
  }

  async onRewardRemove(event) {
    for (let i = this.rewards.length - 1; i >= 0; i -= 1) {
      if (this.rewards[i].id === event.id) {
        this.rewards.splice(i, 1);
        break;
      }
    }
    this.controlEmit(appActions.updateRewards, this.rewards.map(rewardToObj));
  }

  async onRewardUpdate(event) {
    for (let i = 0; i < this.rewards.length; i += 1) {
      if (this.rewards[i].id === event.id) {
        this.rewards[i] = event;
        break;
      }
    }
  }

  async onRedeem(event) {
    const payload = redeemToObj(event);
    this.redeems.push(event);
    const action = this.rewardMapFile.data[event.rewardId];
    if (action && this.rewardFuncMap[action]) {
      this.rewardFuncMap[action](event);
    }
    this.allEmit(appActions.addRedeem, payload);
  }

  async onRedeemUpdate(event) {
    const payload = redeemToObj(event);
    for (let i = 0; i < this.redeems.length; i += 1) {
      if (this.redeems[i].id === event.id) {
        this.redeems[i] = event;
        break;
      }
    }
    this.allEmit(appActions.updateRedeem, payload);
  }

  async onSocketCreateRewardForAction(data, actionKey) {
    logger(`Creating reward for action "${actionKey}"...`);
    const reward = await this.twitchUserClient.helix.channelPoints.createCustomReward(this.user.id, data);
    this.rewardMapFile.data[reward.id] = actionKey;
    logger(`Created reward for action "${actionKey}"`);
    await this.rewardMapFile.save();
    this.controlEmit(appActions.updateRewardMap, this.rewardMapFile.data);
  }

  async onSocketSetRewardToAction(rewardId, actionKey) {
    if (actionKey) {
      this.rewardMapFile.data[rewardId] = actionKey;
      logger(`Set reward "${rewardId}" to action "${actionKey}"`);
    } else {
      const prevActionKey = this.rewardMapFile.data[rewardId];
      delete this.rewardMapFile.data[rewardId];
      logger(`Unset reward "${rewardId}" from action "${prevActionKey}`);
    }
    await this.rewardMapFile.save();
    this.controlEmit(appActions.updateRewardMap, this.rewardMapFile.data);
  }

  async onSocketRemovePlayer(userId) {
    const player = this.getPlayer(userId);
    if (!player) {
      logger(`onSocketRemovePlayer: "${userId}" not in player data`);
      return;
    }
    if (!player.alive) {
      logger(`onSocketRemovePlayer: "${player.userDisplayName}" not in arena`);
      return;
    }
    logger(`onSocketRemovePlayer: Removing "${player.userDisplayName}" from arena`);
    player.alive = false;
    await this.playerDataFile.save();
    this.allEmit(appActions.removePlayer, player);
  }

  async onSocketUpdateDebugAutoRefund(value) {
    this.debugAutoRefund = value;
    logger(`Set debugAutoRefund to ${value}`);
    this.controlEmit(appActions.updateDebugAutoRefund, this.debugAutoRefund);
  }

  async onSocketUpdatePlayer(userId, data) {
    const player = this.getPlayer(userId);
    if (!player) {
      logger(`onSocketUpdatePlayer: "${userId}" not in player data`);
      return;
    }
    const entries = Object.entries(data);
    const changesMsg = entries.map(([key, value]) => `"${key}": ${value}`).join('; ');
    logger(`onSocketUpdatePlayer: "${player.userDisplayName}" updating: ${changesMsg}`);

    entries.forEach(([key, value]) => {
      if (has(player, key)) {
        player[key] = value;
      }
    });
    
    await this.playerDataFile.save();
    this.allEmit(appActions.updatePlayer, player);
  }

  getRewardObjs() {
    return this.rewards.map(rewardToObj);
  }

  getRedeemObjs() {
    return this.redeems.map(redeemToObj);
  }

  async addPlayer(event) {
    let player = this.getPlayer(event.userId);
    if (player && player.userId === event.userId && player.alive) {
      // delayed refund
      this.updateRedeem(event.rewardId, event.id, 'CANCELED');
      // TODO send "error" to chat
      logger(`addPlayer: "${player.userName}" already alive in game`);
      return;
    }
    if (player) {
      player.userName = event.userName;
      player.userDisplayName = event.userDisplayName;
      player.alive = true;
      logger(`addPlayer: "${player.userName}" set to alive`);
    } else {
      player = {
        ...defaultPlayer,
        userId: event.userId,
        userName: event.userName,
        userDisplayName: event.userDisplayName,
        alive: true,
        characterType: RandUtils.pick(characterTypes),
        characterGender: RandUtils.pick(characterGenders)
      };
      this.playerDataFile.data.players.push(player);
      logger(`addPlayer: "${player.userName}" created`);
    }

    // delayed consume
    this.updateRedeem(event.rewardId, event.id, 'FULFILLED');

    await this.playerDataFile.save();

    this.allEmit(appActions.addPlayer, player);
  }

  async requestBattle(event) {
    const player = this.getPlayer(event.userId);
    if (!player) {
      throw new Error(`requestBattle: "${event.userId}" not in player data`);
    }
    if (!player.alive) {
      throw new Error(`requestBattle: "${player.userDisplayName}" is not alive`);
    }
    this.battleQueue.push({
      id: event.id,
      rewardId: event.rewardId,
      userId: event.userId,
      userName: event.userName,
      userDisplayName: event.userDisplayName,
      debug: event.debug || false
    });
    this.controlEmit(appActions.updateBattleQueue, this.battleQueue);
  }
  async startBattle(eventId) {
    if (this.currentBattle) {
      throw new Error(`startBattle: Cannot start battle for "${player.userDisplayName}", battle in progress`);
    }

    const eventIndex = this.battleQueue.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error(`startBattle: Battle event "${eventId}" not found in queue`);
    }
    const event = this.battleQueue[eventIndex];
    const player = this.getPlayer(event.userId);
    if (!player) {
      throw new Error(`startBattle: "${event.userId}" not found in player data`);
    }
    if (!player.alive) {
      throw new Error(`startBattle: "${player.userDisplayName}" is not alive`);
    }
    const alivePlayers = this.playerDataFile.data.players.filter(filterAlivePlayers);
    if (alivePlayers.length < 2) {
      throw new Error(`startBattle: "${player.userDisplayName}" is the only one alive`);
    }

    if (!event.debug) {
      this.updateRedeem(event.rewardId, event.id, 'FULFILLED');
    }

    this.battleQueue.splice(eventIndex, 1);
    this.controlEmit(appActions.updateBattleQueue, this.battleQueue);
    const otherPlayer = pickExcept(alivePlayers, player);
    this.currentBattle = [player.userId, otherPlayer.userId];
    this.allEmit(appActions.updateBattle, this.currentBattle);
  }

  async cancelBattle(eventId) {
    const eventIndex = this.battleQueue.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error(`cancelBattle: "${eventId}" not in queue`);
    }
    const event = this.battleQueue[eventIndex];
    this.battleQueue.splice(eventIndex, 1);
    if (!event.debug) {
      this.updateRedeem(event.rewardId, event.id, 'CANCELED');
    }
    this.controlEmit(appActions.updateBattleQueue, this.battleQueue);
  }

  async finishBattle(winnerUserId, loserUserId) {
    if (!this.currentBattle) {
      // battle may have been removed on server side before widget battle ended
      this.allEmit(appActions.updateBattle, null);
      return;
    }
    const winner = this.getPlayer(winnerUserId);
    if (!winner) {
      logger(`finishBattle: "${winnerUserId}" winner not in player data`);
      return;
    }
    const loser = this.getPlayer(loserUserId);
    if (!loser) {
      logger(`finishBattle: "${loserUserId}" loser not in player data`);
      return;
    }
    winner.wins += 1;
    winner.winStreak += 1;
    winner.battles += 1;
    loser.losses += 1;
    loser.winStreak = 0;
    loser.battles += 1;
    loser.alive = false;
    logger(`finishBattle: "${winner.userDisplayName}" won against "${loser.userDisplayName}"`);
    await this.playerDataFile.save();
    this.allEmit(appActions.updatePlayer, winner);
    this.allEmit(appActions.updatePlayer, loser);
  }

  async onSocketAddDebugPlayer() {
    let player = this.playerDataFile.data.players.filter(filterDebugPlayers).find(p => !p.alive);
    if (player) {
      player.alive = true;
      logger(`addDebugPlayer: "${player.userName}" respawned`);
    } else {
      const date = new Date();
      const timeStr = date.getTime().toString();
      const userId = `debug-${timeStr}`;
      const userName = `db-${timeStr.substr(timeStr.length - 6)}`;
      const userDisplayName = userName;
      player = {
        ...defaultPlayer,
        userId,
        userName,
        userDisplayName,
        alive: true,
        characterType: RandUtils.pick(characterTypes),
        characterGender: RandUtils.pick(characterGenders),
        debug: true
      };
      this.playerDataFile.data.players.push(player);
      logger(`addDebugPlayer: "${player.userName}" created`);
    }

    await this.playerDataFile.save();

    this.allEmit(appActions.addPlayer, player);
  }

  async onSocketClearDebugPlayers() {
    const indexes = [], alivePlayers = [];
    this.playerDataFile.data.players.forEach((player, i) => {
      if (player.debug) {
        indexes.push(i);
        if (player.alive) {
          player.alive = false;
          alivePlayers.push(player);
        }
      }
    });
    for (let i = indexes.length - 1; i >= 0; i -= 1) {
      this.playerDataFile.data.players.splice(indexes[i], 1);
    }
    logger('clearDebugPlayers: Cleared all debug players');
    await this.playerDataFile.save();
    alivePlayers.forEach(player => this.allEmit(appActions.removePlayer, player));
  }

  async onSocketRequestBattle(userId) {
    const player = this.getPlayer(userId);
    if (!player) {
      logger(`onSocketRequestBattle: "${userId}" not found in player data`);
    }
    try {
      const date = new Date();
      await this.requestBattle({
        id: `debug-${userId}-${date.getTime()}`,
        rewardId: this.getRewardIdFromAction(requiredRewards.add.key),
        userId,
        userName: player.userName,
        userDisplayName: player.userDisplayName,
        debug: true
      });
    } catch (e) {
      logger(`onSocketRequestBattle: Error occurred: ${e.message}`);
    }
  }
}

(async function () {
  const settings = await fs.readJSON('./settings.json');
  logger('loaded settings.json');
  const serverApp = new ServerApp(settings);
  await serverApp.init();
}());
