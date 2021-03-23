
export default {
  name: 'Archdemon Male',
  idle: {
    sprites: [
      'Archdemon_Male/idle_1.png',
      'Archdemon_Male/idle_2.png',
      'Archdemon_Male/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Archdemon_Male/idle_sword_1.png',
      'Archdemon_Male/idle_sword_2.png',
      'Archdemon_Male/idle_sword_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Archdemon_Male/run_1.png',
      'Archdemon_Male/run_2.png',
      'Archdemon_Male/run_3.png',
      'Archdemon_Male/run_4.png'
    ],
    frameDelay: 75
  },
  runWeapon: {
    sprites: [
      'Archdemon_Male/idle_sword_1.png',
      'Archdemon_Male/idle_sword_2.png',
      'Archdemon_Male/idle_sword_3.png'
    ],
    frameDelay: 150
  },
  dash: {
    sprites: [
      'Archdemon_Male/dash_1.png',
      'Archdemon_Male/dash_2.png'
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Archdemon_Male/dash_sword_1.png',
      'Archdemon_Male/dash_sword_2.png'
    ],
    frameDelay: 75
  },
  bannerIdle: {
    sprites: [
      'Archdemon_Male/bannerIdle_1.png',
      'Archdemon_Male/bannerIdle_2.png',
      'Archdemon_Male/bannerIdle_3.png'
    ],
    frameDelay: 150
  },
  bannerRaise: {
    sprites: [
      'Archdemon_Male/bannerRaise_1.png'
    ],
    frameDelay: 600
  },
  spawn: {
    sprites: [
      'Archdemon_Male/graveBurst_1.png',
      'Archdemon_Male/graveBurst_2.png',
      'Archdemon_Male/graveBurst_3.png',
      'Archdemon_Male/graveBurst_4.png',
      'Archdemon_Male/graveBurst_5.png',
      'Archdemon_Male/graveBurst_6.png'
    ],
    frameDelay: 100,
    stationary: true,
    sound: 'magicSpawn'
  },
  hit: {
    sprites: [
      'Archdemon_Male/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Archdemon_Male/dead_1.png',
      'Archdemon_Male/dead_2.png',
      'Archdemon_Male/dead_3.png',
      'Archdemon_Male/dead_4.png',
      'Archdemon_Male/dead_5.png'
    ],
    frameDelay: 100,
    sound: 'magicDead'
  },
  attacks: [
    {
      sprites: [
        'Archdemon_Male/attackUnarmed_1.png',
        'Archdemon_Male/attackUnarmed_2.png',
        'Archdemon_Male/attackUnarmed_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Archdemon_Male/attackUnarmed_FX_1.png',
          'Archdemon_Male/attackUnarmed_FX_2.png',
          'Archdemon_Male/attackUnarmed_FX_3.png',
          'Archdemon_Male/attackUnarmed_FX_4.png',
          'Archdemon_Male/attackUnarmed_FX_5.png',
          'Archdemon_Male/attackUnarmed_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Archdemon_Male/attackUnarmed2_1.png',
        'Archdemon_Male/attackUnarmed2_2.png',
        'Archdemon_Male/attackUnarmed2_3.png'
      ],
      frameDelay: 100,
      sound: 'magic',
      fx: {
        sprites: [
          'Archdemon_Male/attackUnarmed2_FX_1.png',
          'Archdemon_Male/attackUnarmed2_FX_2.png',
          'Archdemon_Male/attackUnarmed2_FX_3.png',
          'Archdemon_Male/attackUnarmed2_FX_4.png',
          'Archdemon_Male/attackUnarmed2_FX_5.png',
          'Archdemon_Male/attackUnarmed2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Archdemon_Male/attackUnarmed3_1.png',
        'Archdemon_Male/attackUnarmed3_2.png',
        'Archdemon_Male/attackUnarmed3_3.png'
      ],
      frameDelay: 100,
      sound: 'magic',
      fx: {
        sprites: [
          'Archdemon_Male/attackUnarmed3_FX_1.png',
          'Archdemon_Male/attackUnarmed3_FX_2.png',
          'Archdemon_Male/attackUnarmed3_FX_3.png',
          'Archdemon_Male/attackUnarmed3_FX_4.png',
          'Archdemon_Male/attackUnarmed3_FX_5.png',
          'Archdemon_Male/attackUnarmed3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Archdemon_Male/attackWeapon1_1.png',
        'Archdemon_Male/attackWeapon1_2.png',
        'Archdemon_Male/attackWeapon1_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Archdemon_Male/attackWeapon1_FX_1.png',
          'Archdemon_Male/attackWeapon1_FX_2.png',
          'Archdemon_Male/attackWeapon1_FX_3.png',
          'Archdemon_Male/attackWeapon1_FX_4.png',
          'Archdemon_Male/attackWeapon1_FX_5.png',
          'Archdemon_Male/attackWeapon1_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Archdemon_Male/attackWeapon2_1.png',
        'Archdemon_Male/attackWeapon2_2.png',
        'Archdemon_Male/attackWeapon2_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Archdemon_Male/attackWeapon2_FX_1.png',
          'Archdemon_Male/attackWeapon2_FX_2.png',
          'Archdemon_Male/attackWeapon2_FX_3.png',
          'Archdemon_Male/attackWeapon2_FX_4.png',
          'Archdemon_Male/attackWeapon2_FX_5.png',
          'Archdemon_Male/attackWeapon2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Archdemon_Male/attackWeapon3_1.png',
        'Archdemon_Male/attackWeapon3_2.png',
        'Archdemon_Male/attackWeapon3_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Archdemon_Male/attackWeapon3_FX_1.png',
          'Archdemon_Male/attackWeapon3_FX_2.png',
          'Archdemon_Male/attackWeapon3_FX_3.png',
          'Archdemon_Male/attackWeapon3_FX_4.png',
          'Archdemon_Male/attackWeapon3_FX_5.png',
          'Archdemon_Male/attackWeapon3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ]
};
