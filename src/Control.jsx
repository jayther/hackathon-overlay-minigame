import React from 'react';
import { withApp } from './utils/AppContext';

function Control(props) {
  return (
    <div>
      <h1>Control</h1>
      <ul>
        { props.appState.redeems.map(item => (
          <li key={item.id}>
            <strong>{item.rewardTitle}</strong>: {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withApp(Control);
