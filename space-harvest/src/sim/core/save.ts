import type { Game } from './game';
import { Rng } from './rng';
import type { GameModule } from './module';

export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  savedAt: number;
  rng: number;
  credits: number;
  /** Cada módulo guarda su propia versión. */
  modules: Record<string, { version: number; data: unknown }>;
}

export function saveGame(game: Game, nowMs: number): SaveData {
  const mods: SaveData['modules'] = {};
  for (const m of game.modules) mods[m.id] = { version: m.version, data: m.serialize(game.states[m.id]) };
  return { version: SAVE_VERSION, savedAt: nowMs, rng: game.rng.getState(), credits: game.common.credits, modules: mods };
}

/** Carga una partida; lo que falte (módulos nuevos, campos nuevos) toma su valor por defecto. */
export function loadGame(modules: GameModule[], data: unknown, seed: number, nowMs: number): Game {
  const d = (data ?? {}) as Partial<SaveData>;
  const rng = new Rng(seed);
  if (typeof d.rng === 'number') rng.setState(d.rng);
  const states: Record<string, unknown> = {};
  for (const m of modules) {
    const saved = d.modules?.[m.id];
    states[m.id] = saved ? m.load(saved.data, saved.version) : m.init();
  }
  return {
    common: { credits: typeof d.credits === 'number' ? d.credits : 0 },
    rng,
    modules,
    states,
    savedAt: typeof d.savedAt === 'number' ? d.savedAt : nowMs,
  };
}
