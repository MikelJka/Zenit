import { advanceFixed } from './clock';
import type { CoreState, GameModule } from './module';
import { Rng } from './rng';

export interface Game {
  core: CoreState;
  /** Estado propio de cada módulo, por id. */
  own: Record<string, unknown>;
  /** Segundos que sobran de un paso entero. */
  carry: number;
}

export function newGame(mods: GameModule<any>[], seed: number): Game {
  const core: CoreState = { time: 0, credits: 0, rng: new Rng(seed) };
  const own: Record<string, unknown> = {};
  for (const m of mods) own[m.id] = m.init(core);
  return { core, own, carry: 0 };
}

/** Avanza la partida `seconds` segundos (también sirve para las ganancias con el juego cerrado). */
export function advance(game: Game, mods: GameModule<any>[], seconds: number, maxSteps?: number): void {
  game.carry = advanceFixed(seconds, game.carry, (dt) => {
    game.core.time += dt;
    for (const m of mods) m.step(game.core, game.own[m.id], dt);
  }, maxSteps);
}
