import React from 'react';
import { withApp } from './utils/AppContext';
import PlayerChar from './game/PlayerChar';
import FXAnim from './game/FXAnim';
import { resolveCharacter } from './utils/CharacterUtils';
import { createCharacter } from '../shared/CharacterParts';
import SocketBridge from './utils/SocketBridge';
import appActions from '../shared/AppActions';
import * as allCharacters from './game/characters/All_Characters';

let fxIdPool = 0;

class WidgetPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerChars: [],
      fxInstances: []
    };

    this.userIdRefMap = {};

    this.startFX = this.startFX.bind(this);
    this.onFXEnd = this.onFXEnd.bind(this);

    SocketBridge.socket.on(appActions.addPlayer, this.onAddPlayer.bind(this));
    SocketBridge.socket.on(appActions.updatePlayer, this.onUpdatePlayer.bind(this));
    SocketBridge.socket.on(appActions.removePlayer, this.onRemovePlayer.bind(this));
  }

  componentDidMount() {
    // is this fine...
    this.props.appState.players.forEach(this.onAddPlayer, this);
  }

  onAddPlayer(player) {
    // assuming no duplicates will be sent
    this.userIdRefMap[player.userId] = new React.createRef();
    this.setState((state, props) => {
      const character = allCharacters[createCharacter(player.characterType, player.characterGender)];
      const playerChar = {
        ...player,
        character: character,
        position: {
          x: 200, y: 200
        }
      };
      return {
        playerChars: [...state.playerChars, playerChar]
      };
    })
  }

  onUpdatePlayer(player) {
    this.setState((state, props) => {
      const character = allCharacters[createCharacter(player.characterType, player.characterGender)];
      return {
        playerChars: state.playerChars.map(pc => pc.userId === player.userId ? {
          ...pc,
          character
        } : pc)
      };
    });
  }

  onRemovePlayer(player) {
    // TODO animation for exit instead of immediate removal
    this.setState((state, props) => {
      const index = state.playerChars.findIndex(playerChar => playerChar.userId === player.userId);
      if (index === -1) {
        return {}; // no update
      }
      const playerChars = Array.from(state.playerChars);
      playerChars.splice(index, 1);
      delete this.userIdRefMap[player.userId]; // is this ok to do this here?
      return { playerChars };
    });
  }

  startFX(fx, position, flipped = false, autoplay = true) {
    const fxInstance = {
      id: fxIdPool++,
      fx,
      position,
      flipped,
      autoplay
    };
    this.setState((state, props) => {
      const fxInstances = [...state.fxInstances, fxInstance];
      return { fxInstances };
    });
    return fxInstance;
  }

  onFXEnd(fxId) {
    const index = this.state.fxInstances.findIndex(fxi => fxi.id === fxId);
    if (index === -1) {
      console.log(`Tried to remove an fxInstance that is not in state (id: ${fxId})`);
      return;
    }
    const fxInstances = Array.from(this.state.fxInstances);
    fxInstances.splice(index, 1);
    this.setState({
      fxInstances
    });
  }

  render() {
    return (
      <div className="widget-page">
        <div className="widget-playerchar-layer widget-layer">
          { this.state.playerChars.map(playerChar => (
            <PlayerChar 
              key={playerChar.userId}
              ref={this.userIdRefMap[playerChar.userId]}
              character={resolveCharacter(playerChar.character)}
              startFX={this.startFX}
              position={playerChar.position}
            />
          )) }
        </div>
        <div className="widget-fx-layer widget-layer">
          { this.state.fxInstances.map(fxInstance => (
            <FXAnim
              key={fxInstance.id}
              id={fxInstance.id}
              fx={fxInstance.fx}
              position={fxInstance.position}
              flipped={fxInstance.flipped}
              autoplay={fxInstance.autoplay}
              onEnd={this.onFXEnd}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default withApp(WidgetPage);
