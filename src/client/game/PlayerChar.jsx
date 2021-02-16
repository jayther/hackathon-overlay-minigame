import React from 'react';

class PlayerChar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.containerRef = React.createRef();
    this.spriteRef = React.createRef();
    this.container = null;
    this.sprite = null;
    this.containerStyle = null;
    this.spriteStyle = null;
    this.spriteIndex = 0;
    this.flipped = false;

    this.onPressed = this.onPressed.bind(this);
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
    setInterval(() => {
      this.spriteIndex += 1;
      if (this.spriteIndex >= this.props.anim.sprites.length) {
        this.spriteIndex = 0;
      }
      this.applySprite(this.props.anim.sprites[this.spriteIndex]);
    }, this.props.anim.frameDelay);
    this.applySprite(this.props.anim.sprites[this.spriteIndex]);
  }

  applySprite(sprite) {
    let halfWOffset;
    if (this.flipped) {
      halfWOffset = Math.ceil(sprite.frame.w / 2);
    } else {
      halfWOffset = Math.floor(sprite.frame.w / 2);
    }
    const halfHOffset = Math.floor(sprite.frame.h / 2);

    if (sprite.rotated) {
      this.spriteStyle.width = `${sprite.frame.h}px`;
      this.spriteStyle.height = `${sprite.frame.w}px`;
      this.spriteStyle.transform = `translate(-${halfWOffset}px, ${sprite.frame.h - halfHOffset}px) rotate(-90deg)`
    } else {
      this.spriteStyle.width = `${sprite.frame.w}px`;
      this.spriteStyle.height = `${sprite.frame.h}px`;
      this.spriteStyle.transform = `translate(-${halfWOffset}px, -${halfHOffset}px)`;
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

  onPressed() {
    this.flipped = !this.flipped;
  }

  render() {
    return (
      <div ref={this.containerRef} className="playerchar-con">
        <div ref={this.spriteRef} className="playerchar" onClick={this.onPressed}></div>
      </div>
    )
  }
}

export default PlayerChar;
