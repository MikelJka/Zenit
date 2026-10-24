export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  common: { credits: number };
  clock: { time: number; acc: number };
  rng: number;
  modules: Record<string, { version: number; data: unknown }>;
}

/** Migraciones del guardado general: `MIGRATIONS[n]` pasa de la versión n a la n+1. */
const MIGRATIONS: Record<number, (s: any) => any> = {};

export function migrateSave(raw: unknown): SaveData {
  if (typeof raw !== 'object' || raw === null) throw new Error('Partida no válida');
  let s = raw as any;
  let v = typeof s.version === 'number' ? s.version : 1;
  if (v > SAVE_VERSION) throw new Error(`Partida de una versión más nueva (${v})`);
  while (v < SAVE_VERSION) {
    s = MIGRATIONS[v](s);
    v++;
  }
  return { ...s, version: SAVE_VERSION, common: s.common ?? { credits: 0 }, modules: s.modules ?? {} };
}

const KEY = 'space-harvest-save';

export function saveToStorage(data: SaveData, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(KEY, JSON.stringify(data));
}

export function loadFromStorage(storage: Pick<Storage, 'getItem'> = localStorage): unknown | null {
  const txt = storage.getItem(KEY);
  return txt ? JSON.parse(txt) : null;
}
