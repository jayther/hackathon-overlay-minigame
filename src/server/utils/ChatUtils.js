const { chatEvents } = require('../consts');

function createCommandEvent(command) {
  return `${chatEvents.chatCommand}-${command}`;
}

module.exports = {
  createCommandEvent
};
