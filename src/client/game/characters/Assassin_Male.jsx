
export default {
  name: 'Assassin Male',
  idle: {
    sprites: [
      'Assassin_Male/idle_1.png',
      'Assassin_Male/idle_2.png',
      'Assassin_Male/idle_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Assassin_Male/run_1.png',
      'Assassin_Male/run_2.png',
      'Assassin_Male/run_3.png',
      'Assassin_Male/run_4.png'
    ],
    frameDelay: 75
  },
  dead: {
    sprites: [
      'Assassin_Male/dead_1.png'
    ],
    frameDelay: 750
  },
  attacks: [
    {
      sprites: [
        'Assassin_Male/attackUnarmed_1.png',
        'Assassin_Male/attackUnarmed_2.png',
        'Assassin_Male/attackUnarmed_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Assassin_Male/attackUnarmed2_1.png',
        'Assassin_Male/attackUnarmed2_2.png',
        'Assassin_Male/attackUnarmed2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Assassin_Male/attackUnarmed3_1.png',
        'Assassin_Male/attackUnarmed3_2.png',
        'Assassin_Male/attackUnarmed3_3.png'
      ],
      frameDelay: 100
    }
  ]
};
