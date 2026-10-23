import { SAVE_VERSION, type SaveData } from './game';

export const SAVE_KEY = 'space-harvest-save';

export function encodeSave(save: SaveData): string {
  return JSON.stringify(save);
}

/** Devuelve null si el texto no es una partida válida. Las versiones antiguas se migran aquí. */
export function decodeSave(text: string | null): SaveData | null {
  if (!text) return null;
  try {
    const raw = JSON.parse(text) as Partial<SaveData>;
    if (typeof raw.version !== 'number' || raw.version > SAVE_VERSION) return null;
    return {
      version: SAVE_VERSION,
      savedAt: raw.savedAt ?? 0,
      common: { ...{ credits: 0, energy: 0, data: 0 }, ...raw.common },
      rng: raw.rng ?? 1,
      modules: raw.modules ?? {},
    };
  } catch {
    return null;
  }
}

/** Segundos que pasaron con el juego cerrado, acotados a un máximo. */
export function offlineSeconds(savedAt: number, now: number, capSeconds: number): number {
  return Math.min(Math.max(0, (now - savedAt) / 1000), capSeconds);
}
