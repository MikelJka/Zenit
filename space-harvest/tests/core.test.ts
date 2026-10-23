import { describe, expect, it } from 'vitest';
import { Clock, STEP_SECONDS } from '../src/sim/core/clock';
import { Game } from '../src/sim/core/game';
import type { SimModule } from '../src/sim/core/module';
import { Rng } from '../src/sim/core/rng';
import { MODULES } from '../src/sim/registry';

describe('Rng', () => {
  it('misma semilla, misma secuencia', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 20; i++) expect(a.next()).toBe(b.next());
  });
  it('int respeta los límites y el estado se puede restaurar', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) {
      const v = r.int(3, 5);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(5);
    }
    const s = r.getState();
    const x = r.next();
    r.setState(s);
    expect(r.next()).toBe(x);
  });
});

describe('Clock', () => {
  it('da pasos fijos y guarda el resto', () => {
    const c = new Clock();
    let n = 0;
    expect(c.advance(STEP_SECONDS * 2.5, () => n++)).toBe(2);
    expect(c.advance(STEP_SECONDS * 0.5, () => n++)).toBe(1);
    expect(n).toBe(3);
    expect(c.time).toBeCloseTo(STEP_SECONDS * 3);
  });
});

describe('Game', () => {
  const counter: SimModule<{ n: number }> = {
    id: 'counter',
    version: 1,
    init: () => ({ n: 0 }),
    step: (s) => void s.n++,
    serialize: (s) => s,
    load: (d) => ({ n: (d as { n?: number } | undefined)?.n ?? 0 }),
  };

  it('guarda y carga conservando el estado', () => {
    const g = new Game([counter]);
    g.advance(10);
    const g2 = Game.load([counter], g.serialize());
    expect(g2.states.counter).toEqual(g.states.counter);
    expect(g2.clock.time).toBe(g.clock.time);
  });
  it('un módulo nuevo carga con valores por defecto en una partida antigua', () => {
    const old = new Game([counter]);
    old.advance(5);
    const g = Game.load([counter, ...MODULES], old.serialize());
    expect(g.states.core).toEqual({ credits: 0 });
    expect(g.states.counter).toEqual(old.states.counter);
  });
});
