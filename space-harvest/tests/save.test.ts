import { describe, expect, it } from 'vitest';
import { offlineSeconds, parseSave, serializeSave, SAVE_VERSION } from '../src/sim/core/save';
import { stepsFor } from '../src/sim/core/clock';

describe('guardado', () => {
  it('ida y vuelta', () => {
    const save = { version: SAVE_VERSION, savedAt: 10, rng: 3, clock: 99, modules: { core: { version: 1, data: { a: 1 } } } };
    expect(parseSave(serializeSave(save))).toEqual(save);
  });
  it('rechaza basura y versiones futuras; rellena lo que falta', () => {
    expect(parseSave('no es json')).toBeNull();
    expect(parseSave(JSON.stringify({ version: SAVE_VERSION + 1 }))).toBeNull();
    expect(parseSave(JSON.stringify({ version: 1 }))).toEqual({ version: 1, savedAt: 0, rng: 1, clock: 0, modules: {} });
  });
  it('ganancias sin conexión con tope', () => {
    expect(offlineSeconds(1000, 61000, 3600)).toBe(60);
    expect(offlineSeconds(1000, 1e12, 3600)).toBe(3600);
    expect(offlineSeconds(0, 5000, 3600)).toBe(0);
  });
  it('pasos enteros del reloj', () => {
    expect(stepsFor(3.9)).toBe(3);
    expect(stepsFor(-2)).toBe(0);
  });
});
