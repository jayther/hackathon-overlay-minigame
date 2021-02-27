import React, { useState } from 'react';
import SocketBridge from '../utils/SocketBridge';
import appActions from '../../shared/AppActions';

export function DebugSection(props) {
  const [show, setShow] = useState(false);

  function toggleShow() {
    setShow(!show);
  }

  function onAutoRefundChange(e) {
    console.log('auto refund change', props.appState.debugAutoRefund, e.target.checked);
    SocketBridge.socket.emit(appActions.updateDebugAutoRefund, e.target.checked);
  }

  function onAddDebugPlayer() {
    SocketBridge.socket.emit(appActions.addDebugPlayer);
  }

  function onClearDebugPlayers() {
    SocketBridge.socket.emit(appActions.clearDebugPlayers);
  }

  return (
    <div>
      <h2>Debug options <button onClick={toggleShow}>{show ? 'Hide' : 'Show'}</button></h2>
      {show && (
        <ul>
          <li><label>
            <input type="checkbox"
              checked={props.appState.debugAutoRefund}
              onChange={onAutoRefundChange} /> Auto refund
          </label></li>
          <li>
            <button onClick={onAddDebugPlayer}>Add debug player</button>
          </li>
          <li>
            <button onClick={onClearDebugPlayers}>Clear debug players</button>
          </li>
        </ul>
      )}
    </div>
  );
}
