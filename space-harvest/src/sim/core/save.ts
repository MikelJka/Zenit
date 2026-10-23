import { Rng } from './rng';
import { newState } from './state';
import type { GameState, SimModule } from './types';

export const SAVE_VERSION = 1;

interface SaveFile {
  version: number;
  savedAt: number;
  time: number;
  rng: number;
  resources: GameState['resources'];
  modules: Record<string, { version: number; data: unknown }>;
}

export function serialize(state: GameState, modules: SimModule[], nowMs: number): string {
  const mods: SaveFile['modules'] = {};
  for (const m of modules) mods[m.id] = { version: m.version, data: m.serialize(state) };
  const file: SaveFile = {
    version: SAVE_VERSION,
    savedAt: nowMs,
    time: state.time,
    rng: state.rng.getState(),
    resources: state.resources,
    modules: mods,
  };
  return JSON.stringify(file);
}

/** Carga una partida; un módulo ausente en el guardado arranca con sus valores por defecto. */
export function load(json: string | null, modules: SimModule[], seed: number): { state: GameState; savedAt: number | null } {
  const state = newState(seed);
  let file: Partial<SaveFile> | null = null;
  try {
    file = json ? (JSON.parse(json) as Partial<SaveFile>) : null;
  } catch {
    file = null;
  }
  if (file) {
    state.time = Number(file.time) || 0;
    if (typeof file.rng === 'number') state.rng = new Rng(file.rng);
    Object.assign(state.resources, file.resources ?? {});
  }
  for (const m of modules) {
    m.init(state);
    const saved = file?.modules?.[m.id];
    if (saved) m.load(state, saved.data, saved.version);
  }
  return { state, savedAt: file && typeof file.savedAt === 'number' ? file.savedAt : null };
}
