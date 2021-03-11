import React from 'react';
import EventEmitter from 'eventemitter3';

import OutlinedText from './OutlinedText';

import RandUtils from '../../shared/RandUtils';
import SpriteApplier from './SpriteApplier';
import Vec2 from '../../shared/math/Vec2';
import { distance } from '../../shared/math/JMath';
import { waitForMS } from '../../shared/PromiseUtils';
import HPBar from './HPBar';

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
    run: ['runWeapon', 'run'],
    dead: 'dead',
    attacks: 'attacksWeapon',
    dash: 'dashWeapon',
    spawn: 'spawn',
    hit: 'hit'
  }
};

const actions = {
  move: 'move',
  dash: 'dash',
  attack: 'attack',
  hit: 'hit',
  delay: 'delay',
  die: 'die',
  face: 'face',
  spawn: 'spawn'
};

const maxHp = 1000;
const hpBarOffset = 31;

function getAnimSetState(state, weapon = false) {
  return animSetStates[weapon ? 'weapon' : 'unarmed'][state];
}

function randPos(segStart, segEnd) {
  const pos = Vec2.lerp(segStart, segEnd, Math.random());
  pos.x = Math.floor(pos.x);
  pos.y = Math.floor(pos.y);
  return pos;
}

const labelOffset = 25;
const scale = 2;

class PlayerChar extends SpriteApplier {
  constructor(props) {
    super(props);

    this.userId = props.userId;
    this.character = props.character;
    this.startFX = props.startFX;

    this.state = {
      hp: maxHp,
      showHp: false,
      labelY: 0,
      side: null
    };
    this.hp = maxHp;
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
    this.position = new Vec2(200, 200);
    this.speed = 200; // px per second
    this.dashSpeed = 300; // px per second
    this.hitSpeed = 150; // px per second
    this.spawnSpeed = 300; // px per second
    this.weapon = false;
    this.inBattle = false;
    this.actionQueue = [];
    this.currentAction = null;
    this.executingQueue = false;
    this.randomMoveWhenIdle = true;
    this.randomMoveId = -1;
    this.randomMoveDelayBounds = {
      min: 3000, // ms
      max: 6000
    };
    this.delayActionId = -1;

    this.events = new EventEmitter();
    this.animStep = this.animStep.bind(this);
  }

  componentDidMount() {
    const pos = Vec2.lerp(this.props.randSegStart, this.props.randSegEnd, Math.random());
    const stationary = this.isSpawnStationary();
    pos.x = Math.floor(pos.x);
    pos.y = Math.floor(pos.y);
    if (!stationary) {
      pos.y += 100;
    }
    this.position.set(pos);
    this.container = this.containerRef.current;
    this.sprite = this.spriteRef.current;
    this.containerStyle = this.container.style;
    this.spriteStyle = this.sprite.style;
    this.weapon = this.props.weapon;
    this.containerStyle.left = `${this.position.x}px`;
    this.containerStyle.top = `${this.position.y}px`;
    this.containerStyle.width = `0px`;
    this.containerStyle.height = `0px`;
    // unreliable; using setTimeout()
    // this.container.addEventListener('transitionend', this.onConTransitionEnd.bind(this), false);
    if (stationary) {
      this.spawnStationary();
    } else {
      const newPos = pos.copy();
      newPos.y -= 100;
      this.spawnTo(newPos);
    }
  }

  componentDidUpdate() {
    let update = false;
    if (this.character !== this.props.character) {
      this.character = this.props.character;
      update = true;
    }
    if (this.weapon !== this.props.weapon) {
      this.weapon = this.props.weapon;
      update = true;
    }
    if (this.inBattle !== this.props.inBattle) {
      this.inBattle = this.props.inBattle;
      if (!this.inBattle && this.randomMoveWhenIdle) {
        this.startRandomMove();
      }
    }
    if (update) {
      this.setAnimState(this.animState);
    }
  }

  componentWillUnmount() {
    this.stopRandomMove();
    this.stopCurrentAnim();
    if (this.delayActionId !== -1) {
      clearTimeout(this.delayActionId);
    }
  }

  onConTransitionEnd() {
    this.processActionQueue();
  }

  isSpawnStationary() {
    const animSetState = getAnimSetState('spawn');
    const anim = this.character[animSetState];
    if (!anim) {
      throw new Error('PlayerChar.isSpawnStationary: no anim found for spawn');
    }
    return anim.stationary;
  }

  startRandomMove() {
    if (this.randomMoveId !== -1) {
      clearTimeout(this.randomMoveId);
    }

    this.randomMoveId = setTimeout(() => {
      for (let i = 0; i < 1; i += 1) {
        const pos = randPos(this.props.randSegStart, this.props.randSegEnd);
        // prevent getting stuck due to zero distance
        //pos.y -= betweenInt(0, 300);
        if (pos.x === this.position.x && pos.y === this.position.y) {
          pos.x += 1;
        }
        this.moveTo(pos);
      }
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

  async cssTransitionMoveTo(position, speed, animState, moveBackwards = false) {
    const oldPos = this.position.copy();
    const delta = distance(oldPos, position);
    let travelTime = Math.floor(delta / speed * 1000); // ms
    if (travelTime < 10) {
      travelTime = 10;
    }
    this.containerStyle.transition = `opacity 1s linear, left ${travelTime}ms linear, top ${travelTime}ms linear`;
    await waitForMS(50); // wait for css to be applied
    this.flipped = position.x > oldPos.x;
    if (moveBackwards) {
      this.flipped = !this.flipped;
    }
    this.containerStyle.left = `${position.x}px`;
    this.containerStyle.top = `${position.y}px`;
    this.position.set(position);
    this.setAnimState(animState);
    await waitForMS(travelTime);
    this.processActionQueue();
  }

  processActionQueue() {
    if (this.actionQueue.length === 0) {
      this.currentAction = null;
      this.executingQueue = false;
      this.containerStyle.transition = 'opacity 1s linear';
      this.setAnimState('idle');
      this.events.emit('idle', this);
      if (this.randomMoveWhenIdle && !this.props.inBattle) {
        this.startRandomMove();
      }
      return;
    }
    this.stopRandomMove();

    this.executingQueue = true;

    const action = this.actionQueue.shift();
    this.currentAction = action;
    switch (action.type) {
      case actions.move:
        this.cssTransitionMoveTo(action.position, this.speed, 'run');
        break;
      case actions.dash:
        this.cssTransitionMoveTo(action.position, this.dashSpeed, 'dash');
        break;
      case actions.attack:
        this.setAnimState('attacks');
        break;
      case actions.hit:
        this.hit(action.damage);
        this.cssTransitionMoveTo(action.position, this.hitSpeed, 'hit', true);
        break;
      case actions.delay:
        this.delayActionId = setTimeout(() => {
          this.delayActionId = -1;
          this.processActionQueue();
        }, action.duration);
        break;
      case actions.die:
        this.setAnimState('dead');
        break;
      case actions.face:
        this.flipped = action.position.x > this.position.x;
        this.setAnimState(this.animState);
        this.processActionQueue();
        break;
      case actions.spawn:
        if (action.stationary) {
          this.setAnimState('spawn');
        } else {
          this.cssTransitionMoveTo(action.position, this.spawnSpeed, 'spawn');
        }
        break;
      default:
        console.error(`processActionQueue: Unknown action type: "${action.type}"`);
    }
  }

  addAction(action) {
    this.actionQueue.push(action);
    if (!this.executingQueue) {
      this.processActionQueue();
    }
    return this;
  }

  spawnTo(position) {
    this.addAction({ type: actions.spawn, position, stationary: false });
    return this;
  }

  spawnStationary() {
    this.addAction({ type: actions.spawn, stationary: true });
    return this;
  }

  moveTo(position) {
    this.addAction({ type: actions.move, position });
    return this;
  }

  dashTo(position) {
    this.addAction({ type: actions.dash, position });
    return this;
  }

  hitTo(position, damage) {
    this.addAction({ type: actions.hit, position, damage });
    return this;
  }

  hitToDelta(dx, damage) {
    const position = this.position.copy();
    position.x += dx;
    return this.hitTo(position, damage);
  }

  attack() {
    this.addAction({ type: actions.attack });
    return this;
  }

  delay(duration) {
    this.addAction({ type: actions.delay, duration });
    return this;
  }

  die() {
    this.addAction({ type: actions.die });
    return this;
  }

  face(position) {
    this.addAction({ type: actions.face, position });
  }

  resetHp() {
    this.hp = maxHp;
    this.setState({
      hp: this.hp
    });
  }

  fadeIn() {
    this.containerStyle.opacity = 1;
  }

  fadeOut() {
    this.containerStyle.opacity = 0;
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

  stopCurrentAnim() {
    if (this.intervalId > -1) {
      clearInterval(this.intervalId);
    }
  }

  animStep() {
    this.spriteIndex += 1;
    let ended = false;
    if (this.spriteIndex >= this.anim.sprites.length) {
      switch (this.animState) {
        case 'idle':
        case 'run':
        case 'dash':
        case 'hit':
          this.spriteIndex = 0;
          break;
        default:
          ended = true;
      }
    }
    if (ended) {
      if (this.animState === 'dead') {
        this.stopCurrentAnim();
        this.fadeOut();
      } else {
        this.processActionQueue();
      }
    } else {
      this.applySprite(this.anim.sprites[this.spriteIndex]);
    }
  }

  toggleFlipped() {
    this.flipped = !this.flipped;
  }

  toggleWeapon() {
    //this.weapon = !this.weapon;
    this.setAnimState(this.animState);
  }

  setAnimState(animState) {
    this.animState = animState;
    const animSetStateOrArr = getAnimSetState(animState, this.weapon);
    let animSetState = null;
    if (Array.isArray(animSetStateOrArr)) {
      animSetState = animSetStateOrArr.find(s => this.character[s]);
      if (!animSetState) {
        throw new Error(`PlayerChar.setAnimState: character does not have any of these anim states: ${animSetStateOrArr.join(', ')}`);
      }
    } else {
      animSetState = animSetStateOrArr;
      if (!this.character[animSetState]) {
        throw new Error(`PlayerChar.setAnimState: character does not have "${animSetState}" anim state`);
      }
    }
    const animOrAnims = this.character[animSetState];
    const anim = Array.isArray(animOrAnims) ? RandUtils.pick(animOrAnims) : animOrAnims;
    this.startAnim(anim);
    // use first sprite as basis
    const sprite = anim.sprites[0];
    this.setState({
      labelY: -sprite.sourceSize.h * scale - labelOffset
    });
    if (anim.fx) {
      this.startFX(anim.fx, this.position, this.flipped, true);
    }
  }

  hit(damage) {
    let hp = this.hp - damage;
    this.hp = hp;
    this.setState({
      hp
    });
    return hp;
  }

  setShowHp(show) {
    this.setState({
      showHp: show
    });
  }

  waitForIdle() {
    return new Promise(resolve => this.events.once('idle', resolve));
  }

  setSide(side) {
    this.setState({
      side
    });
  }

  render() {
    return (
      <div ref={this.containerRef} className="playerchar-con">
        { this.state.showHp ? (
            <HPBar
              y={this.state.labelY - hpBarOffset - (this.state.side === 'right' ? hpBarOffset : 0)}
              amount={this.state.hp}
              max={maxHp}
            />
          ) : null
        }
        <div className="playerchar-label-con">
          <OutlinedText className="playerchar-label"
            text={this.props.userDisplayName}
            style={{
              zIndex: this.props.index,
              top: `${this.state.labelY}px`
            }}
          />
        </div>
        <div ref={this.spriteRef} className="playerchar"></div>
      </div>
    )
  }
}

export default PlayerChar;
