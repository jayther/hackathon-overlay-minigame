import React from 'react';
import SocketBridge from '../utils/SocketBridge';
import appActions from '../../shared/AppActions';

export function DebugSection(props) {

  function onAutoRefundChange(e) {
    SocketBridge.socket.emit(appActions.updateRewardSettings, {
      ...props.appState.rewardSettings,
      autoRefund: e.target.checked
    });
  }

  function onAddDebugPlayer() {
    SocketBridge.socket.emit(appActions.addDebugPlayer);
  }

  function onClearDebugPlayers() {
    SocketBridge.socket.emit(appActions.clearDebugPlayers);
  }

  return (
    <section className="container-sm">
      <article className="card bg-dark">
        <header className="card-header">Debug options</header>
        <div className="card-body">
          <div className="form-group form-check"><label className="form-check-label">
            <input type="checkbox" className="form-check-input"
              checked={props.appState.rewardSettings.autoRefund}
              onChange={onAutoRefundChange} /> Auto refund
          </label></div>
          <div className="form-group">
            <button className="btn btn-primary" onClick={onAddDebugPlayer}>Add debug player</button>
          </div>
          <div className="form-group">
            <button className="btn btn-secondary" onClick={onClearDebugPlayers}>Clear debug players</button>
          </div>
        </div>
      </article>
    </section>
  );
}
