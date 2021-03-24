const requiredRewards = require('../shared/RequiredRewards');
const appActions = require('../shared/AppActions');
const { bindAndLog } = require('./utils/LogUtils');
const { createUpdateEvent } = require('./utils/RewardUtils');
const { waitForMS } = require('../shared/PromiseUtils');

const { updateRedeemDelay } = require('./consts');
const logger = require('./utils/logger');
const globalEmitter = require('./utils/GlobalEmitter');
const { socketEvents } = require('./consts');

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

class RewardManager {
  constructor(settings, files, socketManager, twitchManager) {
    this.settings = settings;
    this.files = files;
    this.socketManager = socketManager;
    this.twitchManager = twitchManager;

    this.rewards = [];
    this.redeems = [];
    this.debugAutoRefund = false;
    
    globalEmitter.on(socketEvents.overlayAdded, this.onOverlayAdded, this);
    globalEmitter.on(socketEvents.controlAdded, this.onControlAdded, this);
  }

  async init() {
    this.rewards = await this.twitchManager.userClient
      .helix.channelPoints
      .getCustomRewards(this.twitchManager.user.id);
      
    logger('Subscribing to reward add events...');
    this.rewardAddSub = await this.twitchManager.eventSub.subscribeToChannelRewardAddEvents(
      this.twitchManager.user.id, bindAndLog(this.onRewardAdd, this)
    );
    logger('Subscribing to reward remove events...');
    this.rewardRemoveSub = await this.twitchManager.eventSub.subscribeToChannelRewardRemoveEvents(
      this.twitchManager.user.id, bindAndLog(this.onRewardRemove, this)
    );
    logger('Subscribing to reward update events...');
    this.rewardUpdteSub = await this.twitchManager.eventSub.subscribeToChannelRewardUpdateEvents(
      this.twitchManager.user.id, bindAndLog(this.onRewardUpdate, this)
    );
    logger('Subscribing to redeem add events...');
    this.redeemSub = await this.twitchManager.eventSub.subscribeToChannelRedemptionAddEvents(
      this.twitchManager.user.id, bindAndLog(this.onRedeem, this)
    );
    logger('Subscribing to redeem update events...');
    this.redeemUpdateSub = await this.twitchManager.eventSub.subscribeToChannelRedemptionUpdateEvents(
      this.twitchManager.user.id, bindAndLog(this.onRedeemUpdate, this)
    );
    this.socketManager.allEmit(appActions.updateEventSubReady, !!this.twitchManager.eventSub);
    logger('Subscribed to all needed events');
  }

  onOverlayAdded(socket) {
    socket.emit(appActions.updateEventSubReady, !!this.twitchManager.eventSub);
  }

  onControlAdded(socket) {
    socket.on(appActions.createReward, bindAndLog(this.onSocketCreateReward, this));
    socket.on(appActions.setRewardToAction, bindAndLog(this.onSocketSetRewardToAction, this));
    socket.on(appActions.createRewardForAction, bindAndLog(this.onSocketCreateRewardForAction, this));
    socket.on(appActions.updateDebugAutoRefund, bindAndLog(this.onSocketUpdateDebugAutoRefund, this));
    socket.emit(appActions.updateEventSubReady, !!this.twitchManager.eventSub);
    socket.emit(appActions.updateRewards, this.getRewardObjs());
    socket.emit(appActions.allRedeems, this.getRedeemObjs());
    socket.emit(appActions.updateRewardMap, this.files.rewardMap.data);
    socket.emit(appActions.updateDebugAutoRefund, this.debugAutoRefund);
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
    try {
      return await this.twitchManager.userClient
        .helix.channelPoints
        .updateRedemptionStatusByIds(
          this.twitchManager.user.id, rewardId, ids, useStatus
        );
    } catch (e) {
      logger(`RewardManager.updateRedeem:`, e.message);
      return null;
    }
  }

  async approveRedeem(event, immediate = false) {
    if (event.debug) {
      return [];
    }
    return this.updateRedeem(event.rewardId, event.id, 'FULFILLED', immediate);
  }

  async approveRedeemsMulti(events, immediate = false) {
    if (!Array.isArray(events)) {
      throw new Error('RewardManager.approveRedeemsMulti: events (first arg) must be an array of redeems.');
    }
    if (events.length === 0) {
      return [];
    }
    const rewardId = events[0].rewardId;
    for (const event of events) {
      if (rewardId !== event.rewardId) {
        throw new Error('RewardManager.approveRedeemsMulti: all events must have the same rewardId.');
      }
    }
    const actualEvents = events.filter(event => !event.debug);
    if (actualEvents.length === 0) {
      return [];
    }
    const redeemIds = actualEvents.map(event => event.id);

    return this.updateRedeem(rewardId, redeemIds, 'FULFILLED', immediate);
  }

  async rejectRedeem(event, immediate = false) {
    if (event.debug) {
      return [];
    }
    return this.updateRedeem(event.rewardId, event.id, 'CANCELED', immediate);
  }

  async rejectRedeemsMulti(events, immediate = false) {
    if (!Array.isArray(events)) {
      throw new Error('RewardManager.rejectRedeemsMulti: events (first arg) must be an array of redeems.');
    }
    if (events.length === 0) {
      return [];
    }
    const rewardId = events[0].rewardId;
    for (const event of events) {
      if (rewardId !== event.rewardId) {
        throw new Error('RewardManager.rejectRedeemsMulti: all events must have the same rewardId.');
      }
    }
    const actualEvents = events.filter(event => !event.debug);
    if (actualEvents.length === 0) {
      return [];
    }
    const redeemIds = actualEvents.map(event => event.id);

    return this.updateRedeem(rewardId, redeemIds, 'CANCELED', immediate);
  }

  getRewardIdFromAction(actionKey) {
    for (let [rewardId, k] of Object.entries(this.files.rewardMap.data)) {
      if (k === actionKey) {
        return rewardId;
      }
    }
    return null;
  }

  getRewardFromAction(actionKey) {
    const rewardId = this.getRewardIdFromAction(actionKey);
    if (!rewardId) {
      return null;
    }
    return this.rewards.find(reward => reward.id === rewardId);
  }

  async onSocketCreateReward(data) {
    await this.twitchManager.userClient
      .helix.channelPoints
      .createCustomReward(this.twitchManager.user.id, data);
  }

  async onRewardAdd(event) {
    this.rewards.push(event);
    this.socketManager.controlEmit(appActions.updateRewards, this.rewards.map(rewardToObj));
  }

  async onRewardRemove(event) {
    for (let i = this.rewards.length - 1; i >= 0; i -= 1) {
      if (this.rewards[i].id === event.id) {
        this.rewards.splice(i, 1);
        break;
      }
    }
    this.socketManager.controlEmit(appActions.updateRewards, this.rewards.map(rewardToObj));
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
    const rewardKey = this.files.rewardMap.data[event.rewardId];
    if (rewardKey && requiredRewards[rewardKey]) {
      globalEmitter.emit(requiredRewards[rewardKey].eventName, event);
    }
    this.socketManager.allEmit(appActions.addRedeem, payload);
  }

  async onRedeemUpdate(event) {
    const payload = redeemToObj(event);
    for (let i = 0; i < this.redeems.length; i += 1) {
      if (this.redeems[i].id === event.id) {
        this.redeems[i] = event;
        break;
      }
    }
    const rewardKey = this.files.rewardMap.data[event.rewardId];
    if (rewardKey && requiredRewards[rewardKey]) {
      globalEmitter.emit(
        createUpdateEvent(requiredRewards[rewardKey].eventName),
        event
      );
    }
    this.socketManager.allEmit(appActions.updateRedeem, payload);
  }

  async onSocketCreateRewardForAction(data, actionKey) {
    logger(`Creating reward for action "${actionKey}"...`);
    const reward = await this.twitchManager.userClient
      .helix.channelPoints
      .createCustomReward(this.twitchManager.user.id, data);
    this.files.rewardMap.data[reward.id] = actionKey;
    logger(`Created reward for action "${actionKey}"`);
    await this.files.rewardMap.save();
    this.socketManager.controlEmit(appActions.updateRewardMap, this.files.rewardMap.data);
  }

  async onSocketSetRewardToAction(rewardId, actionKey) {
    if (actionKey) {
      this.files.rewardMap.data[rewardId] = actionKey;
      logger(`Set reward "${rewardId}" to action "${actionKey}"`);
    } else {
      const prevActionKey = this.files.rewardMap.data[rewardId];
      delete this.files.rewardMap.data[rewardId];
      logger(`Unset reward "${rewardId}" from action "${prevActionKey}`);
    }
    await this.files.rewardMap.save();
    this.socketManager.controlEmit(appActions.updateRewardMap, this.files.rewardMap.data);
  }

  async onSocketUpdateDebugAutoRefund(value) {
    this.debugAutoRefund = value;
    logger(`Set debugAutoRefund to ${value}`);
    this.socketManager.controlEmit(appActions.updateDebugAutoRefund, this.debugAutoRefund);
  }

  getRewardObjs() {
    return this.rewards.map(rewardToObj);
  }

  getRedeemObjs() {
    return this.redeems.map(redeemToObj);
  }

  async getRedeemsFromRewardId(rewardId) {
    const redeems = await this.twitchManager.userClient
    .helix.channelPoints
    .getRedemptionsForBroadcaster(this.twitchManager.user.id, rewardId, 'UNFULFILLED', {});
    return redeems.data;
  }

  async updateRewardById(rewardId, data) {
    try {
      return await this.twitchManager.userClient
        .helix.channelPoints
        .updateCustomReward(this.twitchManager.user.id, rewardId, data);
    } catch (e) {
      logger('RewardManager.updateRewardById:', e);
      return null;
    }
  }

  async setEnabledRewardById(rewardId, isEnabled) {
    return await this.updateRewardById(rewardId, { isEnabled });
  }
}

module.exports = RewardManager;
