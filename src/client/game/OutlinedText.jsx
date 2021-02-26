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
  return (
    <div className={classNames.join(' ')} style={props.style}>
      <div className="outline">{props.text}</div>
      <div className="fill">{props.text}</div>
    </div>
  );
}

export default OutlinedText;
