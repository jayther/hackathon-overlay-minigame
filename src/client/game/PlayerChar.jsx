import React from 'react';
import RandUtils from '../../shared/RandUtils';
import SpriteApplier from './SpriteApplier';
import Vec2 from '../../shared/math/Vec2';
import { distance } from '../../shared/math/JMath';

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

function randPos(segStart, segEnd) {
  const pos = Vec2.lerp(segStart, segEnd, Math.random());
  pos.x = Math.floor(pos.x);
  pos.y = Math.floor(pos.y);
  return pos;
}

class PlayerChar extends SpriteApplier {
  constructor(props) {
    super(props);

    this.userId = props.userId;
    this.character = props.character;
    this.startFX = props.startFX;

    this.state = {
      hp: 1000
    };
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
    this.position = new Vec2(200, 200);
    this.speed = 200; // px per second
    this.dashSpeed = 300; // px per second
    this.actionQueue = [];
    this.currentAction = null;
    this.executingQueue = false;
    this.randomMoveWhenIdle = true;
    this.randomMoveId = -1;
    this.randomMoveDelayBounds = {
      min: 3000, // ms
      max: 6000
    };

    this.animStep = this.animStep.bind(this);
  }

  componentDidMount() {
    const pos = Vec2.lerp(this.props.randSegStart, this.props.randSegEnd, Math.random());
    pos.x = Math.floor(pos.x);
    pos.y = Math.floor(pos.y);
    this.position.set(pos);
    this.container = this.containerRef.current;
    this.sprite = this.spriteRef.current;
    this.containerStyle = this.container.style;
    this.spriteStyle = this.sprite.style;
    this.containerStyle.left = `${this.position.x}px`;
    this.containerStyle.top = `${this.position.y}px`;
    this.containerStyle.width = `0px`;
    this.containerStyle.height = `0px`;
    this.container.addEventListener('transitionend', this.onConTransitionEnd.bind(this), false);
    this.setAnimState('spawn');
  }

  componentDidUpdate() {
    if (this.character !== this.props.character) {
      this.character = this.props.character;
      this.setAnimState(this.animState);
    }
    this.containerStyle.left = `${this.position.x}px`;
    this.containerStyle.top = `${this.position.y}px`;
  }

  onConTransitionEnd() {
    this.processActionQueue();
  }

  startRandomMove() {
    if (this.randomMoveId !== -1) {
      clearTimeout(this.randomMoveId);
    }

    this.randomMoveId = setTimeout(() => {
      const pos = randPos(this.props.randSegStart, this.props.randSegEnd);
      // prevent getting stuck due to zero distance
      if (pos.x === this.position.x && pos.y === this.position.y) {
        pos.x += 1;
      }
      this.moveTo(pos)
    }, RandUtils.betweenInt(
      this.randomMoveDelayBounds.min,
      this.randomMoveDelayBounds.max
    ));
  }

  stopRandomMove() {
    if (this.randomMoveId !== -1) {
      clearTimeout(this.randomMoveId);
      this.randomMoveId = -1;
    }
  }

  processActionQueue() {
    if (this.actionQueue.length === 0) {
      this.currentAction = null;
      this.executingQueue = false;
      this.containerStyle.transition = '';
      this.setAnimState('idle');
      if (this.randomMoveWhenIdle) {
        this.startRandomMove();
      }
      return;
    }
    this.stopRandomMove();

    this.executingQueue = true;

    const action = this.actionQueue.shift();
    let travelTime, delta;
    this.currentAction = action;
    switch (action.type) {
      case 'move':
        delta = distance(this.position, action.position);
        travelTime = delta / this.speed;
        this.containerStyle.transition = `left ${travelTime}s linear, top ${travelTime}s linear`;
        setTimeout(() => {
          this.flipped = action.position.x > this.position.x;
          this.containerStyle.left = `${action.position.x}px`;
          this.containerStyle.top = `${action.position.y}px`;
          this.position.set(action.position);
          this.setAnimState('run');
        }, 50);
        break;
      case 'dash':
        travelTime = distance(this.position, action.position) / this.dashSpeed;
        this.containerStyle.transition = `left ${travelTime}s linear, top ${travelTime}s linear`;
        setTimeout(() => {
          this.flipped = action.position.x > this.position.x;
          this.containerStyle.left = `${action.position.x}px`;
          this.containerStyle.top = `${action.position.y}px`;
          this.position.set(action.position);
          this.setAnimState('dash');
        }, 50);
        break;
      case 'attack':
        this.setAnimState('attacks');
        break;
      case 'hit':
        this.setAnimState('hit');
        break;
      case 'weapon':
        this.weapon = true;
        this.setAnimState(this.animState);
        break;
      case 'unweapon':
        this.weapon = false;
        this.setAnimState(this.animState);
        break;
    }
  }

  addAction(action) {
    this.actionQueue.push(action);
    if (!this.executingQueue) {
      this.processActionQueue();
    }
  }

  moveTo(position) {
    this.addAction({ type: 'move', position });
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
    let ended = false;
    if (this.spriteIndex >= this.anim.sprites.length) {
      switch (this.animState) {
        case 'idle':
        case 'run':
        case 'dash':
          this.spriteIndex = 0;
          break;
        default:
          ended = true;
      }
    }
    if (ended) {
      this.processActionQueue();
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
      this.startFX(anim.fx, this.position, this.flipped, true);
    }
  }

  hit(damage) {
    this.setState((state, props) => {
      let hp = state.hp - damage;
      if (hp < 0) {
        hp = 0;
      }
      return { hp };
    });
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
