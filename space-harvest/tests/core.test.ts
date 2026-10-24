import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';
import { Clock, offlineSeconds, OFFLINE_CAP_SECONDS } from '../src/sim/core/clock';
import { Registry } from '../src/sim/registry';
import { initStates, load, save } from '../src/sim/core/save';
import type { GameModule } from '../src/sim/core/module';

const counter: GameModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, dt) => { s.n += dt; },
  serialize: (s) => s,
  load: (d) => (d ? (d as { n: number }) : { n: 0 }),
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42), b = new Rng(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });
  it('int respeta los límites y el estado se restaura', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) { const v = r.int(3, 5); expect(v).toBeGreaterThanOrEqual(3); expect(v).toBeLessThanOrEqual(5); }
    const s = r.getState(), x = r.next();
    r.setState(s);
    expect(r.next()).toBe(x);
  });
});

describe('Clock', () => {
  it('acumula tiempo e ignora valores negativos', () => {
    const c = new Clock();
    c.advance(2); c.advance(-5); c.advance(NaN);
    expect(c.time).toBe(2);
  });
  it('acota las ganancias con el juego cerrado', () => {
    expect(offlineSeconds(0, 1000)).toBe(1);
    expect(offlineSeconds(5000, 1000)).toBe(0);
    expect(offlineSeconds(0, 1e12)).toBe(OFFLINE_CAP_SECONDS);
  });
});

describe('guardado', () => {
  it('guarda y carga', () => {
    const reg = new Registry().register(counter);
    const states = initStates(reg);
    (states.counter as { n: number }).n = 5;
    const out = load(reg, save(reg, states, 10, 99, 1234));
    expect(out.states.counter).toEqual({ n: 5 });
    expect(out.time).toBe(10);
    expect(out.rng).toBe(99);
    expect(out.savedAt).toBe(1234);
  });
  it('un módulo nuevo carga con valores por defecto en una partida antigua', () => {
    const old = save(new Registry(), {}, 0, 1, 0);
    const reg = new Registry().register(counter);
    expect(load(reg, old).states.counter).toEqual({ n: 0 });
  });
  it('rechaza módulos duplicados', () => {
    expect(() => new Registry().register(counter).register(counter)).toThrow();
  });
});
