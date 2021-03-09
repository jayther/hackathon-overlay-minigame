
export default {
  name: 'Samurai Male',
  idle: {
    sprites: [
      'Samurai_Male/idle_1.png',
      'Samurai_Male/idle_2.png',
      'Samurai_Male/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Samurai_Male/idle_sword_1.png',
      'Samurai_Male/idle_sword_2.png',
      'Samurai_Male/idle_sword_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Samurai_Male/run_1.png',
      'Samurai_Male/run_2.png',
      'Samurai_Male/run_3.png',
      'Samurai_Male/run_4.png'
    ],
    frameDelay: 75
  },
  dash: {
    sprites: [
      'Samurai_Male/dash_1.png',
      'Samurai_Male/dash_2.png',
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Samurai_Male/dash_sword_1.png',
      'Samurai_Male/dash_sword_2.png',
    ],
    frameDelay: 75
  },
  spawn: {
    sprites: [
      'Samurai_Male/graveBurst_1.png',
      'Samurai_Male/graveBurst_2.png',
      'Samurai_Male/graveBurst_3.png',
      'Samurai_Male/graveBurst_4.png',
      'Samurai_Male/graveBurst_5.png',
      'Samurai_Male/graveBurst_6.png'
    ],
    frameDelay: 100,
    stationary: false
  },
  hit: {
    sprites: [
      'Samurai_Male/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Samurai_Male/dead_1.png',
      'Samurai_Male/dead_2.png',
      'Samurai_Male/dead_3.png',
      'Samurai_Male/dead_4.png',
      'Samurai_Male/dead_5.png'
    ],
    frameDelay: 100
  },
  attacks: [
    {
      sprites: [
        'Samurai_Male/attackUnarmed_1.png',
        'Samurai_Male/attackUnarmed_2.png',
        'Samurai_Male/attackUnarmed_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Samurai_Male/attackUnarmed_FX_1.png',
          'Samurai_Male/attackUnarmed_FX_2.png',
          'Samurai_Male/attackUnarmed_FX_3.png',
          'Samurai_Male/attackUnarmed_FX_4.png',
          'Samurai_Male/attackUnarmed_FX_5.png',
          'Samurai_Male/attackUnarmed_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Samurai_Male/attackUnarmed2_1.png',
        'Samurai_Male/attackUnarmed2_2.png',
        'Samurai_Male/attackUnarmed2_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Samurai_Male/attackUnarmed2_FX_1.png',
          'Samurai_Male/attackUnarmed2_FX_2.png',
          'Samurai_Male/attackUnarmed2_FX_3.png',
          'Samurai_Male/attackUnarmed2_FX_4.png',
          'Samurai_Male/attackUnarmed2_FX_5.png',
          'Samurai_Male/attackUnarmed2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Samurai_Male/attackUnarmed3_1.png',
        'Samurai_Male/attackUnarmed3_2.png',
        'Samurai_Male/attackUnarmed3_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Samurai_Male/attackUnarmed3_FX_1.png',
          'Samurai_Male/attackUnarmed3_FX_2.png',
          'Samurai_Male/attackUnarmed3_FX_3.png',
          'Samurai_Male/attackUnarmed3_FX_4.png',
          'Samurai_Male/attackUnarmed3_FX_5.png',
          'Samurai_Male/attackUnarmed3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Samurai_Male/attackWeapon1_1.png',
        'Samurai_Male/attackWeapon1_2.png',
        'Samurai_Male/attackWeapon1_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Samurai_Male/attackWeapon1_FX_1.png',
          'Samurai_Male/attackWeapon1_FX_2.png',
          'Samurai_Male/attackWeapon1_FX_3.png',
          'Samurai_Male/attackWeapon1_FX_4.png',
          'Samurai_Male/attackWeapon1_FX_5.png',
          'Samurai_Male/attackWeapon1_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Samurai_Male/attackWeapon2_1.png',
        'Samurai_Male/attackWeapon2_2.png',
        'Samurai_Male/attackWeapon2_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Samurai_Male/attackWeapon2_FX_1.png',
          'Samurai_Male/attackWeapon2_FX_2.png',
          'Samurai_Male/attackWeapon2_FX_3.png',
          'Samurai_Male/attackWeapon2_FX_4.png',
          'Samurai_Male/attackWeapon2_FX_5.png',
          'Samurai_Male/attackWeapon2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Samurai_Male/attackWeapon3_1.png',
        'Samurai_Male/attackWeapon3_2.png',
        'Samurai_Male/attackWeapon3_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Samurai_Male/attackWeapon3_FX_1.png',
          'Samurai_Male/attackWeapon3_FX_2.png',
          'Samurai_Male/attackWeapon3_FX_3.png',
          'Samurai_Male/attackWeapon3_FX_4.png',
          'Samurai_Male/attackWeapon3_FX_5.png',
          'Samurai_Male/attackWeapon3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ]
};
