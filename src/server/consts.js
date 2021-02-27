
module.exports = {
  appSecretsPath: './.appsecrets.json',
  userTokensPath: './.usertokens.json',
  rewardMapPath: './.rewardmap.json',
  playerDataPath: './.playerdata.json',
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
  updateRedeemDelay: 1000 //ms
};