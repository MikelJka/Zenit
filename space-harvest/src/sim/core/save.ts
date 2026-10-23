/** Partida guardada: JSON con versión global y versión por módulo. */
export const SAVE_VERSION = 1;

export interface SavedModule {
  version: number;
  data: unknown;
}

export interface SaveData {
  version: number;
  /** Marca de tiempo (ms) del guardado, para calcular las ganancias con el juego cerrado. */
  savedAt: number;
  time: number;
  rngState: number;
  resources: Record<string, number>;
  modules: Record<string, SavedModule>;
}

export function encodeSave(save: SaveData): string {
  return JSON.stringify(save);
}

/** Devuelve la partida o `null` si el texto no es una partida válida o es de una versión futura. */
export function decodeSave(text: string | null | undefined): SaveData | null {
  if (!text) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.version !== 'number' || r.version > SAVE_VERSION) return null;
  return {
    version: SAVE_VERSION,
    savedAt: typeof r.savedAt === 'number' ? r.savedAt : 0,
    time: typeof r.time === 'number' ? r.time : 0,
    rngState: typeof r.rngState === 'number' ? r.rngState : 1,
    resources: isRecord(r.resources) ? (r.resources as Record<string, number>) : {},
    modules: isRecord(r.modules) ? (r.modules as Record<string, SavedModule>) : {},
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
