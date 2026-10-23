import { describe, expect, it } from 'vitest';
import { Clock } from '../src/sim/core/clock';
import type { SimModule } from '../src/sim/core/module';
import { Rng } from '../src/sim/core/rng';
import { Simulation } from '../src/sim/registry';

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 20; i++) expect(a.next()).toBe(b.next());
  });
  it('int respeta los límites y el estado se restaura', () => {
    const r = new Rng(7);
    r.next();
    const s = r.getState();
    const x = r.int(3, 5);
    expect(x).toBeGreaterThanOrEqual(3);
    expect(x).toBeLessThanOrEqual(5);
    r.setState(s);
    expect(r.int(3, 5)).toBe(x);
  });
});

describe('Clock', () => {
  it('reparte el tiempo en pasos fijos sin perder resto', () => {
    const c = new Clock(0.1);
    expect(c.advance(0.25)).toBe(2);
    expect(c.advance(0.05)).toBe(1);
  });
});

interface Counter { n: number }
const counter: SimModule<Counter> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, dt) => { s.n += dt; },
  serialize: (s) => s,
  load: (data) => (data as Counter | undefined) ?? { n: 0 },
};

describe('Simulation', () => {
  it('guarda y carga, y avanza offline igual que en vivo', () => {
    const a = new Simulation([counter], 1);
    a.fastForward(100);
    const b = new Simulation([counter], 99);
    b.load(a.save());
    expect(b.stateOf<Counter>('counter').n).toBeCloseTo(100);
  });
  it('un módulo ausente en la partida carga con valores por defecto', () => {
    const old = new Simulation([], 1).save();
    const sim = new Simulation([counter], 1);
    sim.load(old);
    expect(sim.stateOf<Counter>('counter').n).toBe(0);
  });
});
