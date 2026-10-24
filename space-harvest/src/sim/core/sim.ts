import { Rng } from './rng';
import type { GameState, SimModule } from './types';

export const SAVE_VERSION = 1;

export function createState(modules: SimModule[], seed = 1): GameState {
  const state: GameState = { time: 0, rng: new Rng(seed), resources: {}, modules: {} };
  for (const m of modules) state.modules[m.id] = m.init(state);
  return state;
}

export function step(state: GameState, modules: SimModule[], dt: number): void {
  for (const m of modules) m.step(state, dt);
  state.time += dt;
}

/** Ganancias con el juego cerrado: avanza en pasos de 1 s. */
export function advance(state: GameState, modules: SimModule[], seconds: number): void {
  let left = seconds;
  while (left >= 1) {
    step(state, modules, 1);
    left -= 1;
  }
  if (left > 0) step(state, modules, left);
}

export interface SaveData {
  version: number;
  time: number;
  rng: number;
  resources: Record<string, number>;
  modules: Record<string, { version: number; data: unknown }>;
}

export function serialize(state: GameState, modules: SimModule[]): SaveData {
  const mods: SaveData['modules'] = {};
  for (const m of modules) mods[m.id] = { version: m.version, data: m.serialize(state) };
  return { version: SAVE_VERSION, time: state.time, rng: state.rng.getState(), resources: { ...state.resources }, modules: mods };
}

/** Un módulo ausente en la partida carga con sus valores por defecto. */
export function load(save: SaveData, modules: SimModule[]): GameState {
  const state = createState(modules, 1);
  state.time = save.time ?? 0;
  state.rng.setState(save.rng ?? 1);
  state.resources = { ...(save.resources ?? {}) };
  for (const m of modules) {
    const saved = save.modules?.[m.id];
    m.load(state, saved?.data, saved?.version);
  }
  return state;
}
