
const { ApiClient } = require('twitch');
const { EventSubListener } = require('twitch-eventsub');
const { NgrokAdapter } = require('twitch-eventsub-ngrok');
const {
  ClientCredentialsAuthProvider,
  RefreshableAuthProvider,
  StaticAuthProvider
} = require('twitch-auth');

const logger = require('./utils/logger');
const globalEmitter = require('./utils/GlobalEmitter');
const appActions = require('../shared/AppActions');
const { socketEvents } = require('./consts');
const { ExpectedError } = require('./errors');

class TwitchManager {
  constructor(settings, files, socketManager) {
    this.settings = settings;
    this.files = files;
    this.socketManager = socketManager;

    this.userClient = null;
    this.appClient = null;
    this.eventSub = null;
    this.user = null;

    globalEmitter.on(socketEvents.overlayAdded, this.onOverlayAdded, this);
    globalEmitter.on(socketEvents.controlAdded, this.onControlAdded, this);
  }

  async init() {
    await this.startUserClient();
    await this.startAppClient();
    await this.startEventSub();
    logger('Twitch services ready');
  }

  onOverlayAdded(socket) {
    socket.emit(appActions.updateApp, this.isAppReady());
    socket.emit(appActions.updateUser, this.user);
  }

  onControlAdded(socket) {
    socket.emit(appActions.updateApp, this.isAppReady());
    socket.emit(appActions.updateUser, this.user);
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

  areUserTokensReady() {
    return !!(
      this.files.userTokens &&
      this.files.userTokens.data &&
      this.files.userTokens.data.accessToken
    );
  }

  async startUserClient() {
    if (!this.isAppReady()) {
      throw new ExpectedError('Cannot start twitch: no app secrets');
    }
    if (!this.areUserTokensReady()) {
      throw new ExpectedError('Cannot start twitch: no user tokens');
    }
    if (this.userClient) {
      logger('userClient already started');
      return;
    }
    logger('Starting twitch user...');
    const authProvider = new RefreshableAuthProvider(
      new StaticAuthProvider(this.files.appSecrets.data.clientId, this.files.userTokens.data.accessToken),
      {
        clientSecret: this.files.appSecrets.data.clientSecret,
        refreshToken: this.files.userTokens.data.refreshToken,
        onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
          const tokensData = {
            accessToken,
            refreshToken,
            expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
          };
          this.files.userTokens.data = tokensData;
          await this.files.userTokens.save();
          logger('User tokens refreshed');
        }
      }
    );
    this.userClient = new ApiClient({ authProvider });
    const twitchUser = await this.userClient.helix.users.getMe();
    this.user = {
      id: twitchUser.id,
      name: twitchUser.name,
      displayName: twitchUser.displayName,
      profilePictureUrl: twitchUser.profilePictureUrl
    };
    this.socketManager.allEmit(appActions.updateUser, this.user);
    logger('Twitch User started');
  }
  
  async startAppClient() {
    if (!this.isAppReady()) {
      throw new ExpectedError('Cannot start twitch: no app secrets');
    }
    if (this.appClient) {
      throw new ExpectedError('appClient already started');
    }
    logger('Starting twitch app...');
    const authProvider = new ClientCredentialsAuthProvider(this.files.appSecrets.data.clientId, this.files.appSecrets.data.clientSecret);
    this.appClient = new ApiClient({ authProvider });
    this.socketManager.allEmit('updatetwitchapp', true);
    logger('Twitch App started');
  }

  async startEventSub() {
    if (!this.appClient) {
      throw new Error(`Cannot start eventSub: appClient not ready`);
    }
    if (!this.user) {
      throw new Error(`Cannot start eventSub: missing user (userClient started but did not get user details)`);
    }
    if (this.eventSub) {
      logger('eventSub already started');
      return;
    }
    logger('Starting eventSub...');
    this.eventSub = new EventSubListener(this.appClient, new NgrokAdapter());
    await this.eventSub.listen();
    logger('Removing old subscriptions...');
    await this.appClient.helix.eventSub.deleteAllSubscriptions();
    logger('eventSub started');
  }
}

module.exports = TwitchManager;
