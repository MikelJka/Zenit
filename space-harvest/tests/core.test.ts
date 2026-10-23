import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';
import { advance, newGame } from '../src/sim/core/game';
import { load, serialize } from '../src/sim/core/save';
import type { SimModule } from '../src/sim/core/module';

const counter: SimModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, dt, ctx) => {
    s.n += dt;
    ctx.common.credits += dt;
  },
  serialize: (s) => s,
  load: (d) => ({ n: (d as { n?: number })?.n ?? 0 }),
  purchases: () => [],
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 10; i++) expect(a.next()).toBe(b.next());
  });
  it('int respeta el rango', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) {
      const v = r.int(3, 5);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(5);
    }
  });
});

describe('simulación y guardado', () => {
  it('advance recorre los módulos y avanza el reloj', () => {
    const s = newGame([counter]);
    advance(s, [counter], 10.5);
    expect(s.time).toBeCloseTo(10.5);
    expect(s.common.credits).toBeCloseTo(10.5);
  });
  it('guardar y cargar conserva el estado y el Rng', () => {
    const s = newGame([counter], 5);
    advance(s, [counter], 20);
    s.rng.next();
    const { state, savedAt } = load(serialize(s, [counter], 1234), [counter]);
    expect(savedAt).toBe(1234);
    expect(state.common.credits).toBe(20);
    expect(state.rng.next()).toBe(s.rng.next());
  });
  it('un módulo nuevo carga con valores por defecto en una partida antigua', () => {
    const s = newGame([]);
    const { state } = load(serialize(s, [], 0), [counter]);
    expect(state.modules['counter']).toEqual({ n: 0 });
  });
});
