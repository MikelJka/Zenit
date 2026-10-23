import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';
import { Game } from '../src/sim/core/game';
import type { GameModule } from '../src/sim/core/module';

interface CounterState { n: number }
const counter: GameModule<CounterState> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, dt) => { s.n += dt; },
  serialize: (s) => s,
  load: (d) => ({ n: (d as CounterState).n ?? 0 }),
  purchases: () => [],
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42), b = new Rng(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });
  it('int respeta los límites', () => {
    const r = new Rng(1);
    for (let i = 0; i < 200; i++) { const v = r.int(3, 5); expect(v >= 3 && v <= 5).toBe(true); }
  });
  it('recupera el estado', () => {
    const a = new Rng(7); a.next();
    const b = new Rng(0); b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
});

describe('Game', () => {
  it('avanza por pasos fijos y devuelve el resto', () => {
    const g = new Game([counter]);
    expect(g.tick(3.5)).toBeCloseTo(0.5);
    expect((g.states.counter as CounterState).n).toBe(3);
  });
  it('guarda y carga la partida', () => {
    const g = new Game([counter]);
    g.tick(10);
    const g2 = new Game([counter], g.save(123));
    expect((g2.states.counter as CounterState).n).toBe(10);
  });
  it('un módulo nuevo arranca con su valor por defecto', () => {
    const g = new Game([], null);
    const other: GameModule<CounterState> = { ...counter, id: 'otro' };
    const g2 = new Game([counter, other], g.save(1));
    expect((g2.states.otro as CounterState).n).toBe(0);
  });
  it('una partida corrupta no rompe la carga', () => {
    const g = new Game([counter], '{no es json');
    expect((g.states.counter as CounterState).n).toBe(0);
  });
});
