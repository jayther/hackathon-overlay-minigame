import React from 'react';
import SocketBridge from '../utils/SocketBridge';
import appActions from '../../shared/AppActions';

export function BattleSection(props) {
  return (
    <div>
      <h2>Battles</h2>
      <p>
        Current battle:
        {props.battle ?
          `${props.battle.player1.userDisplayName} vs ${props.battle.player2.userDisplayName}` :
          'none'}
      </p>
      <p>
        Last battle results:
        {props.battleResults ? (
          <span>
            <strong>{props.battleResults.winner.userDisplayName}</strong> vs {props.battleResults.loser.userDisplayName}
          </span>
        ) : (
            <em>None</em>
          )}
      </p>
      <h3>Queue</h3>
      <table>
        <tbody>
          {props.battleQueue.length ?
            props.battleQueue.map(b => (
              <tr key={b.id}>
                <td>{b.userDisplayName}</td>
                <td>{b.target ? `vs. ${b.target.userDisplayName}` : 'vs. random'}</td>
                <td>
                  <button onClick={() => SocketBridge.socket.emit(appActions.cancelBattle, b.id)}>
                    Cancel
                </button>
                  <button onClick={() => SocketBridge.socket.emit(appActions.startBattle, b.id)}>
                    Start
                </button>
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
        <button onClick={() => SocketBridge.socket.emit(appActions.pruneBattles)}>
          Prune battles
        </button> (Remove battles involving players not in game)
      </div>
      <h3>Battle Settings</h3>
      <table>
        <tbody>
          <tr>
            <td>Delay between attacks</td>
            <td><input
              type="number"
              min="0"
              step="1"
              pattern="[0-9]+"
              onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
                ...props.battleSettings,
                delayBetweenAttacks: parseInt(e.target.value, 10)
              })}
              value={props.battleSettings.delayBetweenAttacks}
            />ms</td>
          </tr>
          <tr>
            <td>Auto prune after battle</td>
            <td><input
              type="checkbox"
              onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
                ...props.battleSettings,
                pruneAfterBattle: e.target.checked
              })}
              checked={props.battleSettings.pruneAfterBattle}
            /></td>
          </tr>
          <tr>
            <td>Auto start battles</td>
            <td><input
              type="checkbox"
              onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
                ...props.battleSettings,
                autoBattle: e.target.checked
              })}
              checked={props.battleSettings.autoBattle}
            /></td>
          </tr>
          <tr>
            <td>Auto start battle delay</td>
            <td><input
              type="number"
              min="0"
              step="1"
              pattern="[0-9]+"
              onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
                ...props.battleSettings,
                autoBattleDelay: parseInt(e.target.value, 10)
              })}
              value={props.battleSettings.autoBattleDelay}
            />ms</td>
          </tr>
          <tr>
            <td>Control battles from<br />Twitch Rewards Requests Queue</td>
            <td><input
              type="checkbox"
              onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
                ...props.battleSettings,
                controlFromTwitch: e.target.checked
              })}
              checked={props.battleSettings.controlFromTwitch}
            /></td>
          </tr>
          <tr>
            <td>Chance attack: Normal</td>
            <td><input
              type="number"
              min="0"
              onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
                ...props.battleSettings,
                chanceNormalWeight: parseFloat(e.target.value, 10)
              })}
              value={props.battleSettings.chanceNormalWeight}
            /></td>
          </tr>
          <tr>
            <td>Chance attack: Crit</td>
            <td><input
              type="number"
              min="0"
              onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
                ...props.battleSettings,
                chanceCritWeight: parseFloat(e.target.value, 10)
              })}
              value={props.battleSettings.chanceCritWeight}
            /></td>
          </tr>
          <tr>
            <td>Chance attack: Miss</td>
            <td><input
              type="number"
              min="0"
              onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
                ...props.battleSettings,
                chanceMissWeight: parseFloat(e.target.value, 10)
              })}
              value={props.battleSettings.chanceMissWeight}
            /></td>
          </tr>
          <tr>
            <td>Weapon damage boost</td>
            <td><input
              type="number"
              min="0"
              step="1"
              pattern="[0-9]+"
              onChange={e => SocketBridge.socket.emit(appActions.updateBattleSettings, {
                ...props.battleSettings,
                weaponBoost: parseInt(e.target.value, 10)
              })}
              value={props.battleSettings.weaponBoost}
            /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
