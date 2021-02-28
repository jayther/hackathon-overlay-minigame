import React from 'react';
import OutlinedText from './OutlinedText';

function HitMarker(props) {
  const style = {
    left: `${props.position.x}px`,
    top: `${props.position.y}px`
  };
  const text = props.children && props.children.length > 0 ? props.children : props.text;
  function onEnd() {
    props.onEnd(props.id);
  }
  return (
    <div className="hitmarker-con" style={style}>
      <OutlinedText className="hitmarker" onAnimationEnd={onEnd}>{text}</OutlinedText>
    </div>
  );
}

export default HitMarker;
