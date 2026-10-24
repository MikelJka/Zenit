import type { Registry } from '../registry';

export const SAVE_VERSION = 1;

export interface SaveFile {
  version: number;
  savedAt: number;
  time: number;
  rng: number;
  modules: Record<string, { version: number; data: unknown }>;
}

export type States = Record<string, unknown>;

export function initStates(registry: Registry): States {
  const states: States = {};
  for (const m of registry.all()) states[m.id] = m.init();
  return states;
}

export function save(registry: Registry, states: States, time: number, rng: number, nowMs: number): string {
  const modules: SaveFile['modules'] = {};
  for (const m of registry.all()) {
    modules[m.id] = { version: m.version, data: m.serialize(states[m.id]) };
  }
  const file: SaveFile = { version: SAVE_VERSION, savedAt: nowMs, time, rng, modules };
  return JSON.stringify(file);
}

/** Carga una partida; un módulo ausente arranca con sus valores por defecto, así añadir módulos no rompe partidas antiguas. */
export function load(registry: Registry, json: string): { states: States; time: number; rng: number; savedAt: number } {
  const file = JSON.parse(json) as SaveFile;
  const states: States = {};
  for (const m of registry.all()) {
    const entry = file.modules?.[m.id];
    states[m.id] = entry ? m.load(entry.data, entry.version) : m.load(undefined, 0);
  }
  return { states, time: file.time ?? 0, rng: file.rng ?? 1, savedAt: file.savedAt ?? 0 };
}
