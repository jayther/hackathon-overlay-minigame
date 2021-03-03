import React from 'react';
import SpriteApplier from '../game/SpriteApplier';

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
const spritePivotStyle = {
  position: 'absolute',
  left: '50%',
  top: '100%',
  width: '0',
  height: '0'
};

const spriteScale = 2;

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

export default DebugSprite;
