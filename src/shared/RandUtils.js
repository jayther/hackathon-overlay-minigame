
function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickExcept(list, except) {
  const pool = list.slice();
  const excepts = Array.isArray(except) ? except : [except];
  excepts.forEach(e => {
    const index = pool.indexOf(e);
    if (index !== -1) {
      pool.splice(index, 1);
    }
  });
  return pick(pool);
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
  pickExcept,
  between,
  betweenInt,
  rollDice
};
