import type { GameModule } from './module';

export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  savedAt: number;
  modules: Record<string, { version: number; data: unknown }>;
}

export type ModuleStates = Record<string, unknown>;

export function serializeGame(modules: GameModule<any>[], states: ModuleStates, savedAt: number): string {
  const out: SaveData = { version: SAVE_VERSION, savedAt, modules: {} };
  for (const m of modules) out.modules[m.id] = { version: m.version, data: m.serialize(states[m.id]) };
  return JSON.stringify(out);
}

/** Carga una partida; un módulo ausente o nuevo arranca con su valor por defecto (`init`). */
export function loadGame(modules: GameModule<any>[], json: string | null): { states: ModuleStates; savedAt: number | null } {
  const states: ModuleStates = {};
  let parsed: SaveData | null = null;
  try {
    parsed = json ? (JSON.parse(json) as SaveData) : null;
  } catch {
    parsed = null;
  }
  for (const m of modules) {
    const saved = parsed?.modules?.[m.id];
    states[m.id] = saved ? m.load(saved.data, saved.version) : m.init();
  }
  return { states, savedAt: parsed?.savedAt ?? null };
}
