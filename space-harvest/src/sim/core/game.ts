import { createClock, advance, type Clock } from './clock';
import type { GameModule } from './module';
import { Rng } from './rng';

export interface Game {
  clock: Clock;
  rng: Rng;
  /** Estado de cada módulo por id. */
  states: Record<string, unknown>;
}

export function createGame(mods: GameModule<any>[], seed: number): Game {
  const states: Record<string, unknown> = {};
  for (const m of mods) states[m.id] = m.init();
  return { clock: createClock(), rng: new Rng(seed), states };
}

/** Avanza el juego `seconds` (también sirve para las ganancias con el juego cerrado). */
export function advanceGame(game: Game, mods: GameModule<any>[], seconds: number): number {
  return advance(game.clock, seconds, (dt) => {
    for (const m of mods) m.step(game.states[m.id], dt);
  });
}
