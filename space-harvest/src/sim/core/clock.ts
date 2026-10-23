/** Reloj de la simulación: el tiempo entra como parámetro, nunca se lee de Date. */
export const TICK_SECONDS = 0.1;

export interface Clock {
  /** Segundos de juego acumulados. */
  time: number;
}

/** Divide un intervalo en pasos fijos; devuelve cuántos pasos completos caben y el resto. */
export function splitSteps(dt: number, tick = TICK_SECONDS): { steps: number; rest: number } {
  const steps = Math.floor(dt / tick);
  return { steps, rest: dt - steps * tick };
}
