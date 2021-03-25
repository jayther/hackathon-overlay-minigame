import {
  shuffleNew,
  pickArgs,
  betweenInt,
  pick,
  weightedPick
} from '../../shared/RandUtils';
import { sign } from '../../shared/math/JMath';
import sounds from './SoundSets';
import { waitForMS } from '../../shared/PromiseUtils';

import {
  attackDistance,
  hitDistance,
  hitDelay,
  missDelay,
  hitMarkerOffset,
  missDistance,
  normalDmgMin,
  normalDmgMax,
  critDmgMin,
  critDmgMax,
  musicFadeDuration
} from './GameConfig';

const defaultOptions = {
  players: null,
  arena: null,
  setShowArena: null,
  musicVolume: 1,
  battleSettings: null
};

const attackTypes = {
  normal: 'normal',
  normalCrit: 'normalCrit',
  weapon: 'weapon',
  weaponCrit: 'weaponCrit',
  miss: 'miss',
  final: 'final',
  finalCrit: 'finalCrit'
};

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
    if (typeof opts.startHitMarker !== 'function') {
      throw new Error('BattleRunner(): startHitMarker is a required property and must be a function');
    }
    if (!opts.battleSettings) {
      throw new Error('BattleRunner(): battleSettings property required');
    }
    const shuffled = shuffleNew(options.players);
    this.leftPlayer = shuffled[0];
    this.rightPlayer = shuffled[1];
    this.winner = null;
    this.loser = null;
    this.leftTurn = pickArgs(true, false);

    this.arena = opts.arena;
    this.setShowArena = opts.setShowArena;
    this.startHitMarker = opts.startHitMarker;
    this.battleSettings = opts.battleSettings;

    this.music = pick(sounds.music);
    this.music.loop(true);
    this.music.volume(opts.musicVolume);

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

  generateRandomAttack(weapon = false) {
    const index = weightedPick(
      this.battleSettings.chanceNormalWeight, // 0
      this.battleSettings.chanceCritWeight, // 1
      this.battleSettings.chanceMissWeight // 2
    );
    switch (index) {
      case 0:
        return weapon ? attackTypes.weapon : attackTypes.normal;
      case 1:
        return weapon ? attackTypes.weaponCrit : attackTypes.normalCrit;
      case 2:
        return attackTypes.miss;
      default:
        throw new Error(
          `BattleRunner.generateRandomAttack: `+
          `Unexpected weight index (${index})`
        );
    }
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
    const arenaSound = pick(sounds.arena);
    arenaSound.loop(true);
    arenaSound.play();
    await this.setShowArena(true);
    arenaSound.stop();
  }

  async setupPlayers() {
    this.music.seek(0);
    this.music.play();
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

      let damage, hitMarkerText;
      let attackType = this.generateRandomAttack(attacker.playerChar.weapon);
      switch (attackType) {
        case attackTypes.normal:
          damage = betweenInt(normalDmgMin, normalDmgMax);
          hitMarkerText = `${damage}`;
          break;
        case attackTypes.normalCrit:
          damage = betweenInt(critDmgMin, critDmgMax);
          hitMarkerText = `${damage}!!`;
          break;
        case attackTypes.weapon:
          damage = betweenInt(normalDmgMin, normalDmgMax) + this.battleSettings.weaponBoost;
          hitMarkerText = `${damage}`;
          break;
        case attackTypes.weaponCrit:
          damage = betweenInt(critDmgMin, critDmgMax) + this.battleSettings.weaponBoost;
          hitMarkerText = `${damage}!!`;
          break;
        case attackTypes.miss:
          damage = 0;
          hitMarkerText = 'Miss';
          break;
        default:
          throw new Error(`BattleRunner.battling: Unexpected attack type at RNG: ${attackType}`);
      }

      const defenderFutureHp = defender.playerChar.hp - damage;
      if (attackType !== attackTypes.miss && defenderFutureHp <= 0) {
        switch (attackType) {
          case attackTypes.normal:
          case attackTypes.weapon:
            attackType = attackTypes.final;
            break;
          case attackTypes.normalCrit:
          case attackTypes.weaponCrit:
            attackType = attackTypes.finalCrit;
            break;
        }
      }

      const attackPos = defender.playerChar.position.copy();
      const deltaSign = sign(attacker.playerChar.position.x - defender.playerChar.position.x);
      const attackPosDelta = deltaSign * attackDistance;
      attackPos.x += attackPosDelta;
      attacker.playerChar.moveTo(attackPos);
      await attacker.playerChar.waitForIdle();
      let hitMarkerDelay;
      if (damage === 0) { // miss
        attacker.playerChar.delay(missDelay).attackMiss().moveTo(attackPoint).face(defendPoint);
        const missPos = defender.playerChar.position.copy();
        missPos.x += -deltaSign * missDistance;
        defender.playerChar.moveTo(missPos);
        hitMarkerDelay = missDelay + hitDelay;
      } else { // hit
        let dashTo;
        switch (attackType) {
          case attackTypes.normal:
            attacker.playerChar.attack();
            break;
          case attackTypes.normalCrit:
            dashTo = defender.playerChar.position.copy();
            dashTo.x -= attackPosDelta; // behind defender
            attacker.playerChar.attackCritTo(dashTo);
            attacker.playerChar.dashTo(attackPos);
            break;
          case attackTypes.weapon:
            attacker.playerChar.attackWeapon();
            break;
          case attackTypes.weaponCrit:
            dashTo = defender.playerChar.position.copy();
            dashTo.x -= attackPosDelta; // behind defender
            attacker.playerChar.attackWeaponCritTo(dashTo);
            attacker.playerChar.dashTo(attackPos);
            break;
          case attackTypes.final:
          case attackTypes.finalCrit:
            attacker.playerChar.attackFinal();
            break;
          default:
            throw new Error(`BattleRunner.battling: Unexpected attack type at animation: ${attackType}`)
        }
        attacker.playerChar.moveTo(attackPoint).face(defendPoint);
        defender.playerChar.delay(hitDelay).hitToDelta(-deltaSign * hitDistance, damage);
        hitMarkerDelay = hitDelay;
      }
      const hitMarkerPos = defender.playerChar.position.copy();
      hitMarkerPos.y += hitMarkerOffset;
      setTimeout(() => {
        this.startHitMarker(hitMarkerPos, hitMarkerText);
      }, hitMarkerDelay);
      const waitForAll = [
        attacker.playerChar.waitForIdle()
      ];
      if (defenderFutureHp <= 0) { // ded
        defender.playerChar.die();
      } else { // alive still, move back
        defender.playerChar.moveTo(defendPoint);
        waitForAll.push(defender.playerChar.waitForIdle());
      }
      await Promise.all(waitForAll);
      if (defenderFutureHp > 0 && this.battleSettings.delayBetweenAttacks > 0) {
        await waitForMS(this.battleSettings.delayBetweenAttacks);
      }
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
    this.music.fade(this.music.volume(), 0, musicFadeDuration); // 1 to 0 in 2 seconds
    this.music.once('fade', () => {
      this.music.stop();
    });
    this.winner.playerChar.moveTo(this.arena.midPoint);
    await this.winner.playerChar.waitForIdle();
    const winSound = pick(sounds.win);
    winSound.seek(0);
    winSound.play();
    this.winner.playerChar.pose(-1, 500).pose(1, 500).pose(-1, 500);
    
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
    const arenaSound = pick(sounds.arena);
    arenaSound.loop(true);
    arenaSound.play();
    await this.setShowArena(false);
    arenaSound.stop();
  }
  async end() {
    // do nothing
  }
}

export default BattleRunner;
