
function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function between(min, max) {
  return min + Math.random() * (max - min);
}

function betweenInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

function rollDice(count, sides) {
  let sum = 0;
  for (let i = 0; i < count; i += 1) {
    sum += betweenInt(0, sides) + 1;
  }
  return sum;
}

module.exports = {
  pick,
  between,
  betweenInt,
  rollDice
};
