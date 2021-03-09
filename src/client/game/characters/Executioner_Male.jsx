
export default {
  name: 'Executioner Male',
  idle: {
    sprites: [
      'Executioner_Male/idle_1.png',
      'Executioner_Male/idle_2.png',
      'Executioner_Male/idle_3.png'
    ],
    frameDelay: 150
  },
  idleWeapon: {
    sprites: [
      'Executioner_Male/idle_weapon_1.png',
      'Executioner_Male/idle_weapon_2.png',
      'Executioner_Male/idle_weapon_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Executioner_Male/run_1.png',
      'Executioner_Male/run_2.png',
      'Executioner_Male/run_3.png',
      'Executioner_Male/run_4.png'
    ],
    frameDelay: 75
  },
  dash: {
    sprites: [
      'Executioner_Male/dash_1.png',
      'Executioner_Male/dash_2.png'
    ],
    frameDelay: 75
  },
  dashWeapon: {
    sprites: [
      'Executioner_Male/dash_weapon_1.png',
      'Executioner_Male/dash_weapon_2.png'
    ],
    frameDelay: 75
  },
  spawn: {
    sprites: [
      'Executioner_Male/graveBurst_1.png'
    ],
    frameDelay: 600,
    stationary: false
  },
  hit: {
    sprites: [
      'Executioner_Male/hit_1.png'
    ],
    frameDelay: 500
  },
  dead: {
    sprites: [
      'Executioner_Male/dead_1.png'
    ],
    frameDelay: 500
  },
  attacks: [
    {
      sprites: [
        'Executioner_Male/attackUnarmed_1.png',
        'Executioner_Male/attackUnarmed_2.png',
        'Executioner_Male/attackUnarmed_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Executioner_Male/attackUnarmed2_1.png',
        'Executioner_Male/attackUnarmed2_2.png',
        'Executioner_Male/attackUnarmed2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Executioner_Male/attackUnarmed3_1.png',
        'Executioner_Male/attackUnarmed3_2.png',
        'Executioner_Male/attackUnarmed3_3.png'
      ],
      frameDelay: 100
    }
  ],
  attacksWeapon: [
    {
      sprites: [
        'Executioner_Male/attackWeapon1_1.png',
        'Executioner_Male/attackWeapon1_2.png',
        'Executioner_Male/attackWeapon1_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Executioner_Male/attackWeapon2_1.png',
        'Executioner_Male/attackWeapon2_2.png',
        'Executioner_Male/attackWeapon2_3.png'
      ],
      frameDelay: 100
    },
    {
      sprites: [
        'Executioner_Male/attackWeapon3_1.png',
        'Executioner_Male/attackWeapon3_2.png',
        'Executioner_Male/attackWeapon3_3.png'
      ],
      frameDelay: 100
    }
  ]
};
