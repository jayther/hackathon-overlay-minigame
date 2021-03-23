import React from 'react';
import { withApp } from './utils/AppContext';
import PlayerChar from './game/PlayerChar';
import FXAnim from './game/FXAnim';
import HitMarker from './game/HitMarker';
import { resolveCharacter } from './utils/CharacterUtils';
import { createCharacter } from '../shared/CharacterParts';
import SocketBridge from './utils/SocketBridge';
import appActions from '../shared/AppActions';
import Vec2 from '../shared/math/Vec2';
import * as allCharacters from './game/characters/All_Characters';
import arenaImg from './assets/arena.png';
import EventEmitter from 'eventemitter3';
import BattleRunner from './game/BattleRunner';
import JRect from '../shared/math/JRect';
import { has } from '../shared/ObjectUtils';
import sounds, { changeVolume } from './game/SoundSets';
import { Howler } from 'howler';

let fxIdPool = 0;
let hitMarkerIdPool = 0;

const arenaDimensions = {
  width: 336,
  height: 126
};
const arenaScale = 2;

class WidgetPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerChars: [],
      fxInstances: [],
      hitMarkers: [],
      randSegStart: new Vec2(200, 200),
      randSegEnd: new Vec2(400, 200),
      showArena: false
    };

    this.pageRef = React.createRef();
    this.userIdRefMap = {};
    this.arena = {
      leftStairBottom: new Vec2(),
      leftStairTop: new Vec2(),
      rightStairBottom: new Vec2(),
      rightStairTop: new Vec2(),
      leftPoint: new Vec2(),
      rightPoint: new Vec2(),
      midPoint: new Vec2()
    };
    this.arenaRef = React.createRef();
    this.arenaRect = new JRect();
    this.arenaRect.setWidth(arenaDimensions.width * arenaScale);
    this.arenaRect.setHeight(arenaDimensions.height * arenaScale);

    this.runningBattle = false;
    this.events = new EventEmitter();
    this.prevSoundVolumes = {};

    this.startFX = this.startFX.bind(this);
    this.onFXEnd = this.onFXEnd.bind(this);
    this.startHitMarker = this.startHitMarker.bind(this);
    this.onHitMarkerEnd = this.onHitMarkerEnd.bind(this);

    SocketBridge.socket.on(appActions.addPlayer, this.onAddPlayer.bind(this));
    SocketBridge.socket.on(appActions.updatePlayer, this.onUpdatePlayer.bind(this));
    SocketBridge.socket.on(appActions.removePlayer, this.onRemovePlayer.bind(this));
    window.addEventListener('resize', this.onResize.bind(this), false);
  }

  componentDidMount() {
    // is this fine...
    this.props.appState.players.forEach(this.onAddPlayer, this);
    this.arenaRef.current.addEventListener('transitionend', this.onArenaTransitionEnd.bind(this), false);
    // double call on purpose
    this.onResize();
    setTimeout(this.onResize.bind(this), 500);
    //this.maybeExecuteBattle();
  }

  componentDidUpdate() {
    this.maybeExecuteBattle();
    this.setSoundVolumes(this.props.appState.soundVolumes);
  }

  async maybeExecuteBattle() {
    if (this.runningBattle) {
      return;
    }
    if (!this.props.appState.currentBattle) {
      return;
    }
    const player1UserId = this.props.appState.currentBattle[0];
    const player2UserId = this.props.appState.currentBattle[1];
    const player1Ref = this.userIdRefMap[player1UserId];
    const player2Ref = this.userIdRefMap[player2UserId];
    if (!player1Ref || !player1Ref.current) {
      console.log(`maybeExecuteBattle(): ${player1UserId} does not have a ref (might be just initial run)`);
      return;
    }
    if (!player2Ref || !player2Ref.current) {
      console.log(`maybeExecuteBattle(): ${player2UserId} does not have a ref (might be just initial run)`);
      return;
    }

    this.runningBattle = true;
    console.log('executing battle');
    const player1 = this.props.appState.players.find(p => p.userId === player1UserId);
    const player2 = this.props.appState.players.find(p => p.userId === player2UserId);
    const battleRunner = new BattleRunner({
      players: [
        {
          ...player1,
          playerChar: player1Ref.current
        },
        {
          ...player2,
          playerChar: player2Ref.current
        }
      ],
      arena: this.arena,
      setShowArena: this.setShowArena.bind(this),
      startHitMarker: this.startHitMarker,
      musicVolume: this.props.appState.soundVolumes.music
    });
    await battleRunner.run();
    SocketBridge.socket.emit(appActions.finishBattle, battleRunner.winner.userId, battleRunner.loser.userId);
    this.runningBattle = false;
  }

  setSoundVolumes(soundVolumes) {
    const changedKeys = [];
    for (const [key, volume] of Object.entries(soundVolumes)) {
      if (!has(this.prevSoundVolumes, key) || this.prevSoundVolumes[key] !== volume) {
        changedKeys.push(key);
      }
    }
    for (const key of changedKeys) {
      switch (key) {
        case 'globalVolume':
          Howler.volume(soundVolumes[key]);
          break;
        case 'music':
          changeVolume(sounds.music, soundVolumes[key]);
          break;
        case 'arena':
          changeVolume(sounds.arena, soundVolumes[key]);
          break;
        case 'win':
          changeVolume(sounds.win, soundVolumes[key]);
          break;
        case 'spawn':
          changeVolume(sounds.jump, soundVolumes[key]);
          changeVolume(sounds.magicSpawn, soundVolumes[key]);
          break;
        case 'attacks':
          changeVolume(sounds.finalHit, soundVolumes[key]);
          changeVolume(sounds.gunShot, soundVolumes[key]);
          changeVolume(sounds.punch, soundVolumes[key]);
          changeVolume(sounds.sword, soundVolumes[key]);
          changeVolume(sounds.thunder, soundVolumes[key]);
          changeVolume(sounds.magic, soundVolumes[key]);
          changeVolume(sounds.miss, soundVolumes[key]);
          break;
        default:
          console.error(`WidgetPage.setSoundVolumes: "${key}" is not a valid sound volume key`);
      }
    }
    this.prevSoundVolumes = {...soundVolumes};
  }

  onResize() {
    const style = window.getComputedStyle(this.pageRef.current);
    const width = parseInt(style.width, 10);
    const height = parseInt(style.height, 10);
    this.setState({
      randSegStart: new Vec2(20, height),
      randSegEnd: new Vec2(width - 20, height)
    });
    this.arenaRect.setCenter(
      Math.floor(width / 2),
      Math.floor(height - this.arenaRect.getHeight() / 2)
    );
    this.arena.leftStairBottom.set(
      Math.floor(this.arenaRect.left + 96 * arenaScale),
      Math.floor(this.arenaRect.bottom)
    );
    this.arena.leftStairTop.set(
      Math.floor(this.arenaRect.left + 16 * arenaScale),
      Math.floor(this.arenaRect.top + 38 * arenaScale)
    );
    this.arena.rightStairBottom.set(
      Math.floor(this.arenaRect.right - 96 * arenaScale),
      Math.floor(this.arenaRect.bottom)
    );
    this.arena.rightStairTop.set(
      Math.floor(this.arenaRect.right - 16 * arenaScale),
      Math.floor(this.arenaRect.top + 38 * arenaScale)
    );
    this.arena.leftPoint.set(
      Math.floor(this.arenaRect.left + 120 * arenaScale),
      Math.floor(this.arenaRect.top + 38 * arenaScale)
    );
    this.arena.rightPoint.set(
      Math.floor(this.arenaRect.right - 120 * arenaScale),
      Math.floor(this.arenaRect.top + 38 * arenaScale)
    );
    this.arena.midPoint.set(
      Math.floor((this.arena.leftPoint.x + this.arena.rightPoint.x) / 2),
      Math.floor((this.arena.leftPoint.y + this.arena.rightPoint.y) / 2)
    );
  }

  onArenaTransitionEnd() {
    this.events.emit('arenaTransitionEnd');
  }

  waitForArenaTransitionEnd() {
    return new Promise(resolve => this.events.once('arenaTransitionEnd', resolve));
  }

  onAddPlayer(player) {
    // assuming no duplicates will be sent
    this.userIdRefMap[player.userId] = new React.createRef();
    this.setState((state, props) => {
      const character = allCharacters[createCharacter(player.characterType, player.characterGender)];
      const playerChar = {
        ...player,
        character: character
      };
      return {
        playerChars: [...state.playerChars, playerChar]
      };
    })
  }

  onUpdatePlayer(player) {
    this.setState((state, props) => {
      const character = allCharacters[createCharacter(player.characterType, player.characterGender)];
      return {
        playerChars: state.playerChars.map(pc => pc.userId === player.userId ? {
          ...pc,
          ...player,
          character
        } : pc)
      };
    });
  }

  onRemovePlayer(player) {
    // TODO animation for exit instead of immediate removal
    this.setState((state, props) => {
      const index = state.playerChars.findIndex(playerChar => playerChar.userId === player.userId);
      if (index === -1) {
        return {}; // no update
      }
      const playerChars = Array.from(state.playerChars);
      playerChars.splice(index, 1);
      delete this.userIdRefMap[player.userId]; // is this ok to do this here?
      return { playerChars };
    });
  }

  startFX(fx, position, flipped = false, autoplay = true) {
    const fxInstance = {
      id: fxIdPool++,
      fx,
      position,
      flipped,
      autoplay
    };
    this.setState((state, props) => {
      const fxInstances = [...state.fxInstances, fxInstance];
      return { fxInstances };
    });
    return fxInstance;
  }

  onFXEnd(fxId) {
    const index = this.state.fxInstances.findIndex(fxi => fxi.id === fxId);
    if (index === -1) {
      console.log(`Tried to remove an fxInstance that is not in state (id: ${fxId})`);
      return;
    }
    const fxInstances = Array.from(this.state.fxInstances);
    fxInstances.splice(index, 1);
    this.setState({
      fxInstances
    });
  }

  startHitMarker(position, text) {
    const hitMarker = {
      id: hitMarkerIdPool++,
      position,
      text
    };
    this.setState((state, props) => {
      const hitMarkers = [...state.hitMarkers, hitMarker];
      return { hitMarkers };
    });
    return hitMarker;
  }

  onHitMarkerEnd(hitMarkerId) {
    // wrapping up this in function state in case multiple hitmarkers ended at the same time
    this.setState((state, props) => {
      const index = state.hitMarkers.findIndex(hitMarker => hitMarker.id === hitMarkerId);
      if (index === -1) {
        console.log(`Tried to remove a hitmarker that is not in state (id: ${hitMarkerId})`);
        return;
      }
      const hitMarkers = Array.from(state.hitMarkers);
      hitMarkers.splice(index, 1);
      return { hitMarkers };
    });
  }

  setShowArena(show) {
    if (this.state.showArena === show) {
      return Promise.resolve();
    }
    this.setState({
      showArena: show
    });
    return this.waitForArenaTransitionEnd();
  }

  render() {
    const isInBattle = (userId) => {
      return this.props.appState.currentBattle ? this.props.appState.currentBattle.includes(userId) : false;
    };
    return (
      <div className="widget-page" ref={this.pageRef}>
        <div ref={this.arenaRef} className="arena" style={{
          backgroundImage: `url('${arenaImg}')`,
          top: this.state.showArena ? '100%' : '150%'
        }}></div>
        <div className="widget-playerchar-layer widget-layer">
          { this.state.playerChars.map((playerChar, i) => (
            <PlayerChar 
              key={playerChar.userId}
              userId={playerChar.userId}
              userDisplayName={playerChar.userDisplayName}
              index={i + 1}
              ref={this.userIdRefMap[playerChar.userId]}
              inBattle={isInBattle(playerChar.userId)}
              character={resolveCharacter(playerChar.character)}
              weapon={playerChar.weapon}
              startFX={this.startFX}
              randSegStart={this.state.randSegStart}
              randSegEnd={this.state.randSegEnd}
            />
          )) }
        </div>
        <div className="widget-fx-layer widget-layer">
          { this.state.fxInstances.map(fxInstance => (
            <FXAnim
              key={fxInstance.id}
              id={fxInstance.id}
              fx={fxInstance.fx}
              position={fxInstance.position}
              flipped={fxInstance.flipped}
              autoplay={fxInstance.autoplay}
              onEnd={this.onFXEnd}
            />
          ))}
        </div>
        <div className="widget-hitmarker-layer widget-layer">
          { this.state.hitMarkers.map(hitMarker => (
            <HitMarker
              key={hitMarker.id}
              id={hitMarker.id}
              position={hitMarker.position}
              text={hitMarker.text}
              onEnd={this.onHitMarkerEnd}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default withApp(WidgetPage);
