
export default {
  name: 'Archangel Female',
  idle: {
    sprites: [
      'Archangel_Female/idle_1.png',
      'Archangel_Female/idle_2.png',
      'Archangel_Female/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Archangel_Female/idle_sword_1.png',
      'Archangel_Female/idle_sword_2.png',
      'Archangel_Female/idle_sword_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Archangel_Female/run_1.png',
      'Archangel_Female/run_2.png',
      'Archangel_Female/run_3.png',
      'Archangel_Female/run_4.png'
    ],
    frameDelay: 75
  },
  runWeapon: {
    sprites: [
      'Archangel_Female/idle_sword_1.png',
      'Archangel_Female/idle_sword_2.png',
      'Archangel_Female/idle_sword_3.png'
    ],
    frameDelay: 150
  },
  dash: {
    sprites: [
      'Archangel_Female/dash_1.png',
      'Archangel_Female/dash_2.png',
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Archangel_Female/dash_sword_1.png',
      'Archangel_Female/dash_sword_2.png',
    ],
    frameDelay: 75
  },
  bannerIdle: {
    sprites: [
      'Archangel_Female/bannerIdle_1.png',
      'Archangel_Female/bannerIdle_2.png',
      'Archangel_Female/bannerIdle_3.png'
    ],
    frameDelay: 150
  },
  bannerRaise: {
    sprites: [
      'Archangel_Female/bannerRaise_1.png'
    ],
    frameDelay: 600
  },
  spawn: {
    sprites: [
      'Archangel_Female/graveBurst_1.png',
      'Archangel_Female/graveBurst_2.png',
      'Archangel_Female/graveBurst_3.png',
      'Archangel_Female/graveBurst_4.png',
      'Archangel_Female/graveBurst_5.png',
      'Archangel_Female/graveBurst_6.png'
    ],
    frameDelay: 100,
    stationary: true,
    sound: 'magicSpawn'
  },
  hit: {
    sprites: [
      'Archangel_Female/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Archangel_Female/dead_1.png',
      'Archangel_Female/dead_2.png',
      'Archangel_Female/dead_3.png',
      'Archangel_Female/dead_4.png',
      'Archangel_Female/dead_5.png'
    ],
    frameDelay: 100
  },
  attacks: [
    {
      sprites: [
        'Archangel_Female/attackUnarmed_1.png',
        'Archangel_Female/attackUnarmed_2.png',
        'Archangel_Female/attackUnarmed_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Archangel_Female/attackUnarmed_FX_1.png',
          'Archangel_Female/attackUnarmed_FX_2.png',
          'Archangel_Female/attackUnarmed_FX_3.png',
          'Archangel_Female/attackUnarmed_FX_4.png',
          'Archangel_Female/attackUnarmed_FX_5.png',
          'Archangel_Female/attackUnarmed_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Archangel_Female/attackUnarmed2_1.png',
        'Archangel_Female/attackUnarmed2_2.png',
        'Archangel_Female/attackUnarmed2_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Archangel_Female/attackUnarmed2_FX_1.png',
          'Archangel_Female/attackUnarmed2_FX_2.png',
          'Archangel_Female/attackUnarmed2_FX_3.png',
          'Archangel_Female/attackUnarmed2_FX_4.png',
          'Archangel_Female/attackUnarmed2_FX_5.png',
          'Archangel_Female/attackUnarmed2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Archangel_Female/attackUnarmed3_1.png',
        'Archangel_Female/attackUnarmed3_2.png',
        'Archangel_Female/attackUnarmed3_3.png'
      ],
      frameDelay: 100,
      sound: 'magic',
      fx: {
        sprites: [
          'Archangel_Female/attackUnarmed3_FX_1.png',
          'Archangel_Female/attackUnarmed3_FX_2.png',
          'Archangel_Female/attackUnarmed3_FX_3.png',
          'Archangel_Female/attackUnarmed3_FX_4.png',
          'Archangel_Female/attackUnarmed3_FX_5.png',
          'Archangel_Female/attackUnarmed3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Archangel_Female/attackWeapon1_1.png',
        'Archangel_Female/attackWeapon1_2.png',
        'Archangel_Female/attackWeapon1_3.png'
      ],
      frameDelay: 100,
      sound: 'thunder',
      fx: {
        sprites: [
          'Archangel_Female/attackWeapon1_FX_1.png',
          'Archangel_Female/attackWeapon1_FX_2.png',
          'Archangel_Female/attackWeapon1_FX_3.png',
          'Archangel_Female/attackWeapon1_FX_4.png',
          'Archangel_Female/attackWeapon1_FX_5.png',
          'Archangel_Female/attackWeapon1_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Archangel_Female/attackWeapon2_1.png',
        'Archangel_Female/attackWeapon2_2.png',
        'Archangel_Female/attackWeapon2_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Archangel_Female/attackWeapon2_FX_1.png',
          'Archangel_Female/attackWeapon2_FX_2.png',
          'Archangel_Female/attackWeapon2_FX_3.png',
          'Archangel_Female/attackWeapon2_FX_4.png',
          'Archangel_Female/attackWeapon2_FX_5.png',
          'Archangel_Female/attackWeapon2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Archangel_Female/attackWeapon3_1.png',
        'Archangel_Female/attackWeapon3_2.png',
        'Archangel_Female/attackWeapon3_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Archangel_Female/attackWeapon3_FX_1.png',
          'Archangel_Female/attackWeapon3_FX_2.png',
          'Archangel_Female/attackWeapon3_FX_3.png',
          'Archangel_Female/attackWeapon3_FX_4.png',
          'Archangel_Female/attackWeapon3_FX_5.png',
          'Archangel_Female/attackWeapon3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ]
};
