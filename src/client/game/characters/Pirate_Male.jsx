
export default {
  name: 'Pirate Male',
  idle: {
    sprites: [
      'Pirate_Male/idle_1.png',
      'Pirate_Male/idle_2.png',
      'Pirate_Male/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Pirate_Male/idle_sword_1.png',
      'Pirate_Male/idle_sword_2.png',
      'Pirate_Male/idle_sword_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Pirate_Male/run_1.png',
      'Pirate_Male/run_2.png',
      'Pirate_Male/run_3.png',
      'Pirate_Male/run_4.png'
    ],
    frameDelay: 75
  },
  dash: {
    sprites: [
      'Pirate_Male/dash_1.png',
      'Pirate_Male/dash_2.png'
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Pirate_Male/dash_sword_1.png',
      'Pirate_Male/dash_sword_2.png'
    ],
    frameDelay: 75
  },
  spawn: {
    sprites: [
      'Pirate_Male/graveBurst_1.png'
    ],
    frameDelay: 600,
    stationary: false
  },
  hit: {
    sprites: [
      'Pirate_Male/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Pirate_Male/dead_1.png'
    ],
    frameDelay: 500
  },
  attacks: [
    {
      sprites: [
        'Pirate_Male/attackUnarmed_1.png',
        'Pirate_Male/attackUnarmed_2.png',
        'Pirate_Male/attackUnarmed_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Pirate_Male/attackUnarmed2_1.png',
        'Pirate_Male/attackUnarmed2_2.png',
        'Pirate_Male/attackUnarmed2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Pirate_Male/attackUnarmed3_1.png',
        'Pirate_Male/attackUnarmed3_2.png',
        'Pirate_Male/attackUnarmed3_3.png'
      ],
      frameDelay: 100
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Pirate_Male/attackWeapon1_1.png',
        'Pirate_Male/attackWeapon1_2.png',
        'Pirate_Male/attackWeapon1_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Pirate_Male/attackWeapon2_1.png',
        'Pirate_Male/attackWeapon2_2.png',
        'Pirate_Male/attackWeapon2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Pirate_Male/attackWeapon3_1.png',
        'Pirate_Male/attackWeapon3_2.png',
        'Pirate_Male/attackWeapon3_3.png'
      ],
      frameDelay: 100,
      sound: 'gunShot'
    }
  ]
};
