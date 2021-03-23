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
        </tbody>
      </table>
    </div>
  );
}
