import { createClock } from './clock';
import type { Game } from './game';
import type { GameModule } from './module';
import { Rng } from './rng';

export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  time: number;
  rng: number;
  modules: Record<string, { version: number; data: unknown }>;
}

export function serializeGame(game: Game, mods: GameModule<any>[]): SaveData {
  const out: SaveData['modules'] = {};
  for (const m of mods) out[m.id] = { version: m.version, data: m.serialize(game.states[m.id]) };
  return { version: SAVE_VERSION, time: game.clock.time, rng: game.rng.getState(), modules: out };
}

/** Un módulo ausente en la partida carga con sus valores por defecto: añadir módulos no rompe partidas. */
export function loadGame(save: SaveData, mods: GameModule<any>[]): Game {
  const clock = createClock();
  clock.time = save.time;
  const rng = new Rng(0);
  rng.setState(save.rng);
  const states: Record<string, unknown> = {};
  for (const m of mods) {
    const saved = save.modules[m.id];
    states[m.id] = saved ? m.load(saved.data, saved.version) : m.load(undefined, m.version);
  }
  return { clock, rng, states };
}
