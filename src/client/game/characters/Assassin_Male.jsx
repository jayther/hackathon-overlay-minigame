
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
  idleWeapon: {
    sprites: [
      'Assassin_Male/idle_sword_1.png',
      'Assassin_Male/idle_sword_2.png',
      'Assassin_Male/idle_sword_3.png'
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
  dash: {
    sprites: [
      'Assassin_Male/dash_1.png',
      'Assassin_Male/dash_2.png'
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Assassin_Male/dash_sword_1.png',
      'Assassin_Male/dash_sword_2.png'
    ],
    frameDelay: 75
  },
  spawn: {
    sprites: [
      'Assassin_Male/graveBurst_1.png'
    ],
    frameDelay: 600,
    stationary: false
  },
  hit: {
    sprites: [
      'Assassin_Male/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Assassin_Male/dead_1.png'
    ],
    frameDelay: 500
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
  ],
  attacksWeapon: [
    {
      sprites: [
        'Assassin_Male/attackWeapon1_1.png',
        'Assassin_Male/attackWeapon1_2.png',
        'Assassin_Male/attackWeapon1_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Assassin_Male/attackWeapon2_1.png',
        'Assassin_Male/attackWeapon2_2.png',
        'Assassin_Male/attackWeapon2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Assassin_Male/attackWeapon3_1.png',
        'Assassin_Male/attackWeapon3_2.png',
        'Assassin_Male/attackWeapon3_3.png'
      ],
      frameDelay: 100
    }
  ]
};
