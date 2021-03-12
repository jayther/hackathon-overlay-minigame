
// TODO error codes?

class ExpectedError extends Error {
  constructor(...params) {
    super(...params);
    this.name = 'ExpectedError';
    this.expected = true;
  }
}

class SetupError extends Error {
  constructor(statusCode, ...params) {
    super(...params);
    this.name = 'SetupError';
    this.expected = true;
    this.statusCode = statusCode;
  }
}

class ChattableError extends Error {
  constructor(chatMessage, ...params) {
    super(...params);
    this.name = 'ChattableError';
    this.expected = true;
    this.chatMessage = chatMessage;
    this.sendToChat = true;
  }
  setSetSendToChat(sendToChat) {
    this.sendToChat = sendToChat;
    return this;
  }
}

module.exports = {
  ExpectedError,
  SetupError,
  ChattableError
};
