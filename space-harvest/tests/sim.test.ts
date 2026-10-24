import { describe, expect, it } from 'vitest';
import { advance, createState, load, serialize } from '../src/sim/core/sim';
import type { SimModule } from '../src/sim/core/types';

const counter: SimModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, dt) => {
    s.resources.credits = (s.resources.credits ?? 0) + dt;
    (s.modules.counter as { n: number }).n += 1;
  },
  serialize: (s) => s.modules.counter,
  load: (s, data) => {
    if (data) s.modules.counter = data;
  },
};

describe('sim', () => {
  it('advance avanza en pasos de 1 s', () => {
    const s = createState([counter]);
    advance(s, [counter], 10.5);
    expect(s.time).toBeCloseTo(10.5);
    expect((s.modules.counter as { n: number }).n).toBe(11);
  });
  it('guardar y cargar conserva el estado', () => {
    const s = createState([counter]);
    advance(s, [counter], 5);
    const back = load(JSON.parse(JSON.stringify(serialize(s, [counter]))), [counter]);
    expect(back.time).toBe(5);
    expect(back.resources.credits).toBe(5);
    expect(back.modules.counter).toEqual({ n: 5 });
  });
  it('una partida antigua sin el módulo carga con valores por defecto', () => {
    const s = createState([]);
    const back = load(serialize(s, []), [counter]);
    expect(back.modules.counter).toEqual({ n: 0 });
  });
});
