
const { RefreshableAuthProvider, StaticAuthProvider } = require('twitch-auth');
const { ChatClient } = require('twitch-chat-client');

const logger = require('./utils/logger');
const globalEmitter = require('./utils/GlobalEmitter');
const appActions = require('../shared/AppActions');
const { socketEvents } = require('./consts');
const { ExpectedError } = require('./errors');
const { createCommandEvent } = require('./utils/ChatUtils');

function removeHash(channel) {
  return channel.replace('#', '');
}

class ChatBotManager {
  constructor(settings, files, socketManager, twitchManager) {
    this.settings = settings;
    this.files = files;
    this.socketManager = socketManager;
    this.twitchManager = twitchManager;

    this.chatClient = null;
    this.joined = false;
    this.deferredJoins = [];

    globalEmitter.on(socketEvents.overlayAdded, this.onOverlayAdded, this);
    globalEmitter.on(socketEvents.controlAdded, this.onControlAdded, this);
  }

  async init() {
    await this.startChatBot();
    logger('Chatbot ready');
  }

  onOverlayAdded(socket) {
    socket.emit(appActions.updateBotReady, this.isChatBotReady());
  }

  onControlAdded(socket) {
    socket.emit(appActions.updateBotReady, this.isChatBotReady());
  }

  async startChatBot() {
    if (!this.isAppReady()) {
      throw new ExpectedError(`Cannot start twitch: no app secrets (open http://localhost:${this.settings.webPort}/ in browser)`);
    }
    if (!this.areChatBotTokensReady()) {
      throw new ExpectedError(`Cannot start twitch: no chatbot tokens (open http://localhost:${this.settings.webPort}/ in browser)`);
    }
    if (this.chatClient) {
      logger('chatClient already started');
      return;
    }
    logger('Starting chatbot user...');
    const authProvider = new RefreshableAuthProvider(
      new StaticAuthProvider(this.files.appSecrets.data.clientId, this.files.chatBotTokens.data.accessToken),
      {
        clientSecret: this.files.appSecrets.data.clientSecret,
        refreshToken: this.files.chatBotTokens.data.refreshToken,
        onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
          const tokensData = {
            accessToken,
            refreshToken,
            expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
          };
          this.files.chatBotTokens.data = tokensData;
          await this.files.chatBotTokens.save();
          logger('ChatBot tokens refreshed');
        }
      }
    );
    this.chatClient = new ChatClient(authProvider, {
      channels: [this.twitchManager.user.name]
    });
    logger('ChatBot connecting...');
    await this.chatClient.connect();

    this.chatClient.onJoin(this.onJoin.bind(this));
    this.chatClient.onMessage(this.onMessage.bind(this));

    await this.waitForJoin();
    logger('ChatBot joined channel');

    this.socketManager.allEmit(appActions.updateBotReady, this.isChatBotReady());
    logger('ChatBot started');
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

  areChatBotTokensReady() {
    return !!(
      this.files.chatBotTokens &&
      this.files.chatBotTokens.data &&
      this.files.chatBotTokens.data.accessToken
    );
  }

  isChatBotReady() {
    return !!(
      this.chatClient &&
      this.chatClient.isConnected
    );
  }

  async say(message) {
    if (!this.isChatBotReady()) {
      throw new ExpectedError(`ChatBotManager.say: chatbot not ready (attempted to send "${message}")`);
    }
    await this.chatClient.say(`#${this.twitchManager.user.name}`, message);
  }

  async action(message) {
    if (!this.isChatBotReady()) {
      throw new ExpectedError(`ChatBotManager.action: chatbot not ready (attempted to send "${message}")`);
    }
    await this.chatClient.action(`#${this.twitchManager.user.name}`, message);
  }

  waitForJoin() {
    if (this.joined) {
      return Promise.resolve();
    }
    return new Promise(resolve => this.deferredJoins.push(resolve));
  }

  onJoin(channel, user) {
    if (removeHash(channel).toLowerCase() !== this.twitchManager.user.name) {
      return;
    }
    if (user.toLowerCase() !== this.chatClient.currentNick.toLowerCase()) {
      return;
    }
    this.joined = true;
    while (this.deferredJoins.length > 0) {
      const resolve = this.deferredJoins.pop();
      resolve();
    }
  }

  onMessage(channel, user, message) {
    if (message === '!ping') {
      this.chatClient.say(channel, 'Pong!');
    } else if (message.startsWith(this.settings.commandPrefix)) {
      const parts = message.split(' ');
      parts[0] = parts[0].substring(this.settings.commandPrefix.length);
      globalEmitter.emit(createCommandEvent(parts[0]), this, channel, user, message, parts);
    }
  }
}

module.exports = ChatBotManager;
