import React from 'react';
import { withApp } from './utils/AppContext';
import PlayerChar from './game/PlayerChar';
import FXAnim from './game/FXAnim';
import { resolveCharacter } from './utils/CharacterUtils';
import { createCharacter } from '../shared/CharacterParts';
import SocketBridge from './utils/SocketBridge';
import appActions from '../shared/AppActions';
import Vec2 from '../shared/math/Vec2';
import * as allCharacters from './game/characters/All_Characters';
import arenaImg from './assets/arena.png';

let fxIdPool = 0;

class WidgetPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerChars: [],
      fxInstances: [],
      randSegStart: new Vec2(200, 200),
      randSegEnd: new Vec2(400, 200),
      showArena: false
    };

    this.pageRef = React.createRef();
    this.userIdRefMap = {};
    this.arenaLeftStairBottom = new Vec2();
    this.arenaLeftStairTop = new Vec2();
    this.arenaRightStairBottom = new Vec2();
    this.arenaRightStairTop = new Vec2();
    this.arenaLeftPoint = new Vec2();
    this.arenaRightPoint = new Vec2();

    this.runningBattle = false;

    this.startFX = this.startFX.bind(this);
    this.onFXEnd = this.onFXEnd.bind(this);

    SocketBridge.socket.on(appActions.addPlayer, this.onAddPlayer.bind(this));
    SocketBridge.socket.on(appActions.updatePlayer, this.onUpdatePlayer.bind(this));
    SocketBridge.socket.on(appActions.removePlayer, this.onRemovePlayer.bind(this));
    window.addEventListener('resize', this.onResize.bind(this), false);
  }

  componentDidMount() {
    // is this fine...
    this.props.appState.players.forEach(this.onAddPlayer, this);
    // double call on purpose
    this.onResize();
    setTimeout(this.onResize.bind(this), 500);
    this.maybeExecuteBattle();
  }

  componentDidUpdate() {
    this.maybeExecuteBattle();
  }

  maybeExecuteBattle() {
    if (this.runningBattle) {
      return;
    }
    if (!this.props.appState.currentBattle) {
      return;
    }
    this.runningBattle = true;
    console.log('executing battle');
    this.setState({
      lastWinner: null
    });
    setTimeout(() => {
      let winnerUserId, loserUserId;
      if (Math.random() < 0.5) {
        winnerUserId = this.props.appState.currentBattle[0];
        loserUserId = this.props.appState.currentBattle[1];
      } else {
        winnerUserId = this.props.appState.currentBattle[1];
        loserUserId = this.props.appState.currentBattle[0];
      }
      SocketBridge.socket.emit(appActions.finishBattle, winnerUserId, loserUserId);
      this.runningBattle = false;
    }, 3000);
  }

  onResize() {
    const style = window.getComputedStyle(this.pageRef.current);
    const width = parseInt(style.width, 10);
    const height = parseInt(style.height, 10);
    this.setState({
      randSegStart: new Vec2(20, height),
      randSegEnd: new Vec2(width - 20, height)
    });
    this.arenaLeftStairBottom.set(
      Math.floor(width / 2 - 66),
      height
    );
    this.arenaLeftStairTop.set(
      Math.floor(width / 2 - 152),
      height - 90
    );
    this.arenaRightStairBottom.set(
      Math.floor(width / 2 + 66),
      height
    );
    this.arenaRightStairTop.set(
      Math.floor(width / 2 + 152),
      height - 90
    );
    this.arenaLeftPoint.set(
      Math.floor(width / 2 - 136),
      height - 90
    );
    this.arenaRightPoint.set(
      Math.floor(width / 2 - 136),
      height - 90
    );
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

  movePlayerTo(userId, position) {

  }

  render() {
    return (
      <div className="widget-page" ref={this.pageRef} onClick={() => {
        this.setState({ showArena: !this.state.showArena});
      }}>
        <div className="arena" style={{
          backgroundImage: `url('${arenaImg}')`,
          top: this.state.showArena ? '100%' : '150%'
        }}></div>
        <div className="widget-playerchar-layer widget-layer">
          { this.state.playerChars.map(playerChar => (
            <PlayerChar 
              key={playerChar.userId}
              userId={playerChar.userId}
              ref={this.userIdRefMap[playerChar.userId]}
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
      </div>
    )
  }
}

export default withApp(WidgetPage);
