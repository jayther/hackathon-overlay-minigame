
export default {
  name: 'Knight Female',
  idle: {
    sprites: [
      'Knight_Female/idle_1.png',
      'Knight_Female/idle_2.png',
      'Knight_Female/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Knight_Female/idle_weapon_1.png',
      'Knight_Female/idle_weapon_2.png',
      'Knight_Female/idle_weapon_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Knight_Female/run_1.png',
      'Knight_Female/run_2.png',
      'Knight_Female/run_3.png',
      'Knight_Female/run_4.png'
    ],
    frameDelay: 75
  },
  dash: {
    sprites: [
      'Knight_Female/dash_1.png',
      'Knight_Female/dash_2.png'
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Knight_Female/dash_weapon_1.png',
      'Knight_Female/dash_weapon_2.png'
    ],
    frameDelay: 75
  },
  bannerIdle: {
    sprites: [
      'Knight_Female/bannerIdle_1.png',
      'Knight_Female/bannerIdle_2.png',
      'Knight_Female/bannerIdle_3.png'
    ],
    frameDelay: 150
  },
  bannerRaise: {
    sprites: [
      'Knight_Female/bannerRaise_1.png'
    ],
    frameDelay: 600
  },
  spawn: {
    sprites: [
      'Knight_Female/graveBurst_1.png'
    ],
    frameDelay: 600,
    stationary: false
  },
  hit: {
    sprites: [
      'Knight_Female/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Knight_Female/dead_1.png'
    ],
    frameDelay: 500
  },
  attacks: [
    {
      sprites: [
        'Knight_Female/attackUnarmed_1.png',
        'Knight_Female/attackUnarmed_2.png',
        'Knight_Female/attackUnarmed_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Knight_Female/attackUnarmed2_1.png',
        'Knight_Female/attackUnarmed2_2.png',
        'Knight_Female/attackUnarmed2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Knight_Female/attackUnarmed3_1.png',
        'Knight_Female/attackUnarmed3_2.png',
        'Knight_Female/attackUnarmed3_3.png'
      ],
      frameDelay: 100
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Knight_Female/attackWeapon1_1.png',
        'Knight_Female/attackWeapon1_2.png',
        'Knight_Female/attackWeapon1_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Knight_Female/attackWeapon2_1.png',
        'Knight_Female/attackWeapon2_2.png',
        'Knight_Female/attackWeapon2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Knight_Female/attackWeapon3_1.png',
        'Knight_Female/attackWeapon3_2.png',
        'Knight_Female/attackWeapon3_3.png'
      ],
      frameDelay: 100
    }
  ]
};
