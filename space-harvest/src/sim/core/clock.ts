/** Reloj de simulación: el tiempo entra como parámetro, nunca se lee del sistema. */
export const STEP_SECONDS = 1

export interface Clock {
  /** Segundos de juego transcurridos. */
  time: number
}

export function createClock(): Clock {
  return { time: 0 }
}

/**
 * Avanza `seconds` en pasos fijos de STEP_SECONDS y llama a `step` en cada uno.
 * El resto menor que un paso se descarta (los tiempos largos van por `offlineSeconds`).
 */
export function advance(clock: Clock, seconds: number, step: (dt: number) => void): number {
  const steps = Math.floor(Math.max(0, seconds) / STEP_SECONDS)
  for (let i = 0; i < steps; i++) {
    step(STEP_SECONDS)
    clock.time += STEP_SECONDS
  }
  return steps
}

/** Segundos que cuentan como juego cerrado, limitados por `capSeconds`. */
export function offlineSeconds(lastSavedMs: number, nowMs: number, capSeconds: number): number {
  return Math.min(capSeconds, Math.max(0, (nowMs - lastSavedMs) / 1000))
}
