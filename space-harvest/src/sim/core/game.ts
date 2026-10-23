import { splitSteps, TICK_SECONDS } from './clock';
import type { CommonState, SimContext } from './module';
import { Rng } from './rng';
import type { ModuleRegistry } from '../registry';

export interface SaveData {
  version: number;
  savedAt: number;
  common: CommonState;
  rng: number;
  modules: Record<string, { version: number; data: unknown }>;
}

export const SAVE_VERSION = 1;

/** Estado completo de la partida y paso de simulación determinista. */
export class Game {
  common: CommonState = { credits: 0, energy: 0, data: 0 };
  rng: Rng;
  states = new Map<string, unknown>();
  private rest = 0;

  constructor(private registry: ModuleRegistry, seed: number) {
    this.rng = new Rng(seed);
    for (const m of registry.list()) this.states.set(m.id, m.init());
  }

  private ctx(): SimContext {
    return { common: this.common, rng: this.rng };
  }

  /** Avanza `dt` segundos en pasos fijos (también sirve para las ganancias con el juego cerrado). */
  advance(dt: number): void {
    const { steps, rest } = splitSteps(dt + this.rest);
    this.rest = rest;
    for (let i = 0; i < steps; i++) {
      for (const m of this.registry.list()) m.step(this.states.get(m.id), TICK_SECONDS, this.ctx());
    }
  }

  save(now: number): SaveData {
    const modules: SaveData['modules'] = {};
    for (const m of this.registry.list()) {
      modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) };
    }
    return { version: SAVE_VERSION, savedAt: now, common: { ...this.common }, rng: this.rng.getState(), modules };
  }

  /** Carga una partida; un módulo ausente o nuevo arranca con sus valores por defecto. */
  load(save: SaveData): void {
    this.common = { ...save.common };
    this.rng.setState(save.rng);
    for (const m of this.registry.list()) {
      const saved = save.modules[m.id];
      this.states.set(m.id, saved ? m.load(saved.data, saved.version) : m.init());
    }
  }
}
