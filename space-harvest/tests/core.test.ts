import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';
import { advance, newGame } from '../src/sim/core/game';
import { load, serialize } from '../src/sim/core/save';
import type { GameModule } from '../src/sim/core/module';

interface Counter { n: number }
const counter: GameModule<Counter> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, m, dt) => { m.n += dt; s.credits += dt; },
  serialize: (m) => m,
  load: (d) => ({ n: (d as Counter | undefined)?.n ?? 0 }),
};
const late: GameModule<{ x: number }> = {
  id: 'late', version: 1, init: () => ({ x: 7 }), step: () => {}, serialize: (m) => m, load: (d) => d as { x: number },
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42), b = new Rng(42);
    expect([a.next(), a.next(), a.int(1, 6)]).toEqual([b.next(), b.next(), b.int(1, 6)]);
  });
  it('int respeta el rango', () => {
    const r = new Rng(3);
    for (let i = 0; i < 200; i++) { const v = r.int(2, 5); expect(v).toBeGreaterThanOrEqual(2); expect(v).toBeLessThanOrEqual(5); }
  });
});

describe('simulación', () => {
  it('advance equivale a pasos de 1 s', () => {
    const s = newGame([counter]);
    advance(s, [counter], 10.5);
    expect(s.time).toBeCloseTo(10.5);
    expect((s.modules.counter as Counter).n).toBeCloseTo(10.5);
  });
  it('guardado: ida y vuelta, y módulo nuevo carga con valores por defecto', () => {
    const s = newGame([counter], 5);
    advance(s, [counter], 20);
    const json = serialize(s, [counter]);
    const l = load(json, [counter, late]);
    expect(l.credits).toBeCloseTo(20);
    expect((l.modules.counter as Counter).n).toBeCloseTo(20);
    expect(l.modules.late).toEqual({ x: 7 });
    expect(l.rng.state).toBe(s.rng.state);
  });
});
