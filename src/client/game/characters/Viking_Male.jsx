
export default {
  name: 'Viking Male',
  idle: {
    sprites: [
      'Viking_Male/idle_1.png',
      'Viking_Male/idle_2.png',
      'Viking_Male/idle_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Viking_Male/run_1.png',
      'Viking_Male/run_2.png',
      'Viking_Male/run_3.png',
      'Viking_Male/run_4.png'
    ],
    frameDelay: 100
  },
  dead: {
    sprites: [
      'Viking_Male/dead_1.png',
      'Viking_Male/dead_2.png',
      'Viking_Male/dead_3.png',
      'Viking_Male/dead_4.png',
      'Viking_Male/dead_5.png'
    ],
    frameDelay: 150
  },
  attacks: [
    {
      sprites: [
        'Viking_Male/attackUnarmed_1.png',
        'Viking_Male/attackUnarmed_2.png',
        'Viking_Male/attackUnarmed_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Viking_Male/attackUnarmed_FX_1.png',
          'Viking_Male/attackUnarmed_FX_2.png',
          'Viking_Male/attackUnarmed_FX_3.png',
          'Viking_Male/attackUnarmed_FX_4.png',
          'Viking_Male/attackUnarmed_FX_5.png',
          'Viking_Male/attackUnarmed_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Viking_Male/attackUnarmed2_1.png',
        'Viking_Male/attackUnarmed2_2.png',
        'Viking_Male/attackUnarmed2_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Viking_Male/attackUnarmed2_FX_1.png',
          'Viking_Male/attackUnarmed2_FX_2.png',
          'Viking_Male/attackUnarmed2_FX_3.png',
          'Viking_Male/attackUnarmed2_FX_4.png',
          'Viking_Male/attackUnarmed2_FX_5.png',
          'Viking_Male/attackUnarmed2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Viking_Male/attackUnarmed3_1.png',
        'Viking_Male/attackUnarmed3_2.png',
        'Viking_Male/attackUnarmed3_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Viking_Male/attackUnarmed3_FX_1.png',
          'Viking_Male/attackUnarmed3_FX_2.png',
          'Viking_Male/attackUnarmed3_FX_3.png',
          'Viking_Male/attackUnarmed3_FX_4.png',
          'Viking_Male/attackUnarmed3_FX_5.png',
          'Viking_Male/attackUnarmed3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ]
};
