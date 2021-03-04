import DebugSprite from './DebugSprite';

class DebugChar extends DebugSprite {
  constructor(props) {
    super(props);

    this.anim = null;
    this.intervalId = -1;
    this.spriteIndex = 0;
    this.animStep = this.animStep.bind(this);
  }
  componentDidMount() {
    this.spriteStyle = this.spriteRef.current.style;
    this.startCurrentAnim();
  }
  componentDidUpdate() {
    this.startCurrentAnim();
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
    this.intervalId = setInterval(this.animStep, anim.frameDelay);
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
