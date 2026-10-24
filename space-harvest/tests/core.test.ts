import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';
import { advance, newGame } from '../src/sim/core/game';
import { load, serialize } from '../src/sim/core/save';
import type { GameModule } from '../src/sim/core/types';

const counter: GameModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, dt) => { s.n += dt; },
  serialize: (s) => ({ n: s.n }),
  load: (d) => ({ n: (d as { n: number } | undefined)?.n ?? 0 }),
  purchases: () => [],
};
const mods = [counter as GameModule];

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(7), b = new Rng(7);
    expect([a.next(), a.next(), a.int(1, 6)]).toEqual([b.next(), b.next(), b.int(1, 6)]);
  });
  it('int queda dentro del rango', () => {
    const r = new Rng(3);
    for (let i = 0; i < 200; i++) { const v = r.int(2, 5); expect(v).toBeGreaterThanOrEqual(2); expect(v).toBeLessThanOrEqual(5); }
  });
});

describe('juego y guardado', () => {
  it('advance avanza en pasos y sirve para el tiempo cerrado', () => {
    const g = newGame(mods);
    advance(g, mods, 3600.5);
    expect(g.time).toBeCloseTo(3600.5);
    expect((g.modules.counter as { n: number }).n).toBeCloseTo(3600.5);
  });
  it('guardar y cargar conserva el estado y el Rng', () => {
    const g = newGame(mods, 5);
    advance(g, mods, 10);
    g.rng.next();
    const copy = load(JSON.parse(JSON.stringify(serialize(g, mods))), mods, (m) => newGame(m, 5));
    expect(copy.time).toBe(10);
    expect(copy.rng.next()).toBe(g.rng.next());
    expect((copy.modules.counter as { n: number }).n).toBe(10);
  });
  it('un módulo ausente en el guardado carga con valores por defecto', () => {
    const g = load({ version: 1, time: 4 }, mods, (m) => newGame(m));
    expect((g.modules.counter as { n: number }).n).toBe(0);
  });
});
