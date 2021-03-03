import React from 'react';
import DebugSprite from './DebugSprite';
import spritesheets0 from '../assets/spritesheets-0.json';
import spritesheets1 from '../assets/spritesheets-1.json';

const spriteConStyle = {
  padding: '5px'
};

const allFrames = spritesheets0.frames.concat(spritesheets1.frames);
allFrames.sort((a, b) => a.filename.localeCompare(b.filename));

class DebugSpritePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sprite: allFrames[0],
      nonce: 0
    };

    this.onSpriteSelect = this.onSpriteSelect.bind(this);
    this.onLeft = this.onLeft.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onRight = this.onRight.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onFloor = this.onFloor.bind(this);
  }

  onSpriteSelect(e) {
    this.setState({
      sprite: allFrames[e.target.value]
    });
  }

  onLeft() {
    this.setState(state => {
      state.sprite.spriteSourceSize.x -= 1;
      return {
        nonce: state.nonce + 1
      };
    });
  }

  onUp() {
    this.setState(state => {
      state.sprite.spriteSourceSize.y -= 1;
      return {
        nonce: state.nonce + 1
      };
    });
  }

  onRight() {
    this.setState(state => {
      state.sprite.spriteSourceSize.x += 1;
      return {
        nonce: state.nonce + 1
      };
    });
  }

  onDown() {
    this.setState(state => {
      state.sprite.spriteSourceSize.y += 1;
      return {
        nonce: state.nonce + 1
      };
    });
  }

  onFloor() {
    this.setState(state => {
      state.sprite.spriteSourceSize.y = state.sprite.sourceSize.h - state.sprite.spriteSourceSize.h;
      return {
        nonce: state.nonce + 1
      };
    });
  }

  render() {
    return (
      <div className="debug-sprite-page">
        <div className="sprite-con" style={spriteConStyle}>
          <DebugSprite sprite={this.state.sprite} />
        </div>
        <div className="sprite-list-con">
          <select onChange={this.onSpriteSelect}>
            {allFrames.map((frame, index) => (
              <option key={frame.filename} value={index}>
                {frame.filename}
              </option>
            ))}
          </select>
        </div>
        <div className="info-con">
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
                <td>{this.state.sprite.frame.x}</td>
                <td>{this.state.sprite.frame.y}</td>
                <td>{this.state.sprite.frame.w}</td>
                <td>{this.state.sprite.frame.h}</td>
                <td></td>
              </tr>
              <tr>
                <td>rotated</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>{this.state.sprite.rotated ? 'true' : 'false'}</td>
              </tr>
              <tr>
                <td>trimmed</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>{this.state.sprite.trimmed ? 'true' : 'false'}</td>
              </tr>
              <tr>
                <td>spriteSourceSize</td>
                <td>{this.state.sprite.spriteSourceSize.x}</td>
                <td>{this.state.sprite.spriteSourceSize.y}</td>
                <td>{this.state.sprite.spriteSourceSize.w}</td>
                <td>{this.state.sprite.spriteSourceSize.h}</td>
                <td></td>
              </tr>
              <tr>
                <td>sourceSize</td>
                <td></td>
                <td></td>
                <td>{this.state.sprite.sourceSize.w}</td>
                <td>{this.state.sprite.sourceSize.h}</td>
                <td></td>
              </tr>
              <tr>
                <td>pivot</td>
                <td>{this.state.sprite.pivot.x}</td>
                <td>{this.state.sprite.pivot.y}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="controls-con">
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
      </div>
    );
  }
}

export default DebugSpritePage;
