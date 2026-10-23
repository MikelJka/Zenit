import type { SimModule } from './module';
import { newGame, type GameState } from './game';
import { Rng } from './rng';

export const SAVE_VERSION = 1;

interface SaveFile {
  version: number;
  savedAt: number;
  time: number;
  common: GameState['common'];
  rng: number;
  modules: Record<string, { version: number; data: unknown }>;
}

export function serialize(state: GameState, modules: SimModule<any>[], now: number): string {
  const mods: SaveFile['modules'] = {};
  for (const m of modules) {
    mods[m.id] = { version: m.version, data: m.serialize(state.modules[m.id]) };
  }
  const file: SaveFile = {
    version: SAVE_VERSION,
    savedAt: now,
    time: state.time,
    common: state.common,
    rng: state.rng.getState(),
    modules: mods,
  };
  return JSON.stringify(file);
}

/**
 * Carga una partida. Un módulo ausente en el guardado arranca con valores por defecto,
 * así añadir un módulo nunca rompe partidas antiguas. Devuelve también `savedAt`
 * para calcular las ganancias con el juego cerrado.
 */
export function load(
  json: string,
  modules: SimModule<any>[],
): { state: GameState; savedAt: number } {
  const file = JSON.parse(json) as Partial<SaveFile>;
  const state = newGame(modules);
  state.common = { ...state.common, ...file.common };
  state.time = file.time ?? 0;
  if (typeof file.rng === 'number') state.rng = new Rng(file.rng);
  for (const m of modules) {
    const saved = file.modules?.[m.id];
    if (saved) state.modules[m.id] = m.load(saved.data, saved.version);
  }
  return { state, savedAt: file.savedAt ?? 0 };
}
