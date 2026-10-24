import { describe, expect, it } from 'vitest';
import { Rng } from '../src/sim/core/rng';
import { createClock, advance } from '../src/sim/core/clock';
import { createGame, advanceGame } from '../src/sim/core/game';
import { loadGame, serializeGame } from '../src/sim/core/save';
import type { GameModule } from '../src/sim/core/module';

interface Counter { n: number }
const counter: GameModule<Counter> = {
  id: 'counter',
  version: 2,
  init: () => ({ n: 0 }),
  step: (s, dt) => { s.n += dt; },
  serialize: (s) => s,
  load: (d) => ({ n: (d as Counter | undefined)?.n ?? 0 }),
  purchases: () => [],
};

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42), b = new Rng(42);
    expect([a.next(), a.next(), a.int(1, 6)]).toEqual([b.next(), b.next(), b.int(1, 6)]);
  });
  it('restaura su estado', () => {
    const a = new Rng(7); a.next();
    const b = new Rng(0); b.setState(a.getState());
    expect(b.next()).toBe(a.next());
  });
});

describe('reloj', () => {
  it('avanza en pasos de 1 s y descarta el resto', () => {
    const c = createClock(); let calls = 0;
    expect(advance(c, 3.7, () => calls++)).toBe(3);
    expect(calls).toBe(3);
    expect(c.time).toBe(3);
  });
});

describe('guardado', () => {
  it('ida y vuelta conserva el estado', () => {
    const g = createGame([counter], 1);
    advanceGame(g, [counter], 10);
    const g2 = loadGame(JSON.parse(JSON.stringify(serializeGame(g, [counter]))), [counter]);
    expect(g2.states.counter).toEqual({ n: 10 });
    expect(g2.clock.time).toBe(10);
  });
  it('un módulo nuevo carga con valores por defecto', () => {
    const old = serializeGame(createGame([], 1), []);
    expect(loadGame(old, [counter]).states.counter).toEqual({ n: 0 });
  });
});
