import { describe, expect, it } from 'vitest';
import { advance, offlineSeconds } from '../src/sim/core/advance';
import type { SimModule } from '../src/sim/core/module';
import { loadGame, newGame, serializeGame } from '../src/sim/core/save';
import { modules } from '../src/sim/registry';

const extra: SimModule<{ n: number }> = {
  id: 'extra',
  version: 1,
  init: () => ({ n: 5 }),
  step(game, s, dt) {
    s.n += dt;
    game.resources.credits = (game.resources.credits ?? 0) + dt;
  },
  serialize: (s) => s,
  load: (d) => ({ n: Number((d as { n?: number })?.n) || 0 }),
  purchases: () => [],
};

describe('guardado', () => {
  it('guardar y cargar conserva el estado y la secuencia aleatoria', () => {
    const g = newGame(modules, 9);
    advance(g, modules, 10);
    g.game.rng.next();
    const copy = loadGame(JSON.parse(JSON.stringify(serializeGame(g, modules, 0))), modules);
    expect(copy.clock.time).toBe(10);
    expect(copy.game.rng.next()).toBe(g.game.rng.next());
  });
  it('un módulo nuevo carga con valores por defecto en una partida antigua', () => {
    const old = JSON.parse(JSON.stringify(serializeGame(newGame(modules, 1), modules, 0)));
    const g = loadGame(old, [...modules, extra as SimModule]);
    expect(g.game.modules.extra).toEqual({ n: 5 });
  });
  it('advance ejecuta los módulos en orden y por pasos de 1 s', () => {
    const all = [...modules, extra as SimModule];
    const g = newGame(all, 1);
    expect(advance(g, all, 3.9)).toBe(3);
    expect(g.game.resources.credits).toBe(3);
  });
  it('las ganancias offline tienen tope', () => {
    expect(offlineSeconds(0, 10_000, 3600)).toBe(10);
    expect(offlineSeconds(0, 10_000_000, 3600)).toBe(3600);
    expect(offlineSeconds(5000, 1000, 3600)).toBe(0);
  });
});
