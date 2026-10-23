import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';
import { loadGame, serializeGame } from '../src/sim/core/save';
import type { SimModule } from '../src/sim/core/module';
import { advance, createGame } from '../src/sim/registry';

const counter = (id: string): SimModule<{ n: number }> => ({
  id,
  version: 1,
  init: () => ({ n: 0 }),
  step: (g, s, dt) => {
    s.n += dt;
    g.resources.credits = (g.resources.credits ?? 0) + dt;
  },
  serialize: (s) => s,
  load: (d) => ({ n: (d as { n: number }).n }),
  purchases: () => [],
});

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42), b = new Rng(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });
  it('int respeta los límites', () => {
    const r = new Rng(7);
    for (let i = 0; i < 1000; i++) expect([1, 2, 3]).toContain(r.int(1, 3));
  });
});

describe('simulación', () => {
  it('advance avanza el reloj y ejecuta los módulos', () => {
    const g = createGame([counter('a')], 1);
    advance(g, 10.5);
    expect(g.clock.time).toBeCloseTo(10.5);
    expect(g.resources.credits).toBeCloseTo(10.5);
  });
  it('guardar y cargar conserva el estado y el azar', () => {
    const g = createGame([counter('a')], 5);
    advance(g, 20);
    g.rng.next();
    const json = serializeGame(g);
    const h = createGame([counter('a')], 99);
    loadGame(h, json);
    expect(h.clock.time).toBe(20);
    expect(h.modules.a).toEqual({ n: 20 });
    expect(h.rng.next()).toBe(g.rng.next());
  });
  it('un módulo nuevo carga con valores por defecto en una partida antigua', () => {
    const g = createGame([counter('a')], 1);
    advance(g, 5);
    const json = serializeGame(g);
    const h = createGame([counter('a'), counter('b')], 1);
    loadGame(h, json);
    expect(h.modules.a).toEqual({ n: 5 });
    expect(h.modules.b).toEqual({ n: 0 });
  });
});
