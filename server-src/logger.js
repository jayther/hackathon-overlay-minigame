
module.exports = (...msg) => {
  const date = new Date();
  const args = [`[${date.toLocaleTimeString()}]:`].concat(msg);
  console.log.apply(console, args);
};
