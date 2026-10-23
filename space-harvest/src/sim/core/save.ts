import type { GameModule } from './module';
import { createState, type GameState } from './state';

export const SAVE_VERSION = 1;

interface SaveFile {
  version: number;
  time: number;
  savedAt: number;
  resources: GameState['resources'];
  rng: number;
  /** Datos y versión por módulo: añadir un módulo nunca rompe partidas antiguas. */
  modules: Record<string, { version: number; data: unknown }>;
}

export function serialize(state: GameState, active: GameModule[], savedAt: number): string {
  const mods: SaveFile['modules'] = {};
  for (const m of active) mods[m.id] = { version: m.version, data: m.serialize(state) };
  const file: SaveFile = {
    version: SAVE_VERSION,
    time: state.time,
    savedAt,
    resources: { ...state.resources },
    rng: state.rng.getState(),
    modules: mods,
  };
  return JSON.stringify(file);
}

/** Carga una partida; un módulo ausente se inicia con sus valores por defecto. */
export function load(json: string, active: GameModule[]): { state: GameState; savedAt: number } {
  const file = JSON.parse(json) as Partial<SaveFile>;
  const state = createState(0);
  state.time = file.time ?? 0;
  state.rng.setState(file.rng ?? 0);
  Object.assign(state.resources, file.resources);
  for (const m of active) {
    m.init(state);
    const saved = file.modules?.[m.id];
    if (saved) m.load(state, saved.data, saved.version);
  }
  return { state, savedAt: file.savedAt ?? 0 };
}
