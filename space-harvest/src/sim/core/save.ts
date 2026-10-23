import type { GameState, SimModule } from './module';
import { Rng } from './rng';
import { createClock, type Clock } from './clock';

export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  savedAt: number;
  clock: Clock;
  rngState: number;
  resources: Record<string, number>;
  modules: Record<string, { version: number; data: unknown }>;
}

export interface Game {
  game: GameState;
  clock: Clock;
}

export function newGame(modules: readonly SimModule[], seed: number): Game {
  const game: GameState = { rng: new Rng(seed), resources: {}, modules: {} };
  for (const m of modules) game.modules[m.id] = m.init(game);
  return { game, clock: createClock() };
}

export function serializeGame(g: Game, modules: readonly SimModule[], savedAt: number): SaveData {
  const mods: SaveData['modules'] = {};
  for (const m of modules) mods[m.id] = { version: m.version, data: m.serialize(g.game.modules[m.id]) };
  return {
    version: SAVE_VERSION,
    savedAt,
    clock: { ...g.clock },
    rngState: g.game.rng.state,
    resources: { ...g.game.resources },
    modules: mods,
  };
}

/** Carga una partida. Un módulo ausente en el guardado se crea con sus valores por defecto: añadir módulos nunca rompe partidas. */
export function loadGame(save: Partial<SaveData>, modules: readonly SimModule[]): Game {
  const game: GameState = { rng: new Rng(0), resources: { ...save.resources }, modules: {} };
  if (typeof save.rngState === 'number') game.rng.state = save.rngState;
  for (const m of modules) {
    const saved = save.modules?.[m.id];
    game.modules[m.id] = saved ? m.load(saved.data, saved.version) : m.init(game);
  }
  const clock = createClock();
  if (save.clock) {
    clock.time = Number(save.clock.time) || 0;
    clock.carry = Number(save.clock.carry) || 0;
  }
  return { game, clock };
}
