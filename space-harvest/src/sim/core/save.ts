import type { Common } from './module';

/** Versión del contenedor de la partida (cada módulo lleva además la suya). */
export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  savedAt: number;
  common: Common;
  rng: number;
  modules: Record<string, { version: number; data: unknown }>;
}

/** Migraciones del contenedor: `migrations[n]` pasa de la versión n a n+1. */
const migrations: Record<number, (d: any) => any> = {};

/** Lee una partida guardada como texto. Devuelve null si está rota o es de una versión futura. */
export function parseSave(text: string): SaveData | null {
  let d: any;
  try {
    d = JSON.parse(text);
  } catch {
    return null;
  }
  if (!d || typeof d.version !== 'number' || d.version > SAVE_VERSION) return null;
  while (d.version < SAVE_VERSION) {
    const mig = migrations[d.version];
    if (!mig) return null;
    d = mig(d);
  }
  return {
    version: d.version,
    savedAt: Number(d.savedAt) || 0,
    common: { credits: 0, energy: 0, data: 0, ...(d.common ?? {}) },
    rng: Number(d.rng) >>> 0,
    modules: d.modules && typeof d.modules === 'object' ? d.modules : {},
  };
}

export function stringifySave(data: SaveData): string {
  return JSON.stringify(data);
}
