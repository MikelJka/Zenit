import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42), b = new Rng(42);
    for (let i = 0; i < 20; i++) expect(a.next()).toBe(b.next());
  });
  it('int respeta los límites', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) { const n = r.int(3, 5); expect(n).toBeGreaterThanOrEqual(3); expect(n).toBeLessThanOrEqual(5); }
  });
  it('se puede guardar y restaurar el estado', () => {
    const a = new Rng(1); a.next();
    const b = new Rng(0); b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
});
