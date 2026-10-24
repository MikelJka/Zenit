/** Reloj de la simulación: el tiempo entra como parámetro, nunca se lee del sistema. */
export const TICK_SECONDS = 0.1;

export interface Clock {
  /** Segundos de juego acumulados. */
  time: number;
  /** Resto de tiempo que aún no llega a un tick completo. */
  pending: number;
}

export function createClock(): Clock {
  return { time: 0, pending: 0 };
}

/** Avanza `dt` segundos y devuelve cuántos ticks hay que ejecutar. */
export function advance(clock: Clock, dt: number): number {
  clock.pending += Math.max(0, dt);
  const ticks = Math.floor(clock.pending / TICK_SECONDS + 1e-9);
  clock.pending -= ticks * TICK_SECONDS;
  clock.time += ticks * TICK_SECONDS;
  return ticks;
}
