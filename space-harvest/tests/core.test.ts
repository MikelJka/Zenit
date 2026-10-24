import { describe, expect, it } from 'vitest';
import { Clock, offlineSeconds, TICK_SECONDS, MAX_OFFLINE_SECONDS } from '../src/sim/core/clock';
import { Game } from '../src/sim/core/game';
import type { SimModule } from '../src/sim/core/module';
import { Rng } from '../src/sim/core/rng';

const counter: SimModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, _dt, ctx) => {
    s.n += 1;
    ctx.common.credits += 2;
  },
  serialize: (s) => s,
  load: (d) => ({ n: 0, ...(d as object) }),
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 10; i++) expect(a.next()).toBe(b.next());
  });
  it('int respeta los límites', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) {
      const v = r.int(3, 5);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(5);
    }
  });
});

describe('Clock', () => {
  it('acumula el resto entre llamadas', () => {
    const c = new Clock();
    expect(c.advance(TICK_SECONDS * 1.5)).toBe(1);
    expect(c.advance(TICK_SECONDS * 0.5)).toBe(1);
  });
  it('las ganancias sin conexión tienen tope', () => {
    expect(offlineSeconds(0, 1000)).toBe(1);
    expect(offlineSeconds(0, 1e12)).toBe(MAX_OFFLINE_SECONDS);
    expect(offlineSeconds(5000, 0)).toBe(0);
  });
});

describe('Game', () => {
  it('ejecuta los módulos en pasos fijos', () => {
    const g = new Game([counter]);
    g.advance(1);
    expect(g.getState<{ n: number }>('counter').n).toBe(4);
    expect(g.common.credits).toBe(8);
  });
  it('guarda y carga sin perder estado', () => {
    const g = new Game([counter], 9);
    g.advance(2);
    const json = JSON.parse(JSON.stringify(g.save(123)));
    const g2 = Game.load([counter], json);
    expect(g2.getState<{ n: number }>('counter').n).toBe(8);
    expect(g2.common.credits).toBe(16);
    expect(g2.rng.next()).toBe(g.rng.next());
  });
  it('una partida sin un módulo nuevo lo inicia por defecto', () => {
    const g = new Game([]);
    const g2 = Game.load([counter], g.save(0));
    expect(g2.getState<{ n: number }>('counter').n).toBe(0);
  });
});
