const { has } = require('../ObjectUtils');
const JMath = require('./JMath');

class Vec2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  abs() {
    if (this.x < 0) {
      this.x = -this.x;
    }
    if (this.y < 0) {
      this.y = -this.y;
    }
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
  }

  multiply(a) {
    this.x *= a;
    this.y *= a;
  }

  mulM(a) {
    const tX = this.x;
    this.x = a.col1.x * tX + a.col2.x * this.y;
    this.y = a.col1.y * tX + a.col2.y * this.y;
  }

  mulTM(a) {
  }

  crossVF(s) {
    const tX = this.x;
    this.x = s * this.y;
    this.y = -s * tX;
  }

  crossFV(s) {
    const tX = this.x;
    this.x = -s * this.y;
    this.y = s * tX;
  }

  min(v) {
    this.x = this.x < v.x ? this.x : v.x;
    this.y = this.y < v.y ? this.y : v.y;
  }

  max(v) {
    this.x = this.x > v.x ? this.x : v.x;
    this.y = this.y > v.y ? this.y : v.y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }

  normalize() {
    let len = Math.sqrt(this.x * this.x + this.y * this.y), inv;
    // TODO: do we use epsilon here?
    if (len < Number.MIN_VALUE) {
      return 0;
    }
    inv = 1.0 / len;
    this.x *= inv;
    this.y *= inv;

    return len;
  }

  copy() {
    return new Vec2(this.x, this.y);
  }

  setZero() {
    this.x = 0;
    this.y = 0;
  }

  getNegative() {
    return new Vec2(-this.x, -this.y);
  }

  negativeSelf() {
    this.x = -this.x;
    this.y = -this.y;
  }

  set(x, y) {
    if (typeof x === 'number' && typeof y === 'number') {
      this.x = x;
      this.y = y;
    } else if (x && has(x, 'x') && has(x, 'y')) {
      this.x = x.x;
      this.y = x.y;
    }
  }

  setAngle(angle) {
    this.x = Math.cos(angle);
    this.y = Math.sin(angle);
  }

  static lerp(a, b, r) {
    return new Vec2(
      JMath.lerp(a.x, b.x, r),
      JMath.lerp(a.y, b.y, r)
    );
  }
}

module.exports = Vec2;
