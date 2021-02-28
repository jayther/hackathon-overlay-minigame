
module.exports = {
  add: {
    key: 'add',
    eventName: 'redeem:add',
    title: 'Add your character on stream',
    cost: 100,
    prompt: 'Add a character that represents you on my stream!',
    userInputRequired: false
  },
  duel: {
    key: 'duel',
    eventName: 'redeem:duel',
    title: 'Duel random player',
    cost: 100,
    prompt: 'Duel a random opponent on my stream!',
    userInputRequired: false
  },
  duelSomeone: {
    key: 'duelSomeone',
    eventName: 'redeem:duelSomeone',
    title: 'Duel specific person',
    cost: 100,
    prompt: 'Duel a specific person on my stream!',
    userInputRequired: true
  },
  weaponize: {
    key: 'weaponize',
    eventName: 'redeem:weaponize',
    title: 'Equip weapon',
    cost: 100,
    prompt: 'Equip special weapon on your character for a damage boost!',
    userInputRequired: false
  }
};
