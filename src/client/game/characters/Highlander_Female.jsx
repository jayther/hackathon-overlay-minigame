
export default {
  name: 'Highlander Female',
  idle: {
    sprites: [
      'Highlander_Female/idle_1.png',
      'Highlander_Female/idle_2.png',
      'Highlander_Female/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Highlander_Female/idle_sword_1.png',
      'Highlander_Female/idle_sword_2.png',
      'Highlander_Female/idle_sword_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Highlander_Female/run_1.png',
      'Highlander_Female/run_2.png',
      'Highlander_Female/run_3.png',
      'Highlander_Female/run_4.png'
    ],
    frameDelay: 75
  },
  dash: {
    sprites: [
      'Highlander_Female/dash_1.png',
      'Highlander_Female/dash_2.png',
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Highlander_Female/dash_sword_1.png',
      'Highlander_Female/dash_sword_2.png',
    ],
    frameDelay: 75
  },
  bannerIdle: {
    sprites: [
      'Highlander_Female/bannerIdle_1.png',
      'Highlander_Female/bannerIdle_2.png',
      'Highlander_Female/bannerIdle_3.png'
    ],
    frameDelay: 150
  },
  bannerRaise: {
    sprites: [
      'Highlander_Female/bannerRaise_1.png'
    ],
    frameDelay: 600
  },
  spawn: {
    sprites: [
      'Highlander_Female/graveBurst_1.png',
      'Highlander_Female/graveBurst_2.png',
      'Highlander_Female/graveBurst_3.png',
      'Highlander_Female/graveBurst_4.png',
      'Highlander_Female/graveBurst_5.png',
      'Highlander_Female/graveBurst_6.png'
    ],
    frameDelay: 100,
    stationary: false
  },
  hit: {
    sprites: [
      'Highlander_Female/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Highlander_Female/dead_1.png',
      'Highlander_Female/dead_2.png',
      'Highlander_Female/dead_3.png',
      'Highlander_Female/dead_4.png',
      'Highlander_Female/dead_5.png'
    ],
    frameDelay: 100
  },
  attacks: [
    {
      sprites: [
        'Highlander_Female/attackUnarmed_1.png',
        'Highlander_Female/attackUnarmed_2.png',
        'Highlander_Female/attackUnarmed_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Highlander_Female/attackUnarmed_FX_1.png',
          'Highlander_Female/attackUnarmed_FX_2.png',
          'Highlander_Female/attackUnarmed_FX_3.png',
          'Highlander_Female/attackUnarmed_FX_4.png',
          'Highlander_Female/attackUnarmed_FX_5.png',
          'Highlander_Female/attackUnarmed_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Highlander_Female/attackUnarmed2_1.png',
        'Highlander_Female/attackUnarmed2_2.png',
        'Highlander_Female/attackUnarmed2_3.png'
      ],
      frameDelay: 100,
      sound: 'thunder',
      fx: {
        sprites: [
          'Highlander_Female/attackUnarmed2_FX_1.png',
          'Highlander_Female/attackUnarmed2_FX_2.png',
          'Highlander_Female/attackUnarmed2_FX_3.png',
          'Highlander_Female/attackUnarmed2_FX_4.png',
          'Highlander_Female/attackUnarmed2_FX_5.png',
          'Highlander_Female/attackUnarmed2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Highlander_Female/attackUnarmed3_1.png',
        'Highlander_Female/attackUnarmed3_2.png',
        'Highlander_Female/attackUnarmed3_3.png'
      ],
      frameDelay: 100,
      sound: 'thunder',
      fx: {
        sprites: [
          'Highlander_Female/attackUnarmed3_FX_1.png',
          'Highlander_Female/attackUnarmed3_FX_2.png',
          'Highlander_Female/attackUnarmed3_FX_3.png',
          'Highlander_Female/attackUnarmed3_FX_4.png',
          'Highlander_Female/attackUnarmed3_FX_5.png',
          'Highlander_Female/attackUnarmed3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Highlander_Female/attackWeapon1_1.png',
        'Highlander_Female/attackWeapon1_2.png',
        'Highlander_Female/attackWeapon1_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Highlander_Female/attackWeapon1_FX_1.png',
          'Highlander_Female/attackWeapon1_FX_2.png',
          'Highlander_Female/attackWeapon1_FX_3.png',
          'Highlander_Female/attackWeapon1_FX_4.png',
          'Highlander_Female/attackWeapon1_FX_5.png',
          'Highlander_Female/attackWeapon1_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Highlander_Female/attackWeapon2_1.png',
        'Highlander_Female/attackWeapon2_2.png',
        'Highlander_Female/attackWeapon2_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Highlander_Female/attackWeapon2_FX_1.png',
          'Highlander_Female/attackWeapon2_FX_2.png',
          'Highlander_Female/attackWeapon2_FX_3.png',
          'Highlander_Female/attackWeapon2_FX_4.png',
          'Highlander_Female/attackWeapon2_FX_5.png',
          'Highlander_Female/attackWeapon2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Highlander_Female/attackWeapon3_1.png',
        'Highlander_Female/attackWeapon3_2.png',
        'Highlander_Female/attackWeapon3_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Highlander_Female/attackWeapon3_FX_1.png',
          'Highlander_Female/attackWeapon3_FX_2.png',
          'Highlander_Female/attackWeapon3_FX_3.png',
          'Highlander_Female/attackWeapon3_FX_4.png',
          'Highlander_Female/attackWeapon3_FX_5.png',
          'Highlander_Female/attackWeapon3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ]
};
