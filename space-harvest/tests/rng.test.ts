import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';

describe('Rng', () => {
  it('con la misma semilla da la misma secuencia', () => {
    const a = new Rng(42), b = new Rng(42);
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()));
  });
  it('int respeta los límites', () => {
    const r = new Rng(1);
    for (let i = 0; i < 500; i++) {
      const n = r.int(3, 6);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(6);
    }
  });
  it('restaurar el estado continúa la secuencia', () => {
    const a = new Rng(7);
    a.next();
    const b = new Rng(0);
    b.state = a.state;
    expect(b.next()).toBe(a.next());
  });
});
