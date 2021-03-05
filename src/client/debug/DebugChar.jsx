import DebugSprite from './DebugSprite';
import { has } from '../../shared/ObjectUtils';

class DebugChar extends DebugSprite {
  constructor(props) {
    super(props);

    this.anim = null;
    this.intervalId = -1;
    this.spriteIndex = 0;
    this.speed = 1;
    this.animStep = this.animStep.bind(this);
  }
  componentDidMount() {
    this.spriteStyle = this.spriteRef.current.style;
    this.speed = this.props.speed || 1;
    this.startOrGoto();
  }
  componentDidUpdate() {
    this.speed = this.props.speed || 1;
    this.startOrGoto();
  }

  startOrGoto() {
    if (has(this.props, 'spriteIndex') && this.props.spriteIndex !== -1) {
      this.gotoAndStop(this.props.spriteIndex);
    } else {
      this.startCurrentAnim();
    }
  }

  gotoAndStop(spriteIndex) {
    if (spriteIndex < 0 || spriteIndex >= this.props.anim.sprites.length) {
      throw new Error(`DebugChar.gotoAndStop: spriteIndex out of range (${spriteIndex} out of ${this.props.anim.sprites.length})`);
    }
    this.stopAnim();
    this.anim = this.props.anim;
    this.spriteIndex = spriteIndex;
    // causes a setState loop
    // const sprite = this.props.anim.sprites[0];
    // if (this.sprite !== sprite) {
    //   this.setState({
    //     width: sprite.sourceSize.w,
    //     height: sprite.sourceSize.h
    //   });
    // }
    this.applySprite(this.anim.sprites[this.spriteIndex]);
  }

  startCurrentAnim() {
    const sprite = this.props.anim.sprites[0];
    if (this.sprite !== sprite) {
      this.setState({
        width: sprite.sourceSize.w,
        height: sprite.sourceSize.h
      });
    }
    this.startAnim(this.props.anim);
  }

  startAnim(anim) {
    if (this.intervalId > -1) {
      clearInterval(this.intervalId);
    }
    this.anim = anim;
    this.spriteIndex = 0;
    this.intervalId = setInterval(this.animStep, Math.round(anim.frameDelay * (1 / this.speed)));
    this.applySprite(this.anim.sprites[this.spriteIndex]);
  }

  stopAnim() {
    if (this.intervalId > -1) {
      clearInterval(this.intervalId);
      this.intervalId = -1;
    }
  }
  animStep() {
    this.spriteIndex += 1;
    if (this.anim.fx) {
      if (this.spriteIndex >= Math.max(this.anim.sprites.length, this.anim.fx.sprites.length)) {
        this.spriteIndex = 0;
      }
      if (this.spriteIndex < this.anim.sprites.length) {
        this.applySprite(this.anim.sprites[this.spriteIndex]);
      }
    } else{
      if (this.spriteIndex >= this.anim.sprites.length) {
        this.spriteIndex = 0;
      }
      this.applySprite(this.anim.sprites[this.spriteIndex]);
    } 
  }
}

export default DebugChar;
