
export default {
  pick: function (list) {
    return list[Math.floor(Math.random() * list.length)];
  },
  between: function (min, max) {
    return min + Math.random() * (max - min);
  },
  betweenInt: function (min, max) {
    return Math.floor(min + Math.random() * (max - min));
  }
};
