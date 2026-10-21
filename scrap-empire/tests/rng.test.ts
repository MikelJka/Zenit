import { describe, expect, it } from 'vitest';
import { Rng, seedFromString } from '../src/sim/rng';

describe('Rng', () => {
  it('la misma semilla da la misma secuencia', () => {
    const a = new Rng(seedFromString('chatarra'));
    const b = new Rng(seedFromString('chatarra'));
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });

  it('int queda dentro del rango', () => {
    const r = new Rng(7);
    for (let i = 0; i < 1000; i++) {
      const n = r.int(3, 9);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(9);
    }
  });
});
