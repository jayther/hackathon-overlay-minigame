import React from 'react';
import RandUtils from '../utils/RandUtils';

class PlayerChar extends React.Component {
  constructor(props) {
    super(props);

    this.character = props.character;

    this.state = {};
    this.containerRef = React.createRef();
    this.spriteRef = React.createRef();
    this.container = null;
    this.sprite = null;
    this.containerStyle = null;
    this.spriteStyle = null;
    this.spriteIndex = 0;
    this.flipped = false;
    this.animState = 'idle';
    this.intervalId = -1;
    this.anim = null;

    this.animStep = this.animStep.bind(this);
  }

  componentDidMount() {
    this.container = this.containerRef.current;
    this.sprite = this.spriteRef.current;
    this.containerStyle = this.container.style;
    this.spriteStyle = this.sprite.style;
    this.containerStyle.left = '100px';
    this.containerStyle.top = '100px';
    this.containerStyle.width = `0px`;
    this.containerStyle.height = `0px`;
    this.setAnimState('idle');
  }

  componentDidUpdate() {
    if (this.character !== this.props.character) {
      this.character = this.props.character;
      this.setAnimState(this.animState);
    }
  }

  startAnim(anim) {
    if (this.intervalId > -1) {
      clearInterval(this.intervalId);
    }
    this.anim = anim;
    this.spriteIndex = 0;
    this.intervalId = setInterval(this.animStep, anim.frameDelay);
    this.applySprite(this.anim.sprites[this.spriteIndex]);
  }

  animStep() {
    this.spriteIndex += 1;
    let backToIdle = false;
    if (this.spriteIndex >= this.anim.sprites.length) {
      if (this.animState === 'idle' || this.animState === 'run') {
        this.spriteIndex = 0;
      } else {
        backToIdle = true;
      }
    }
    if (backToIdle) {
      this.setAnimState('idle');
    } else {
      this.applySprite(this.anim.sprites[this.spriteIndex]);
    }
  }

  applySprite(sprite) {
    let halfWOffset;
    if (this.flipped) {
      halfWOffset = Math.ceil(sprite.frame.w / 2);
    } else {
      halfWOffset = Math.floor(sprite.frame.w / 2);
    }

    if (sprite.rotated) {
      this.spriteStyle.width = `${sprite.frame.h}px`;
      this.spriteStyle.height = `${sprite.frame.w}px`;
      this.spriteStyle.transform = `translate(-${halfWOffset}px, 0px) rotate(-90deg)`
    } else {
      this.spriteStyle.width = `${sprite.frame.w}px`;
      this.spriteStyle.height = `${sprite.frame.h}px`;
      this.spriteStyle.transform = `translate(-${halfWOffset}px, -${sprite.frame.h}px)`;
    }
    if (this.flipped) {
      if (sprite.rotated) {
        this.spriteStyle.transform += ` rotateX(180deg) translate(0px, -${sprite.frame.w}px)`;
      } else {
        this.spriteStyle.transform += ` rotateY(180deg) translate(-${sprite.frame.w}px, 0px)`;
      }
    }
    this.spriteStyle.backgroundImage = `url(${sprite.src})`;
    this.spriteStyle.backgroundPosition = `left -${sprite.frame.x}px top -${sprite.frame.y}px`;
  }

  toggleFlipped() {
    this.flipped = !this.flipped;
  }

  setAnimState(animState) {
    this.animState = animState;
    if (!this.character[animState]) {
      throw new Error(`PlayerChar.setAnimState: character does not have "${animState}" anim state`);
    }
    const animOrAnims = this.character[animState];
    const anim = Array.isArray(animOrAnims) ? RandUtils.pick(animOrAnims) : animOrAnims;
    this.startAnim(anim);
  }

  render() {
    return (
      <div ref={this.containerRef} className="playerchar-con">
        <div ref={this.spriteRef} className="playerchar"></div>
      </div>
    )
  }
}

export default PlayerChar;
