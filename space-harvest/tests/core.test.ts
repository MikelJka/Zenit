import { describe, expect, it } from 'vitest';
import { Clock, TICK_SECONDS } from '../src/sim/core/clock';
import { Game } from '../src/sim/core/game';
import type { GameModule } from '../src/sim/core/module';
import { Rng } from '../src/sim/core/rng';
import { SAVE_VERSION, migrateSave } from '../src/sim/core/save';

// Módulo de prueba: gana 1 crédito por segundo.
const counter: GameModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, c, dt) => {
    s.n += dt;
    c.credits += dt;
  },
  serialize: (s) => s,
  load: (d) => ({ n: (d as any)?.n ?? 0 }),
  purchases: () => [],
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42), b = new Rng(42);
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()));
  });
  it('restaura su estado', () => {
    const a = new Rng(7);
    a.next();
    const b = new Rng(0);
    b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
  it('int respeta los límites', () => {
    const r = new Rng(3);
    for (let i = 0; i < 200; i++) expect([1, 2, 3]).toContain(r.int(1, 3));
  });
});

describe('Clock', () => {
  it('da pasos fijos y guarda el resto', () => {
    const c = new Clock();
    let n = 0;
    expect(c.advance(TICK_SECONDS * 2.5, () => n++)).toBe(2);
    expect(c.advance(TICK_SECONDS * 0.5, () => n++)).toBe(1);
    expect(n).toBe(3);
  });
});

describe('Game', () => {
  it('simula, guarda y carga igual', () => {
    const g = new Game([counter], 5);
    g.step(10);
    expect(g.common.credits).toBeCloseTo(10);
    const h = new Game([counter], 99);
    h.load(JSON.parse(JSON.stringify(g.serialize())));
    expect(h.serialize()).toEqual(g.serialize());
  });
  it('ganancias con el juego cerrado con tope', () => {
    const g = new Game([counter]);
    expect(g.offline(1000, 60)).toBe(60);
    expect(g.common.credits).toBeCloseTo(60);
  });
  it('un módulo nuevo en una partida antigua usa sus valores por defecto', () => {
    const old = new Game([]);
    old.step(1);
    const g = new Game([counter]);
    g.load(old.serialize());
    expect(g.states.get('counter')).toEqual({ n: 0 });
  });
  it('rechaza partidas más nuevas', () => {
    expect(() => migrateSave({ version: SAVE_VERSION + 1 })).toThrow();
  });
});
