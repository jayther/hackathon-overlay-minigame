
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

function pickArgs(...list) {
  return pick(list);
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

function shuffleNew(array) {
  const pool = array.slice();
  const n = [];
  while (pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    n.push(pool[index]);
    pool.splice(index, 1);
  }
  return n;
}

function shuffleInPlace(array) {
  let target, temp;
  for (let i = 0; i < array.length - 1; i += 1) {
    target = Math.floor(Math.random() * array.length);
    if (target === i) {
      continue;
    }
    temp = array[i];
    array[i] = array[target];
    array[target] = temp;
  }
  return array; // just return the same array for chaining
}
module.exports = {
  pick,
  pickExcept,
  pickArgs,
  between,
  betweenInt,
  rollDice,
  shuffleNew,
  shuffleInPlace
};
