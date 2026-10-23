/** Partida guardada: JSON con versión por módulo (valor por defecto para lo nuevo, migración para lo viejo). */
export const SAVE_VERSION = 1;

export interface ModuleSave {
  version: number;
  data: unknown;
}

export interface SaveFile {
  version: number;
  /** Marca de tiempo (ms) del último guardado, para las ganancias con el juego cerrado. */
  savedAt: number;
  rng: number;
  clock: number;
  modules: Record<string, ModuleSave>;
}

export function serializeSave(save: SaveFile): string {
  return JSON.stringify(save);
}

/** Lee una partida; devuelve null si el texto no es una partida válida. */
export function parseSave(text: string): SaveFile | null {
  try {
    const raw = JSON.parse(text) as Partial<SaveFile>;
    if (typeof raw !== 'object' || raw === null) return null;
    if (typeof raw.version !== 'number' || raw.version > SAVE_VERSION) return null;
    return {
      version: SAVE_VERSION,
      savedAt: typeof raw.savedAt === 'number' ? raw.savedAt : 0,
      rng: typeof raw.rng === 'number' ? raw.rng : 1,
      clock: typeof raw.clock === 'number' ? raw.clock : 0,
      modules: typeof raw.modules === 'object' && raw.modules !== null ? raw.modules : {},
    };
  } catch {
    return null;
  }
}

/** Segundos a simular al abrir con la app cerrada, con tope. */
export function offlineSeconds(savedAt: number, now: number, capSeconds: number): number {
  if (!savedAt || now <= savedAt) return 0;
  return Math.min(capSeconds, (now - savedAt) / 1000);
}
