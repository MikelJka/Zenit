import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';

describe('Rng', () => {
  it('misma semilla, misma secuencia', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 50; i++) expect(a.next()).toBe(b.next());
  });
  it('queda en [0, 1) y int respeta los límites', () => {
    const r = new Rng(7);
    for (let i = 0; i < 500; i++) {
      const x = r.next();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      const n = r.int(3, 5);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(5);
    }
  });
  it('recupera el estado guardado', () => {
    const a = new Rng(9);
    a.next();
    const b = new Rng(0);
    b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
});
