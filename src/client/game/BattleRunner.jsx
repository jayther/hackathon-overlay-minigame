import { shuffleNew, pickArgs, betweenInt } from '../../shared/RandUtils';
import { sign } from '../../shared/math/JMath';

const defaultOptions = {
  players: null,
  arena: null,
  setShowArena: null
};

const attackDistance = 40;
const hitDistance = 60;
const hitDelay = 100; // ms

class BattleRunner {
  constructor(options) {
    const opts = {
      ...defaultOptions,
      ...options
    };
    if (!opts.players) {
      throw new Error('BattleRunner(): players property required');
    }
    if (!Array.isArray(opts.players)) {
      throw new Error('BattleRunner(): players property must be an array');
    }
    if (opts.players.length < 2) {
      throw new Error('BattleRunner(): requires at least 2 players');
    }
    if (!opts.arena) {
      throw new Error('BattleRunner(): arena property required');
    }
    if (typeof opts.setShowArena !== 'function') {
      throw new Error('BattleRunner(): setShowArena is a required property and must be a function');
    }
    console.log(opts.players);
    const shuffled = shuffleNew(options.players);
    this.leftPlayer = shuffled[0];
    this.rightPlayer = shuffled[1];
    this.winner = null;
    this.loser = null;
    this.leftTurn = pickArgs(true, false);

    this.arena = opts.arena;
    this.setShowArena = opts.setShowArena;

    this.state = 0;
    this.stateMap = [
      this.idle.bind(this),
      this.showArena.bind(this),
      this.setupPlayers.bind(this),
      this.battling.bind(this),
      this.leavingArena.bind(this),
      this.hidingArena.bind(this),
      this.end.bind(this)
    ];
  }

  async run() {
    for (let i = 0; i < this.stateMap.length; i += 1) {
      this.state = i;
      await this.stateMap[i]();
    }
  }

  async idle() {
    // do nothing
  }

  async showArena() {
    await this.setShowArena(true);
  }

  async setupPlayers() {
    this.leftPlayer.playerChar.moveTo(this.arena.leftStairBottom)
      .moveTo(this.arena.leftStairTop)
      .moveTo(this.arena.leftPoint);
    this.rightPlayer.playerChar.moveTo(this.arena.rightStairBottom)
      .moveTo(this.arena.rightStairTop)
      .moveTo(this.arena.rightPoint);
    this.leftPlayer.playerChar.setShowHp(true);
    this.rightPlayer.playerChar.setShowHp(true);
    this.leftPlayer.playerChar.setSide('left');
    this.rightPlayer.playerChar.setSide('right');

    await Promise.all([
      this.leftPlayer.playerChar.waitForIdle(),
      this.rightPlayer.playerChar.waitForIdle()
    ]);
  }

  async battling() {
    while (!this.winner) {
      let attacker, defender, attackPoint, defendPoint;
      if (this.leftTurn) {
        attacker = this.leftPlayer;
        attackPoint = this.arena.leftPoint;
        defender = this.rightPlayer;
        defendPoint = this.arena.rightPoint;
      } else {
        attacker = this.rightPlayer;
        attackPoint = this.arena.rightPoint;
        defender = this.leftPlayer;
        defendPoint = this.arena.leftPoint;
      }

      // normal attack
      // TODO use dice rolls
      // TODO add miss chance
      // TODO crits (dash through?)
      // TODO weapon damages
      // 
      const damage = betweenInt(150, 250);
      const attackPos = defender.playerChar.position.copy();
      const deltaSign = sign(attacker.playerChar.position.x - defender.playerChar.position.x);
      const attackPosDelta = deltaSign * attackDistance;
      attackPos.x += attackPosDelta;
      attacker.playerChar.moveTo(attackPos);
      await attacker.playerChar.waitForIdle();
      attacker.playerChar.attack().moveTo(attackPoint).face(defendPoint);
      defender.playerChar.delay(hitDelay).hitToDelta(-deltaSign * hitDistance, damage);
      const waitForAll = [
        attacker.playerChar.waitForIdle()
      ];
      const defenderFutureHp = defender.playerChar.hp - damage;
      if (defenderFutureHp <= 0) {
        defender.playerChar.die();
      } else {
        defender.playerChar.moveTo(defendPoint);
        waitForAll.push(defender.playerChar.waitForIdle());
      }
      await Promise.all(waitForAll);
      console.log(this.leftPlayer.playerChar.hp, this.rightPlayer.playerChar.hp);
      if (this.leftPlayer.playerChar.hp <= 0) {
        this.loser = this.leftPlayer;
        this.winner = this.rightPlayer;
      } else if (this.rightPlayer.playerChar.hp <= 0) {
        this.loser = this.rightPlayer;
        this.winner = this.leftPlayer;
      }
      this.leftTurn = !this.leftTurn;
    }
  }
  async leavingArena() {
    if (this.winner === this.leftPlayer) {
      this.winner.playerChar.moveTo(this.arena.leftStairTop)
        .moveTo(this.arena.leftStairBottom);
    } else {
      this.winner.playerChar.moveTo(this.arena.rightStairTop)
        .moveTo(this.arena.rightStairBottom);
    }
    this.winner.playerChar.setSide(null);
    this.winner.playerChar.resetHp();
    this.winner.playerChar.setShowHp(false);
    await this.winner.playerChar.waitForIdle();
  }
  async hidingArena() {
    await this.setShowArena(false);
  }
  async end() {
    // do nothing
  }
}

export default BattleRunner;
