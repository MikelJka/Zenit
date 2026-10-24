import { Rng } from './rng';
import type { Game, GameModule } from './types';

export const STEP_SECONDS = 1;

export function newGame(modules: GameModule[], seed = 1): Game {
  const game: Game = { time: 0, rng: new Rng(seed), resources: { credits: 0 }, modules: {} };
  for (const m of modules) game.modules[m.id] = m.init();
  return game;
}

/** Avanza `seconds` en pasos de 1 s (también para las ganancias con el juego cerrado). */
export function advance(game: Game, modules: GameModule[], seconds: number): void {
  let left = seconds;
  while (left > 0) {
    const dt = Math.min(STEP_SECONDS, left);
    for (const m of modules) m.step(game.modules[m.id], dt, game);
    game.time += dt;
    left -= dt;
  }
}
