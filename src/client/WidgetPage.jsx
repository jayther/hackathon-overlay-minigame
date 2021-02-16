import React from 'react';
import { withApp } from './utils/AppContext';
import R from './Resources';
import PlayerChar from './game/PlayerChar';
import Archangel_Female from './game/characters/Archangel_Female';
import Archangel_Male from './game/characters/Archangel_Male';
import Assassin_Female from './game/characters/Assassin_Female';
import Assassin_Male from './game/characters/Assassin_Male';

function resolveAnim(anim) {
  if (anim.resolved) {
    return;
  }
  for (let i = 0; i < anim.sprites.length; i += 1) {
    anim.sprites[i] = R.frames[anim.sprites[i]];
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
      character: Archangel_Female
    };

    this.characters = [
      Archangel_Female,
      Archangel_Male,
      Assassin_Female,
      Assassin_Male
    ];

    this.playerRef = React.createRef();
  }

  setCharacter(characterName) {
    this.setState({
      character: this.characters.find(c => c.name === characterName)
    });
  }

  render() {
    return (
      <div className="widget-page">
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
          <button onClick={() => this.playerRef.current.toggleFlipped()}>Flip</button>
        </div>
        <PlayerChar ref={this.playerRef} character={resolveCharacter(this.state.character)} />
      </div>
    )
  }
}

export default withApp(WidgetPage);
