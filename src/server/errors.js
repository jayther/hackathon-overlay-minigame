
// TODO error codes?

class ExpectedError extends Error {
  constructor(...params) {
    super(...params);
    this.name = 'ExpectedError';
    this.expected = true;
  }
}

module.exports = {
  ExpectedError
};
