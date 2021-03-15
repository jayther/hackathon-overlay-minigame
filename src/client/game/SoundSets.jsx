import * as sounds from './SoundAssets';
import R from '../Resources';

export function resolveSet(set) {
  if (set.resolved) {
    return set;
  }
  for (let i = 0; i < set.length; i += 1) {
    const src = set[i];
    const howl = R.sounds[src];
    if (!howl) {
      throw new Error(`Missing howl for path "${src}"`);
    }
    set[i] = howl;
  }
  set.resolved = true;
  return set;
}

export function resolveAllSets(all) {
  if (all.resolved) {
    return all;
  }
  for (const set of Object.values(all)) {
    if (Array.isArray(set)) {
      resolveSet(set);
    }
  }

  all.resolved = true;
  return all;
}

export default {
  music: [sounds.bossCastleHassle],
  finalHit: [sounds.explosion10],
  gunShot: [
    sounds.gunShot1,
    sounds.gunShot2,
    sounds.gunShot3,
    sounds.gunShot4,
    sounds.gunShot5
  ],
  punch: [
    sounds.hitPunch1,
    sounds.hitPunch2,
    sounds.hitPunch3,
    sounds.hitPunch4,
    sounds.hitPunch5
  ],
  sword: [
    sounds.hitSword1,
    sounds.hitSword2,
    sounds.hitSword3,
    sounds.hitSword4,
    sounds.hitSword5
  ],
  jump: [sounds.jump3],
  magic: [
    sounds.magicSpell1,
    sounds.magicSpell2,
    sounds.magicSpell3,
    sounds.magicSpell5
  ],
  magicSpawn: [sounds.magicSpell4],
  magicDead: [sounds.explosion5],
  win: [sounds.positive8],
  miss: [sounds.swoosh4],
  arena: [sounds.vehicle1EngineNormal]
};
