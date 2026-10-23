import { describe, expect, it } from 'vitest';
import { Game } from '../src/sim/core/game';
import type { SimModule } from '../src/sim/core/module';
import { decodeSave, encodeSave, offlineSeconds } from '../src/sim/core/save';
import { ModuleRegistry } from '../src/sim/registry';
import { splitSteps } from '../src/sim/core/clock';

const counter: SimModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, _dt, ctx) => { s.n++; ctx.common.credits += 1; },
  serialize: (s) => s,
  load: (d) => ({ n: (d as { n?: number } | null)?.n ?? 0 }),
};

function make(seed = 1, withModule = true): Game {
  const reg = new ModuleRegistry();
  if (withModule) reg.register(counter);
  return new Game(reg, seed);
}

describe('reloj', () => {
  it('divide en pasos fijos y conserva el resto', () => {
    const { steps, rest } = splitSteps(1.05);
    expect(steps).toBe(10);
    expect(rest).toBeCloseTo(0.05);
  });
});

describe('registro', () => {
  it('rechaza módulos duplicados', () => {
    const reg = new ModuleRegistry();
    reg.register(counter);
    expect(() => reg.register(counter)).toThrow();
  });
});

describe('Game', () => {
  it('avanza en pasos fijos', () => {
    const g = make();
    g.advance(1);
    expect(g.common.credits).toBe(10);
  });
  it('guardar y cargar conserva el estado', () => {
    const g = make();
    g.advance(2);
    const text = encodeSave(g.save(1000));
    const h = make(5);
    h.load(decodeSave(text)!);
    expect(h.common.credits).toBe(g.common.credits);
    expect(h.states.get('counter')).toEqual({ n: 20 });
  });
  it('una partida antigua sin el módulo carga con valores por defecto', () => {
    const g = make(1, false);
    g.advance(1);
    const h = make();
    h.load(decodeSave(encodeSave(g.save(0)))!);
    expect(h.states.get('counter')).toEqual({ n: 0 });
  });
  it('rechaza guardados corruptos o de versión futura', () => {
    expect(decodeSave('no es json')).toBeNull();
    expect(decodeSave(null)).toBeNull();
    expect(decodeSave(JSON.stringify({ version: 999 }))).toBeNull();
  });
});

describe('offline', () => {
  it('acota las ganancias con el juego cerrado', () => {
    expect(offlineSeconds(0, 10_000, 3600)).toBe(10);
    expect(offlineSeconds(0, 10_000_000, 3600)).toBe(3600);
    expect(offlineSeconds(5000, 1000, 3600)).toBe(0);
  });
});
