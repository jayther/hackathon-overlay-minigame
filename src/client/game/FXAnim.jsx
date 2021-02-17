import React from 'react';
import SpriteApplier from './SpriteApplier';

class FXAnim extends SpriteApplier {
  constructor(props) {
    super(props);

    this.id = props.id;
    this.fx = props.fx;
    this.position = props.position;
    this.flipped = props.flipped || false;
    this.autoplay = props.autoplay || false;
    this.onEnd = props.onEnd || (() => {});

    this.spriteRef = React.createRef();
    this.sprite = null;
    this.spriteStyle = null;
    this.spriteIndex = 0;
    this.intervalId = -1;
    this.anim = null;
    
    this.animStep = this.animStep.bind(this);
  }

  componentDidMount() {
    this.sprite = this.spriteRef.current;
    this.spriteStyle = this.sprite.style;
    this.spriteStyle.left = `${this.position.x}px`;
    this.spriteStyle.top = `${this.position.y}px`;
    if (this.autoplay) {
      this.play();
    }
  }

  play() {
    this.startAnim(this.fx);
  }
  stop() {
    if (this.intervalId > -1) {
      clearInterval(this.intervalId);
    }
  }

  startAnim(anim) {
    if (this.intervalId > -1) {
      clearInterval(this.intervalId);
    }
    this.anim = anim;
    this.spriteIndex = 0;
    this.intervalId = setInterval(this.animStep, this.anim.frameDelay);
    this.applySprite(this.anim.sprites[this.spriteIndex]);
  }

  animStep() {
    this.spriteIndex += 1;
    let ended = false;
    if (this.spriteIndex >= this.anim.sprites.length) {
      if (this.anim.repeat) {
        this.spriteIndex = 0;
      } else {
        ended = true;
      }
    }
    if (ended) {
      this.stop();
      this.onEnd(this.id);
    } else {
      this.applySprite(this.anim.sprites[this.spriteIndex]);
    }
  }

  render() {
    return (
      <div className="sprite-fx" ref={this.spriteRef}></div>
    );
  }
}

export default FXAnim;
