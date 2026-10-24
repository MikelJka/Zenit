import type { Game } from './game';
import type { CoreState, GameModule } from './module';
import { Rng } from './rng';

/** Versión del formato general de la partida. Súbela y añade migración si cambia `core`. */
export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  savedAt: number;
  core: { time: number; credits: number; rng: number };
  carry: number;
  modules: Record<string, { version: number; data: unknown }>;
}

export function serialize(game: Game, mods: GameModule<any>[], now: number): SaveData {
  const modulesData: SaveData['modules'] = {};
  for (const m of mods) modulesData[m.id] = { version: m.version, data: m.serialize(game.own[m.id]) };
  return {
    version: SAVE_VERSION,
    savedAt: now,
    core: { time: game.core.time, credits: game.core.credits, rng: game.core.rng.state },
    carry: game.carry,
    modules: modulesData,
  };
}

/** Carga una partida; un módulo ausente en el guardado se carga con sus valores por defecto. */
export function load(save: SaveData, mods: GameModule<any>[]): Game {
  const core: CoreState = {
    time: save.core.time ?? 0,
    credits: save.core.credits ?? 0,
    rng: new Rng(save.core.rng ?? 1),
  };
  const own: Record<string, unknown> = {};
  for (const m of mods) {
    const saved = save.modules?.[m.id];
    own[m.id] = m.load(core, saved?.data, saved?.version);
  }
  return { core, own, carry: save.carry ?? 0 };
}
