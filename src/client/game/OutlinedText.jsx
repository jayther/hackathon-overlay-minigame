import React from 'react';

function OutlinedText(props) {
  let classNames = ['outlined-text'];
  if (props.className) {
    classNames.push(props.className);
  }
  if (props.classNames) {
    classNames = classNames.concat(props.classNames);
  }
  if (props.classList) {
    classNames = classNames.concat(props.classList);
  }
  const text = (props.children && props.children.length > 0) ? props.children : props.text;
  return (
    <div className={classNames.join(' ')} style={props.style} onAnimationEnd={props.onAnimationEnd}>
      <div className="outline">{text}</div>
      <div className="fill">{text}</div>
    </div>
  );
}

export default OutlinedText;
