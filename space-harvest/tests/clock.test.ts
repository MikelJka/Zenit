import { describe, expect, it } from 'vitest';
import { MAX_STEPS_PER_ADVANCE, STEP_SECONDS, advance, newClock } from '../src/sim/core/clock';

describe('reloj', () => {
  it('da pasos fijos y guarda el resto', () => {
    const c = newClock();
    let n = 0;
    advance(c, 1.1, () => n++);
    expect(n).toBe(4);
    expect(c.time).toBeCloseTo(4 * STEP_SECONDS);
    expect(c.carry).toBeCloseTo(0.1);
  });
  it('acumula el resto entre llamadas', () => {
    const c = newClock();
    let n = 0;
    advance(c, 0.1, () => n++);
    advance(c, 0.2, () => n++);
    expect(n).toBe(1);
  });
  it('una ausencia larga cubre todo el tiempo con pocos pasos', () => {
    const c = newClock();
    let n = 0, t = 0;
    advance(c, 30 * 86400, (dt) => { n++; t += dt; });
    expect(n).toBeLessThanOrEqual(MAX_STEPS_PER_ADVANCE);
    expect(t).toBeCloseTo(30 * 86400, 0);
  });
  it('ignora tiempos negativos o NaN', () => {
    const c = newClock();
    advance(c, -5, () => { throw new Error('no debe avanzar'); });
    advance(c, NaN, () => { throw new Error('no debe avanzar'); });
    expect(c.time).toBe(0);
  });
});
