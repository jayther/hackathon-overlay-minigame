const fs = require('fs-extra');
const logger = require('./src/server/utils/logger');
const { bindAndLog, maybeExpectedError } = require('./src/server/utils/LogUtils');
const JsonDataFile = require('./src/server/JsonDataFile');
const SocketManager = require('./src/server/SocketManager');
const SetupManager = require('./src/server/SetupManager');
const TwitchManager = require('./src/server/TwitchManager');
const ChatBotManager = require('./src/server/ChatBotManager');
const RewardManager = require('./src/server/RewardManager');
const PlayerManager = require('./src/server/PlayerManager');
const BattleManager = require('./src/server/BattleManager');
const globalEmitter = require('./src/server/utils/GlobalEmitter');
const { socketEvents } = require('./src/server/consts');

const {
  appSecretsPath,
  userTokensPath,
  chatBotTokensPath,
  rewardMapPath,
  playerDataPath
} = require('./src/server/consts');

class ServerApp {
  constructor(settings) {
    this.settings = settings;
    this.files = {
      appSecrets: new JsonDataFile(appSecretsPath),
      userTokens: new JsonDataFile(userTokensPath),
      chatBotTokens: new JsonDataFile(chatBotTokensPath),
      rewardMap: new JsonDataFile(rewardMapPath),
      playerData: new JsonDataFile(playerDataPath)
    };
    this.socketManager = new SocketManager(settings);
    this.setupManager = new SetupManager(
      settings, this.files, this.socketManager
    );
    this.twitchManager = new TwitchManager(
      settings, this.files, this.socketManager
    );
    this.chatBotManager = new ChatBotManager(
      settings, this.files, this.socketManager, this.twitchManager
    );
    this.rewardManager = new RewardManager(
      settings, this.files, this.socketManager, this.twitchManager
    );
    this.playerManager = new PlayerManager(
      settings, this.files, this.socketManager, this.twitchManager,
      this.rewardManager
    );
    this.battleManager = new BattleManager(
      settings, this.files, this.socketManager, this.twitchManager,
      this.rewardManager, this.playerManager
    );
  }
  async init() {
    logger('Starting ServerApp');

    globalEmitter.on(
      socketEvents.setupAuthorized,
      bindAndLog(this.onSetupAuthorized, this)
    );

    try {
      await this.socketManager.init();
      await this.setupManager.init();
      await this.twitchManager.init();
      await this.chatBotManager.init();
      await this.rewardManager.init();
      logger('ServerApp ready');
    } catch (e) {
      maybeExpectedError(e);
    }
  }

  async onSetupAuthorized() {
    try {
      await this.twitchManager.init();
      await this.chatBotManager.init();
      await this.rewardManager.init();
      logger('ServerApp ready');
    } catch (e) {
      maybeExpectedError(e);
    }
  }
}

(async function () {
  const settings = await fs.readJSON('./settings.json');
  logger('loaded settings.json');
  const serverApp = new ServerApp(settings);
  try {
    await serverApp.init();
  } catch(e) {
    logger(`server init error occurred: ${e.message}`);
    logger(e.stack);
  }
}());
