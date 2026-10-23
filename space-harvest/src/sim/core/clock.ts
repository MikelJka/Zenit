/** Reloj de la simulación: el tiempo entra como parámetro, nunca se lee del sistema. */
export const STEP_SECONDS = 1;

export interface Clock {
  /** Segundos de juego acumulados. */
  time: number;
}

export function createClock(): Clock {
  return { time: 0 };
}

/** Ejecuta `step` una vez por cada paso fijo contenido en `seconds` y devuelve el resto sin gastar. */
export function advance(clock: Clock, seconds: number, step: (dt: number) => void): number {
  let left = seconds;
  while (left >= STEP_SECONDS) {
    step(STEP_SECONDS);
    clock.time += STEP_SECONDS;
    left -= STEP_SECONDS;
  }
  return left;
}
