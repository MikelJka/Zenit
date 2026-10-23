import type { Registry } from '../registry';
import { newState, type GameState } from './state';

/** Versión del formato general de la partida (los módulos llevan la suya). */
export const SAVE_VERSION = 1;

interface SaveFile {
  v: number;
  time: number;
  savedAt: number;
  rng: number;
  resources: Record<string, number>;
  modules: Record<string, { v: number; data: unknown }>;
}

export function serialize(state: GameState, registry: Registry, nowMs: number): string {
  const modules: SaveFile['modules'] = {};
  for (const m of registry.modules) modules[m.id] = { v: m.version, data: m.serialize(state) };
  const file: SaveFile = {
    v: SAVE_VERSION,
    time: state.time,
    savedAt: nowMs,
    rng: state.rng.getState(),
    resources: { ...state.resources },
    modules,
  };
  return JSON.stringify(file);
}

/**
 * Carga una partida. Un módulo ausente en el guardado recibe `undefined` (valores por defecto),
 * así añadir módulos nunca rompe partidas antiguas. Datos ilegibles dan una partida nueva.
 */
export function load(json: string | null, registry: Registry, seed: number): GameState {
  const state = newState(seed);
  registry.init(state);
  if (!json) return state;
  let file: Partial<SaveFile>;
  try {
    file = JSON.parse(json) as Partial<SaveFile>;
  } catch {
    return state;
  }
  if (typeof file !== 'object' || file === null) return state;
  state.time = Number(file.time) || 0;
  state.savedAt = Number(file.savedAt) || 0;
  if (typeof file.rng === 'number') state.rng.setState(file.rng);
  Object.assign(state.resources, file.resources ?? {});
  for (const m of registry.modules) {
    const saved = file.modules?.[m.id];
    m.load(state, saved?.data, saved?.v ?? 0);
  }
  return state;
}
