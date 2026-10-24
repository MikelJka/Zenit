import type { SimModule } from './module';
import { createState, type GameState } from './state';

/** Versión del formato del núcleo del guardado. */
export const SAVE_VERSION = 1;

export interface SaveFile {
  v: number;
  /** Marca de tiempo (ms) del guardado, para calcular las ganancias con el juego cerrado. */
  savedAt: number;
  time: number;
  credits: number;
  rng: number;
  modules: Record<string, { v: number; data: unknown }>;
}

export function serialize(state: GameState, modules: SimModule[], now: number): string {
  const file: SaveFile = {
    v: SAVE_VERSION,
    savedAt: now,
    time: state.time,
    credits: state.resources.credits,
    rng: state.rng.getState(),
    modules: {},
  };
  for (const m of modules) file.modules[m.id] = { v: m.version, data: m.serialize(state) };
  return JSON.stringify(file);
}

/**
 * Carga una partida. Un módulo ausente en el guardado arranca con `init` (valores por defecto),
 * así añadir un módulo nunca rompe partidas antiguas. Devuelve null si el texto no es un guardado válido.
 */
export function load(
  text: string,
  modules: SimModule[],
): { state: GameState; savedAt: number } | null {
  let file: SaveFile;
  try {
    file = JSON.parse(text) as SaveFile;
  } catch {
    return null;
  }
  if (!file || typeof file !== 'object' || typeof file.v !== 'number' || file.v > SAVE_VERSION) return null;
  const state = createState(0);
  state.time = Number(file.time) || 0;
  state.resources.credits = Number(file.credits) || 0;
  state.rng.setState(Number(file.rng) || 0);
  for (const m of modules) {
    const saved = file.modules?.[m.id];
    if (saved) m.load(state, saved.data, saved.v);
    else m.init(state);
  }
  return { state, savedAt: Number(file.savedAt) || 0 };
}
