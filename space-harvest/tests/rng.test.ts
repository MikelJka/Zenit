import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });
  it('int respeta los límites', () => {
    const r = new Rng(1);
    for (let i = 0; i < 200; i++) {
      const v = r.int(3, 5);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(5);
    }
  });
  it('se puede restaurar el estado', () => {
    const a = new Rng(7);
    a.next();
    const b = new Rng(0);
    b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
});
