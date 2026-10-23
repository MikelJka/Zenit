import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';

describe('Rng', () => {
  it('misma semilla, misma secuencia', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 20; i++) expect(a.next()).toBe(b.next());
  });
  it('queda en [0, 1) y los enteros en su rango', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) {
      const x = r.next();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      const n = r.int(3, 5);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(5);
    }
  });
  it('restaurar el estado continúa la secuencia', () => {
    const a = new Rng(5);
    a.next();
    const b = new Rng(0);
    b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
});
