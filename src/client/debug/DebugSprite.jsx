import React from 'react';
import SpriteApplier from '../game/SpriteApplier';

import { spriteScale } from '../game/GameConfig';

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

class DebugSprite extends SpriteApplier {
  constructor(props) {
    super(props);

    this.sprite = null;
    this.state = {
      width: 0,
      height: 0
    };
    this.spriteRef = React.createRef();
    this.sourceRef = React.createRef();
  }
  componentDidMount() {
    this.spriteStyle = this.spriteRef.current.style;
    this.setState({
      width: this.props.sprite.sourceSize.w,
      height: this.props.sprite.sourceSize.h
    });
    this.applySprite(this.props.sprite);
  }
  componentDidUpdate() {
    if (this.sprite !== this.props.sprite) {
      this.setState({
        width: this.props.sprite.sourceSize.w,
        height: this.props.sprite.sourceSize.h
      });
    }
    this.applySprite(this.props.sprite);
  }
  applySprite(sprite) {
    this.sprite = sprite;
    super.applySprite(sprite);
  }

  render() {
    const outlineStyle = {
      ...debugSpriteOutlineStyle,
      width: `${this.state.width * spriteScale}px`,
      height: `${this.state.height * spriteScale}px`
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
