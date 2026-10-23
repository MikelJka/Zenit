import type { GameModule, GameState } from './module';
import { Rng } from './rng';

export const SAVE_VERSION = 1;

interface SaveFile {
  version: number;
  time: number;
  credits: number;
  rng: number;
  modules: Record<string, { v: number; data: unknown }>;
}

export function serialize(state: GameState, modules: GameModule[]): string {
  const mods: SaveFile['modules'] = {};
  for (const m of modules) mods[m.id] = { v: m.version, data: m.serialize(state.modules[m.id]) };
  const file: SaveFile = { version: SAVE_VERSION, time: state.time, credits: state.credits, rng: state.rng.state, modules: mods };
  return JSON.stringify(file);
}

/** Un módulo ausente en la partida carga con sus valores por defecto: añadir módulos no rompe partidas antiguas. */
export function load(json: string, modules: GameModule[]): GameState {
  const f = JSON.parse(json) as Partial<SaveFile>;
  const state: GameState = {
    time: f.time ?? 0,
    credits: f.credits ?? 0,
    rng: new Rng(f.rng ?? 1),
    modules: {},
  };
  for (const m of modules) {
    const saved = f.modules?.[m.id];
    state.modules[m.id] = saved ? m.load(saved.data, saved.v) : m.init(state);
  }
  return state;
}
