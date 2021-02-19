import React from 'react';
import { withApp } from './utils/AppContext';
import PlayerChar from './game/PlayerChar';
import FXAnim from './game/FXAnim';
import { resolveCharacter } from './utils/CharacterUtils';
import { createCharacter } from '../shared/CharacterParts';
import { subtract, changes } from '../shared/ArrayUtils';

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
  }

  componentDidUpdate() {
    // TODO better way than these heavy array ops
    const toAdd = subtract(this.props.appState.players, this.state.playerChars, 'userId');
    const toRemove = subtract(this.state.playerChars, this.props.appState.players, 'userId');
    const changed = changes(
      this.props.appState.players,
      this.state.playerChars,
      'userId',
      ['characterType', 'characterGender']
    );

    if (toAdd.length + toRemove.length + changed.length === 0) {
      return;
    }

    
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
          { this.playerChars.map(playerChar => (
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
