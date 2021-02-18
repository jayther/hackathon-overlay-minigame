import React from 'react';
import { withApp } from './utils/AppContext';
import R from './Resources';
import PlayerChar from './game/PlayerChar';
import FXAnim from './game/FXAnim';
import * as All_Characters from './game/characters/All_Characters';

const allCharacters = Object.values(All_Characters);

let fxIdPool = 0;

function resolveAnim(anim) {
  if (anim.resolved) {
    return;
  }
  for (let i = 0; i < anim.sprites.length; i += 1) {
    if (!R.frames[anim.sprites[i]]) {
      console.error(`resolveAnim: frame "${anim.sprites[i]}" does not exist`);
      continue;
    }
    anim.sprites[i] = R.frames[anim.sprites[i]];
    if (anim.fx) {
      resolveAnim(anim.fx);
    }
  }
  anim.resolved = true;
}

function resolveCharacter(character) {
  if (character.resolved) {
    return character;
  }
  Object.values(character).forEach(animOrAnims => {
    if (typeof animOrAnims === 'string') {
      return;
    } else if (Array.isArray(animOrAnims)) {
      animOrAnims.forEach(resolveAnim);
    } else {
      resolveAnim(animOrAnims);
    }
  });
  character.resolved = true;
  return character;
}

class WidgetPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      character: allCharacters[0],
      fxInstances: []
    };

    this.characters = allCharacters;
    this.characters.forEach(resolveCharacter);

    this.playerRef = React.createRef();
    this.startFX = this.startFX.bind(this);
    this.onFXEnd = this.onFXEnd.bind(this);
  }

  startFX(fx, position, flipped = false, autoplay = true) {
    const fxInstance = {
      id: fxIdPool++,
      fx,
      position,
      flipped,
      autoplay
    };
    const fxInstances = [...this.state.fxInstances, fxInstance];
    this.setState({
      fxInstances
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

  setCharacter(characterName) {
    this.setState({
      character: this.characters.find(c => c.name === characterName)
    });
  }

  render() {
    return (
      <div className="widget-page">
        <div className="widget-playerchar-layer widget-layer">
          <PlayerChar 
            ref={this.playerRef}
            character={resolveCharacter(this.state.character)}
            startFX={this.startFX}
            position={{
              x: 200, y: 200
            }}
          />
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
        <div className="widget-debug">
          <div>
            <select onChange={e => this.setCharacter(e.target.value)}>
              { this.characters.map(character => (
                <option key={character.name} value={character.name}>{character.name}</option>
              ))}
            </select>
          </div>
          <div>
            <button onClick={() => this.playerRef.current.setAnimState('idle')}>Idle</button>
            <button onClick={() => this.playerRef.current.setAnimState('run')}>Run</button>
            <button onClick={() => this.playerRef.current.setAnimState('dead')}>Dead</button>
            <button onClick={() => this.playerRef.current.setAnimState('attacks')}>Attack</button>
            <button onClick={() => this.playerRef.current.setAnimState('dash')}>Dash</button>
            <button onClick={() => this.playerRef.current.setAnimState('spawn')}>Spawn</button>
            <button onClick={() => this.playerRef.current.setAnimState('hit')}>Hit</button>
            <button onClick={() => this.playerRef.current.toggleFlipped()}>Flip</button>
            <button onClick={() => this.playerRef.current.toggleWeapon()}>Weapon</button>
          </div>
        </div>
      </div>
    )
  }
}

export default withApp(WidgetPage);
