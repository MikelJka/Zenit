import type { GameModule } from './module';

export interface SaveFile {
  version: number;
  time: number;
  modules: Record<string, { version: number; data: unknown }>;
}

export const SAVE_VERSION = 1;

export type GameState = Record<string, unknown>;

export function initState(mods: GameModule[]): GameState {
  const state: GameState = {};
  for (const m of mods) state[m.id] = m.init();
  return state;
}

export function stepState(mods: GameModule[], state: GameState, dtMs: number): void {
  for (const m of mods) m.step(state[m.id], dtMs);
}

export function serializeState(mods: GameModule[], state: GameState, time: number): SaveFile {
  const out: SaveFile['modules'] = {};
  for (const m of mods) out[m.id] = { version: m.version, data: m.serialize(state[m.id]) };
  return { version: SAVE_VERSION, time, modules: out };
}

/** Un módulo ausente en el guardado arranca con su estado inicial. */
export function loadState(mods: GameModule[], save: SaveFile): GameState {
  const state: GameState = {};
  for (const m of mods) {
    const saved = save.modules[m.id];
    state[m.id] = saved ? m.load(saved.data, saved.version) : m.init();
  }
  return state;
}
