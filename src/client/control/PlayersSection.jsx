import React, { useState } from 'react';
import SocketBridge from '../utils/SocketBridge';
import appActions from '../../shared/AppActions';
import { characterTypes, characterGenders } from '../../shared/CharacterParts';
import { next } from '../../shared/ArrayUtils';

function filterOneId(userId) {
  return player => player.userId !== userId;
}

function SpecificBattleDropdown(props) {
  function onChange(e) {
    if (e.target.value === 'none') {
      return;
    }
    SocketBridge.socket.emit(appActions.requestBattle, props.userId, e.target.value);
  }
  return (
    <select className="form-control mt-1" onChange={onChange} value="none">
      <option value="none">Specific Battle</option>
      { props.players.filter(filterOneId(props.userId)).map(player => (
        <option key={player.userId} value={player.userId}>
          { player.userDisplayName }
        </option>
      ))}
    </select>
  )
}

export function PlayersSection(props) {

  const [showActions, setShowActions] = useState(false);

  function toggleShowActions() {
    setShowActions(!showActions);
  }

  function onAddDebugPlayer() {
    SocketBridge.socket.emit(appActions.addDebugPlayer);
  }

  return (
    <section className="container-sm">
      <article className="card bg-dark">
        <header className="card-header">Players</header>
        <div className="card-body">
          <div>
            <button className="btn btn-primary" onClick={onAddDebugPlayer}>Add Debug Player</button>
            <button className="btn btn-primary ml-1" onClick={toggleShowActions}>{showActions ? 'Hide' : 'Show'} Actions</button>
          </div>
          <table className="players-section table table-dark table-striped mt-3">
            <thead>
              <tr>
                <th>Username</th>
                <th>K/D/T</th>
                <th>WS</th>
                <th>Type</th>
                <th>Gender</th>
                <th>Weapon</th>
                {showActions && (<th>Actions</th>)}
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
                  {showActions && (<td>
                    <button className="btn btn-secondary mr-1 mt-1" onClick={() => SocketBridge.socket.emit(appActions.updatePlayer, player.userId, {
                      characterType: next(characterTypes, player.characterType)
                    })}>
                      Change Type
                    </button>
                    <button className="btn btn-secondary mr-1 mt-1" onClick={() => SocketBridge.socket.emit(appActions.updatePlayer, player.userId, {
                      characterGender: next(characterGenders, player.characterGender)
                    })}>
                      Change Gender
                    </button>
                    <button className="btn btn-secondary mr-1 mt-1" onClick={() => SocketBridge.socket.emit(appActions.runPlayer, player.userId)}>
                      Run Around
                    </button>
                    <button className="btn btn-secondary mr-1 mt-1" onClick={() => SocketBridge.socket.emit(appActions.dancePlayer, player.userId)}>
                      Dance
                    </button>
                    <button className="btn btn-secondary mr-1 mt-1" onClick={() => SocketBridge.socket.emit(appActions.updatePlayer, player.userId, {
                      weapon: !player.weapon
                    })}>
                      Toggle Weapon
                    </button>
                    <br />
                    <button className="btn btn-secondary mr-1 mt-1" onClick={() => SocketBridge.socket.emit(appActions.requestBattle, player.userId)}>
                      Request Battle
                    </button>
                    <br />
                    <SpecificBattleDropdown players={props.players} userId={player.userId} />
                    <br />
                    <button className="btn btn-danger mr-1 mt-1" onClick={() => SocketBridge.socket.emit(appActions.removePlayer, player.userId)}>
                      Remove
                    </button>
                  </td>)}
                </tr>
              )) : (
                  <tr>
                    <td colSpan={showActions ? 7 : 6}><em>None</em></td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
