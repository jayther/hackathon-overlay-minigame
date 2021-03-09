
export default {
  name: 'Pirate Female',
  idle: {
    sprites: [
      'Pirate_Female/idle_1.png',
      'Pirate_Female/idle_2.png',
      'Pirate_Female/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Pirate_Female/idle_sword_1.png',
      'Pirate_Female/idle_sword_2.png',
      'Pirate_Female/idle_sword_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Pirate_Female/run_1.png',
      'Pirate_Female/run_2.png',
      'Pirate_Female/run_3.png',
      'Pirate_Female/run_4.png'
    ],
    frameDelay: 75
  },
  dash: {
    sprites: [
      'Pirate_Female/dash_1.png',
      'Pirate_Female/dash_2.png'
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Pirate_Female/dash_sword_1.png',
      'Pirate_Female/dash_sword_2.png'
    ],
    frameDelay: 75
  },
  spawn: {
    sprites: [
      'Pirate_Female/graveBurst_1.png'
    ],
    frameDelay: 600,
    stationary: false
  },
  hit: {
    sprites: [
      'Pirate_Female/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Pirate_Female/dead_1.png'
    ],
    frameDelay: 500
  },
  attacks: [
    {
      sprites: [
        'Pirate_Female/attackUnarmed_1.png',
        'Pirate_Female/attackUnarmed_2.png',
        'Pirate_Female/attackUnarmed_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Pirate_Female/attackUnarmed2_1.png',
        'Pirate_Female/attackUnarmed2_2.png',
        'Pirate_Female/attackUnarmed2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Pirate_Female/attackUnarmed3_1.png',
        'Pirate_Female/attackUnarmed3_2.png',
        'Pirate_Female/attackUnarmed3_3.png'
      ],
      frameDelay: 100
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Pirate_Female/attackWeapon1_1.png',
        'Pirate_Female/attackWeapon1_2.png',
        'Pirate_Female/attackWeapon1_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Pirate_Female/attackWeapon2_1.png',
        'Pirate_Female/attackWeapon2_2.png',
        'Pirate_Female/attackWeapon2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Pirate_Female/attackWeapon3_1.png',
        'Pirate_Female/attackWeapon3_2.png',
        'Pirate_Female/attackWeapon3_3.png'
      ],
      frameDelay: 100
    }
  ]
};
