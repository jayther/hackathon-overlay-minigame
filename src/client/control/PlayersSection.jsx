import React from 'react';
import SocketBridge from '../utils/SocketBridge';
import appActions from '../../shared/AppActions';
import { characterTypes, characterGenders } from '../../shared/CharacterParts';
import { next } from '../../shared/ArrayUtils';

export function PlayersSection(props) {
  return (
    <table className="players-section">
      <thead>
        <tr>
          <th>Username</th>
          <th>K/D/T</th>
          <th>WS</th>
          <th>Type</th>
          <th>Gender</th>
          <th>Weapon</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {props.players.length ? props.players.map(player => (
          <tr key={player.userId}>
            <td>{player.userDisplayName}</td>
            <td>{player.wins}/{player.losses}/{player.draws}</td>
            <td>{player.winStreak}</td>
            <td>{player.characterType}</td>
            <td>{player.characterGender}</td>
            <td>{player.weapon ? 'Yes' : 'No'}</td>
            <td>
              <button onClick={() => SocketBridge.socket.emit(appActions.updatePlayer, player.userId, {
                characterType: next(characterTypes, player.characterType)
              })}>
                Change Type
              </button>
              <button onClick={() => SocketBridge.socket.emit(appActions.updatePlayer, player.userId, {
                characterGender: next(characterGenders, player.characterGender)
              })}>
                Change Gender
              </button>
              <button onClick={() => SocketBridge.socket.emit(appActions.updatePlayer, player.userId, {
                weapon: !player.weapon
              })}>
                Toggle Weapon
              </button>
              <button onClick={() => SocketBridge.socket.emit(appActions.requestBattle, player.userId)}>
                Request Battle
              </button>
              <button onClick={() => SocketBridge.socket.emit(appActions.removePlayer, player.userId)}>
                Remove
              </button>
            </td>
          </tr>
        )) : (
            <tr>
              <td colSpan={7}><em>None</em></td>
            </tr>
          )}
      </tbody>
    </table>
  );
}
