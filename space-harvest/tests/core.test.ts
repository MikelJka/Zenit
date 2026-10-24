import { describe, expect, it } from 'vitest';
import { Clock, STEP_MS } from '../src/sim/core/clock';
import { Game } from '../src/sim/core/game';
import type { SimModule } from '../src/sim/core/module';
import { Rng } from '../src/sim/core/rng';

interface CounterState { ticks: number }

const counter: SimModule<CounterState> = {
  id: 'counter',
  version: 1,
  init: () => ({ ticks: 0 }),
  step: (s, ctx) => {
    s.ticks++;
    ctx.resources.credits += 1;
  },
  serialize: (s) => s,
  load: (data) => (data ? (data as CounterState) : { ticks: 0 }),
};

describe('Rng', () => {
  it('misma semilla, misma secuencia', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });
  it('restaura el estado guardado', () => {
    const a = new Rng(7);
    a.next();
    const b = new Rng(0);
    b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
  it('int respeta los límites', () => {
    const r = new Rng(3);
    for (let i = 0; i < 200; i++) {
      const v = r.int(2, 5);
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThanOrEqual(5);
    }
  });
});

describe('Clock', () => {
  it('acumula el resto entre llamadas', () => {
    const c = new Clock();
    expect(c.advance(STEP_MS / 2, () => {})).toBe(0);
    expect(c.advance(STEP_MS / 2, () => {})).toBe(1);
    expect(c.elapsedMs).toBe(STEP_MS);
  });
});

describe('Game', () => {
  it('guarda y carga sin perder estado', () => {
    const g = new Game([counter], 1);
    g.step(1000);
    const loaded = Game.load(JSON.stringify(g.serialize(0)), [counter]);
    expect(loaded.ctx.resources.credits).toBe(10);
    expect(loaded.states.get('counter')).toEqual({ ticks: 10 });
    expect(loaded.ctx.rng.getState()).toBe(g.ctx.rng.getState());
  });
  it('un módulo nuevo carga con valores por defecto en una partida antigua', () => {
    const old = new Game([], 1).serialize(0);
    const loaded = Game.load(JSON.stringify(old), [counter]);
    expect(loaded.states.get('counter')).toEqual({ ticks: 0 });
  });
  it('las ganancias sin conexión respetan el tope', () => {
    const g = new Game([counter], 1);
    const done = g.simulateOffline(10_000, 2_000);
    expect(done).toBe(2_000);
    expect(g.ctx.resources.credits).toBe(20);
  });
  it('rechaza partidas de una versión más nueva', () => {
    expect(() => Game.load(JSON.stringify({ version: 99 }), [])).toThrow();
  });
});
