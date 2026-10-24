// Z#7: de noche salían luces de llama sin saber de dónde: eran estufas con leña guardada pero apagadas.
import { describe, expect, it } from 'vitest';
import { flatWorld } from './helpers';
import { isBurning, updateBonfires } from '../src/sim/bonfire';

type W = ReturnType<typeof flatWorld>;

function buildNow(w: W, x: number, y: number, id: string) {
  w.structures.place(x, y, id);
  const s = w.structures.at(x, y)!;
  for (const [r, n] of Object.entries(s.def.cost)) w.structures.deliver(s, r as never, n as number);
  w.completeStructure(s);
  return s;
}

describe('luces de llama (Z#7)', () => {
  it('una estufa con leña pero sin frío está apagada y no arde', () => {
    const w = flatWorld(1);
    const s = buildNow(w, 10, 10, 'estufa');
    s.delivered.madera = 6;
    updateBonfires(w.structures, 1, false);
    expect(s.fuel).toBe(6);
    expect(isBurning(s)).toBe(false);
  });

  it('con frío la estufa con leña arde; sin leña, no', () => {
    const w = flatWorld(1);
    const s = buildNow(w, 10, 10, 'estufa');
    updateBonfires(w.structures, 1, true);
    expect(isBurning(s)).toBe(false);
    s.delivered.madera = 6;
    updateBonfires(w.structures, 1, true);
    expect(isBurning(s)).toBe(true);
  });

  it('la hoguera con leña arde y sin leña no', () => {
    const w = flatWorld(1);
    const s = buildNow(w, 10, 10, 'hoguera');
    updateBonfires(w.structures, 1, false);
    expect(isBurning(s)).toBe(false);
    s.delivered.madera = 3;
    updateBonfires(w.structures, 1, false);
    expect(isBurning(s)).toBe(true);
  });

  it('un generador de leña no cuenta como llama', () => {
    const w = flatWorld(1);
    const s = buildNow(w, 10, 10, 'generador_lena');
    s.fuel = 5;
    s.powered = true;
    expect(isBurning(s)).toBe(false);
  });
});
