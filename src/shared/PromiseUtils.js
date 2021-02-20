function waitForMS(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function waitForSeconds(seconds) {
  return waitForMS(seconds * 1000);
}

module.exports = {
  waitForMS,
  waitForSeconds
};
