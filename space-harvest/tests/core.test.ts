import { describe, expect, it } from 'vitest';
import type { GameModule } from '../src/sim/core/module';
import { applyOffline, OFFLINE_CAP_SECONDS } from '../src/sim/core/offline';
import { Rng } from '../src/sim/core/rng';
import { load, serialize } from '../src/sim/core/save';
import { advance, newGame } from '../src/sim/registry';

/** Módulo de prueba: suma 2 créditos por segundo y cuenta sus pasos. */
const dummy: GameModule<{ ticks: number }> = {
  id: 'dummy',
  version: 1,
  init: (s) => {
    s.modules.dummy = { ticks: 0 };
  },
  step: (s, dt) => {
    s.resources.credits += 2 * dt;
    (s.modules.dummy as { ticks: number }).ticks += 1;
  },
  serialize: (s) => s.modules.dummy as { ticks: number },
  load: (s, data) => {
    if (data) s.modules.dummy = { ...data };
  },
  purchases: () => [],
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 10; i++) expect(a.next()).toBe(b.next());
  });
  it('recupera la secuencia desde el estado guardado', () => {
    const a = new Rng(7);
    a.next();
    const b = new Rng(0);
    b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
  it('int respeta los límites', () => {
    const r = new Rng(1);
    for (let i = 0; i < 200; i++) {
      const v = r.int(3, 5);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(5);
    }
  });
});

describe('simulación', () => {
  it('advance es igual a pasos de 1 s y admite fracciones', () => {
    const s = newGame(1, [dummy]);
    advance(s, 10.5, [dummy]);
    expect(s.time).toBeCloseTo(10.5);
    expect(s.resources.credits).toBeCloseTo(21);
    expect((s.modules.dummy as { ticks: number }).ticks).toBe(11);
  });
  it('guardar y cargar conserva el estado', () => {
    const s = newGame(5, [dummy]);
    advance(s, 30, [dummy]);
    const { state, savedAt } = load(serialize(s, [dummy], 1234), [dummy]);
    expect(savedAt).toBe(1234);
    expect(state.time).toBe(30);
    expect(state.resources.credits).toBe(60);
    expect(state.modules.dummy).toEqual({ ticks: 30 });
    expect(state.rng.getState()).toBe(s.rng.getState());
  });
  it('un módulo nuevo carga con valores por defecto en una partida antigua', () => {
    const s = newGame(5, []);
    const { state } = load(serialize(s, [], 0), [dummy]);
    expect(state.modules.dummy).toEqual({ ticks: 0 });
  });
  it('las ganancias con el juego cerrado tienen tope de 1 h (8 h con el Pase)', () => {
    const a = newGame(1, [dummy]);
    expect(applyOffline(a, 10 * 3600, [dummy])).toBe(OFFLINE_CAP_SECONDS);
    const b = newGame(1, [dummy]);
    expect(applyOffline(b, 10 * 3600, [dummy], true)).toBe(8 * 3600);
  });
});
