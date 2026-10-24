import { describe, expect, it } from 'vitest';
import { Game } from '../src/sim/core/game';
import type { GameModule } from '../src/sim/core/module';
import { Rng } from '../src/sim/core/rng';

const counter: GameModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (state, mod) => {
    mod.n += 1;
    state.resources.credits += 2;
  },
  serialize: (mod) => mod,
  load: (_s, data) => (data as { n: number } | undefined) ?? { n: 0 },
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    expect([a.next(), a.next(), a.int(1, 6)]).toEqual([b.next(), b.next(), b.int(1, 6)]);
  });
  it('int respeta el rango', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) expect(r.int(3, 5)).toBeGreaterThanOrEqual(3);
  });
});

describe('Game', () => {
  it('avanza en pasos de 1 s y conserva el resto', () => {
    const g = new Game([counter], 1);
    g.advance(2.5);
    g.advance(0.5);
    expect(g.state.time).toBe(3);
    expect(g.state.resources.credits).toBe(6);
  });
  it('guarda y carga sin perder estado', () => {
    const g = new Game([counter], 1);
    g.advance(10);
    const g2 = Game.load([counter], g.serialize());
    expect(g2.state.modules.counter).toEqual({ n: 10 });
    expect(g2.state.resources.credits).toBe(20);
    expect(g2.state.rng.state).toBe(g.state.rng.state);
  });
  it('un módulo nuevo carga con valores por defecto en una partida antigua', () => {
    const g = new Game([], 1);
    g.advance(5);
    const g2 = Game.load([counter], g.serialize());
    expect(g2.state.modules.counter).toEqual({ n: 0 });
    expect(g2.state.time).toBe(5);
  });
});
