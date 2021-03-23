
module.exports = {
  appSecretsPath: './.appsecrets.json',
  userTokensPath: './.usertokens.json',
  chatBotTokensPath: './.chatbottokens.json',
  rewardMapPath: './.rewardmap.json',
  playerDataPath: './.playerdata.json',
  soundSettingsPath: './.soundsettings.json',
  battleSettingsPath: './.battlesettings.json',
  twitchApiScopes: [
    'channel:read:redemptions',
    'channel:manage:redemptions',
    'chat:edit',
    'chat:read'
  ],
  socketEvents: {
    controlAdded: 'controladded',
    controlRemoved: 'controlremoved',
    overlayAdded: 'overlayadded',
    overlayRemoved: 'overlayremoved',
    setupAuthorized: 'setupauthorized'
  },
  chatEvents: {
    chatCommand: 'chatcommand'
  },
  updateRedeemDelay: 1000 //ms
};
