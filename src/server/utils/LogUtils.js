const logger = require('./logger');

function maybeExpectedError(e) {
  if (e.expected || !e.stack) {
    logger(e.message);
  } else {
    logger(e.stack);
  }
}

function bindAndLog(promisable, thisArg) {
  return (...args) => {
    return promisable.apply(thisArg, args).catch(maybeExpectedError);
  };
}

function logOnCatch(promisable) {
  return promisable.catch(maybeExpectedError);
}

module.exports = {
  bindAndLog,
  logOnCatch
};
