import { describe, expect, it } from 'vitest';
import { newGame, tap } from '../src/sim/game';
import { pack, unpack } from '../src/sim/offline';
import { fromCode, toCode } from '../src/sim/transfer';

describe('código de partida', () => {
  it('lleva la partida de un dispositivo a otro', () => {
    const a = newGame();
    for (let i = 0; i < 50; i++) tap(a);
    const code = toCode(pack(a, 1000));
    const restored = unpack(fromCode(code), 1000).state;
    expect(restored.scrap).toBe(a.scrap);
  });
  it('rechaza textos que no son un código', () => {
    expect(fromCode('hola')).toBeNull();
    expect(fromCode('CHAT1:%%%')).toBeNull();
    expect(fromCode('CHAT1:' + btoa('[]'))).toBeNull();
    expect(fromCode('')).toBeNull();
  });
  it('tolera espacios alrededor', () => {
    const code = toCode(pack(newGame(), 5));
    expect(fromCode(`  ${code}\n`)).not.toBeNull();
  });
});
