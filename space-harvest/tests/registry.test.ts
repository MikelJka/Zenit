import { describe, expect, it } from 'vitest';
import { modules, registerModule } from '../src/sim/registry';

describe('registro de módulos', () => {
  it('no admite ids repetidos', () => {
    const mod = { id: 'prueba', version: 1, init: () => ({}), step: () => {}, serialize: () => ({}), load: () => ({}) };
    registerModule(mod);
    expect(modules).toHaveLength(1);
    expect(() => registerModule(mod)).toThrow();
  });
});
