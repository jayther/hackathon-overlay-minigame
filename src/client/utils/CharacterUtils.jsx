
import R from '../Resources';

function resolveAnim(anim) {
  if (anim.resolved) {
    return;
  }
  for (let i = 0; i < anim.sprites.length; i += 1) {
    if (!R.frames[anim.sprites[i]]) {
      console.error(`resolveAnim: frame "${anim.sprites[i]}" does not exist`);
      continue;
    }
    anim.sprites[i] = R.frames[anim.sprites[i]];
    if (anim.fx) {
      resolveAnim(anim.fx);
    }
  }
  anim.resolved = true;
}

function resolveCharacter(character) {
  if (character.resolved) {
    return character;
  }
  Object.values(character).forEach(animOrAnims => {
    if (typeof animOrAnims === 'string') {
      return;
    } else if (Array.isArray(animOrAnims)) {
      animOrAnims.forEach(resolveAnim);
    } else {
      resolveAnim(animOrAnims);
    }
  });
  character.resolved = true;
  return character;
}

export {
  resolveAnim,
  resolveCharacter
};
