
function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function objToParams(obj) {
  const paramParts = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === null) {
      paramParts.push(key);
    } else {
      paramParts.push(`${key}=${value}`);
    }
  }
  return paramParts.join('&');
}

module.exports = {
  has,
  objToParams
};
