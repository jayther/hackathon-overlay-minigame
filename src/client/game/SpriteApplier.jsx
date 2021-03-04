import React from 'react';

class SpriteApplier extends React.Component {
  constructor(props) {
    super(props);

    this.flipped = false;
    this.spriteStyle = null;
  }

  applySprite(sprite) {
    const halfWOffset = Math.floor(sprite.sourceSize.w / 2);

    if (sprite.rotated) {
      this.spriteStyle.width = `${sprite.frame.h}px`;
      this.spriteStyle.height = `${sprite.frame.w}px`;
      this.spriteStyle.transform = `scale(2) translate(${sprite.spriteSourceSize.x - halfWOffset}px, ${sprite.spriteSourceSize.y + sprite.spriteSourceSize.h - sprite.sourceSize.h}px) rotate(-90deg)`
    } else {
      this.spriteStyle.width = `${sprite.frame.w}px`;
      this.spriteStyle.height = `${sprite.frame.h}px`;
      this.spriteStyle.transform = `scale(2) translate(${sprite.spriteSourceSize.x - halfWOffset}px, ${sprite.spriteSourceSize.y - sprite.sourceSize.h}px)`;
    }
    if (this.flipped) {
      if (sprite.rotated) {
        this.spriteStyle.transform += ` rotateX(180deg) translate(0px, -${(halfWOffset - sprite.spriteSourceSize.x) * 2}px)`;
      } else {
        this.spriteStyle.transform += ` rotateY(180deg) translate(-${(halfWOffset - sprite.spriteSourceSize.x) * 2}px, 0px)`;
      }
    }
    this.spriteStyle.backgroundImage = `url(${sprite.src})`;
    this.spriteStyle.backgroundPosition = `left -${sprite.frame.x}px top -${sprite.frame.y}px`;
  }
}

export default SpriteApplier;
