import { STEP_SECONDS } from './core/clock';
import type { GameState, SimModule } from './core/module';
import { Rng } from './core/rng';

export interface Game extends GameState {
  /** Módulos activos, en el orden fijo de ejecución. */
  list: SimModule[];
}

export function createGame(list: SimModule[], seed: number): Game {
  const game: Game = { clock: { time: 0 }, rng: new Rng(seed), resources: {}, modules: {}, list };
  for (const m of list) game.modules[m.id] = m.init(game);
  return game;
}

/** Avanza la simulación `seconds` segundos en pasos de 1 s (sirve igual para el juego abierto y para las ganancias offline). */
export function advance(game: Game, seconds: number): void {
  let left = seconds;
  while (left > 0) {
    const dt = Math.min(STEP_SECONDS, left);
    for (const m of game.list) m.step(game, game.modules[m.id], dt);
    game.clock.time += dt;
    left -= dt;
  }
}
