import { describe, expect, it } from 'vitest';
import { Clock, OFFLINE_CAP_MS, offlineMs } from '../src/sim/core/clock';
import { Game } from '../src/sim/core/game';
import type { SimModule } from '../src/sim/core/module';
import { Rng } from '../src/sim/core/rng';
import { parseSave, stringifySave } from '../src/sim/core/save';

const counter: SimModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, common, dt) => {
    s.n += 1;
    common.credits += dt / 1000;
  },
  serialize: (s) => s,
  load: (raw) => ({ n: Number((raw as any)?.n) || 0 }),
  purchases: () => [],
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42), b = new Rng(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });
  it('int respeta los límites y el estado se restaura', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) expect(r.int(3, 5)).toBeGreaterThanOrEqual(3);
    const st = r.state, x = r.next();
    r.state = st;
    expect(r.next()).toBe(x);
  });
});

describe('Clock', () => {
  it('da pasos enteros y conserva el resto', () => {
    const c = new Clock();
    let n = 0;
    expect(c.advance(250, () => n++)).toBe(2);
    expect(c.advance(50, () => n++)).toBe(1);
    expect(c.time).toBe(300);
  });
  it('limita el tiempo cerrado', () => {
    expect(offlineMs(0, 10 * OFFLINE_CAP_MS)).toBe(OFFLINE_CAP_MS);
    expect(offlineMs(100, 50)).toBe(0);
  });
});

describe('Game y guardado', () => {
  it('guarda y carga sin perder estado', () => {
    const g = new Game([counter], 5);
    g.advance(1000);
    const text = stringifySave(g.save(1234));
    const g2 = new Game([counter], 99);
    g2.load(parseSave(text)!);
    expect(g2.states.get('counter')).toEqual({ n: 10 });
    expect(g2.common.credits).toBeCloseTo(1);
    expect(g2.rng.state).toBe(g.rng.state);
  });
  it('rechaza partidas rotas o del futuro y rellena lo que falta', () => {
    expect(parseSave('no es json')).toBeNull();
    expect(parseSave(JSON.stringify({ version: 999 }))).toBeNull();
    const old = parseSave(JSON.stringify({ version: 1, savedAt: 1, rng: 3, modules: {} }))!;
    const g = new Game([counter]);
    g.load(old);
    expect(g.states.get('counter')).toEqual({ n: 0 });
  });
  it('simula el tiempo con el juego cerrado', () => {
    const g = new Game([counter]);
    expect(g.applyOffline(0, 5000)).toBe(50);
  });
});
