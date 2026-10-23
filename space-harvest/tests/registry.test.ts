import { describe, expect, it } from 'vitest';
import type { SimModule } from '../src/sim/core/module';
import { canAfford, emptyResources, pay } from '../src/sim/core/resources';
import { decodeSave } from '../src/sim/core/save';
import { loadGame, newGame, saveGame, step } from '../src/sim/registry';

interface Gen { n: number; extra?: number }

/** Módulo de prueba: suma 1 crédito por segundo y un número al azar. */
const gen: SimModule<Gen> = {
  id: 'gen',
  version: 2,
  init: () => ({ n: 0, extra: 0 }),
  step(s, ctx, dt) { ctx.resources.credits += dt; s.n += ctx.rng.next() * dt; },
  serialize: (s) => s,
  load(data, version) {
    const d = (data ?? {}) as Partial<Gen>;
    // v1 no tenía `extra`: se rellena con el valor por defecto.
    return { n: d.n ?? 0, extra: version >= 2 ? d.extra ?? 0 : 0 };
  },
  purchases: () => [],
};
const late: SimModule<{ k: number }> = {
  id: 'late', version: 1, init: () => ({ k: 9 }), step() {}, serialize: (s) => s,
  load: (d) => ({ k: (d as { k: number }).k }), purchases: () => [],
};

describe('registro y guardado', () => {
  it('la simulación es determinista con la misma semilla', () => {
    const a = newGame(3, [gen]), b = newGame(3, [gen]);
    step(a, 100, [gen]); step(b, 100, [gen]);
    expect(a.states.gen).toEqual(b.states.gen);
    expect(a.resources.credits).toBeCloseTo(100);
  });
  it('guardar y cargar da el mismo estado y la misma continuación', () => {
    const a = newGame(3, [gen]);
    step(a, 50, [gen]);
    const { game: b, savedAt } = loadGame(saveGame(a, 1234, [gen]), 99, [gen]);
    expect(savedAt).toBe(1234);
    step(a, 10, [gen]); step(b, 10, [gen]);
    expect(b.states.gen).toEqual(a.states.gen);
    expect(b.resources).toEqual(a.resources);
  });
  it('un módulo nuevo carga con su valor por defecto en una partida antigua', () => {
    const old = newGame(1, [gen]);
    const { game } = loadGame(saveGame(old, 0, [gen]), 1, [gen, late]);
    expect(game.states.late).toEqual({ k: 9 });
  });
  it('pasa la versión guardada del módulo para migrar', () => {
    const text = JSON.stringify({ version: 1, savedAt: 0, time: 0, rngState: 1, resources: {}, modules: { gen: { version: 1, data: { n: 5 } } } });
    const { game } = loadGame(text, 1, [gen]);
    expect(game.states.gen).toEqual({ n: 5, extra: 0 });
  });
  it('un texto roto o de versión futura empieza de cero', () => {
    expect(decodeSave('{no es json')).toBeNull();
    expect(decodeSave(JSON.stringify({ version: 99 }))).toBeNull();
    const { game, savedAt } = loadGame('basura', 1, [gen]);
    expect(savedAt).toBe(0);
    expect(game.states.gen).toEqual({ n: 0, extra: 0 });
  });
  it('pagar descuenta solo si alcanza', () => {
    const r = emptyResources(); r.credits = 10;
    expect(canAfford(r, { credits: 11 })).toBe(false);
    expect(pay(r, { credits: 11 })).toBe(false);
    expect(r.credits).toBe(10);
    expect(pay(r, { credits: 4 })).toBe(true);
    expect(r.credits).toBe(6);
  });
});
