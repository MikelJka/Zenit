import type { Common } from './module';

export const SAVE_VERSION = 1;

export interface SaveFile {
  version: number;
  common: Common;
  time: number;
  rng: number;
  modules: Record<string, { version: number; data: unknown }>;
}

/** Sube una partida antigua a la versión actual. Añade un `case` por cada cambio de formato. */
export function migrateSave(raw: unknown): SaveFile {
  if (typeof raw !== 'object' || raw === null) throw new Error('Partida no válida');
  const file = raw as Partial<SaveFile>;
  const version = file.version ?? 0;
  if (version > SAVE_VERSION) throw new Error('Partida de una versión más nueva');
  return {
    version: SAVE_VERSION,
    common: { credits: 0, energy: 0, data: 0, ...file.common },
    time: file.time ?? 0,
    rng: file.rng ?? 1,
    modules: file.modules ?? {},
  };
}
