import React from 'react';
import RandUtils from '../../shared/RandUtils';
import SpriteApplier from './SpriteApplier';

const animSetStates = {
  unarmed: {
    idle: 'idle',
    run: 'run',
    dead: 'dead',
    attacks: 'attacks',
    dash: 'dash',
    spawn: 'spawn',
    hit: 'hit'
  },
  weapon: {
    idle: 'idleWeapon',
    run: 'run',
    dead: 'dead',
    attacks: 'attacksWeapon',
    dash: 'dashWeapon',
    spawn: 'spawn',
    hit: 'hit'
  }
};

function getAnimSetState(state, weapon = false) {
  return animSetStates[weapon ? 'weapon' : 'unarmed'][state];
}

class PlayerChar extends SpriteApplier {
  constructor(props) {
    super(props);

    this.character = props.character;
    this.startFX = props.startFX;

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
    this.weapon = false;

    this.animStep = this.animStep.bind(this);
  }

  componentDidMount() {
    this.container = this.containerRef.current;
    this.sprite = this.spriteRef.current;
    this.containerStyle = this.container.style;
    this.spriteStyle = this.sprite.style;
    this.containerStyle.left = `${this.props.position.x}px`;
    this.containerStyle.top = `${this.props.position.y}px`;
    this.containerStyle.width = `0px`;
    this.containerStyle.height = `0px`;
    this.setAnimState('spawn');
  }

  componentDidUpdate() {
    if (this.character !== this.props.character) {
      this.character = this.props.character;
      this.setAnimState(this.animState);
    }
    this.containerStyle.left = `${this.props.position.x}px`;
    this.containerStyle.top = `${this.props.position.y}px`;
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
      switch (this.animState) {
        case 'idle':
        case 'run':
        case 'dash':
          this.spriteIndex = 0;
          break;
        default:
          backToIdle = true;
      }
    }
    if (backToIdle) {
      this.setAnimState('idle');
    } else {
      this.applySprite(this.anim.sprites[this.spriteIndex]);
    }
  }

  toggleFlipped() {
    this.flipped = !this.flipped;
  }

  toggleWeapon() {
    this.weapon = !this.weapon;
    this.setAnimState(this.animState);
  }

  setAnimState(animState) {
    this.animState = animState;
    const animSetState = getAnimSetState(animState, this.weapon);
    if (!this.character[animSetState]) {
      throw new Error(`PlayerChar.setAnimState: character does not have "${animSetState}" anim state`);
    }
    const animOrAnims = this.character[animSetState];
    const anim = Array.isArray(animOrAnims) ? RandUtils.pick(animOrAnims) : animOrAnims;
    this.startAnim(anim);
    if (anim.fx) {
      this.startFX(anim.fx, this.props.position, this.flipped, true);
    }
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
