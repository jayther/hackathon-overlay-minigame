import React from 'react';
import SpriteApplier from '../game/SpriteApplier';
import spritesheets0 from '../assets/spritesheets-0.json';
import spritesheets1 from '../assets/spritesheets-1.json';

const debugSpriteOutlineStyle = {
  outline: '1px solid black',
  position: 'relative',
  transformOrigin: '0% 0%',
  imageRendering: 'pixelated'
};
const debugSpriteStyle = {
  outline: '1px solid black',
  position: 'relative',
  overflow: 'hidden',
  transformOrigin: '0% 0%',
  imageRendering: 'pixelated'
};
const spriteConStyle = {
  padding: '5px'
};
const spritePivotStyle = {
  position: 'absolute',
  left: '50%',
  top: '100%',
  width: '0',
  height: '0'
};

const spriteScale = 2;

const allFrames = spritesheets0.frames.concat(spritesheets1.frames);
allFrames.sort((a, b) => a.filename.localeCompare(b.filename));

class DebugSprite extends SpriteApplier {
  constructor(props) {
    super(props);

    this.spriteRef = React.createRef();
    this.sourceRef = React.createRef();
  }
  componentDidMount() {
    this.spriteStyle = this.spriteRef.current.style;
    this.applySprite(this.props.sprite);
  }
  componentDidUpdate() {
    this.applySprite(this.props.sprite);
  }

  render() {
    const outlineStyle = {
      ...debugSpriteOutlineStyle,
      width: `${this.props.sprite.sourceSize.w * spriteScale}px`,
      height: `${this.props.sprite.sourceSize.h * spriteScale}px`
    };
    return (
      <div className="debug-sprite-outline" style={outlineStyle}>
        <div className="debug-sprite-pivot" style={spritePivotStyle}>
          <div className="debug-sprite" ref={this.spriteRef} style={debugSpriteStyle}></div>
        </div>
      </div>
    );
  }
}

class DebugSpritePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      frame: allFrames[0]
    };

    this.onSpriteSelect = this.onSpriteSelect.bind(this);
  }

  onSpriteSelect(e) {
    this.setState({
      frame: allFrames[e.target.value]
    });
  }

  render() {
    return (
      <div className="debug-sprite-page">
        <div className="sprite-con" style={spriteConStyle}>
          <DebugSprite sprite={this.state.frame} />
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
        <div className="controls-con">

        </div>
      </div>
    );
  }
}

export default DebugSpritePage;
