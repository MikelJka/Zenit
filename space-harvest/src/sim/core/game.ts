import { runSteps, STEP_SECONDS } from './clock';
import type { GameModule } from './module';
import { newState, type GameState } from './state';
import { Rng } from './rng';

export const SAVE_VERSION = 1;

interface SaveFile {
  version: number;
  time: number;
  resources: Record<string, number>;
  rng: number;
  modules: Record<string, { version: number; data: unknown }>;
}

export class Game {
  state: GameState;
  private carry = 0;

  constructor(
    readonly modules: GameModule[],
    seed: number,
  ) {
    this.state = newState(seed);
    for (const m of modules) this.state.modules[m.id] = m.init(this.state);
  }

  /** Avanza `seconds` segundos de juego (también sirve para las ganancias con el juego cerrado). */
  advance(seconds: number): void {
    this.carry = runSteps(seconds, this.carry, () => {
      for (const m of this.modules) m.step(this.state, this.state.modules[m.id], STEP_SECONDS);
      this.state.time += STEP_SECONDS;
    });
  }

  serialize(): string {
    const modules: SaveFile['modules'] = {};
    for (const m of this.modules) {
      modules[m.id] = { version: m.version, data: m.serialize(this.state.modules[m.id]) };
    }
    const file: SaveFile = {
      version: SAVE_VERSION,
      time: this.state.time,
      resources: this.state.resources,
      rng: this.state.rng.state,
      modules,
    };
    return JSON.stringify(file);
  }

  /** Carga una partida; un módulo ausente en el guardado arranca con sus valores por defecto. */
  static load(modules: GameModule[], json: string): Game {
    const file = JSON.parse(json) as Partial<SaveFile>;
    const game = new Game(modules, 0);
    game.state.time = file.time ?? 0;
    game.state.resources = { ...game.state.resources, ...file.resources };
    game.state.rng = new Rng(file.rng ?? 0);
    for (const m of modules) {
      const saved = file.modules?.[m.id];
      game.state.modules[m.id] = m.load(game.state, saved?.data, saved?.version ?? 0);
    }
    return game;
  }
}
