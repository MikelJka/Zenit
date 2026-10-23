/** Reloj de la simulación: el tiempo entra siempre como parámetro, nunca se lee del sistema. */
export const STEP_SECONDS = 0.25;
/** Tope de pasos por llamada para no bloquear el móvil al volver de una ausencia larga. */
export const MAX_STEPS_PER_ADVANCE = 20000;

export interface Clock {
  /** Segundos de juego transcurridos. */
  time: number;
  /** Segundos sobrantes que aún no completan un paso. */
  carry: number;
}

export function newClock(): Clock {
  return { time: 0, carry: 0 };
}

/**
 * Avanza el reloj `seconds` y llama a `onStep(dt)` por cada paso fijo.
 * Si hay más pasos que el tope, los pasos se agrandan para cubrir el mismo tiempo.
 */
export function advance(clock: Clock, seconds: number, onStep: (dt: number) => void): void {
  if (!(seconds > 0)) return;
  const total = clock.carry + seconds;
  let step = STEP_SECONDS;
  if (total / step > MAX_STEPS_PER_ADVANCE) step = total / MAX_STEPS_PER_ADVANCE;
  const n = Math.floor(total / step + 1e-9);
  for (let i = 0; i < n; i++) {
    onStep(step);
    clock.time += step;
  }
  clock.carry = Math.max(0, total - n * step);
}
