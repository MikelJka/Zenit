import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';

describe('Rng', () => {
  it('con la misma semilla da la misma secuencia', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()));
  });

  it('da valores en [0, 1) y enteros dentro del rango', () => {
    const r = new Rng(7);
    for (let i = 0; i < 1000; i++) {
      const x = r.next();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      const n = r.int(3, 6);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(6);
    }
  });

  it('restaurar el estado continúa la misma secuencia', () => {
    const a = new Rng(1);
    a.next();
    const b = new Rng(0);
    b.state = a.state;
    expect(b.next()).toBe(a.next());
  });
});
