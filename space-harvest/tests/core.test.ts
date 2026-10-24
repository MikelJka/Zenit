import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';
import { Clock } from '../src/sim/core/clock';
import { decodeSave, encodeSave } from '../src/sim/core/save';
import { Registry } from '../src/sim/registry';
import type { SimModule } from '../src/sim/core/module';

const counter: SimModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, dt) => {
    s.n += dt;
  },
  serialize: (s) => s,
  load: (d) => ({ n: Number((d as { n?: number }).n) || 0 }),
  purchases: () => [],
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

describe('Clock', () => {
  it('acumula fracciones de paso', () => {
    const c = new Clock();
    expect(c.advance(0.6)).toBe(0);
    expect(c.advance(0.6)).toBe(1);
  });
});

describe('guardado y registro', () => {
  it('guarda y carga un módulo', () => {
    const r = new Registry();
    r.register(counter);
    r.step(5);
    const text = encodeSave(r.save(100));
    const r2 = new Registry();
    r2.register(counter);
    r2.load(decodeSave(text)!);
    expect(r2.state<{ n: number }>('counter').n).toBe(5);
  });
  it('una partida sin el módulo deja el valor inicial', () => {
    const r = new Registry();
    r.register(counter);
    r.load({ version: 1, savedAt: 0, modules: {} });
    expect(r.state<{ n: number }>('counter').n).toBe(0);
  });
  it('rechaza texto inválido', () => {
    expect(decodeSave('basura')).toBeNull();
    expect(decodeSave('{"version":1}')).toBeNull();
  });
  it('rechaza módulos repetidos', () => {
    const r = new Registry();
    r.register(counter);
    expect(() => r.register(counter)).toThrow();
  });
});
