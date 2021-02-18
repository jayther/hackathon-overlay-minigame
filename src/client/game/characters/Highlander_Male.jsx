
export default {
  name: 'Highlander Male',
  idle: {
    sprites: [
      'Highlander_Male/idle_1.png',
      'Highlander_Male/idle_2.png',
      'Highlander_Male/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Highlander_Male/idle_sword_1.png',
      'Highlander_Male/idle_sword_2.png',
      'Highlander_Male/idle_sword_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Highlander_Male/run1.png',
      'Highlander_Male/run2.png',
      'Highlander_Male/run3.png',
      'Highlander_Male/run4.png'
    ],
    frameDelay: 75
  },
  dash: {
    sprites: [
      'Highlander_Male/dash_1.png',
      'Highlander_Male/dash_2.png',
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Highlander_Male/dash_sword_1.png',
      'Highlander_Male/dash_sword_2.png',
    ],
    frameDelay: 75
  },
  spawn: {
    sprites: [
      'Highlander_Male/graveBurst_1.png',
      'Highlander_Male/graveBurst_2.png',
      'Highlander_Male/graveBurst_3.png',
      'Highlander_Male/graveBurst_4.png',
      'Highlander_Male/graveBurst_5.png',
      'Highlander_Male/graveBurst_6.png'
    ],
    frameDelay: 100
  },
  hit: {
    sprites: [
      'Highlander_Male/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Highlander_Male/dead_1.png',
      'Highlander_Male/dead_2.png',
      'Highlander_Male/dead_3.png',
      'Highlander_Male/dead_4.png',
      'Highlander_Male/dead_5.png'
    ],
    frameDelay: 100
  },
  attacks: [
    {
      sprites: [
        'Highlander_Male/attackUnarmed_1.png',
        'Highlander_Male/attackUnarmed_2.png',
        'Highlander_Male/attackUnarmed_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Highlander_Male/attackUnarmed_FX_1.png',
          'Highlander_Male/attackUnarmed_FX_2.png',
          'Highlander_Male/attackUnarmed_FX_3.png',
          'Highlander_Male/attackUnarmed_FX_4.png',
          'Highlander_Male/attackUnarmed_FX_5.png',
          'Highlander_Male/attackUnarmed_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Highlander_Male/attackUnarmed2_1.png',
        'Highlander_Male/attackUnarmed2_2.png',
        'Highlander_Male/attackUnarmed2_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Highlander_Male/attackUnarmed2_FX_1.png',
          'Highlander_Male/attackUnarmed2_FX_2.png',
          'Highlander_Male/attackUnarmed2_FX_3.png',
          'Highlander_Male/attackUnarmed2_FX_4.png',
          'Highlander_Male/attackUnarmed2_FX_5.png',
          'Highlander_Male/attackUnarmed2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Highlander_Male/attackUnarmed3_1.png',
        'Highlander_Male/attackUnarmed3_2.png',
        'Highlander_Male/attackUnarmed3_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Highlander_Male/attackUnarmed3_FX_1.png',
          'Highlander_Male/attackUnarmed3_FX_2.png',
          'Highlander_Male/attackUnarmed3_FX_3.png',
          'Highlander_Male/attackUnarmed3_FX_4.png',
          'Highlander_Male/attackUnarmed3_FX_5.png',
          'Highlander_Male/attackUnarmed3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Highlander_Male/attackWeapon1_1.png',
        'Highlander_Male/attackWeapon1_2.png',
        'Highlander_Male/attackWeapon1_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Highlander_Male/attackWeapon1_FX_1.png',
          'Highlander_Male/attackWeapon1_FX_2.png',
          'Highlander_Male/attackWeapon1_FX_3.png',
          'Highlander_Male/attackWeapon1_FX_4.png',
          'Highlander_Male/attackWeapon1_FX_5.png',
          'Highlander_Male/attackWeapon1_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Highlander_Male/attackWeapon2_1.png',
        'Highlander_Male/attackWeapon2_2.png',
        'Highlander_Male/attackWeapon2_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Highlander_Male/attackWeapon2_FX_1.png',
          'Highlander_Male/attackWeapon2_FX_2.png',
          'Highlander_Male/attackWeapon2_FX_3.png',
          'Highlander_Male/attackWeapon2_FX_4.png',
          'Highlander_Male/attackWeapon2_FX_5.png',
          'Highlander_Male/attackWeapon2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Highlander_Male/attackWeapon3_1.png',
        'Highlander_Male/attackWeapon3_2.png',
        'Highlander_Male/attackWeapon3_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Highlander_Male/attackWeapon3_FX_1.png',
          'Highlander_Male/attackWeapon3_FX_2.png',
          'Highlander_Male/attackWeapon3_FX_3.png',
          'Highlander_Male/attackWeapon3_FX_4.png',
          'Highlander_Male/attackWeapon3_FX_5.png',
          'Highlander_Male/attackWeapon3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ]
};
