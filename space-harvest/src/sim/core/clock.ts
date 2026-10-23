/** Reloj de simulación: el tiempo entra como parámetro, nunca se lee del sistema. */
export const STEP_SECONDS = 1;

export interface ClockState {
  /** Segundos de juego transcurridos. */
  time: number;
}

export function newClock(): ClockState {
  return { time: 0 };
}

/** Pasos enteros que caben en `seconds` (el resto se descarta). */
export function stepsFor(seconds: number): number {
  return Math.max(0, Math.floor(seconds / STEP_SECONDS));
}
