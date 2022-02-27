import React from 'react';
import SocketBridge from '../utils/SocketBridge';
import appActions from '../../shared/AppActions';

export function BattleSettingsSection(props) {
  return (
    <article className="card bg-dark mt-1" style={{maxWidth: '600px'}}>
      <header className="card-header">Duel Settings</header>
      <div className="card-body">
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Delay between attacks</label>
          <div className="col-sm-6"><input
            type="number"
            className="form-control"
            min="0"
            step="1"
            pattern="[0-9]+"
            onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
              ...props.appState.battleSettings,
              delayBetweenAttacks: parseInt(e.target.value, 10)
            })}
            value={props.appState.battleSettings.delayBetweenAttacks}
          /></div>
          <div className="col-sm-2">ms</div>
        </div>
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Auto prune after duel</label>
          <div className="col-sm-8"><span className="align-middle"><input
            type="checkbox"
            onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
              ...props.appState.battleSettings,
              pruneAfterBattle: e.target.checked
            })}
            checked={props.appState.battleSettings.pruneAfterBattle}
          /></span></div>
        </div>
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Auto start battles</label>
          <div className="col-sm-8"><span className="align-middle"><input
            type="checkbox"
            onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
              ...props.appState.battleSettings,
              autoBattle: e.target.checked
            })}
            checked={props.appState.battleSettings.autoBattle}
          /></span></div>
        </div>
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Auto start duel delay</label>
          <div className="col-sm-6"><input
            type="number"
            className="form-control"
            min="0"
            step="1"
            pattern="[0-9]+"
            onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
              ...props.appState.battleSettings,
              autoBattleDelay: parseInt(e.target.value, 10)
            })}
            value={props.appState.battleSettings.autoBattleDelay}
          /></div>
          <div className="col-sm-2">ms</div>
        </div>
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Control duels from<br />Twitch Rewards Requests Queue</label>
          <div className="col-sm-8"><span className="align-middle"><input
            type="checkbox"
            onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
              ...props.appState.battleSettings,
              controlFromTwitch: e.target.checked
            })}
            checked={props.appState.battleSettings.controlFromTwitch}
          /></span></div>
        </div>
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Chance attack: Normal</label>
          <div className="col-sm-8"><input
            type="number"
            className="form-control"
            min="0"
            onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
              ...props.appState.battleSettings,
              chanceNormalWeight: parseFloat(e.target.value, 10)
            })}
            value={props.appState.battleSettings.chanceNormalWeight}
          /></div>
        </div>
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Chance attack: Crit</label>
          <div className="col-sm-8"><input
            type="number"
            className="form-control"
            min="0"
            onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
              ...props.appState.battleSettings,
              chanceCritWeight: parseFloat(e.target.value, 10)
            })}
            value={props.appState.battleSettings.chanceCritWeight}
          /></div>
        </div>
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Chance attack: Miss</label>
          <div className="col-sm-8"><input
            type="number"
            className="form-control"
            min="0"
            onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
              ...props.appState.battleSettings,
              chanceMissWeight: parseFloat(e.target.value, 10)
            })}
            value={props.appState.battleSettings.chanceMissWeight}
          /></div>
        </div>
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Weapon damage boost</label>
          <div className="col-sm-8"><input
            type="number"
            className="form-control"
            min="0"
            step="1"
            pattern="[0-9]+"
            onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
              ...props.appState.battleSettings,
              weaponBoost: parseInt(e.target.value, 10)
            })}
            value={props.appState.battleSettings.weaponBoost}
          /></div>
        </div>
      </div>
    </article>
  )
}

export function BattleSection(props) {
  const battle = props.appState.currentBattle ? {
    player1: props.appState.players.find(p => p.userId === props.appState.currentBattle[0]) || {
      userId: props.appState.currentBattle[0],
      userDisplayName: props.appState.currentBattle[0],
      userName: props.appState.currentBattle[0]
    },
    player2: props.appState.players.find(p => p.userId === props.appState.currentBattle[1]) || {
      userId: props.appState.currentBattle[1],
      userDisplayName: props.appState.currentBattle[1],
      userName: props.appState.currentBattle[1]
    }
  } : null;
  return (
    <section className="container-sm">
      <article className="card bg-dark">
        <header className="card-header">Duels</header>
        <div className="card-body">
          <h4>Current duel</h4>
          <p>
            {battle ?
              `${battle.player1.userDisplayName} vs ${battle.player2.userDisplayName}` :
              'none'}
          </p>
          <h4>Last duel results</h4>
          <p>
            {props.appState.battleResults ? (
              <span>
                <strong>{props.appState.battleResults.winner.userDisplayName}</strong> vs {props.appState.battleResults.loser.userDisplayName}
              </span>
            ) : (
              <em>None</em>
            )}
          </p>
          <h4>Queue</h4>
          {!!props.appState.battleQueue.length && (
            <div className="btn-group mb-2" role="group">
              <button className="btn btn-secondary me-1"
                onClick={() => SocketBridge.socket.emit(appActions.cancelNextBattle)}
              >Cancel Next Battle</button>
              <button className="btn btn-primary me-1"
                onClick={() => SocketBridge.socket.emit(appActions.startNextBattle)}
              >Start Next Battle</button>
            </div>
          )}
          <table className="table table-striped table-dark">
            <tbody>
              {props.appState.battleQueue.length ?
                props.appState.battleQueue.map(b => (
                  <tr key={b.id}>
                    <td>{b.userDisplayName}</td>
                    <td>vs</td>
                    <td>{b.target ? b.target.userDisplayName : 'random'}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button className="btn btn-secondary"
                          onClick={() => SocketBridge.socket.emit(appActions.cancelBattle, b.id)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => SocketBridge.socket.emit(appActions.startBattle, b.id)}
                        >
                          Start
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3}><em>None</em></td>
                  </tr>
                )}
            </tbody>
          </table>
          <div>
            <button 
              className="btn btn-secondary"
              onClick={
                () => SocketBridge.socket.emit(appActions.pruneBattles)
              }
            >
              Prune duel requests
            </button> (Remove duel requests involving players not in game)
          </div>
        </div>
      </article>
      {props.showSettings && (
        <BattleSettingsSection appState={props.appState} />
      )}
    </section>
  );
}
