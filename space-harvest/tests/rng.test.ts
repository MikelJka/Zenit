import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';

describe('Rng', () => {
  it('con la misma semilla da la misma secuencia', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 10; i++) expect(a.next()).toBe(b.next());
  });
  it('int respeta los límites', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) {
      const n = r.int(3, 5);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(5);
    }
  });
  it('restaura el estado', () => {
    const a = new Rng(5);
    a.next();
    const b = new Rng(1);
    b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
});
