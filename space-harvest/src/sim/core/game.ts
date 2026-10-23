import { advance, createClock, type Clock } from './clock';
import type { GameModule } from './module';
import { loadGame, serializeGame, type ModuleStates } from './save';

export class Game {
  readonly clock: Clock = createClock();
  states: ModuleStates;

  constructor(private modules: GameModule<any>[], saveJson: string | null = null) {
    this.states = loadGame(modules, saveJson).states;
  }

  /** Avanza `seconds` de juego (sirve igual para el bucle normal y para las ganancias con el juego cerrado). */
  tick(seconds: number): number {
    return advance(this.clock, seconds, (dt) => {
      for (const m of this.modules) m.step(this.states[m.id], dt);
    });
  }

  save(now: number): string {
    return serializeGame(this.modules, this.states, now);
  }
}
