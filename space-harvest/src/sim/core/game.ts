import { Rng } from './rng';
import type { GameState, SimModule } from './types';

export const SAVE_VERSION = 1;

export function newGame(modules: SimModule[], seed: number): GameState {
  const state: GameState = {
    time: 0,
    resources: { credits: 0, energy: 0, data: 0 },
    rng: new Rng(seed),
    modules: {},
  };
  for (const m of modules) state.modules[m.id] = m.init();
  return state;
}

/** Avanza la simulación `seconds` en pasos fijos; sirve igual para el juego abierto, las ganancias con el juego cerrado y los tests. */
export function advance(state: GameState, modules: SimModule[], seconds: number, stepSize = 0.25): void {
  let left = seconds;
  while (left > 1e-9) {
    const dt = Math.min(stepSize, left);
    for (const m of modules) m.step(state, state.modules[m.id], dt);
    state.time += dt;
    left -= dt;
  }
}

export interface SaveFile {
  version: number;
  time: number;
  resources: GameState['resources'];
  rng: number;
  modules: Record<string, { version: number; data: unknown }>;
}

export function save(state: GameState, modules: SimModule[]): string {
  const file: SaveFile = {
    version: SAVE_VERSION,
    time: state.time,
    resources: { ...state.resources },
    rng: state.rng.getState(),
    modules: {},
  };
  for (const m of modules) file.modules[m.id] = { version: m.version, data: m.serialize(state.modules[m.id]) };
  return JSON.stringify(file);
}

/** Carga una partida; lo que falte toma su valor por defecto, para no romper partidas antiguas. */
export function load(json: string, modules: SimModule[], seed = 1): GameState {
  const file = JSON.parse(json) as Partial<SaveFile>;
  const state = newGame(modules, seed);
  state.time = file.time ?? 0;
  state.resources = { ...state.resources, ...file.resources };
  if (typeof file.rng === 'number') state.rng.setState(file.rng);
  for (const m of modules) {
    const saved = file.modules?.[m.id];
    if (saved) state.modules[m.id] = m.load(saved.data, saved.version);
  }
  return state;
}
