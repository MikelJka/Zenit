import { Rng } from './rng';

/** Recursos comunes a todos los módulos. */
export interface CommonResources {
  credits: number;
}

/**
 * Estado de la partida. El núcleo es común; cada módulo guarda lo suyo en `modules[id]`
 * y solo toca ahí y en `resources`.
 */
export interface GameState {
  /** Segundos de juego simulados desde el inicio. */
  time: number;
  resources: CommonResources;
  rng: Rng;
  modules: Record<string, unknown>;
}

export function createState(seed: number): GameState {
  return { time: 0, resources: { credits: 0 }, rng: new Rng(seed), modules: {} };
}
