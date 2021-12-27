const { ApiClient } = require('twitch');
const { EventSubListener } = require('twitch-eventsub');
const { NgrokAdapter } = require('twitch-eventsub-ngrok');
const {
  ClientCredentialsAuthProvider,
  RefreshableAuthProvider,
  StaticAuthProvider
} = require('twitch-auth');

const JsonDataFile = require('./src/server/JsonDataFile');
const logger = require('./src/server/utils/logger');

const {
  appSecretsPath,
  userTokensPath,
  rewardMapPath,
  rewardSettingsPath
} = require('./src/server/consts');

const files = {
  appSecrets: new JsonDataFile(appSecretsPath),
  userTokens: new JsonDataFile(userTokensPath),
  rewardMap: new JsonDataFile(rewardMapPath),
  rewardSettings: new JsonDataFile(rewardSettingsPath)
};

const subs = {
  rewardRemoveSub: null,
  rewardUpdateSub: null,
  redeemSub: null,
  redeemUpdateSub: null
};

let userClient, appClient, user, eventSub;

function isAppReady() {
  // force into boolean to prevent secret leak
  return !!(
    files.appSecrets &&
    files.appSecrets.data &&
    files.appSecrets.data.clientId &&
    files.appSecrets.data.clientSecret
  );
}

function areUserTokensReady() {
  return !!(
    files.userTokens &&
    files.userTokens.data &&
    files.userTokens.data.accessToken
  );
}

async function startUserClient() {
  if (!isAppReady()) {
    throw new Error(`Cannot start twitch: no app secrets`);
  }
  if (!areUserTokensReady()) {
    throw new Error(`Cannot start twitch: no user tokens`);
  }
  if (userClient) {
    logger('userClient already started');
    return;
  }
  logger('Starting twitch user...');
  const authProvider = new RefreshableAuthProvider(
    new StaticAuthProvider(files.appSecrets.data.clientId, files.userTokens.data.accessToken),
    {
      clientSecret: files.appSecrets.data.clientSecret,
      refreshToken: files.userTokens.data.refreshToken,
      onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
        const tokensData = {
          accessToken,
          refreshToken,
          expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
        };
        files.userTokens.data = tokensData;
        await files.userTokens.save();
        logger('User tokens refreshed');
      }
    }
  );
  userClient = new ApiClient({ authProvider });
  const twitchUser = await userClient.helix.users.getMe();
  user = {
    id: twitchUser.id,
    name: twitchUser.name,
    displayName: twitchUser.displayName,
    profilePictureUrl: twitchUser.profilePictureUrl
  };
  logger('Twitch User started');
}

async function startAppClient() {
  if (!isAppReady()) {
    throw new Error(`Cannot start twitch: no app secrets`);
  }
  if (appClient) {
    logger('appClient already started');
    return;
  }
  logger('Starting twitch app...');
  const authProvider = new ClientCredentialsAuthProvider(files.appSecrets.data.clientId, files.appSecrets.data.clientSecret);
  appClient = new ApiClient({ authProvider });
  logger('Twitch App started');
}

async function startEventSub() {
  if (!appClient) {
    throw new Error(`Cannot start eventSub: appClient not ready`);
  }
  if (!user) {
    throw new Error(`Cannot start eventSub: missing user (userClient started but did not get user details)`);
  }
  if (eventSub) {
    logger('eventSub already started');
    return;
  }
  logger('Starting eventSub...');
  eventSub = new EventSubListener(appClient, new NgrokAdapter());
  await eventSub.listen();
  logger('eventSub started');
}

async function listSubs() {
  logger('Listing eventsubs');
  const results = await appClient.helix.eventSub.getSubscriptions();
  logger(`Event sub count: ${results.total}`);
  if (results.data) {
    for (const sub of results.data) {
      logger(
        `id: ${sub.id}\n` +
        `  creationDate: ${sub.creationDate}\n` +
        `  condition: ${JSON.stringify(sub.condition)}\n` +
        `  status: ${sub.status}\n` +
        `  type: ${sub.type}`
      );
    }
  }
}

async function clearSubs() {
  logger('Removing old subscriptions...');
  await appClient.helix.eventSub.deleteAllSubscriptions();
  await listSubs();
}

async function addSubs() {
  await startEventSub();
  logger('Subscribing to reward add events...');
  subs.rewardAddSub = await eventSub.subscribeToChannelRewardAddEvents(
    user.id, function (rewardEvent) {
      logger(`Reward added: ${rewardEvent.title}`);
    }
  );
  logger('Subscribing to reward remove events...');
  subs.rewardRemoveSub = await eventSub.subscribeToChannelRewardRemoveEvents(
    user.id, function (rewardEvent) {
      logger(`Reward removed: ${rewardEvent.title}`);
    }
  );
  logger('Subscribing to reward update events...');
  subs.rewardUpdateSub = await eventSub.subscribeToChannelRewardUpdateEvents(
    user.id, function (rewardEvent) {
      logger(`Reward updated: ${rewardEvent.title}`);
    }
  );
  logger('Subscribing to redeem add events...');
  subs.redeemSub = await eventSub.subscribeToChannelRedemptionAddEvents(
    user.id, function (redeemEvent) {
      logger(`Redeemed: ${redeemEvent.rewardTitle} by ${redeemEvent.userDisplayName} (id: ${redeemEvent.id})`);
    }
  );
  logger('Subscribing to redeem update events...');
  subs.redeemUpdateSub = await eventSub.subscribeToChannelRedemptionUpdateEvents(
    user.id, function (redeemEvent) {
      logger(`Redemption updated: ${redeemEvent.rewardTitle} by ${redeemEvent.userDisplayName} (id: ${redeemEvent.id})`);
    }
  );
  logger('Subscribed to all needed events');

  await listSubs();
}

async function manualUnsub() {
  const results = await appClient.helix.eventSub.getSubscriptions();
  logger(`Event sub count: ${results.total}`);
  if (results.data) {
    for (const sub of results.data) {
      await sub.unsubscribe();
      logger(`${sub.type} unsubbed.`);
    }
  }
  
  await listSubs();
}

async function init() {
  for (const file of Object.values(files)) {
    await file.load();
  }

  await startUserClient();
  await startAppClient();

  logger('Everything is ready!');

  const arg = process.argv[2] || null;

  switch (arg) {
  case 'list-subs': await listSubs(); break;
  case 'clear-subs': await clearSubs(); break;
  case 'add-subs': await addSubs(); break;
  case 'manual-unsub': await manualUnsub(); break;
  }
}

init();
