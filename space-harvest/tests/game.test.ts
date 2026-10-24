import { describe, expect, it } from 'vitest';
import { advance, createClock } from '../src/sim/core/clock';
import { Game } from '../src/sim/core/game';
import { migrateSave, SAVE_VERSION } from '../src/sim/core/save';
import { activeModules } from '../src/sim/registry';

describe('reloj', () => {
  it('acumula el resto entre llamadas', () => {
    const c = createClock();
    expect(advance(c, 0.25)).toBe(2);
    expect(advance(c, 0.05)).toBe(1);
  });
});

describe('guardado', () => {
  it('guarda y carga sin perder nada', () => {
    const g = new Game(activeModules, 9);
    g.common.credits = 12;
    g.update(5);
    const raw = JSON.parse(JSON.stringify(g.save()));
    const h = new Game(activeModules);
    h.load(raw);
    expect(h.save()).toEqual(g.save());
  });
  it('una partida antigua sin campos recibe valores por defecto', () => {
    const f = migrateSave({});
    expect(f.version).toBe(SAVE_VERSION);
    expect(f.common.credits).toBe(0);
  });
  it('rechaza partidas de una versión más nueva', () => {
    expect(() => migrateSave({ version: SAVE_VERSION + 1 })).toThrow();
  });
});

describe('determinismo', () => {
  it('dos partidas con la misma semilla acaban igual', () => {
    const a = new Game(activeModules, 3);
    const b = new Game(activeModules, 3);
    a.update(100);
    b.update(100);
    expect(a.save()).toEqual(b.save());
  });
});
