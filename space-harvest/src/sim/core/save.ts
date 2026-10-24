import type { Game, GameModule } from './types';

export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  time: number;
  rng: number;
  resources: Record<string, number>;
  modules: Record<string, { version: number; data: unknown }>;
}

export function serialize(game: Game, modules: GameModule[]): SaveData {
  const out: SaveData['modules'] = {};
  for (const m of modules) out[m.id] = { version: m.version, data: m.serialize(game.modules[m.id]) };
  return { version: SAVE_VERSION, time: game.time, rng: game.rng.state, resources: { ...game.resources }, modules: out };
}

/** Un módulo ausente en el guardado carga con sus valores por defecto: añadir módulos no rompe partidas. */
export function load(save: Partial<SaveData>, modules: GameModule[], newGameFn: (m: GameModule[]) => Game): Game {
  const game = newGameFn(modules);
  game.time = save.time ?? 0;
  if (typeof save.rng === 'number') game.rng.state = save.rng;
  game.resources = { ...game.resources, ...(save.resources ?? {}) };
  for (const m of modules) {
    const saved = save.modules?.[m.id];
    game.modules[m.id] = saved ? m.load(saved.data, saved.version) : m.init();
  }
  return game;
}
