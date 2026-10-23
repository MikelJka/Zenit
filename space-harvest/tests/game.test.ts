import { describe, expect, it } from 'vitest';
import { advance, load, newGame, save } from '../src/sim/core/game';
import { MAX_OFFLINE_SECONDS, offlineSeconds } from '../src/sim/core/clock';
import type { GameModule } from '../src/sim/core/module';

interface S { ticks: number }
const counter: GameModule<S> = {
  id: 'counter',
  version: 1,
  init: () => ({ ticks: 0 }),
  step: (s, _dt, c) => { s.ticks++; c.credits += 1; },
  serialize: (s) => s,
  load: (d) => ({ ticks: (d as Partial<S>)?.ticks ?? 0 }),
  purchases: () => [],
};
const mods = [counter as GameModule];

describe('game', () => {
  it('avanza en pasos fijos', () => {
    const g = newGame(mods, 1, 0);
    advance(g, 10);
    expect(g.common.credits).toBe(20);
  });
  it('guardar y cargar conserva el estado', () => {
    const g = newGame(mods, 1, 0);
    advance(g, 5);
    const l = load(mods, JSON.parse(JSON.stringify(save(g, 1000))), 1, 2000);
    expect(l.common.credits).toBe(g.common.credits);
    expect((l.states.counter as S).ticks).toBe(10);
  });
  it('un módulo nuevo en una partida antigua usa su valor por defecto', () => {
    const l = load(mods, { version: 1, savedAt: 0, rng: 1, credits: 5, modules: {} }, 1, 0);
    expect((l.states.counter as S).ticks).toBe(0);
    expect(l.common.credits).toBe(5);
  });
  it('las ganancias offline tienen tope', () => {
    expect(offlineSeconds(0, 100 * 3600 * 1000)).toBe(MAX_OFFLINE_SECONDS);
    expect(offlineSeconds(5000, 1000)).toBe(0);
  });
});
