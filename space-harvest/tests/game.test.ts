import { describe, expect, it } from 'vitest';
import { advance, load, newGame, save } from '../src/sim/core/game';
import type { SimModule } from '../src/sim/core/types';

interface Own { n: number }
const counter: SimModule<Own> = {
  id: 'counter',
  version: 2,
  init: () => ({ n: 0 }),
  step: (s, own, dt) => { own.n += dt; s.resources.credits += dt; },
  serialize: (own) => own,
  load: (data) => ({ n: (data as Partial<Own>).n ?? 0 }),
};
const mods = [counter as SimModule];

describe('game', () => {
  it('advance es determinista y acumula el tiempo', () => {
    const a = newGame(mods, 1);
    const b = newGame(mods, 1);
    advance(a, mods, 10);
    advance(b, mods, 4);
    advance(b, mods, 6);
    expect(a.time).toBeCloseTo(10);
    expect(a.resources.credits).toBeCloseTo(b.resources.credits);
  });
  it('guardar y cargar conserva el estado', () => {
    const a = newGame(mods, 1);
    advance(a, mods, 5);
    const b = load(save(a, mods), mods);
    expect(b.time).toBeCloseTo(5);
    expect(b.resources.credits).toBeCloseTo(5);
    expect((b.modules['counter'] as Own).n).toBeCloseTo(5);
  });
  it('una partida antigua sin el módulo usa los valores por defecto', () => {
    const b = load(JSON.stringify({ version: 1, time: 3 }), mods);
    expect(b.time).toBe(3);
    expect((b.modules['counter'] as Own).n).toBe(0);
  });
});
