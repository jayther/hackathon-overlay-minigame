
const { pickExcept } = require('../shared/RandUtils');
const appActions = require('../shared/AppActions');
const logger = require('./utils/logger');
const globalEmitter = require('./utils/GlobalEmitter');
const { socketEvents } = require('./consts');
const { bindAndLog } = require('./utils/LogUtils');
const { ChattableError, ExpectedError } = require('./errors');
const requiredRewards = require('../shared/RequiredRewards');
const { applyKnownProps } = require('../shared/ObjectUtils');
const { createUpdateEvent } = require('./utils/RewardUtils');

const defaultBattleSettings = {
  delayBetweenAttacks: 0,
  pruneAfterBattle: true,
  autoBattle: false,
  autoBattleDelay: 3000, //ms
  controlFromTwitch: false,
  chanceNormalWeight: 75,
  chanceCritWeight: 10,
  chanceMissWeight: 15
};

const deferredSaveDelay = 3000; // ms

function filterAlivePlayers(player) {
  return player.alive;
}

function sortByRedemptionDate(a, b) {
  return a.redemptionDate.getTime() - b.redemptionDate.getTime();
}

class BattleManager {
  constructor(
    settings, files, socketManager, twitchManager,
    rewardManager, playerManager, chatBotManager
  ) {
    this.settings = settings;
    this.files = files;
    this.socketManager = socketManager;
    this.twitchManager = twitchManager;
    this.rewardManager = rewardManager;
    this.playerManager = playerManager;
    this.chatBotManager = chatBotManager;

    this.deferredSaveId = -1;
    this.autoBattleId = -1;

    this.currentBattle = null;
    this.battleQueue = [];
    globalEmitter.on(socketEvents.overlayAdded, this.onOverlayAdded, this);
    globalEmitter.on(socketEvents.controlAdded, this.onControlAdded, this);
    globalEmitter.on(requiredRewards.duel.eventName, bindAndLog(this.requestBattle, this));
    globalEmitter.on(requiredRewards.duelSomeone.eventName, bindAndLog(this.requestSpecificBattle, this));
    globalEmitter.on(
      createUpdateEvent(requiredRewards.duel.eventName),
      bindAndLog(this.updateBattle, this)
    );
    globalEmitter.on(
      createUpdateEvent(requiredRewards.duelSomeone.eventName),
      bindAndLog(this.updateSpecificBattle, this)
    );
    globalEmitter.on(requiredRewards.weaponize.eventName, bindAndLog(this.weaponize, this));
  }

  async init() {
    // revive battle queue from redeems
    logger('Reviving battle queue from redeems...');
    let redeems = [];
    const duelRewardId = this.rewardManager.getRewardIdFromAction(requiredRewards.duel.key);
    if (duelRewardId) {
      const duelRedeems = await this.rewardManager.getRedeemsFromRewardId(duelRewardId);
      redeems = redeems.concat(duelRedeems);
    }
    const duelSpecificRewardId = this.rewardManager.getRewardIdFromAction(requiredRewards.duelSomeone.key);
    if (duelSpecificRewardId) {
      const duelSpecificRedeems = await this.rewardManager.getRedeemsFromRewardId(duelSpecificRewardId);
      redeems = redeems.concat(duelSpecificRedeems);
    }
    // adding in order of redemption date
    redeems.sort(sortByRedemptionDate);

    // add each redeem
    let revived = 0;
    for (const redeem of redeems) {
      let target = null;
      // duel specific. If target is not alive, we'll skip
      if (duelSpecificRewardId && redeem.rewardId === duelSpecificRewardId) {
        let input = redeem.input || redeem.userInput || null;
        if (!input || input.length === 0) {
          logger(`${redeem.id} missing input`);
          continue;
        }
        let targetUserName = input.trim().toLowerCase();
        if (targetUserName.charAt(0) === '@') {
          targetUserName = targetUserName.substring(1);
        }
        const targetPlayer = this.playerManager.getPlayerFromUserName(targetUserName);
        if (!targetPlayer) {
          logger(`${targetUserName} not in player data`);
          continue;
        }
        if (!targetPlayer.alive) {
          logger(`${targetUserName} not alive`);
          continue;
        }
        target = {
          userId: targetPlayer.userId,
          userName: targetPlayer.userName,
          userDisplayName: targetPlayer.userDisplayName
        };
      }

      await this.addBattle({
        id: redeem.id,
        rewardId: redeem.rewardId,
        userId: redeem.userId,
        userName: redeem.userName,
        userDisplayName: redeem.userDisplayName,
        target,
        debug: redeem.debug || false,
        status: redeem.status || 'UNFULFILLED'
      });
      revived += 1;
    }
    this.socketManager.allEmit(appActions.updateBattleQueue, this.battleQueue);
    logger(`Revived ${revived} battles`);
    logger('BattleManager ready');
    this.maybeAutoBattleStart();
  }

  onOverlayAdded(socket) {
    socket.on(appActions.finishBattle, bindAndLog(this.finishBattle, this));
    socket.emit(appActions.updateBattle, this.currentBattle);
    socket.emit(appActions.updateBattleSettings, this.files.battleSettings.data);
  }

  onControlAdded(socket) {
    socket.on(appActions.startBattle, bindAndLog(this.startBattle, this));
    socket.on(appActions.cancelBattle, bindAndLog(this.cancelBattle, this));
    socket.on(appActions.requestBattle, bindAndLog(this.onSocketRequestBattle, this));
    socket.on(appActions.updateBattleSettings, bindAndLog(this.onSocketUpdateBattleSettings, this));
    socket.on(appActions.pruneBattles, bindAndLog(this.onSocketPruneBattles, this));
    socket.emit(appActions.updateBattle, this.currentBattle);
    socket.emit(appActions.updateBattleQueue, this.battleQueue);
    socket.emit(appActions.updateBattleSettings, this.files.battleSettings.data);
  }
  
  isInBattle(userId) {
    return this.currentBattle ? this.currentBattle.includes(userId) : false;
  }

  getRewardName(action) {
    const reward = this.rewardManager.getRewardFromAction(action.key);
    return reward ? reward.title : action.title;
  }

  async requestBattle(event) {
    const player = this.playerManager.getPlayer(event.userId);
    if (!player) {
      this.rewardManager.rejectRedeem(event);
      const rewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${event.userDisplayName} Please redeem "${rewardName}" first before requesting a random duel. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `requestBattle: "${event.userDisplayName}" (id: ${event.userId}) not in player data`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
    }
    if (!player.alive) {
      this.rewardManager.rejectRedeem(event);
      const rewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${player.userDisplayName} Please redeem "${rewardName}" first before requesting a random duel. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `requestBattle: "${player.userDisplayName}" is not alive`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
    }
    await this.addBattle({
      id: event.id,
      rewardId: event.rewardId,
      userId: event.userId,
      userName: event.userName,
      userDisplayName: event.userDisplayName,
      target: null,
      debug: event.debug || false,
      status: event.status || 'UNFULFILLED'
    });
    logger(`requestBattle: "${player.userDisplayName}" requested a random duel`);
  }

  async requestSpecificBattle(event) {
    const player = this.playerManager.getPlayer(event.userId);
    if (!player) {
      this.rewardManager.rejectRedeem(event);
      const rewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${event.userDisplayName} Please redeem "${rewardName}" first before requesting a duel. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `requestSpecificBattle: "${event.userDisplayName}" (id: ${event.userId}) not in player data`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
    }
    if (!player.alive) {
      this.rewardManager.rejectRedeem(event);
      const rewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${player.userDisplayName} Please redeem "${rewardName}" first before requesting a duel. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `requestSpecificBattle: "${player.userDisplayName}" is not alive`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
    }
    if (!event.input || event.input.length === 0) {
      this.rewardManager.rejectRedeem(event);
      throw new ChattableError(
        `@${player.userDisplayName} Please specify an alive player's username in the redeem. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `requestSpecificBattle: ${player.userDisplayName} did not specify a userName`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
    }

    let targetUserName = event.input.trim().toLowerCase();
    if (targetUserName.charAt(0) === '@') {
      targetUserName = targetUserName.substring(1);
    }
    const target = this.playerManager.getPlayerFromUserName(targetUserName);
    if (!target) {
      this.rewardManager.rejectRedeem(event);
      throw new ChattableError(
        `@${player.userDisplayName} , please specify an alive player's username in the redeem. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `requestSpecificBattle: target "${targetUserName}" not in player data`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
    }
    if (!target.alive) {
      this.rewardManager.rejectRedeem(event);
      throw new ChattableError(
        `@${player.userDisplayName} Please specify an alive player's username in the redeem. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `requestSpecificBattle: target "${target.userDisplayName}" is not alive`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
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
      debug: event.debug || false,
      status: event.stasus || 'UNFULFILLED'
    });
    logger(`requestSpecificBattle: "${player.userDisplayName}" requested a specific duel with "${target.userDisplayName}"`);
  }

  async updateBattle(event) {
    const battleIndex = this.battleQueue.findIndex(battle => battle.id === event.id);
    if (battleIndex === -1) {
      throw new ExpectedError(`BattleManager.updateBattle: cannot find battle with id ${event.id}`);
    }
    const battle = this.battleQueue[battleIndex];
    battle.status = event.status;
    logger(`updateBattle: updated battle ${battle.id} to ${event.status}`);
    if (!this.files.battleSettings.data.controlFromTwitch) {
      return;
    }
    if (event.status.toUpperCase() === 'FULFILLED') {
      logger('updateBattle: starting battle via twitch');
      await this.startBattle(battle.id);
    } else {
      logger('updateBattle: cancelling battle via twitch');
      await this.cancelBattle(battle.id);
    }
  }

  async updateSpecificBattle(event) {
    const battleIndex = this.battleQueue.findIndex(battle => battle.id === event.id);
    if (battleIndex === -1) {
      throw new ExpectedError(`BattleManager.updateSpecificBattle: cannot find battle with id ${event.id}`);
    }
    const battle = this.battleQueue[battleIndex];
    battle.status = event.status;
    logger(`updateSpecificBattle: updated battle ${battle.id} to ${event.status}`);
    if (!this.files.battleSettings.data.controlFromTwitch) {
      return;
    }
    if (event.status.toUpperCase() === 'FULFILLED') {
      logger('updateSpecificBattle: starting battle via twitch');
      await this.startBattle(battle.id);
    } else {
      logger('updateSpecificBattle: cancelling battle via twitch');
      await this.cancelBattle(battle.id);
    }
  }

  async weaponize(event) {
    const player = this.playerManager.getPlayer(event.userId);
    if (!player) {
      this.rewardManager.rejectRedeem(event);
      const rewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${event.userDisplayName} Please redeem "${rewardName}" first before adding a weapon. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `weaponize: "${event.userDisplayName}" (id: ${event.userId}) not in player data`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
    }
    if (!player.alive) {
      this.rewardManager.rejectRedeem(event);
      const rewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${player.userDisplayName} Please redeem "${rewardName}" first before adding a weapon. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `weaponize: "${player.userDisplayName}" not alive`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
    }
    if (player.weapon) {
      this.rewardManager.rejectRedeem(event);
      throw new ChattableError(
        `@${player.userDisplayName} You already have a weapon. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `weaponize: "${player.userDisplayName}" already has a weapon`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
    }
    if (this.isInBattle(player.userId)) {
      this.rewardManager.rejectRedeem(event);
      throw new ChattableError(
        `@${player.userDisplayName} You cannot add a weapon mid-duel. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `weaponize: "${player.userDisplayName}" cannot equip weapon during battle`
      ).setSetSendToChat(this.settings.sendChatForDebugEvents || !event.debug);
    }

    player.weapon = true;
    this.playerManager.update(player);
    await this.playerManager.save();
    this.rewardManager.approveRedeem(event);
    this.socketManager.allEmit(appActions.updatePlayer, player);
    logger(`weaponize: "${player.userDisplayName}" is now weaponized`);
  }

  async addBattle(battle) {
    this.battleQueue.push(battle);
    this.socketManager.controlEmit(appActions.updateBattleQueue, this.battleQueue);
    this.maybeAutoBattleStart();
  }

  async startBattle(eventId) {
    if (this.currentBattle) {
      throw new ExpectedError(`startBattle: Cannot start battle for "${event.userDisplayName}", battle in progress`);
    }

    const eventIndex = this.battleQueue.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error(`startBattle: Battle event "${eventId}" not found in queue`);
    }
    const event = this.battleQueue[eventIndex];
    const player = this.playerManager.getPlayer(event.userId);
    if (!player) {
      throw new ExpectedError(`startBattle: "${event.userId}" not found in player data`);
    }
    if (!player.alive) {
      throw new ExpectedError(`startBattle: "${player.userDisplayName}" is not alive`);
    }
    let otherPlayer;
    if (event.target) {
      otherPlayer = this.playerManager.getPlayer(event.target.userId);
      if (!otherPlayer) {
        throw new ExpectedError(`startBattle: target "${event.target.userDisplayName}" not found in player data`);
      }
      if (!otherPlayer.alive) {
        throw new ExpectedError(`startBattle: target "${otherPlayer.userDisplayName}" is not alive`);
      }
    } else {
      const alivePlayers = this.files.playerData.data.players.filter(filterAlivePlayers);
      if (alivePlayers.length < 2) {
        throw new ExpectedError(`startBattle: "${player.userDisplayName}" is the only one alive`);
      }
      otherPlayer = pickExcept(alivePlayers, player);
    }

    this.rewardManager.approveRedeem(event);
    if (this.settings.sendChatForDebugEvents || !event.debug) {
      this.chatBotManager.say(`Duel between ${player.userDisplayName} and ${otherPlayer.userDisplayName} is about to start!`);
    }

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
    if (this.settings.sendChatForDebugEvents || !event.debug) {
      this.chatBotManager.say(`Cancelling duel request from ${event.userDisplayName}. Refunding ${this.settings.channelPointsName}.`);
    }
    this.socketManager.controlEmit(appActions.updateBattleQueue, this.battleQueue);
    logger(`cancelBattle: Cancelled a duel request from "${event.userDisplayName}"`);
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
    this.playerManager.update(winner);
    this.playerManager.update(loser);
    await this.playerManager.save();
    this.socketManager.controlEmit(appActions.updateBattleResults, { winner, loser });
    this.socketManager.allEmit(appActions.updateBattle, this.currentBattle);
    this.socketManager.allEmit(appActions.updatePlayer, winner);
    this.socketManager.allEmit(appActions.removePlayer, loser);
    if (this.files.battleSettings.data.pruneAfterBattle) {
      await this.pruneBattles();
    }
    if (this.files.battleSettings.data.autoBattle) {
      this.autoBattleDelayedCheck();
    }
  }

  maybeAutoBattleStart() {
    if (this.files.battleSettings.data.autoBattle) {
      this.autoBattleStart();
    } else {
      this.autoBattleStop();
    }
  }

  autoBattleStart() {
    this.autoBattleStop();
    this.autoBattleDelayedCheck();
  }

  autoBattleStop() {
    if (this.autoBattleId !== -1) {
      clearTimeout(this.autoBattleId);
      this.autoBattleId = -1;
    }
  }

  autoBattleCheck() {
    if (!this.files.battleSettings.data.autoBattle) {
      return;
    }
    if (this.currentBattle) {
      return;
    }
    if (this.playerManager.getPlayerCount() <= 1) {
      logger('autoBattleCheck: one or no players are alive');
      return;
    }
    // find a viable event
    let useEvent = null;
    for (const event of this.battleQueue) {
      const player = this.playerManager.getPlayer(event.userId);
      if (!player) {
        continue;
      }
      if (!player.alive) {
        continue;
      }
      if (event.target) { // duelSomeone
        const targetPlayer = this.playerManager.getPlayer(event.target.userId);
        if (!targetPlayer) {
          continue;
        }
        if (!targetPlayer.alive) {
          continue;
        }
      }
      useEvent = event;
      break;
    }
    if (useEvent) {
      logger('autoBattleCheck: auto starting battle');
      this.startBattle(useEvent.id);
    } else {
      logger('autoBattleCheck: no viable battle');
    }
    // no event, do nothing
  }

  autoBattleDelayedCheck() {
    this.autoBattleId = setTimeout(() => {
      this.autoBattleId = -1;
      this.autoBattleCheck();
    }, this.files.battleSettings.data.autoBattleDelay);
  }

  async pruneBattles() {
    const playerMap = this.playerManager.createPlayerMap();
    const indexesToRemove = [];
    const playersRemovedMap = {};
    for (let i = 0; i < this.battleQueue.length; i += 1) {
      const event = this.battleQueue[i];
      const player = playerMap[event.userId];
      const targetPlayer = event.target ? playerMap[event.target.userId] : null;
      // could put all of this in one big if, but this seems neater
      if (targetPlayer && !targetPlayer.alive) {
        indexesToRemove.push(i);
        playersRemovedMap[targetPlayer.userDisplayName] = targetPlayer;
      } else if (player && !player.alive) {
        indexesToRemove.push(i);
        playersRemovedMap[player.userDisplayName] = player;
      } else if (!player) {
        indexesToRemove.push(i);
      }
    }
    const eventsToReject = [];
    for (let i = indexesToRemove.length - 1; i >= 0; i -= 1) {
      const index = indexesToRemove[i];
      const event = this.battleQueue[index];
      eventsToReject.push(event);
      this.battleQueue.splice(index, 1);
    }
    const playersRemoved = Object.keys(playersRemovedMap);
    if (indexesToRemove.length > 0) {
      logger(`Pruned ${indexesToRemove.length} battles involving ${playersRemoved.join(', ')}.`);
      this.chatBotManager.say(`Cancelling duel requests involving ${playersRemoved.join(', ')}. Refunding ${this.settings.channelPointsName}.`);
    } else {
      logger(`Pruned 0 battles.`);
    }
    await this.rewardManager.rejectRedeemsMulti(eventsToReject);
    this.socketManager.allEmit(appActions.updateBattleQueue, this.battleQueue);
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

  async onSocketUpdateBattleSettings(battleSettings) {
    applyKnownProps(this.files.battleSettings.data, battleSettings);
    this.deferredSave();
    this.socketManager.allEmit(appActions.updateBattleSettings, this.files.battleSettings.data);
    this.maybeAutoBattleStart();
  }

  async onSocketPruneBattles() {
    await this.pruneBattles();
  }

  deferredSave() {
    if (this.deferredSaveId !== -1) {
      clearTimeout(this.deferredSaveId);
    }
    this.deferredSaveId = setTimeout(() => {
      this.files.battleSettings.save();
      this.deferredSaveId = -1;
    }, deferredSaveDelay);
  }
}

module.exports = BattleManager;
module.exports.defaultBattleSettings = defaultBattleSettings;
