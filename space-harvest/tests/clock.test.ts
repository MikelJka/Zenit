import { describe, expect, it } from 'vitest';
import { createClock, tick } from '../src/sim/core/clock';

describe('clock', () => {
  it('da un paso por segundo y guarda el sobrante', () => {
    const c = createClock();
    let n = 0;
    expect(tick(c, 2.5, () => n++)).toBe(2);
    expect(c.carry).toBeCloseTo(0.5);
    expect(tick(c, 0.5, () => n++)).toBe(1);
    expect(c.time).toBe(3);
    expect(n).toBe(3);
  });
  it('ignora tiempos negativos o NaN', () => {
    const c = createClock();
    expect(tick(c, -5, () => {})).toBe(0);
    expect(tick(c, NaN, () => {})).toBe(0);
  });
});
