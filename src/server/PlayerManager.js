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
const { applyKnownProps } = require('../shared/ObjectUtils');
const { ChattableError, ExpectedError } = require('./errors');
const { createCommandEvent } = require('./utils/ChatUtils');
const ChangeMethods = require('../shared/ChangeMethods');

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

function pickGender(reqGender) {
  switch (reqGender.toLowerCase()) {
    case 'male':
    case 'guy':
    case 'boy':
      return 'Male';
    case 'female':
    case 'gal':
    case 'girl':
      return 'Female';
  }
  return null;
}

function pickCharType(reqType) {
  return characterTypes.find(t => t.toLowerCase() === reqType.toLowerCase());
}

class PlayerManager {
  constructor(settings, files, socketManager, twitchManager, rewardManager) {
    this.settings = settings;
    this.files = files;
    this.socketManager = socketManager;
    this.twitchManager = twitchManager;
    this.rewardManager = rewardManager;
    this.isInBattle = () => { return false };
    globalEmitter.on(socketEvents.overlayAdded, this.onOverlayAdded, this);
    globalEmitter.on(socketEvents.controlAdded, this.onControlAdded, this);
    globalEmitter.on(requiredRewards.add.eventName, bindAndLog(this.addPlayer, this));
    globalEmitter.on(requiredRewards.changeCharacterGender.eventName, bindAndLog(this.onRedeemGender, this));
    globalEmitter.on(requiredRewards.changeCharacterType.eventName, bindAndLog(this.onRedeemCharacter, this));
    globalEmitter.on(requiredRewards.runAround.eventName, bindAndLog(this.onRedeemRunAround, this));
    globalEmitter.on(requiredRewards.dance.eventName, bindAndLog(this.onRedeemDance, this));
    globalEmitter.on(createCommandEvent('gender'), bindAndLog(this.onCommandGender, this));
    globalEmitter.on(createCommandEvent('char'), bindAndLog(this.onCommandCharacter, this));
    globalEmitter.on(createCommandEvent('character'), bindAndLog(this.onCommandCharacter, this));
    globalEmitter.on(createCommandEvent('chars'), bindAndLog(this.onCommandAllCharacters, this));
    globalEmitter.on(createCommandEvent('allchars'), bindAndLog(this.onCommandAllCharacters, this));
    globalEmitter.on(createCommandEvent('allcharacters'), bindAndLog(this.onCommandAllCharacters, this));
  }

  onOverlayAdded(socket) {
    socket.emit(appActions.allPlayers, this.files.playerData.data.players.filter(filterAlivePlayers));
  }

  onControlAdded(socket) {
    socket.on(appActions.removePlayer, bindAndLog(this.onSocketRemovePlayer, this));
    socket.on(appActions.updatePlayer, bindAndLog(this.onSocketUpdatePlayer, this));
    socket.on(appActions.addDebugPlayer, bindAndLog(this.onSocketAddDebugPlayer, this));
    socket.on(appActions.clearDebugPlayers, bindAndLog(this.onSocketClearDebugPlayers, this));
    socket.on(appActions.updateGenderMethod, bindAndLog(this.onSocketUpdateGenderMethod, this));
    socket.on(appActions.updateCharTypeMethod, bindAndLog(this.onSocketUpdateCharTypeMethod, this));
    socket.on(appActions.runPlayer, bindAndLog(this.onSocketRunAround, this));
    socket.on(appActions.dancePlayer, bindAndLog(this.onSocketDance, this));
    socket.emit(appActions.allPlayers, this.files.playerData.data.players.filter(filterAlivePlayers));
    socket.emit(appActions.updateGenderMethod, this.files.playerData.data.genderMethod);
    socket.emit(appActions.updateCharTypeMethod, this.files.playerData.data.charTypeMethod);
  }

  async onCommandGender(chatBotManager, channel, user, message, parts) {
    const player = this.getPlayerFromUserName(user.toLowerCase());
    if (!player) {
      const addRewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${user} Please redeem "${addRewardName}" first before doing the gender command.`,
        `PlayerManager.onCommandGender: ${user} is not in player data.`
      );
    }
    if (!player.alive) {
      const addRewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${user} Please redeem "${addRewardName}" first before doing the gender command.`,
        `PlayerManager.onCommandGender: ${user} is not in player data.`
      );
    }

    if (parts.length === 1) {
      chatBotManager.say(`@${user} Your character's gender is ${player.characterGender}.`);
      return;
    }

    if (!this.isGenderMethod(ChangeMethods.chat)) {
      return;
    }

    if (parts.length === 2) {
      const reqGender = parts[1];
      const gender = pickGender(reqGender);
      if (!gender) {
        throw new ChattableError(
          `@${user} You can only set your character's gender with these values: ${characterGenders.join(', ')}`,
          `PlayerManager.onCommandRedeem: ${user} inputted an invalid gender ("${reqGender}")`
        );
      }

      player.characterGender = gender;
      this.update(player);
      await this.save();
      this.socketManager.allEmit(appActions.updatePlayer, player);
      chatBotManager.say(`@${user} Your character is now ${player.characterType}, ${gender}.`);
      logger(`PlayerManager.onCommandGender: ${player.userDisplayName} changed gender to ${gender}`);
      return;
    }

    chatBotManager.say(`@${user} Invalid command.`);
  }

  async onRedeemGender(event) {
    if (!this.isGenderMethod(ChangeMethods.reward)) {
      this.rewardManager.rejectRedeem(event);
      return;
    }
    const player = this.getPlayer(event.userId);
    if (!player) {
      this.rewardManager.rejectRedeem(event);
      const addRewardName = this.getRewardName(requiredRewards.add);
      const genderRewardName = this.getRewardName(requiredRewards.changeCharacterGender);
      throw new ChattableError(
        `@${event.userDisplayName} Please redeem "${addRewardName}" first before redeeming "${genderRewardName}". ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemGender: ${event.userDisplayName} (id: ${event.userId}) is not in player data.`
      );
    }
    if (!player.alive) {
      this.rewardManager.rejectRedeem(event);
      const addRewardName = this.getRewardName(requiredRewards.add);
      const genderRewardName = this.getRewardName(requiredRewards.changeCharacterGender);
      throw new ChattableError(
        `@${player.userDisplayName} Please redeem "${addRewardName}" first before redeeming "${genderRewardName}". ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemGender: ${player.userDisplayName} is not in player data.`
      );
    }

    const input = event.input.trim();
    const reqGender = input.replace(' ', '_');
    const gender = pickGender(reqGender);
    if (!gender) {
      this.rewardManager.rejectRedeem(event);
      throw new ChattableError(
        `@${player.userDisplayName} You can only set your character's gender with these values: ${characterGenders.join(', ')}. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemGender: ${player.userDisplayName} entered an invalid gender ("${input}").`
      );
    }
    player.characterGender = gender;
    this.update(player);
    await this.save();
    this.rewardManager.approveRedeem(event);
    this.socketManager.allEmit(appActions.updatePlayer, player);
    logger(`PlayerManager.onRedeemGender: ${player.userDisplayName} changed gender to ${gender}`);
  }

  async onCommandCharacter(chatBotManager, channel, user, message, parts) {
    const player = this.getPlayerFromUserName(user.toLowerCase());
    if (!player) {
      const addRewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${user} Please redeem "${addRewardName}" first before doing the character command.`,
        `PlayerManager.onCommandCharacter: ${user} is not in player data.`
      );
    }
    if (!player.alive) {
      const addRewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${user} Please redeem "${addRewardName}" first before doing the character command.`,
        `PlayerManager.onCommandCharacter: ${user} is not in player data.`
      );
    }

    if (parts.length === 1) {
      chatBotManager.say(`@${user} Your character is ${player.characterType}, ${player.characterGender}.`);
      return;
    }
    if (!this.isCharTypeMethod(ChangeMethods.chat)) {
      return;
    }

    if (parts.length === 2 || parts.length === 3) {
      const reqType = parts.length === 3 ? `${parts[1]}_${parts[2]}` : parts[1];
      const characterType = pickCharType(reqType);
      
      if (!characterType) {
        throw new ChattableError(
          `@${user} Not a valid character type. Please refer to ${this.settings.commandPrefix}allchars`,
          `PlayerManager.onCommandCharacter: ${user} entered an invalid character type ("${reqType}")`
        );
      }

      player.characterType = characterType;
      this.update(player);
      await this.save();
      this.socketManager.allEmit(appActions.updatePlayer, player);
      chatBotManager.say(`@${user} Your character is now ${characterType}, ${player.characterGender}.`);
      logger(`PlayerManager.onCommandCharacter: ${player.userDisplayName} changed character to ${characterType}`);

      return;
    }

    chatBotManager.say(`@${user} Invalid command.`);
  }

  async onRedeemCharacter(event) {
    if (!this.isCharTypeMethod(ChangeMethods.reward)) {
      this.rewardManager.rejectRedeem(event);
      return;
    }
    const player = this.getPlayer(event.userId);
    if (!player) {
      this.rewardManager.rejectRedeem(event);
      const addRewardName = this.getRewardName(requiredRewards.add);
      const typeRewardName = this.getRewardName(requiredRewards.changeCharacterType);
      throw new ChattableError(
        `@${event.userDisplayName} Please redeem "${addRewardName}" first before redeeming "${typeRewardName}". ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemCharacter: ${event.userDisplayName} (id: ${event.userId}) is not in player data.`
      );
    }
    if (!player.alive) {
      this.rewardManager.rejectRedeem(event);
      const typeRewardName = this.getRewardName(requiredRewards.changeCharacterType);
      const addRewardName = this.getRewardName(requiredRewards.add);
      throw new ChattableError(
        `@${player.userDisplayName} Please redeem "${addRewardName}" first before redeeming "${typeRewardName}". ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemCharacter: ${player.userDisplayName} is not in player data.`
      );
    }

    const input = event.input.trim();
    const reqType = input.replace(' ', '_');
    const characterType = pickCharType(reqType);

    if (!characterType) {
      this.rewardManager.rejectRedeem(event);
      throw new ChattableError(
        `@${player.userDisplayName} Not a valid character type. Please refer to ${this.settings.commandPrefix}allchars. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemCharacter: ${player.userDisplayName} entered an invalid character type ("${input}")`
      );
    }

    player.characterType = characterType;
    this.update(player);
    await this.save();
    this.rewardManager.approveRedeem(event);
    this.socketManager.allEmit(appActions.updatePlayer, player);
    logger(`PlayerManager.onRedeemCharacter: ${player.userDisplayName} changed character to ${characterType}`);
  }

  async onCommandAllCharacters(chatBotManager, channel, user, message, parts) {
    chatBotManager.say(`@${user} Characters: ${characterTypes.join(', ')}`);
  }

  async onRedeemRunAround(event) {
    const player = this.getPlayer(event.userId);
    if (!player) {
      this.rewardManager.rejectRedeem(event);
      const addRewardName = this.getRewardName(requiredRewards.add);
      const runRewardName = this.getRewardName(requiredRewards.runAround);
      throw new ChattableError(
        `@${event.userDisplayName} Please redeem "${addRewardName}" first before redeeming "${runRewardName}". ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemRunAround: ${event.userDisplayName} (id: ${event.userId}) is not in player data.`
      );
    }
    if (!player.alive) {
      this.rewardManager.rejectRedeem(event);
      const addRewardName = this.getRewardName(requiredRewards.add);
      const runRewardName = this.getRewardName(requiredRewards.runAround);
      throw new ChattableError(
        `@${player.userDisplayName} Please redeem "${addRewardName}" first before redeeming "${runRewardName}". ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemRunAround: ${player.userDisplayName} is not in player data.`
      );
    }
    if (this.isInBattle(player.userId)) {
      this.rewardManager.rejectRedeem(event);
      const runRewardName = this.getRewardName(requiredRewards.runAround);
      throw new ChattableError(
        `@${player.userDisplayName} You are currently in a battle. Please wait until after the battle to redeem "${runRewardName}" ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemRunAround: ${player.userDisplayName} is currently in battle.`
      );
    }

    this.rewardManager.approveRedeem(event);
    this.socketManager.overlayEmit(appActions.runPlayer, player.userId);
    logger(`PlayerManager.onRedeemRunAround: ${player.userDisplayName} redeemed to run around.`);
  }

  async onRedeemDance(event) {
    const player = this.getPlayer(event.userId);
    if (!player) {
      this.rewardManager.rejectRedeem(event);
      const addRewardName = this.getRewardName(requiredRewards.add);
      const danceRewardName = this.getRewardName(requiredRewards.dance);
      throw new ChattableError(
        `@${event.userDisplayName} Please redeem "${addRewardName}" first before redeeming "${danceRewardName}". ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemDance: ${event.userDisplayName} (id: ${event.userId}) is not in player data.`
      );
    }
    if (!player.alive) {
      this.rewardManager.rejectRedeem(event);
      const addRewardName = this.getRewardName(requiredRewards.add);
      const danceRewardName = this.getRewardName(requiredRewards.dance);
      throw new ChattableError(
        `@${player.userDisplayName} Please redeem "${addRewardName}" first before redeeming "${danceRewardName}". ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemDance: ${player.userDisplayName} is not in player data.`
      );
    }
    if (this.isInBattle(player.userId)) {
      this.rewardManager.rejectRedeem(event);
      const danceRewardName = this.getRewardName(requiredRewards.dance);
      throw new ChattableError(
        `@${player.userDisplayName} You are currently in a battle. Please wait until after the battle to redeem "${danceRewardName}". ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `PlayerManager.onRedeemDance: ${player.userDisplayName} is currently in battle.`
      );
    }

    this.rewardManager.approveRedeem(event);
    this.socketManager.overlayEmit(appActions.dancePlayer, player.userId);
    logger(`PlayerManager.onRedeemDance: ${player.userDisplayName} redeemed to dance.`);
  }

  getGenderMethod() {
    return this.files.playerData.data.genderMethod;
  }
  isGenderMethod(method) {
    return this.files.playerData.data.genderMethod === method;
  }
  getCharTypeMethod() {
    return this.files.playerData.data.charTypeMethod;
  }
  isCharTypeMethod(method) {
    return this.files.playerData.data.charTypeMethod === method;
  }

  getRewardName(action) {
    const reward = this.rewardManager.getRewardFromAction(action.key);
    return reward ? reward.title : action.title;
  }

  getPlayer(userId) {
    return this.files.playerData.data.players.find(player => userId === player.userId);
  }

  getPlayerFromUserName(userName) {
    return this.files.playerData.data.players.find(player => userName === player.userName);
  }

  getAllPlayers() {
    return this.files.playerData.data.players;
  }

  getAllPlayerIds() {
    return this.files.playerData.data.players.map(player => player.userId);
  }

  getPlayerCount() {
    return this.files.playerData.data.players.length;
  }

  createPlayerMap() {
    const map = {};
    this.files.playerData.data.players.forEach(player => map[player.userId] = player);
    return map;
  }

  update(idOrObj, playerObj = null) {
    const idOrObjType = typeof idOrObj;
    const playerObjType = typeof playerObj;
    const validCall = (idOrObjType === 'object' && !playerObj) || (idOrObjType === 'string' && playerObjType === 'object');
    if (!validCall) {
      throw new Error('update: Invalid call. Valid calls are update(string, obj) or update(obj)');
    }
    let userId;
    if (idOrObjType === 'string') {
      userId = idOrObj;
    } else {
      playerObj = idOrObj;
      userId = playerObj.userId;
    }
    if (this.files.playerData.data.players.indexOf(playerObj) !== -1) {
      // player object directly modified, no need to update
      return;
    }
    let player = this.files.playerData.data.players.find(p => p.userId === userId);

    if (!player) {
      player = { ...defaultPlayer };
      this.files.playerData.data.players.push(player);
    }
    // only apply known properties
    applyKnownProps(player, playerObj);
  }

  async save() {
    await this.files.playerData.save();
  }

  async addPlayer(event) {
    let player = this.getPlayer(event.userId);
    if (player && player.userId === event.userId && player.alive) {
      // delayed refund
      this.rewardManager.rejectRedeem(event);
      throw new ChattableError(
        `@${player.userDisplayName} You are already in the game. ` +
        `Refunding ${this.settings.channelPointsName}.`,
        `addPlayer: "${player.userName}" already alive in game`
      );
    }
    if (player) {
      player.userName = event.userName;
      player.userDisplayName = event.userDisplayName;
      player.alive = true;
      player.weapon = false;
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

    await this.files.playerData.save();

    this.rewardManager.approveRedeem(event);

    this.socketManager.allEmit(appActions.addPlayer, player);
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

    this.update(userId, data);
    
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

  async onSocketUpdateGenderMethod(genderMethod) {
    if (!Object.values(ChangeMethods).includes(genderMethod)) {
      throw new Error(`PlayerManager.onSocketUpdateCharTypeMethod: "${genderMethod}" not a valid value`);
    }
    const enableReward = genderMethod === ChangeMethods.reward;
    const rewardId = this.rewardManager.getRewardIdFromAction(requiredRewards.changeCharacterGender.key);
    if (rewardId) {
      await this.rewardManager.setEnabledRewardById(rewardId, enableReward);
      logger(`${enableReward ? 'Enabled' : 'Disabled'} change gender reward.`);
    }
    this.files.playerData.data.genderMethod = genderMethod;
    await this.save();
    this.socketManager.controlEmit(appActions.updateGenderMethod, genderMethod);
    logger(`Changed genderMethod to ${genderMethod}`);
  }
  async onSocketUpdateCharTypeMethod(charTypeMethod) {
    if (!Object.values(ChangeMethods).includes(charTypeMethod)) {
      throw new Error(`PlayerManager.onSocketUpdateCharTypeMethod: "${charTypeMethod}" not a valid value`);
    }
    const enableReward = charTypeMethod === ChangeMethods.reward;
    const rewardId = this.rewardManager.getRewardIdFromAction(requiredRewards.changeCharacterType.key);
    if (rewardId) {
      await this.rewardManager.setEnabledRewardById(rewardId, enableReward);
      logger(`${enableReward ? 'Enabled' : 'Disabled'} change character type reward.`);
    }
    this.files.playerData.data.charTypeMethod = charTypeMethod;
    await this.save();
    this.socketManager.controlEmit(appActions.updateCharTypeMethod, charTypeMethod);
    logger(`Changed charTypeMethod to ${charTypeMethod}`);
  }
  async onSocketRunAround(userId) {
    const player = this.getPlayer(userId);
    if (!player) {
      throw new ExpectedError(`onSocketRunAround: "${userId}" not in player data`);
    }
    if (!player.alive) {
      throw new ExpectedError(`onSocketRunAround: "${player.userDisplayName}" not in arena`);
    }
    const date = new Date();
    this.onRedeemRunAround({
      id: `debug-${userId}-${date.getTime()}`,
      rewardId: this.rewardManager.getRewardIdFromAction(requiredRewards.runAround.key),
      userId,
      userName: player.userName,
      userDisplayName: player.userDisplayName,
      input: null,
      debug: true
    });
  }
  async onSocketDance(userId) {
    const player = this.getPlayer(userId);
    if (!player) {
      throw new ExpectedError(`onSocketDance: "${userId}" not in player data`);
    }
    if (!player.alive) {
      throw new ExpectedError(`onSocketDance: "${player.userDisplayName}" not in arena`);
    }
    const date = new Date();
    this.onRedeemDance({
      id: `debug-${userId}-${date.getTime()}`,
      rewardId: this.rewardManager.getRewardIdFromAction(requiredRewards.dance.key),
      userId,
      userName: player.userName,
      userDisplayName: player.userDisplayName,
      input: null,
      debug: true
    });
  }
}

module.exports = PlayerManager;
module.exports.defaultPlayer = defaultPlayer;
