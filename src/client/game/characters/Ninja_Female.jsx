
export default {
  name: 'Ninja Female',
  idle: {
    sprites: [
      'Ninja_Female/idle_1.png',
      'Ninja_Female/idle_2.png',
      'Ninja_Female/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Ninja_Female/idle_weapon_1.png',
      'Ninja_Female/idle_weapon_2.png',
      'Ninja_Female/idle_weapon_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Ninja_Female/run_1.png',
      'Ninja_Female/run_2.png',
      'Ninja_Female/run_3.png',
      'Ninja_Female/run_4.png'
    ],
    frameDelay: 75
  },
  dash: {
    sprites: [
      'Ninja_Female/dash_1.png',
      'Ninja_Female/dash_2.png'
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Ninja_Female/dash_weapon_1.png',
      'Ninja_Female/dash_weapon_2.png'
    ],
    frameDelay: 75
  },
  spawn: {
    sprites: [
      'Ninja_Female/graveBurst_1.png'
    ],
    frameDelay: 600,
    stationary: false
  },
  hit: {
    sprites: [
      'Ninja_Female/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Ninja_Female/dead_1.png'
    ],
    frameDelay: 500
  },
  attacks: [
    {
      sprites: [
        'Ninja_Female/attackUnarmed_1.png',
        'Ninja_Female/attackUnarmed_2.png',
        'Ninja_Female/attackUnarmed_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Ninja_Female/attackUnarmed2_1.png',
        'Ninja_Female/attackUnarmed2_2.png',
        'Ninja_Female/attackUnarmed2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Ninja_Female/attackUnarmed3_1.png',
        'Ninja_Female/attackUnarmed3_2.png',
        'Ninja_Female/attackUnarmed3_3.png'
      ],
      frameDelay: 100
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Ninja_Female/attackWeapon1_1.png',
        'Ninja_Female/attackWeapon1_2.png',
        'Ninja_Female/attackWeapon1_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Ninja_Female/attackWeapon2_1.png',
        'Ninja_Female/attackWeapon2_2.png',
        'Ninja_Female/attackWeapon2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Ninja_Female/attackWeapon3_1.png',
        'Ninja_Female/attackWeapon3_2.png',
        'Ninja_Female/attackWeapon3_3.png'
      ],
      frameDelay: 100
    }
  ]
};
