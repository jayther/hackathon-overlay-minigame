const { createServer } = require('http');
const https = require('https');
const express = require('express');
const fs = require('fs-extra');

const { bindAndLog } = require('./utils/LogUtils');
const logger = require('./utils/logger');
const { defaultPlayer } = require('./PlayerManager');
const { defaultBattleSettings } = require('./BattleManager');
const { defaultRewardSettings } = require('./RewardManager');
const { objToParams } = require('../shared/ObjectUtils');

const { twitchApiScopes, socketEvents } = require('./consts');
const globalEmitter = require('./utils/GlobalEmitter');
const appActions = require('../shared/AppActions');

const { SetupError } = require('./errors');
const changeMethods = require('../shared/ChangeMethods');

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

class SetupManager {
  constructor(settings, files, socketManager) {
    this.settings = settings;
    this.files = files;
    this.socketManager = socketManager;
    this.app = null;
    this.server = null;

    globalEmitter.on(socketEvents.controlAdded, this.onControlSocket, this);
  }

  async init() {
    logger('Loading files...');
    for (const file of Object.values(this.files)) {
      await file.load();
    }

    if (!this.files.playerData.data.players) {
      this.files.playerData.data.players = [];
    }
    if (!this.files.playerData.data.changeGenderMethod) {
      this.files.playerData.data.genderMethod = changeMethods.chat;
    }
    if (!this.files.playerData.data.changeCharTypeMethod) {
      this.files.playerData.data.charTypeMethod = changeMethods.chat;
    }
    // populate missing props
    this.files.battleSettings.data = {
      ...defaultBattleSettings,
      ...this.files.battleSettings.data
    };
    this.files.rewardSettings.data = {
      ...defaultRewardSettings,
      ...this.files.rewardSettings.data
    };
    const players = this.files.playerData.data.players;
    for (let i = 0; i < players.length; i += 1) {
      players[i] = {
        ...defaultPlayer,
        ...players[i]
      };
    }
    // don't need to save, next save will include new props

    // check if project was even built
    try {
      await fs.access(this.settings.staticDir);
    } catch (e) {
      throw new Error(
        `SetupManager.init: Cannot access output directory ` +
        `(maybe npm run build was not run yet?)\n` +
        e.stack || e.message
      );
    }

    this.app = express();
    this.app.use(express.static(this.settings.staticDir));
    this.app.head('/authorize', (req, resp) => resp.status(200));
    this.app.head('/authorize-chatbot', (req, resp) => resp.status(200));
    this.app.get('/authorize', this.onGetAuthorize.bind(this));
    this.app.get('/authorize-chatbot', this.onGetAuthorizeChatBot.bind(this));
    this.app.get('/callback', this.onGetCallback.bind(this));
    this.app.get('/chatbot', this.onGetChatbot.bind(this));
    this.server = createServer(this.app);

    this.server.listen(this.settings.webPort);
    logger(`Webserver listening to (${this.settings.webPort})`);
  }

  onControlSocket(socket) {
    socket.on('appsetup', bindAndLog(this.onAppSetup, this));
  }

  isAppReady() {
    // force into boolean to prevent secret leak
    return !!(
      this.files.appSecrets &&
      this.files.appSecrets.data &&
      this.files.appSecrets.data.clientId &&
      this.files.appSecrets.data.clientSecret
    );
  }

  onGetAuthorize(req, resp) {
    const redirectUri = `http://localhost:${this.settings.webPort}/callback`;
    const query = objToParams({
      client_id: this.files.appSecrets.data.clientId,
      redirect_uri: encodeURIComponent(redirectUri),
      response_type: 'code',
      scope: twitchApiScopes.join('+')
    });
    resp.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    resp.redirect(`https://id.twitch.tv/oauth2/authorize?${query}`);
  }

  onGetAuthorizeChatBot(req, resp) {
    const redirectUri = `http://localhost:${this.settings.webPort}/chatbot`;
    const query = objToParams({
      client_id: this.files.appSecrets.data.clientId,
      redirect_uri: encodeURIComponent(redirectUri),
      response_type: 'code',
      scope: twitchApiScopes.join('+')
    });
    resp.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    resp.redirect(`https://id.twitch.tv/oauth2/authorize?${query}`);
  }

  async onGetCallback(req, resp) {
    try {
      const tokens = await this.fetchTokens(req, resp);
      this.files.userTokens.data = tokens;
      await this.files.userTokens.save();
      resp.send('User Authorized!').end();
      this.maybeEmitSetupAuthorized();
    } catch (e) {
      if (e.expected) {
        const msg = `callback error: ${e.message}`;
        resp.status(e.statusCode || 500).send(msg);
        logger(msg);
      } else {
        throw e;
      }
    }
  }

  async onGetChatbot(req, resp) {
    try {
      const tokens = await this.fetchTokens(req, resp);
      this.files.chatBotTokens.data = tokens;
      await this.files.chatBotTokens.save();
      resp.send('ChatBot Authorized!').end();
      this.maybeEmitSetupAuthorized();
    } catch (e) {
      if (e.expected) {
        const msg = `callback error: ${e.message}`;
        resp.status(e.statusCode || 500).send(msg);
        logger(msg);
      } else {
        throw e;
      }
    }
  }

  areUserTokensReady() {
    return !!(
      this.files.userTokens &&
      this.files.userTokens.data &&
      this.files.userTokens.data.accessToken
    );
  }

  areChatBotTokensReady() {
    return !!(
      this.files.chatBotTokens &&
      this.files.chatBotTokens.data &&
      this.files.chatBotTokens.data.accessToken
    );
  }

  areTokensReady() {
    return this.areUserTokensReady() && this.areChatBotTokensReady();
  }

  maybeEmitSetupAuthorized() {
    globalEmitter.emit(socketEvents.setupAuthorized);
  }

  async fetchTokens(req, resp) {
    resp.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    if (!req.query.code) {
      throw new SetupError(400, 'Missing code parameter');
    }
    const code = req.query.code;
    const query = objToParams({
      client_id: this.files.appSecrets.data.clientId,
      client_secret: this.files.appSecrets.data.clientSecret,
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
      throw new SetupError(tokensResponse.status, `${tokensResponse.status} error: ${tokensResponse.message}`);
    }
    if (!tokensResponse.access_token) {
      throw new SetupError(400, 'Missing access_token');
    }
    if (!tokensResponse.refresh_token) {
      throw new SetupError(400, 'Missing refresh_token');
    }
    const tokensData = {
      accessToken: tokensResponse.access_token,
      refreshToken: tokensResponse.refresh_token,
      expiryTimestamp: tokensResponse.expires_in ? (new Date()).getTime() + (tokensResponse.expires_in * 1000) : null
    };
    return tokensData;
  }

  async onAppSetup(clientId, clientSecret) {
    this.files.appSecrets.data = {
      clientId,
      clientSecret
    };
    logger('Received app secrets');
    await this.files.appSecrets.save();
    this.socketManager.allEmit(appActions.updateApp, this.isAppReady());
  }
}

module.exports = SetupManager;
