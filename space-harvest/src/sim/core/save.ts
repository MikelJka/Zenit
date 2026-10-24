import type { CommonResources } from './module';

export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  savedAt: number;
  resources: CommonResources;
  rngState: number;
  elapsedMs: number;
  modules: Record<string, { version: number; data: unknown }>;
}

/** Migraciones por versión: `MIGRATIONS[n]` convierte el formato n en el n+1. */
const MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {};

export function parseSave(json: string): SaveData {
  let raw = JSON.parse(json) as Record<string, unknown>;
  let version = typeof raw.version === 'number' ? raw.version : 0;
  if (version > SAVE_VERSION) throw new Error(`Partida de una versión más nueva (${version})`);
  while (version < SAVE_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) throw new Error(`Sin migración desde la versión ${version}`);
    raw = migrate(raw);
    version++;
    raw.version = version;
  }
  const res = (raw.resources ?? {}) as Partial<CommonResources>;
  return {
    version,
    savedAt: Number(raw.savedAt ?? 0),
    resources: { credits: res.credits ?? 0, energy: res.energy ?? 0 },
    rngState: Number(raw.rngState ?? 0),
    elapsedMs: Number(raw.elapsedMs ?? 0),
    modules: (raw.modules ?? {}) as SaveData['modules'],
  };
}
