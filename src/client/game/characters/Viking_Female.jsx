
export default {
  name: 'Viking Female',
  idle: {
    sprites: [
      'Viking_Female/idle_1.png',
      'Viking_Female/idle_2.png',
      'Viking_Female/idle_3.png'
    ],
    frameDelay: 150
  },
  run: {
    sprites: [
      'Viking_Female/run_1.png',
      'Viking_Female/run_2.png',
      'Viking_Female/run_3.png',
      'Viking_Female/run_4.png'
    ],
    frameDelay: 100
  },
  dead: {
    sprites: [
      'Viking_Female/dead_1.png',
      'Viking_Female/dead_2.png',
      'Viking_Female/dead_3.png',
      'Viking_Female/dead_4.png',
      'Viking_Female/dead_5.png'
    ],
    frameDelay: 150
  },
  attacks: [
    {
      sprites: [
        'Viking_Female/attackUnarmed_1.png',
        'Viking_Female/attackUnarmed_2.png',
        'Viking_Female/attackUnarmed_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Viking_Female/attackUnarmed_FX_1.png',
          'Viking_Female/attackUnarmed_FX_2.png',
          'Viking_Female/attackUnarmed_FX_3.png',
          'Viking_Female/attackUnarmed_FX_4.png',
          'Viking_Female/attackUnarmed_FX_5.png',
          'Viking_Female/attackUnarmed_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Viking_Female/attackUnarmed2_1.png',
        'Viking_Female/attackUnarmed2_2.png',
        'Viking_Female/attackUnarmed2_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Viking_Female/attackUnarmed2_FX_1.png',
          'Viking_Female/attackUnarmed2_FX_2.png',
          'Viking_Female/attackUnarmed2_FX_3.png',
          'Viking_Female/attackUnarmed2_FX_4.png',
          'Viking_Female/attackUnarmed2_FX_5.png',
          'Viking_Female/attackUnarmed2_FX_6.png'
        ],
        frameDelay: 100
      }
    },
    {
      sprites: [
        'Viking_Female/attackUnarmed3_1.png',
        'Viking_Female/attackUnarmed3_2.png',
        'Viking_Female/attackUnarmed3_3.png'
      ],
      frameDelay: 100,
      fx: {
        sprites: [
          'Viking_Female/attackUnarmed3_FX_1.png',
          'Viking_Female/attackUnarmed3_FX_2.png',
          'Viking_Female/attackUnarmed3_FX_3.png',
          'Viking_Female/attackUnarmed3_FX_4.png',
          'Viking_Female/attackUnarmed3_FX_5.png',
          'Viking_Female/attackUnarmed3_FX_6.png'
        ],
        frameDelay: 100
      }
    }
  ]
};
