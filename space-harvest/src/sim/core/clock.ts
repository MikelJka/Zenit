/** Reloj de simulación: el tiempo entra como parámetro, en pasos fijos de 1 s. */
export const STEP_SECONDS = 1;

/** Reparte `seconds` en pasos enteros de STEP_SECONDS y devuelve el resto para el siguiente avance. */
export function runSteps(seconds: number, carry: number, step: () => void): number {
  let pending = carry + Math.max(0, seconds);
  while (pending >= STEP_SECONDS) {
    step();
    pending -= STEP_SECONDS;
  }
  return pending;
}
