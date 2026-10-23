import type { Game } from '../registry';

export const SAVE_VERSION = 1;

interface SaveFile {
  v: number;
  time: number;
  rng: number;
  resources: Record<string, number>;
  modules: Record<string, { v: number; data: unknown }>;
}

export function serializeGame(game: Game): string {
  const modules: SaveFile['modules'] = {};
  for (const m of game.list) modules[m.id] = { v: m.version, data: m.serialize(game.modules[m.id]) };
  const file: SaveFile = { v: SAVE_VERSION, time: game.clock.time, rng: game.rng.getState(), resources: game.resources, modules };
  return JSON.stringify(file);
}

/** Carga una partida en `game` (recién creado). Un módulo ausente del guardado conserva su estado inicial. */
export function loadGame(game: Game, json: string): void {
  const file = JSON.parse(json) as SaveFile;
  game.clock.time = file.time ?? 0;
  game.rng.setState(file.rng ?? 1);
  game.resources = { ...file.resources };
  for (const m of game.list) {
    const saved = file.modules?.[m.id];
    if (saved) game.modules[m.id] = m.load(saved.data, saved.v, game);
  }
}
