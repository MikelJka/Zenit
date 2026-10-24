import { describe, expect, it } from 'vitest';
import type { SimModule } from '../src/sim/core/module';
import { advance } from '../src/sim/core/offline';
import { load, serialize } from '../src/sim/core/save';
import { allPurchases, newGame, step } from '../src/sim/registry';

/** Módulo de prueba: suma `rate` créditos por segundo y cuenta sus pasos. */
function counter(version = 1): SimModule<{ steps: number }> {
  return {
    id: 'counter',
    version,
    init: (s) => {
      s.modules.counter = { steps: 0 };
    },
    step: (s, dt) => {
      s.resources.credits += 2 * dt;
      (s.modules.counter as { steps: number }).steps++;
    },
    serialize: (s) => s.modules.counter as { steps: number },
    load: (s, data) => {
      s.modules.counter = { steps: (data as { steps?: number })?.steps ?? 0 };
    },
    purchases: () => [],
  };
}

describe('registro y reloj', () => {
  it('step llama a los módulos y avanza el tiempo', () => {
    const mods = [counter()];
    const s = newGame(1, mods);
    step(s, 3, mods);
    expect(s.time).toBe(3);
    expect(s.resources.credits).toBe(6);
    expect(allPurchases(s, mods)).toEqual([]);
  });
  it('advance simula en pasos de 1 s y respeta el tope', () => {
    const mods = [counter()];
    const s = newGame(1, mods);
    expect(advance(s, 10.5, mods)).toBe(10.5);
    expect((s.modules.counter as { steps: number }).steps).toBe(11);
    expect(advance(s, 1e9, mods, 100)).toBe(100);
    expect(advance(s, -5, mods)).toBe(0);
  });
  it('es determinista', () => {
    const run = () => {
      const mods = [counter()];
      const s = newGame(9, mods);
      advance(s, 500, mods);
      return [s.resources.credits, s.rng.next()];
    };
    expect(run()).toEqual(run());
  });
});

describe('guardado con versión', () => {
  it('guarda y carga el estado completo', () => {
    const mods = [counter()];
    const s = newGame(5, mods);
    advance(s, 20, mods);
    const loaded = load(serialize(s, mods, 1234), mods)!;
    expect(loaded.savedAt).toBe(1234);
    expect(loaded.state.time).toBe(20);
    expect(loaded.state.resources.credits).toBe(40);
    expect(loaded.state.rng.next()).toBe(s.rng.next());
    expect(loaded.state.modules.counter).toEqual({ steps: 20 });
  });
  it('un módulo nuevo carga con valores por defecto en una partida antigua', () => {
    const old = serialize(newGame(1, []), [], 0);
    const mods = [counter()];
    const loaded = load(old, mods)!;
    expect(loaded.state.modules.counter).toEqual({ steps: 0 });
  });
  it('rechaza guardados corruptos o de una versión futura', () => {
    expect(load('no es json', [])).toBeNull();
    expect(load(JSON.stringify({ v: 999 }), [])).toBeNull();
  });
});
