const PI2 = Math.PI * 2;

function normalizeAngle(angle) {
  while(angle >= Math.PI) {
    angle -= PI2;
  }
  while (angle < -Math.PI) {
    angle += PI2;
  }
  return angle;
}

function radToDeg(rad) {
  return rad / PI2 * 360;
}

function degToRad(deg) {
  return deg / 360 * PI2;
}

function lerp(min, max, ratio) {
  return min + (max - min) * ratio;
}

function clamp(min, max, value) {
  return value > max ? max : value < min ? min : value;
}

function clamp01(value) {
  return clamp(0, 1, value);
}

function distance(posA, posB) {
  const dx = posB.x - posA.x,
    dy = posB.y - posA.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function sign(num) {
  return num > 0 ? 1 : num < 0 ? -1 : 0;
}

function round10NthPlace(num, n) {
  return Math.round(num * Math.pow(10, n)) / Math.pow(10, n); 
}

function floor10NthPlace(num, n) {
  return Math.floor(num * Math.pow(10, n)) / Math.pow(10, n);
}

function ceil10NthPlace(num, n) {
  return Math.ceil(num * Math.pow(10, n)) / Math.pow(10, n);
}

module.exports = {
  normalizeAngle,
  radToDeg,
  degToRad,
  lerp,
  clamp,
  clamp01,
  distance,
  sign,
  round10NthPlace,
  floor10NthPlace,
  ceil10NthPlace
};
