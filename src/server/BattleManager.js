
const { pickExcept } = require('../shared/RandUtils');
const appActions = require('../shared/AppActions');
const logger = require('./utils/logger');
const globalEmitter = require('./utils/GlobalEmitter');
const { socketEvents } = require('./consts');
const { bindAndLog } = require('./utils/LogUtils');
const { ExpectedError } = require('./errors');
const requiredRewards = require('../shared/RequiredRewards');

function filterAlivePlayers(player) {
  return player.alive;
}

class BattleManager {
  constructor(
    settings, files, socketManager, twitchManager,
    rewardManager, playerManager
  ) {
    this.settings = settings;
    this.files = files;
    this.socketManager = socketManager;
    this.twitchManager = twitchManager;
    this.rewardManager = rewardManager;
    this.playerManager = playerManager;

    this.currentBattle = null;
    this.battleQueue = [];
    globalEmitter.on(socketEvents.overlayAdded, this.onOverlayAdded, this);
    globalEmitter.on(socketEvents.controlAdded, this.onControlAdded, this);
    globalEmitter.on(requiredRewards.duel.eventName, bindAndLog(this.requestBattle, this));
    globalEmitter.on(requiredRewards.duelSomeone.eventName, bindAndLog(this.requestSpecificBattle, this));
  }

  onOverlayAdded(socket) {
    socket.on(appActions.finishBattle, bindAndLog(this.finishBattle, this));
    socket.emit(appActions.updateBattle, this.currentBattle);
  }

  onControlAdded(socket) {
    socket.on(appActions.startBattle, bindAndLog(this.startBattle, this));
    socket.on(appActions.cancelBattle, bindAndLog(this.cancelBattle, this));
    socket.on(appActions.requestBattle, bindAndLog(this.onSocketRequestBattle, this));
    socket.emit(appActions.updateBattle, this.currentBattle);
    socket.emit(appActions.updateBattleQueue, this.battleQueue);
  }
  
  isInBattle(userId) {
    return this.currentBattle ? this.currentBattle.includes(userId) : false;
  }

  async requestBattle(event) {
    const player = this.playerManager.getPlayer(event.userId);
    if (!player) {
      this.rewardManager.rejectRedeem(event);
      // TODO send error in chat
      throw new ExpectedError(`requestBattle: "${event.userId}" not in player data`);
    }
    if (!player.alive) {
      this.rewardManager.rejectRedeem(event);
      // TODO send error in chat
      throw new ExpectedError(`requestBattle: "${player.userDisplayName}" is not alive`);
    }
    await this.addBattle({
      id: event.id,
      rewardId: event.rewardId,
      userId: event.userId,
      userName: event.userName,
      userDisplayName: event.userDisplayName,
      target: null,
      debug: event.debug || false
    });
    logger(`requestBattle: "${player.userDisplayName}" requested a random duel`);
  }

  async requestSpecificBattle(event) {
    const player = this.playerManager.getPlayer(event.userId);
    if (!player) {
      this.rewardManager.rejectRedeem(event);
      // TODO send error in chat
      throw new ExpectedError(`requestSpecificBattle: "${event.userId}" not in player data`);
    }
    if (!player.alive) {
      this.rewardManager.rejectRedeem(event);
      // TODO send error in chat
      throw new ExpectedError(`requestSpecificBattle: "${player.userDisplayName}" is not alive`);
    }
    if (!event.input || event.input.length === 0) {
      this.rewardManager.rejectRedeem(event);
      // TODO send error in chat
      throw new ExpectedError(`requestSpecificBattle: no userName specified`);
    }

    let targetUserName = event.input.trim().toLowerCase();
    if (targetUserName.charAt(0) === '@') {
      targetUserName = targetUserName.substring(1);
    }
    const target = this.playerManager.getPlayerFromUserName(targetUserName);
    if (!target) {
      this.rewardManager.rejectRedeem(event);
      // TODO send error chat
      throw new ExpectedError(`requestSpecificBattle: target "${targetUserName}" not in player data`);
    }
    if (!target.alive) {
      this.rewardManager.rejectRedeem(event);
      // TODO send error in chat
      throw new ExpectedError(`requestSpecificBattle: target "${target.userDisplayName}" is not alive`);
    }

    await this.addBattle({
      id: event.id,
      rewardId: event.rewardId,
      userId: event.userId,
      userName: event.userName,
      userDisplayName: event.userDisplayName,
      target: {
        userId: target.userId,
        userName: target.userName,
        userDisplayName: target.userDisplayName
      },
      debug: event.debug || false
    });
    logger(`requestSpecificBattle: "${player.userDisplayName}" requested a specific duel with "${target.userDisplayName}"`);
  }

  async addBattle(battle) {
    this.battleQueue.push(battle);
    this.socketManager.controlEmit(appActions.updateBattleQueue, this.battleQueue);
  }

  async startBattle(eventId) {
    if (this.currentBattle) {
      // TODO send error chat
      throw new ExpectedError(`startBattle: Cannot start battle for "${player.userDisplayName}", battle in progress`);
    }

    const eventIndex = this.battleQueue.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error(`startBattle: Battle event "${eventId}" not found in queue`);
    }
    const event = this.battleQueue[eventIndex];
    const player = this.playerManager.getPlayer(event.userId);
    if (!player) {
      // TODO send error chat
      throw new ExpectedError(`startBattle: "${event.userId}" not found in player data`);
    }
    if (!player.alive) {
      // TODO send error chat
      throw new ExpectedError(`startBattle: "${player.userDisplayName}" is not alive`);
    }
    let otherPlayer;
    if (event.target) {
      otherPlayer = this.playerManager.getPlayer(event.target.userId);
      if (!otherPlayer) {
        // TODO send error chat
        throw new ExpectedError(`startBattle: target "${event.target.userDisplayName}" not found in player data`);
      }
      if (!otherPlayer.alive) {
        // TODO send error chat
        throw new ExpectedError(`startBattle: target "${otherPlayer.userDisplayName}" is not alive`);
      }
    } else {
      const alivePlayers = this.files.playerData.data.players.filter(filterAlivePlayers);
      if (alivePlayers.length < 2) {
        // TODO send error chat
        throw new ExpectedError(`startBattle: "${player.userDisplayName}" is the only one alive`);
      }
      otherPlayer = pickExcept(alivePlayers, player);
    }

    this.rewardManager.approveRedeem(event);

    this.battleQueue.splice(eventIndex, 1);
    this.socketManager.controlEmit(appActions.updateBattleQueue, this.battleQueue);
    this.currentBattle = [player.userId, otherPlayer.userId];
    this.socketManager.allEmit(appActions.updateBattle, this.currentBattle);
    logger(`startBattle: "${player.userDisplayName}" starting a duel with "${otherPlayer.userDisplayName}"`);
  }

  async cancelBattle(eventId) {
    const eventIndex = this.battleQueue.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error(`cancelBattle: "${eventId}" not in queue`);
    }
    const event = this.battleQueue[eventIndex];
    this.battleQueue.splice(eventIndex, 1);
    this.rewardManager.rejectRedeem(event);
    this.socketManager.controlEmit(appActions.updateBattleQueue, this.battleQueue);
    logger(`cancelBattle: Cancelled a duel request from "${event.userDisplayName}"`)
  }

  async finishBattle(winnerUserId, loserUserId) {
    if (!this.currentBattle) {
      // battle may have been removed on server side before widget battle ended
      this.socketManager.allEmit(appActions.updateBattle, null);
      return;
    }
    const winner = this.playerManager.getPlayer(winnerUserId);
    if (!winner) {
      throw new Error(`finishBattle: "${winnerUserId}" winner not in player data`);
    }
    const loser = this.playerManager.getPlayer(loserUserId);
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

  async onSocketRequestBattle(userId, targetUserId = null) {
    const player = this.playerManager.getPlayer(userId);
    if (!player) {
      throw new ExpectedError(`onSocketRequestBattle: "${userId}" not found in player data`);
    }
    let targetUserName = null;
    if (targetUserId) {
      const targetPlayer = this.playerManager.getPlayer(targetUserId);
      if (!targetPlayer) {
        throw new ExpectedError(`onSocketRequestBattle: target "${targetUserId}" not found in player data`);
      }
      targetUserName = targetPlayer.userName;
    }
    try {
      const date = new Date();
      if (targetUserName) {
        await this.requestSpecificBattle({
          id: `debug-${userId}-${date.getTime()}`,
          rewardId: this.rewardManager.getRewardIdFromAction(requiredRewards.duelSomeone.key),
          userId,
          userName: player.userName,
          userDisplayName: player.userDisplayName,
          input: targetUserName,
          debug: true
        });
      } else {
        await this.requestBattle({
          id: `debug-${userId}-${date.getTime()}`,
          rewardId: this.rewardManager.getRewardIdFromAction(requiredRewards.duel.key),
          userId,
          userName: player.userName,
          userDisplayName: player.userDisplayName,
          input: null,
          debug: true
        });
      }
    } catch (e) {
      logger(`onSocketRequestBattle: Error occurred: ${e.message}`);
    }
  }
}

module.exports = BattleManager;
