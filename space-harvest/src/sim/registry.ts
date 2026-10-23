import { advance, newClock, type Clock } from './core/clock';
import type { SimModule } from './core/module';
import { RESOURCE_IDS, emptyResources, type Resources } from './core/resources';
import { Rng } from './core/rng';
import { SAVE_VERSION, decodeSave, encodeSave, type SaveData } from './core/save';

/** Módulos activos, en orden fijo de ejecución (así la simulación es determinista). */
export const MODULES: readonly SimModule<any>[] = [];

export interface Game {
  clock: Clock;
  rng: Rng;
  resources: Resources;
  states: Record<string, unknown>;
}

export function newGame(seed: number, modules: readonly SimModule<any>[] = MODULES): Game {
  const states: Record<string, unknown> = {};
  for (const m of modules) states[m.id] = m.init();
  return { clock: newClock(), rng: new Rng(seed), resources: emptyResources(), states };
}

/** Avanza la partida `seconds` (también sirve para las ganancias con el juego cerrado). */
export function step(game: Game, seconds: number, modules: readonly SimModule<any>[] = MODULES): void {
  const ctx = { resources: game.resources, rng: game.rng };
  advance(game.clock, seconds, (dt) => {
    for (const m of modules) m.step(game.states[m.id], ctx, dt);
  });
}

export function saveGame(game: Game, now: number, modules: readonly SimModule<any>[] = MODULES): string {
  const data: SaveData = {
    version: SAVE_VERSION,
    savedAt: now,
    time: game.clock.time,
    rngState: game.rng.getState(),
    resources: { ...game.resources },
    modules: {},
  };
  for (const m of modules) data.modules[m.id] = { version: m.version, data: m.serialize(game.states[m.id]) };
  return encodeSave(data);
}

/**
 * Carga una partida. Un módulo que no está en la partida toma su valor por defecto,
 * así añadir módulos nuevos no rompe partidas antiguas. Si el texto no es válido, parte de cero.
 */
export function loadGame(
  text: string | null | undefined,
  seed: number,
  modules: readonly SimModule<any>[] = MODULES,
): { game: Game; savedAt: number } {
  const save = decodeSave(text);
  const game = newGame(seed, modules);
  if (!save) return { game, savedAt: 0 };
  game.clock.time = save.time;
  game.rng.setState(save.rngState);
  for (const id of RESOURCE_IDS) {
    const v = save.resources[id];
    if (typeof v === 'number' && Number.isFinite(v)) game.resources[id] = v;
  }
  for (const m of modules) {
    const saved = save.modules[m.id];
    if (saved) game.states[m.id] = m.load(saved.data, saved.version);
  }
  return { game, savedAt: save.savedAt };
}
