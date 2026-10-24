import { describe, expect, it } from 'vitest';
import { Rng, seedFromString } from '../src/sim/core/rng';

describe('Rng', () => {
  it('misma semilla, misma secuencia', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });
  it('restaura el estado guardado', () => {
    const a = new Rng(7);
    a.next();
    const b = new Rng(0);
    b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
  it('int y range respetan los límites', () => {
    const r = new Rng(1);
    for (let i = 0; i < 500; i++) {
      const n = r.int(3, 6);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(6);
      const x = r.range(2, 5);
      expect(x).toBeGreaterThanOrEqual(2);
      expect(x).toBeLessThan(5);
    }
  });
  it('seedFromString es estable', () => {
    expect(seedFromString('abc')).toBe(seedFromString('abc'));
    expect(seedFromString('abc')).not.toBe(seedFromString('abd'));
  });
});
