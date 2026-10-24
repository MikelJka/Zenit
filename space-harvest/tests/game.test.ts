import { describe, expect, it } from 'vitest';
import { advance, newGame } from '../src/sim/core/game';
import type { GameModule } from '../src/sim/core/module';
import { load, serialize } from '../src/sim/core/save';

interface Counter { n: number }

const counter: GameModule<Counter> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (core, own, dt) => { own.n += dt; core.credits += dt; },
  serialize: (own) => ({ n: own.n }),
  load: (_core, data) => ({ n: (data as Counter | undefined)?.n ?? 0 }),
};

describe('simulación', () => {
  it('avanza en pasos de 1 s y guarda el resto', () => {
    const mods = [counter];
    const g = newGame(mods, 1);
    advance(g, mods, 2.5);
    expect(g.core.time).toBe(2);
    expect((g.own.counter as Counter).n).toBe(2);
    advance(g, mods, 0.5);
    expect(g.core.time).toBe(3);
  });

  it('guardar y cargar conserva el estado', () => {
    const mods = [counter];
    const g = newGame(mods, 5);
    advance(g, mods, 10);
    const copy = load(JSON.parse(JSON.stringify(serialize(g, mods, 0))), mods);
    expect(copy.core.credits).toBe(10);
    expect((copy.own.counter as Counter).n).toBe(10);
    expect(copy.core.rng.state).toBe(g.core.rng.state);
  });

  it('una partida antigua sin el módulo carga con valores por defecto', () => {
    const old = serialize(newGame([], 1), [], 0);
    const g = load(old, [counter]);
    expect((g.own.counter as Counter).n).toBe(0);
  });
});
