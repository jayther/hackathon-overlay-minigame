
export default {
  name: 'Knight Male',
  idle: {
    sprites: [
      'Knight_Male/idle_1.png',
      'Knight_Male/idle_2.png',
      'Knight_Male/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Knight_Male/idle_weapon_1.png',
      'Knight_Male/idle_weapon_2.png',
      'Knight_Male/idle_weapon_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Knight_Male/run_1.png',
      'Knight_Male/run_2.png',
      'Knight_Male/run_3.png',
      'Knight_Male/run_4.png'
    ],
    frameDelay: 75
  },
  dash: {
    sprites: [
      'Knight_Male/dash_1.png',
      'Knight_Male/dash_2.png'
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Knight_Male/dash_weapon_1.png',
      'Knight_Male/dash_weapon_2.png'
    ],
    frameDelay: 75
  },
  spawn: {
    sprites: [
      'Knight_Male/graveBurst_1.png'
    ],
    frameDelay: 600,
    stationary: false
  },
  hit: {
    sprites: [
      'Knight_Male/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Knight_Male/dead_1.png'
    ],
    frameDelay: 500
  },
  attacks: [
    {
      sprites: [
        'Knight_Male/attackUnarmed_1.png',
        'Knight_Male/attackUnarmed_2.png',
        'Knight_Male/attackUnarmed_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Knight_Male/attackUnarmed2_1.png',
        'Knight_Male/attackUnarmed2_2.png',
        'Knight_Male/attackUnarmed2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Knight_Male/attackUnarmed3_1.png',
        'Knight_Male/attackUnarmed3_2.png',
        'Knight_Male/attackUnarmed3_3.png'
      ],
      frameDelay: 100
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Knight_Male/attackWeapon1_1.png',
        'Knight_Male/attackWeapon1_2.png',
        'Knight_Male/attackWeapon1_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Knight_Male/attackWeapon2_1.png',
        'Knight_Male/attackWeapon2_2.png',
        'Knight_Male/attackWeapon2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Knight_Male/attackWeapon3_1.png',
        'Knight_Male/attackWeapon3_2.png',
        'Knight_Male/attackWeapon3_3.png'
      ],
      frameDelay: 100
    }
  ]
};
