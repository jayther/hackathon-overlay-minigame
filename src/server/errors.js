
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

module.exports = {
  ExpectedError,
  SetupError
};
