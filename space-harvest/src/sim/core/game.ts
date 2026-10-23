import { STEP_SECONDS, stepsFor } from './clock';
import type { CommonState, GameModule } from './module';
import { Rng } from './rng';
import { loadGame, saveGame, type SaveData } from './save';

export interface Game {
  common: CommonState;
  rng: Rng;
  modules: GameModule[];
  states: Record<string, unknown>;
  savedAt: number;
}

export function newGame(modules: GameModule[], seed: number, nowMs: number): Game {
  const states: Record<string, unknown> = {};
  for (const m of modules) states[m.id] = m.init();
  return { common: { credits: 0 }, rng: new Rng(seed), modules, states, savedAt: nowMs };
}

/** Avanza `seconds` de simulación en pasos fijos; sirve igual para jugar y para las ganancias offline. */
export function advance(game: Game, seconds: number): void {
  const n = stepsFor(seconds);
  for (let i = 0; i < n; i++) {
    for (const m of game.modules) m.step(game.states[m.id], STEP_SECONDS, game.common);
  }
}

export function save(game: Game, nowMs: number): SaveData {
  return saveGame(game, nowMs);
}

export function load(modules: GameModule[], data: unknown, seed: number, nowMs: number): Game {
  return loadGame(modules, data, seed, nowMs);
}
