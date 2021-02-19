
const characterTypes = [
  'Archangel',
  'Archdemon',
  'Assassin',
  'Electric_Knight',
  'Executioner',
  'Fire_Knight',
  'Highlander',
  'Kings_Guard',
  'Knight',
  'Mayan',
  'Ninja',
  'Paladin',
  'Pirate',
  'Royal_Guard',
  'Samurai',
  'Spartan',
  'Viking'
];

const characterGenders = [
  'Male',
  'Female'
];

function createCharacter(type, gender) {
  return `${type}_${gender}`;
}

function underScoreToSpace(name) {
  return name.replace('_', ' ');
}

module.exports = {
  characterTypes,
  characterGenders,
  createCharacter,
  underScoreToSpace
};
