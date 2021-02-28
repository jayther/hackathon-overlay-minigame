const { pick, pickArgs, betweenInt } = require('../shared/RandUtils');

const logger = require('./utils/logger');
const fantasyNames = require('./FantasyNames');
const {
  characterGenders,
  characterTypes
} = require('../shared/CharacterParts');
const appActions = require('../shared/AppActions');
const requiredRewards = require('../shared/RequiredRewards');
const globalEmitter = require('./utils/GlobalEmitter');
const { socketEvents } = require('./consts');
const { bindAndLog } = require('./utils/LogUtils');
const { has } = require('../shared/ObjectUtils');
const { ExpectedError } = require('./errors');

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

function filterDebugPlayers(player) {
  return player.debug;
}

function filterAlivePlayers(player) {
  return player.alive;
}

function mockCase(word, even = false) {
  let mockWord = '';
  for (let i = 0; i < word.length; i += 1) {
    const isEven = (i % 2) === 0;
    if (isEven === even) {
      mockWord += word.charAt(i).toUpperCase();
    }
  }
  return mockWord;
}

function randDisplayUserName() {
  const first = pick(fantasyNames),
    second = pick(fantasyNames);
  const delimiter = pickArgs('', '_');
  
  // names are capitalized by default
  const style = betweenInt(0, 7);
  switch (style) {
    case 0: // capitalize both
      return first + delimiter + second;
    case 1: // capitalize first
      return first + delimiter + second.toLowerCase();
    case 2: // capitalize second
      return first.toLowerCase() + delimiter + second;
    case 3: // all caps
      return first.toUpperCase() + delimiter + second.toUpperCase();
    case 4: // all lowercase
      return first.toLowerCase() + delimiter + second.toLowerCase();
    case 5: // even mock
      return mockCase(first, true) + delimiter + mockCase(second, true);
    case 6: // odd mock
      return mockCase(first, false) + delimiter + mockCase(second, false);
    default: // safety
      return first + delimiter + second;
  }
}

class PlayerManager {
  constructor(settings, files, socketManager, twitchManager, rewardManager) {
    this.settings = settings;
    this.files = files;
    this.socketManager = socketManager;
    this.twitchManager = twitchManager;
    this.rewardManager = rewardManager;
    globalEmitter.on(socketEvents.overlayAdded, this.onOverlayAdded, this);
    globalEmitter.on(socketEvents.controlAdded, this.onControlAdded, this);
    globalEmitter.on(requiredRewards.add.eventName, bindAndLog(this.addPlayer, this));
  }

  onOverlayAdded(socket) {
    socket.emit(appActions.allPlayers, this.files.playerData.data.players.filter(filterAlivePlayers));
  }

  onControlAdded(socket) {
    socket.on(appActions.removePlayer, bindAndLog(this.onSocketRemovePlayer, this));
    socket.on(appActions.updatePlayer, bindAndLog(this.onSocketUpdatePlayer, this));
    socket.on(appActions.addDebugPlayer, bindAndLog(this.onSocketAddDebugPlayer, this));
    socket.on(appActions.clearDebugPlayers, bindAndLog(this.onSocketClearDebugPlayers, this));
    socket.emit(appActions.allPlayers, this.files.playerData.data.players.filter(filterAlivePlayers));
  }

  getPlayer(userId) {
    return this.files.playerData.data.players.find(player => userId === player.userId);
  }
  
  getPlayerFromUserName(userName) {
    return this.files.playerData.data.players.find(player => userName === player.userName);
  }

  async addPlayer(event) {
    let player = this.getPlayer(event.userId);
    if (player && player.userId === event.userId && player.alive) {
      // delayed refund
      this.rewardManager.rejectRedeem(event);
      // TODO send "error" to chat
      throw new ExpectedError(`addPlayer: "${player.userName}" already alive in game`);
    }
    if (player) {
      player.userName = event.userName;
      player.userDisplayName = event.userDisplayName;
      player.alive = true;
      logger(`addPlayer: "${player.userName}" respawned`);
    } else {
      player = {
        ...defaultPlayer,
        userId: event.userId,
        userName: event.userName,
        userDisplayName: event.userDisplayName,
        alive: true,
        characterType: pick(characterTypes),
        characterGender: pick(characterGenders)
      };
      this.files.playerData.data.players.push(player);
      logger(`addPlayer: "${player.userName}" created`);
    }

    // delayed consume
    this.rewardManager.approveRedeem(event);

    await this.files.playerData.save();

    this.socketManager.allEmit(appActions.addPlayer, player);
  }

  async addWeapon(event) {
    // TODO
  }

  async onSocketAddDebugPlayer() {
    let player = this.files.playerData.data.players.filter(filterDebugPlayers).find(p => !p.alive);
    if (player) {
      player.alive = true;
      logger(`addDebugPlayer: "${player.userName}" respawned`);
    } else {
      const date = new Date();
      const timeStr = date.getTime().toString();
      const userId = `debug-${timeStr}`;
      const userDisplayName = randDisplayUserName();
      const userName = userDisplayName.toLowerCase();
      player = {
        ...defaultPlayer,
        userId,
        userName,
        userDisplayName,
        alive: true,
        characterType: pick(characterTypes),
        characterGender: pick(characterGenders),
        debug: true
      };
      this.files.playerData.data.players.push(player);
      logger(`addDebugPlayer: "${player.userName}" created`);
    }

    await this.files.playerData.save();

    this.socketManager.allEmit(appActions.addPlayer, player);
  }

  async onSocketClearDebugPlayers() {
    const indexes = [], alivePlayers = [];
    this.files.playerData.data.players.forEach((player, i) => {
      if (player.debug) {
        indexes.push(i);
        if (player.alive) {
          player.alive = false;
          alivePlayers.push(player);
        }
      }
    });
    for (let i = indexes.length - 1; i >= 0; i -= 1) {
      this.files.playerData.data.players.splice(indexes[i], 1);
    }
    logger('clearDebugPlayers: Cleared all debug players');
    await this.files.playerData.save();
    alivePlayers.forEach(player => this.socketManager.allEmit(appActions.removePlayer, player));
  }

  async onSocketUpdatePlayer(userId, data) {
    const player = this.getPlayer(userId);
    if (!player) {
      throw new ExpectedError(`onSocketUpdatePlayer: "${userId}" not in player data`);
    }
    const entries = Object.entries(data);
    const changesMsg = entries.map(([key, value]) => `"${key}": ${value}`).join('; ');
    logger(`onSocketUpdatePlayer: "${player.userDisplayName}" updating: ${changesMsg}`);

    entries.forEach(([key, value]) => {
      if (has(player, key)) {
        player[key] = value;
      }
    });
    
    await this.files.playerData.save();
    this.socketManager.allEmit(appActions.updatePlayer, player);
  }

  async onSocketRemovePlayer(userId) {
    const player = this.getPlayer(userId);
    if (!player) {
      throw new ExpectedError(`onSocketRemovePlayer: "${userId}" not in player data`);
    }
    if (!player.alive) {
      throw new ExpectedError(`onSocketRemovePlayer: "${player.userDisplayName}" not in arena`);
    }
    logger(`onSocketRemovePlayer: Removing "${player.userDisplayName}" from arena`);
    player.alive = false;
    await this.files.playerData.save();
    this.socketManager.allEmit(appActions.removePlayer, player);
  }
}

module.exports = PlayerManager;
module.exports.defaultPlayer = defaultPlayer;
