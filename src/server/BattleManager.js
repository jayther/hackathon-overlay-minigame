
const { pickExcept } = require('../shared/RandUtils');
const appActions = require('../shared/AppActions');
const logger = require('./utils/logger');
const globalEmitter = require('./utils/GlobalEmitter');
const { socketEvents } = require('./consts');
const { bindAndLog } = require('./utils/LogUtils');

function filterAlivePlayers(player) {
  return player.alive;
}

class BattleManager {
  constructor(settings, files, socketManager, twitchManager) {
    this.settings = settings;
    this.files = files;
    this.socketManager = socketManager;
    this.twitchManager = twitchManager;

    this.currentBattle = null;
    this.battleQueue = [];
    globalEmitter.on(socketEvents.overlayAdded, this.onOverlayAdded, this);
    globalEmitter.on(socketEvents.controlAdded, this.onControlAdded, this);
  }

  onOverlayAdded(socket) {
    socket.on(appActions.finishBattle, bindAndLog(this.finishBattle, this));
    socket.emit(appActions.updateBattle, this.currentBattle);
  }

  onControlAdded(socket) {
    socket.on(appActions.startBattle, bindAndLog(this.startBattle, this));
    socket.on(appActions.cancelBattle, bindAndLog(this.cancelBattle, this));
    socket.emit(appActions.updateBattle, this.currentBattle);
    socket.emit(appActions.updateBattleQueue, this.battleQueue);
  }
  
  isInBattle(userId) {
    return this.currentBattle ? this.currentBattle.includes(userId) : false;
  }

  getPlayer(userId) {
    return this.files.playerData.data.players.find(player => userId === player.userId);
  }

  async addBattle(battle) {
    this.battleQueue.push(battle);
    this.socketManager.controlEmit(appActions.updateBattleQueue, this.battleQueue);
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
    const alivePlayers = this.files.playerData.data.players.filter(filterAlivePlayers);
    if (alivePlayers.length < 2) {
      throw new Error(`startBattle: "${player.userDisplayName}" is the only one alive`);
    }

    if (!event.debug) {
      this.updateRedeem(event.rewardId, event.id, 'FULFILLED');
    }

    this.battleQueue.splice(eventIndex, 1);
    this.socketManager.controlEmit(appActions.updateBattleQueue, this.battleQueue);
    const otherPlayer = pickExcept(alivePlayers, player);
    this.currentBattle = [player.userId, otherPlayer.userId];
    this.socketManager.allEmit(appActions.updateBattle, this.currentBattle);
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
    this.socketManager.controlEmit(appActions.updateBattleQueue, this.battleQueue);
  }

  async finishBattle(winnerUserId, loserUserId) {
    if (!this.currentBattle) {
      // battle may have been removed on server side before widget battle ended
      this.socketManager.allEmit(appActions.updateBattle, null);
      return;
    }
    const winner = this.getPlayer(winnerUserId);
    if (!winner) {
      throw new Error(`finishBattle: "${winnerUserId}" winner not in player data`);
    }
    const loser = this.getPlayer(loserUserId);
    if (!loser) {
      throw new Error(`finishBattle: "${loserUserId}" loser not in player data`);
    }
    winner.wins += 1;
    winner.winStreak += 1;
    winner.battles += 1;
    loser.losses += 1;
    loser.winStreak = 0;
    loser.battles += 1;
    loser.alive = false;
    this.currentBattle = null;
    logger(`finishBattle: "${winner.userDisplayName}" won against "${loser.userDisplayName}"`);
    await this.files.playerData.save();
    this.socketManager.controlEmit(appActions.updateBattleResults, { winner, loser });
    this.socketManager.allEmit(appActions.updateBattle, this.currentBattle);
    this.socketManager.allEmit(appActions.updatePlayer, winner);
    this.socketManager.allEmit(appActions.removePlayer, loser);
  }
}

module.exports = BattleManager;
