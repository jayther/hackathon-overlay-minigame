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

class DebugWidgetPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      character: allCharacters[0],
      fxInstances: []
    };

    this.characters = allCharacters;
    this.playerRefs = [];
    this.characters.forEach(character => {
      resolveCharacter(character);
      this.playerRefs.push(React.createRef());
    });

    this.startFX = this.startFX.bind(this);
    this.onFXEnd = this.onFXEnd.bind(this);
    this.setAnimState = this.setAnimState.bind(this);
    this.toggleFlipped = this.toggleFlipped.bind(this);
    this.toggleWeapon = this.toggleWeapon.bind(this);
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

  setCharacter(characterName) {
    this.setState({
      character: this.characters.find(c => c.name === characterName)
    });
  }

  setAnimState(state) {
    this.playerRefs.forEach(ref => ref.current.setAnimState(state));
  }

  toggleFlipped() {
    this.playerRefs.forEach(ref => ref.current.toggleFlipped());
  }

  toggleWeapon() {
    this.playerRefs.forEach(ref => ref.current.toggleWeapon());
  }

  render() {
    const maxCols = 7, spacing = 120;
    return (
      <div className="widget-page">
        <div className="widget-playerchar-layer widget-layer">
          { this.characters.map((c, i) => (
            <PlayerChar 
              key={i}
              ref={this.playerRefs[i]}
              character={resolveCharacter(c)}
              startFX={this.startFX}
              position={{
                x: 100 + (i % maxCols) * spacing, y: 200 + Math.floor(i / maxCols) * spacing
              }}
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
        <div className="widget-debug">
          <div>
            <select onChange={e => this.setCharacter(e.target.value)}>
              { this.characters.map(character => (
                <option key={character.name} value={character.name}>{character.name}</option>
              ))}
            </select>
          </div>
          <div>
            <button onClick={() => this.setAnimState('idle')}>Idle</button>
            <button onClick={() => this.setAnimState('run')}>Run</button>
            <button onClick={() => this.setAnimState('dead')}>Dead</button>
            <button onClick={() => this.setAnimState('attacks')}>Attack</button>
            <button onClick={() => this.setAnimState('dash')}>Dash</button>
            <button onClick={() => this.setAnimState('spawn')}>Spawn</button>
            <button onClick={() => this.setAnimState('hit')}>Hit</button>
            <button onClick={() => this.toggleFlipped()}>Flip</button>
            <button onClick={() => this.toggleWeapon()}>Weapon</button>
          </div>
        </div>
      </div>
    )
  }
}

export default withApp(DebugWidgetPage);
