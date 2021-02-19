
module.exports = {
  next: function (array, current) {
    let index = array.indexOf(current);
    if (index === -1) {
      return array[0];
    }
    index += 1;
    if (index >= array.length) {
      index = 0;
    }
    return array[index];
  },
  subtract: function (minuend, subtrahend, prop = undefined) {
    if (prop) {
      return minuend.filter(a => !subtrahend.find(b => a[prop] === b[prop]));
    }
    return minuend.filter(a => subtrahend.indexOf(a) === -1);
  },
  changes: function (arrayA, arrayB, propKey, props) {
    return arrayA.filter(
      a => arrayB.some(
        b => a[propKey] === b[propKey] && props.some(prop => a[prop] !== b[prop])
      )
    );
  }
}
