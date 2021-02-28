
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

function applyKnownProps(base, obj) {
  for (const key of Object.keys(base)) {
    if (has(obj, key)) {
      base[key] = obj[key];
    }
  }
}

module.exports = {
  has,
  objToParams,
  applyKnownProps
};
