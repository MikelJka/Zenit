/** Reloj de la simulación: el tiempo entra como parámetro, en pasos fijos de 1 s. */
export const STEP_SECONDS = 1;

export interface Clock {
  /** Segundos de juego transcurridos. */
  time: number;
}

export function createClock(): Clock {
  return { time: 0 };
}

/** Avanza `seconds` llamando a `step` en pasos de 1 s (el resto fraccionario se descarta). */
export function advance(clock: Clock, seconds: number, step: (dt: number) => void): number {
  const steps = Math.max(0, Math.floor(seconds / STEP_SECONDS));
  for (let i = 0; i < steps; i++) {
    step(STEP_SECONDS);
    clock.time += STEP_SECONDS;
  }
  return steps;
}
