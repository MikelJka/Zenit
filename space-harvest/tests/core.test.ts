import { describe, expect, it } from 'vitest';
import { advance, advanceOffline, MAX_OFFLINE } from '../src/sim/core/clock';
import { Rng } from '../src/sim/core/rng';
import { load, serialize } from '../src/sim/core/save';
import { newState, type GameState } from '../src/sim/core/state';
import { Registry, type SimModule } from '../src/sim/registry';

/** Módulo de prueba: suma 2 créditos por segundo. */
const dummy: SimModule<{ n: number }> = {
  id: 'dummy',
  version: 2,
  init: () => ({ n: 0 }),
  step(state, dt) {
    state.resources.credits = (state.resources.credits ?? 0) + 2 * dt;
    (state.modules.dummy as { n: number }).n += 1;
  },
  serialize: (state) => state.modules.dummy,
  load(state, data) {
    if (data) state.modules.dummy = data;
  },
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    expect([a.next(), a.next(), a.int(1, 6)]).toEqual([b.next(), b.next(), b.int(1, 6)]);
  });
  it('mantiene int dentro del rango y restaura su estado', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) expect([1, 2, 3]).toContain(r.int(1, 3));
    const s = r.getState();
    const x = r.next();
    r.setState(s);
    expect(r.next()).toBe(x);
  });
});

describe('reloj', () => {
  it('avanza en pasos y acumula el tiempo', () => {
    const reg = new Registry([dummy]);
    const st = newState(1);
    reg.init(st);
    advance(st, reg, 10.5);
    expect(st.time).toBeCloseTo(10.5);
    expect(st.resources.credits).toBeCloseTo(21);
  });
  it('limita las ganancias con el juego cerrado', () => {
    const reg = new Registry();
    const st = newState(1);
    st.savedAt = 1000;
    const secs = advanceOffline(st, reg, 1000 + 100 * 3600 * 1000);
    expect(secs).toBe(MAX_OFFLINE);
  });
});

describe('guardado', () => {
  it('ida y vuelta conserva el estado', () => {
    const reg = new Registry([dummy]);
    const st = newState(5);
    reg.init(st);
    advance(st, reg, 5);
    const back: GameState = load(serialize(st, reg, 123), reg, 5);
    expect(back.resources.credits).toBe(10);
    expect(back.savedAt).toBe(123);
    expect(back.modules.dummy).toEqual({ n: 5 });
    expect(back.rng.getState()).toBe(st.rng.getState());
  });
  it('una partida antigua sin el módulo nuevo carga con valores por defecto', () => {
    const old = serialize(newState(1), new Registry(), 1);
    const reg = new Registry([dummy]);
    const st = load(old, reg, 1);
    expect(st.modules.dummy).toEqual({ n: 0 });
  });
  it('datos corruptos o vacíos dan partida nueva', () => {
    const reg = new Registry([dummy]);
    expect(load('{no json', reg, 1).modules.dummy).toEqual({ n: 0 });
    expect(load(null, reg, 1).resources.credits).toBe(0);
  });
});

describe('registro', () => {
  it('rechaza ids duplicados', () => {
    expect(() => new Registry([dummy, dummy])).toThrow();
  });
});
