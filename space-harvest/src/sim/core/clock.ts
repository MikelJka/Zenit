/** Reloj de la simulación: el tiempo entra como parámetro, nunca se lee Date.now() aquí dentro. */
export const STEP_SECONDS = 1;

export interface Clock {
  /** Segundos de juego transcurridos. */
  time: number;
  /** Segundos sobrantes que aún no completan un paso. */
  carry: number;
}

export function createClock(): Clock {
  return { time: 0, carry: 0 };
}

/** Avanza el reloj `seconds` y llama a `onStep(STEP_SECONDS)` por cada paso completo. Devuelve los pasos dados. */
export function tick(clock: Clock, seconds: number, onStep: (dt: number) => void): number {
  if (!(seconds > 0)) return 0;
  clock.carry += seconds;
  let steps = 0;
  while (clock.carry >= STEP_SECONDS) {
    clock.carry -= STEP_SECONDS;
    clock.time += STEP_SECONDS;
    onStep(STEP_SECONDS);
    steps++;
  }
  return steps;
}
