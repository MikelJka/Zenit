/** Reloj de pasos fijos: convierte tiempo real (o ausencia con el juego cerrado) en pasos de simulación. */
export const STEP_SECONDS = 0.5;
/** Máximo de tiempo con el juego cerrado que se cuenta (8 h, ver Pase en DISENO.md). */
export const MAX_OFFLINE_SECONDS = 8 * 3600;

export function stepsFor(seconds: number): number {
  return Math.floor(Math.max(0, seconds) / STEP_SECONDS);
}

export function offlineSeconds(savedAtMs: number, nowMs: number, cap = MAX_OFFLINE_SECONDS): number {
  return Math.min(cap, Math.max(0, (nowMs - savedAtMs) / 1000));
}
