export interface SaveFile {
  version: number;
  savedAt: number;
  /** Datos y versión de cada módulo, por id. */
  modules: Record<string, { version: number; data: unknown }>;
}

export const SAVE_VERSION = 1;

export function encodeSave(save: SaveFile): string {
  return JSON.stringify(save);
}

/** Devuelve null si el texto no es una partida válida; nunca lanza. */
export function decodeSave(text: string): SaveFile | null {
  try {
    const raw = JSON.parse(text) as Partial<SaveFile>;
    if (typeof raw.version !== 'number' || typeof raw.modules !== 'object' || raw.modules === null) return null;
    return { version: raw.version, savedAt: Number(raw.savedAt) || 0, modules: raw.modules };
  } catch {
    return null;
  }
}
