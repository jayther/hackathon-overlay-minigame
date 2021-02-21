class AABB {
  constructor(x, y, hw, hh) {
      this.x = x || 0;
      this.y = y || 0;
      this.hw = hw || 0;
      this.hh = hh || 0;
    }

  set(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  getLeft() {
    return this.x - this.hw;
  }

  getTop() {
    return this.y - this.hh;
  }

  getRight() {
    return this.x + this.hw;
  }

  getBottom() {
    return this.y + this.hh;
  }

  getWidth() {
    return this.hw * 2;
  }

  getHeight() {
    return this.hh * 2;
  }

  intersectsWith(aabb) {
    return (
      (Math.abs(this.x - aabb.x) < this.hw + aabb.hw) &&
      (Math.abs(this.y - aabb.y) < this.hh + aabb.hh)
    );
  }

  containsPoint(x, y) {
    return Math.abs(this.x - x) < this.hw && Math.abs(this.y - y) < this.hh;
  }
}

module.exports = AABB;
