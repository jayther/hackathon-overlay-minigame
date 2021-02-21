
const { has } = require('../ObjectUtils');
const Vec2 = require('./Vec2');

class JRect {
  constructor(options) {
    var opts = options || {};
  
    this.left = opts.left || 0;
    this.top = opts.top || 0;
    this.right = opts.right || 0;
    this.bottom = opts.bottom || 0;
  
    if (has(opts, 'x')) {
      this.left = opts.x;
    }
    if (has(opts, 'y')) {
      this.top = opts.y;
    }
    if (has(opts, 'width')) {
      this.right = this.left + opts.width;
    }
    if (has(opts, 'height')) {
      this.bottom = this.top + opts.height;
    }
    this.checkDimensions();
  }
  static doRectsIntersect(a, b) {
    const ax = a.getCenterX(),
      ay = a.getCenterY(),
      ahw = a.getWidth() / 2,
      ahh = a.getHeight() / 2,
      bx = b.getCenterX(),
      by = b.getCenterY(),
      bhw = b.getWidth() / 2,
      bhh = b.getHeight() / 2;
    return (
      (Math.abs(ax - bx) < ahw + bhw) &&
      (Math.abs(ay - by) < ahh + bhh)
    );
  }
  static combine(a, b) {
    const n = new JRect();
    n.combine(a, b);
    return n;
  }
  static isJRect(rect, strict) {
    if (!rect) {
      return false;
    }
    if (Object.keys(JRect.IDENTITY).some(key => !has(rect, key))) {
      return false;
    }
    // don't know if this still works
    if (strict && Object.keys(JRect.prototype).some(key => !rect[key])) {
      return false;
    }

    return true;
  }
  getCenterX() {
    return (this.left + this.right) / 2;
  }
  getCenterY() {
    return (this.top + this.bottom) / 2;
  }
  getCenter() {
    return new Vec2(this.getCenterX(), this.getCenterY());
  }
  set(l, t, r, b) {
    const lType = typeof l;
    if (l && lType === 'object') {
      this.apply(l);
    } else if (lType === 'number') {
      this.left = l || 0;
      this.top = t || 0;
      this.right = r || 0;
      this.bottom = b || 0;
    } else {
      throw 'JRect.set: invalid parameter(s).';
    }
  }
  setX(x) {
    const width = this.getWidth();
    this.left = x;
    this.right = x + width;
  }
  setY(y) {
    const height = this.getHeight();
    this.top = y;
    this.bottom = y + height;
  }
  setPosition(x, y) {
    this.setX(x);
    this.setY(y);
  }
  setCenterX(x) {
    const hw = this.getWidth() / 2;
    this.left = x - hw;
    this.right = x + hw;
  }
  setCenterY(y) {
    const hh = this.getHeight() / 2;
    this.top = y - hh;
    this.bottom = y + hh;
  }
  setCenter(x, y) {
    this.setCenterX(x);
    this.setCenterY(y);
  }
  checkDimensions() {
    let temp;
    if (this.left > this.right) {
      temp = this.left;
      this.left = this.right;
      this.right = temp;
    }
    if (this.top > this.bottom) {
      temp = this.top;
      this.top = this.bottom;
      this.bottom = temp;
    }
  }
  translateX(dx) {
    this.left += dx;
    this.right += dx;
  }
  translateY(dy) {
    this.top += dy;
    this.bottom += dy;
  }
  translate(dx, dy) {
    this.translateX(dx);
    this.translateY(dy);
  }
  getWidth() {
    return this.right - this.left;
  }
  getHeight() {
    return this.bottom - this.top;
  }
  setWidth(w) {
    this.right = this.left + w;
  }
  setHeight(h) {
    this.bottom = this.top + h;
  }
  containsPoint(x, y) {
    return x >= this.left &&
      x < this.right &&
      y >= this.top &&
      y < this.bottom;
  }
  intersectsRect(rect) {
    return JRect.doRectsIntersect(this, rect);
  }
  copy() {
    return new JRect({ left: this.left, top: this.top, right: this.right, bottom: this.bottom });
  }
  apply(rect) {
    this.left = rect.left;
    this.top = rect.top;
    this.right = rect.right;
    this.bottom = rect.bottom;
  }
  contains(r) {
    return (
      this.left <= r.left &&
      this.top <= r.top &&
      r.right <= this.right &&
      r.bottom <= this.bottom
    );
  }
  combine(a, b) {
    this.left = Math.min(a.left, b.left);
    this.top = Math.min(a.top, b.top);
    this.right = Math.max(a.right, b.right);
    this.bottom = Math.max(a.bottom, b.bottom);
  }
  addRect(r) {
    this.left = Math.min(this.left, r.left);
    this.top = Math.min(this.top, r.top);
    this.right = Math.max(this.right, r.right);
    this.bottom = Math.max(this.bottom, r.bottom);
  }
}
JRect.IDENTITY = new JRect();

module.exports = JRect;
