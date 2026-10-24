import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';
import { Clock, STEP_MS } from '../src/sim/core/clock';
import type { GameModule } from '../src/sim/core/module';
import { initState, loadState, serializeState, stepState } from '../src/sim/core/save';

const counter: GameModule<{ n: number; extra: number }> = {
  id: 'counter',
  version: 2,
  init: () => ({ n: 0, extra: 5 }),
  step: (s, dt) => { s.n += dt; },
  serialize: (s) => ({ n: s.n }),
  load: (d) => ({ extra: 5, ...(d as { n: number }) }),
};

describe('Rng', () => {
  it('es determinista y restaurable', () => {
    const a = new Rng(42), b = new Rng(42);
    expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
    const s = a.getState();
    const x = a.next();
    a.setState(s);
    expect(a.next()).toBe(x);
  });
  it('int queda en el rango', () => {
    const r = new Rng(1);
    for (let i = 0; i < 200; i++) expect(r.int(3, 5)).toBeGreaterThanOrEqual(3);
  });
});

describe('Clock', () => {
  it('da pasos fijos y guarda el resto', () => {
    const c = new Clock();
    let total = 0;
    expect(c.advance(250, (d) => { total += d; })).toBe(2);
    expect(c.advance(50, (d) => { total += d; })).toBe(1);
    expect(total).toBe(3 * STEP_MS);
  });
});

describe('guardado', () => {
  it('ida y vuelta con valores por defecto para lo nuevo', () => {
    const mods = [counter as GameModule];
    const st = initState(mods);
    stepState(mods, st, 100);
    const save = serializeState(mods, st, 100);
    const back = loadState(mods, JSON.parse(JSON.stringify(save)));
    expect(back.counter).toEqual({ n: 100, extra: 5 });
    expect(loadState(mods, { ...save, modules: {} }).counter).toEqual({ n: 0, extra: 5 });
  });
});
