/** Reloj de simulación: el tiempo entra como parámetro y avanza en pasos fijos de 1 s. */
export const STEP_SECONDS = 1;

/** Divide `seconds` en pasos de `STEP_SECONDS` y llama a `step` por cada uno; devuelve los segundos que sobran. */
export function advanceFixed(
  seconds: number,
  carry: number,
  step: (dt: number) => void,
  maxSteps = Infinity,
): number {
  let pending = carry + Math.max(0, seconds);
  let steps = 0;
  while (pending >= STEP_SECONDS && steps < maxSteps) {
    step(STEP_SECONDS);
    pending -= STEP_SECONDS;
    steps++;
  }
  return steps >= maxSteps ? 0 : pending;
}
