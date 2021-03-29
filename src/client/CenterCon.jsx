import React from 'react';

function CenterCon(props) {
  return (<div className="container h-100">
    <div className="row h-100">
      <div className="col-sm-12 my-auto">
        {props.children}
      </div>
    </div>
  </div>);
}

export default CenterCon;
