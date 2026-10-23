import { describe, expect, it } from 'vitest';
import { advance, MAX_OFFLINE_SECONDS, offlineSeconds } from '../src/sim/core/clock';
import { load, serialize } from '../src/sim/core/save';
import { MODULES } from '../src/sim/registry';
import type { SimModule } from '../src/sim/core/types';

describe('reloj y guardado', () => {
  it('advance suma el tiempo y ejecuta los módulos', () => {
    const { state } = load(null, MODULES, 1);
    advance(state, MODULES, 10.5);
    expect(state.time).toBeCloseTo(10.5);
    expect((state.modules.core as { ticks: number }).ticks).toBeCloseTo(10.5);
  });
  it('guardar y cargar conserva el estado', () => {
    const { state } = load(null, MODULES, 1);
    advance(state, MODULES, 5);
    const copy = load(serialize(state, MODULES, 1000), MODULES, 99);
    expect(copy.savedAt).toBe(1000);
    expect(copy.state.time).toBe(5);
    expect(copy.state.rng.getState()).toBe(state.rng.getState());
  });
  it('un módulo nuevo carga con valores por defecto en una partida antigua', () => {
    const { state } = load(null, MODULES, 1);
    const old = serialize(state, MODULES, 0);
    const extra: SimModule = {
      id: 'extra', version: 1,
      init: (s) => (s.modules.extra = { n: 7 }),
      step() {}, serialize: (s) => s.modules.extra,
      load: (s, d) => (s.modules.extra = d ?? { n: 7 }),
    };
    const r = load(old, [...MODULES, extra], 1);
    expect(r.state.modules.extra).toEqual({ n: 7 });
  });
  it('un guardado roto empieza partida nueva', () => {
    expect(load('{no es json', MODULES, 1).state.time).toBe(0);
  });
  it('las ganancias con el juego cerrado tienen tope', () => {
    expect(offlineSeconds(0, 1e12)).toBe(MAX_OFFLINE_SECONDS);
    expect(offlineSeconds(5000, 1000)).toBe(0);
  });
});
