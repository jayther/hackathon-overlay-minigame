import React from 'react';
import DebugChar from './DebugChar';
import * as All_Characters from '../game/characters/All_Characters';
import { resolveCharacter } from '../utils/CharacterUtils';
import spritesheets0 from '../assets/spritesheets-0.json';
import spritesheets1 from '../assets/spritesheets-1.json';

import { spriteScale } from '../game/GameConfig';

const animSpeeds = [
  0.1,
  0.25,
  0.5,
  0.75,
  1
];

const allCharacters = Object.values(All_Characters);

function getAnimKeys(character) {
  return Object.keys(character).filter(key => key !== 'name' && key !== 'resolved');
}

function SpriteInfo(props) {
  return (
    <table className="info">
      <thead>
        <tr>
          <th>Property</th>
          <th>x</th>
          <th>y</th>
          <th>w</th>
          <th>h</th>
          <th>Etc</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>frame</td>
          <td>{props.sprite.frame.x}</td>
          <td>{props.sprite.frame.y}</td>
          <td>{props.sprite.frame.w}</td>
          <td>{props.sprite.frame.h}</td>
          <td></td>
        </tr>
        <tr>
          <td>rotated</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>{props.sprite.rotated ? 'true' : 'false'}</td>
        </tr>
        <tr>
          <td>trimmed</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>{props.sprite.trimmed ? 'true' : 'false'}</td>
        </tr>
        <tr>
          <td>spriteSourceSize</td>
          <td>{props.sprite.spriteSourceSize.x}</td>
          <td>{props.sprite.spriteSourceSize.y}</td>
          <td>{props.sprite.spriteSourceSize.w}</td>
          <td>{props.sprite.spriteSourceSize.h}</td>
          <td></td>
        </tr>
        <tr>
          <td>sourceSize</td>
          <td></td>
          <td></td>
          <td>{props.sprite.sourceSize.w}</td>
          <td>{props.sprite.sourceSize.h}</td>
          <td></td>
        </tr>
        <tr>
          <td>pivot</td>
          <td>{props.sprite.pivot.x}</td>
          <td>{props.sprite.pivot.y}</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
}

class DebugCharPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      characterIndex: 0,
      character: resolveCharacter(allCharacters[0]),
      anim: allCharacters[0].idle,
      animKey: 'idle',
      animIndex: -1,
      animKeys: getAnimKeys(allCharacters[0]),
      animSpriteIndex: -1,
      animSpeed: 1,
      fxSpriteIndex: -1,
      fxSpeed: 1,
      nonce: 0,
      changeAnim: true,
      changeFx: false,
      overlayFx: false,
      exportResults0: 'idle',
      exportResults1: 'idle'
    };

    this.onCharacterSelect = this.onCharacterSelect.bind(this);
    this.onAnimSelect = this.onAnimSelect.bind(this);
    this.onAnimIndexSelect = this.onAnimIndexSelect.bind(this);
    this.onChangeAnimChanged = this.onChangeAnimChanged.bind(this);
    this.onFXChanged = this.onFXChanged.bind(this);
    this.onOverlayFxChanged = this.onOverlayFxChanged.bind(this);
    this.onAnimSpriteIndexChanged = this.onAnimSpriteIndexChanged.bind(this);
    this.onAnimSpeedChanged = this.onAnimSpeedChanged.bind(this);
    this.onFxSpriteIndexChanged = this.onFxSpriteIndexChanged.bind(this);
    this.onFxSpeedChanged = this.onFxSpeedChanged.bind(this);
    this.onLeft = this.onLeft.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onRight = this.onRight.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onFloor = this.onFloor.bind(this);
    this.onExport = this.onExport.bind(this);
  }

  onCharacterSelect(e) {
    const characterIndex = parseInt(e.target.value);
    const character = resolveCharacter(allCharacters[characterIndex]);
    this.setState({
      characterIndex,
      character,
      anim: character.idle,
      animKey: 'idle',
      animKeys: getAnimKeys(character),
      animIndex: 0,
      animSpriteIndex: -1,
      fxSpriteIndex: -1,
      changeFx: false
    });
  }

  onAnimSelect(e) {
    const animKey = e.target.value;
    const anim = this.state.character[animKey];
    this.setState({
      anim: Array.isArray(anim) ? anim[0] : anim,
      animKey,
      animIndex: 0,
      animSpriteIndex: -1,
      fxSpriteIndex: -1,
      changeFx: false
    });
  }

  onAnimIndexSelect(e) {
    const animIndex = parseInt(e.target.value);
    const anims = this.state.character[this.state.animKey];
    this.setState({
      anim: anims[animIndex],
      animIndex,
      animSpriteIndex: -1,
      fxSpriteIndex: -1,
    });
  }

  onChangeAnimChanged(e) {
    this.setState({
      changeAnim: e.target.checked
    });
  }

  onFXChanged(e) {
    this.setState({
      changeFx: e.target.checked
    });
  }
  
  onOverlayFxChanged(e) {
    this.setState({
      overlayFx: e.target.checked
    });
  }

  onAnimSpriteIndexChanged(e) {
    this.setState({
      animSpriteIndex: parseInt(e.target.value)
    });
  }

  onAnimSpeedChanged(e) {
    this.setState({
      animSpeed: parseFloat(e.target.value)
    });
  }

  onFxSpriteIndexChanged(e) {
    this.setState({
      fxSpriteIndex: parseInt(e.target.value)
    });
  }

  onFxSpeedChanged(e) {
    this.setState({
      fxSpeed: parseFloat(e.target.value)
    });
  }

  adjustAnim(dx, dy) {
    this.setState(state => {
      if (state.animSpriteIndex === -1) {
        state.anim.sprites.forEach(sprite => {
          sprite.spriteSourceSize.x += dx;
          sprite.spriteSourceSize.y += dy;
        });
      } else {
        const sprite = state.anim.sprites[state.animSpriteIndex];
        sprite.spriteSourceSize.x += dx;
        sprite.spriteSourceSize.y += dy;
      }
      return {
        nonce: state.nonce + 1
      };
    });
  }

  adjustFX(dx, dy) {
    if (!this.state.anim.fx) {
      return;
    }
    this.setState(state => {
      if (state.anim.fxSpriteIndex === -1) {
        state.anim.fx.sprites.forEach(sprite => {
          sprite.spriteSourceSize.x += dx;
          sprite.spriteSourceSize.y += dy;
        });
      } else {
        const sprite = state.anim.fx.sprites[state.fxSpriteIndex];
        sprite.spriteSourceSize.x += dx;
        sprite.spriteSourceSize.y += dy;
      }
      return {
        nonce: state.nonce + 1
      };
    });
  }

  onLeft() {
    if (this.state.changeFx) {
      this.adjustFX(-1, 0);
    }
    if (this.state.changeAnim) {
      this.adjustAnim(-1, 0);
    }
  }

  onUp() {
    if (this.state.changeFx) {
      this.adjustFX(0, -1);
    } 
    if (this.state.changeAnim) {
      this.adjustAnim(0, -1);
    }
  }

  onRight() {
    if (this.state.changeFx) {
      this.adjustFX(1, 0);
    } 
    if (this.state.changeAnim) {
      this.adjustAnim(1, 0);
    }
  }

  onDown() {
    if (this.state.changeFx) {
      this.adjustFX(0, 1);
    } 
    if (this.state.changeAnim) {
      this.adjustAnim(0, 1);
    }
  }

  onFloor() {
    // base it off of first sprite
    if (this.state.changeFx && this.state.anim.fx) {
      const sprite = this.state.anim.fx.sprites[0];
      const dy = sprite.sourceSize.h - sprite.spriteSourceSize.h - sprite.spriteSourceSize.y;
      this.adjustFX(0, dy);
    } 
    if (this.state.changeAnim) {
      const sprite = this.state.anim.sprites[0];
      const dy = sprite.sourceSize.h - sprite.spriteSourceSize.h - sprite.spriteSourceSize.y;
      this.adjustAnim(0, dy);
    }
  }

  async onExport() {
    const data0 = JSON.stringify(spritesheets0, null, 2);
    const data1 = JSON.stringify(spritesheets1, null, 2);

    try {
      this.setState({
        exportResults0: 'exporting...'
      });
      const resp = await fetch('spritesheets/spritesheets-0.json', {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data0
      });
      const respStr = await resp.text();
      this.setState({
        exportResults0: respStr
      });
    } catch (e) {
      this.setState({
        exportResults0: e.message
      });
      console.error(e);
      return;
    }
    try {
      this.setState({
        exportResults1: 'exporting...'
      });
      const resp = await fetch('spritesheets/spritesheets-1.json', {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data1
      });
      const respStr = await resp.text();
      this.setState({
        exportResults1: respStr
      });
    } catch (e) {
      this.setState({
        exportResults1: e.message
      });
      console.error(e);
      return;
    }
  }

  render() {
    const combinedSpriteConNames = ['combined-sprite-con'];
    const combinedSpriteConStyle = {};
    if (this.state.overlayFx) {
      combinedSpriteConNames.push('overlay-fx');
      combinedSpriteConStyle.width = `${this.state.anim.sprites[0].sourceSize.w * spriteScale}px`;
    }
    return (
      <div className="debug-char-page">
        <div className={combinedSpriteConNames.join(' ')} style={combinedSpriteConStyle}>
          <div className="sprite-con">
            <DebugChar anim={this.state.anim} speed={this.state.animSpeed} spriteIndex={this.state.animSpriteIndex} />
          </div>
          {this.state.anim.fx && (
            <div className="fx-con">
              <DebugChar anim={this.state.anim.fx} speed={this.state.fxSpeed} spriteIndex={this.state.fxSpriteIndex} />
            </div>
          )}
        </div>
        <div className="info-controls-con">
          <div className="character-list-con">
            <select onChange={this.onCharacterSelect} value={this.state.characterIndex}>
              {allCharacters.map((character, index) => (
                <option key={character.name} value={index}>
                  {character.name}
                </option>
              ))}
            </select>
            <select onChange={this.onAnimSelect} value={this.state.animKey}>
              {this.state.animKeys.map(key => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            {Array.isArray(this.state.character[this.state.animKey]) ? (
              <select onChange={this.onAnimIndexSelect} value={this.state.animIndex}>
                {this.state.character[this.state.animKey].map((anim, index) => (
                  <option key={index} value={index}>
                    {index}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
          <div className="anim-control-con">
            <div>
              <label>
                Anim Frame index:
                <select onChange={this.onAnimSpriteIndexChanged} value={this.state.animSpriteIndex}>
                  <option value={-1}>Play all</option>
                  {this.state.anim.sprites.map((sprite, index) => (
                    <option key={index} value={index}>{index}</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label>
                Anim Speed:
                <select onChange={this.onAnimSpeedChanged} value={this.state.animSpeed}>
                  {animSpeeds.map((speed, index) => (
                    <option key={index} value={speed}>{speed}x</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label>
                FX Frame index:
                <select onChange={this.onFxSpriteIndexChanged} value={this.state.fxSpriteIndex} disabled={!this.state.anim.fx}>
                  <option value={-1}>Play all</option>
                  {this.state.anim.fx ? this.state.anim.fx.sprites.map((sprite, index) => (
                    <option key={index} value={index}>{index}</option>
                  )) : null}
                </select>
              </label>
            </div>
            <div>
              <label>
                FX Speed:
                <select onChange={this.onFxSpeedChanged} value={this.state.fxSpeed} disabled={!this.state.anim.fx}>
                  {animSpeeds.map((speed, index) => (
                    <option key={index} value={speed}>{speed}x</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="info-con">
            <SpriteInfo sprite={this.state.anim.sprites[this.state.animSpriteIndex === -1 ? 0 : this.state.animSpriteIndex]} />
            <div></div>
            {this.state.anim.fx && (
              <SpriteInfo sprite={this.state.anim.fx.sprites[this.state.fxSpriteIndex === -1 ? 0 : this.state.fxSpriteIndex]} />
            )}
          </div>
          <div className="controls-con">
            <div>
              <label>
                <input type="checkbox" checked={this.state.changeAnim} onChange={this.onChangeAnimChanged} />
                <span>Change Anim</span>
              </label>
              <label>
                <input type="checkbox" checked={this.state.changeFx} onChange={this.onFXChanged} disabled={!this.state.anim.fx} />
                <span>Change FX</span>
              </label>
              <label>
                <input type="checkbox" checked={this.state.overlayFx} onChange={this.onOverlayFxChanged} disabled={!this.state.anim.fx} />
                <span>Overlay FX</span>
              </label>
            </div>
            <table>
              <tbody>
                <tr>
                  <td></td>
                  <td>
                    <button onClick={this.onUp}>Up</button>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td>
                    <button onClick={this.onLeft}>Left</button>
                  </td>
                  <td></td>
                  <td>
                    <button onClick={this.onRight}>Right</button>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <button onClick={this.onDown}>Down</button>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <button onClick={this.onFloor}>Floor</button>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="export-con">
            <button onClick={this.onExport}>Export</button>
            <div className="export-results">
              <p><strong>spritesheets-0.json:</strong> {this.state.exportResults0}</p>
              <p><strong>spritesheets-1.json:</strong> {this.state.exportResults1}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DebugCharPage;
