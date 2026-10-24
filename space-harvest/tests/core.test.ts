import { describe, expect, it } from 'vitest';
import { Game } from '../src/sim/core/game';
import type { SimModule } from '../src/sim/core/module';
import { Rng } from '../src/sim/core/rng';

const counter: SimModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, ctx) => {
    s.n += 1;
    ctx.resources.credits = (ctx.resources.credits ?? 0) + 1;
  },
  serialize: (s) => ({ n: s.n }),
  load: (d) => ({ n: (d as { n: number }).n }),
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    expect([a.next(), a.next(), a.int(1, 6)]).toEqual([b.next(), b.next(), b.int(1, 6)]);
  });
  it('recupera su estado', () => {
    const a = new Rng(7);
    a.next();
    const b = new Rng(0);
    b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
});

describe('Game', () => {
  it('avanza por ticks completos', () => {
    const g = new Game([counter], 1);
    g.step(1050);
    expect(g.stateOf<{ n: number }>('counter').n).toBe(10);
    expect(g.ctx.resources.credits).toBe(10);
  });
  it('guarda y carga sin perder estado', () => {
    const g = new Game([counter], 1);
    g.step(500);
    const g2 = new Game([counter], 1, JSON.parse(JSON.stringify(g.serialize())));
    expect(g2.stateOf<{ n: number }>('counter').n).toBe(5);
    expect(g2.ctx.resources.credits).toBe(5);
    expect(g2.clock.now).toBe(500);
  });
  it('un módulo nuevo no rompe una partida antigua', () => {
    const old = new Game([], 1);
    old.step(300);
    const g = new Game([counter], 1, old.serialize());
    expect(g.stateOf<{ n: number }>('counter').n).toBe(0);
  });
  it('las ganancias sin conexión respetan el tope', () => {
    const g = new Game([counter], 1);
    g.offline(10_000_000, 1000);
    expect(g.stateOf<{ n: number }>('counter').n).toBe(10);
  });
});
