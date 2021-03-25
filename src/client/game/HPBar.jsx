import React from 'react';
import { has } from '../../shared/ObjectUtils';
import { clamp01 } from '../../shared/math/JMath';
import hpBarImg from '../assets/hp-bar.png';

import { hpBarMaxWidth } from './GameConfig';

const hpBarStyle = {
  borderTop: '13px solid transparent',
  borderBottom: '13px solid transparent',
  borderLeft: '6px solid transparent',
  borderRight: '6px solid transparent',
  borderImageSource: `url("${hpBarImg}")`,
  borderImageWidth: '0px 6px',
  borderImageSlice: '0 6 fill',
  borderImageRepeat: 'repeat',
  borderImageOutset: '0'
};

const hpBarSlice = {
  left: 6,
  top: 0,
  right: 6,
  bottom: 0
};

function HPBar(props) {
  let ratio, width;
  if (has(props, 'ratio')) {
    ratio = props.ratio;
  } else if (has(props, 'max') && has(props, 'amount')) {
    ratio = props.amount / props.max;
  }
  ratio = clamp01(ratio);
  width = ratio * hpBarMaxWidth - hpBarSlice.left - hpBarSlice.right;
  const innerStyle = {
    width: `${ratio * 100}%`
  };
  const style = {
    top: props.y
  };
  const useHpBarStyle = {
    ...hpBarStyle,
    width: `${width}px`
  };
  return (
    <div className="hp" style={style}>
      <div className="hp-inner" style={innerStyle}>
        <div className="hp-bar" style={useHpBarStyle}></div>
      </div>
    </div>
  );
}

export default HPBar;
