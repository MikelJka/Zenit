/** Paso fijo de la simulación, en segundos. */
export const STEP = 0.1

/**
 * Reloj de la simulación: el tiempo entra como parámetro (nunca se lee Date.now()),
 * así sirve igual para el juego en marcha, las ganancias con el juego cerrado y los tests.
 */
export class Clock {
  /** Segundos de juego acumulados. */
  time = 0
  private rest = 0

  /** Avanza `seconds` y llama a `onStep(STEP)` por cada paso fijo completo. Devuelve los pasos dados. */
  advance(seconds: number, onStep: (dt: number) => void): number {
    this.rest += Math.max(0, seconds)
    let n = 0
    while (this.rest >= STEP - 1e-9) {
      this.rest -= STEP
      this.time += STEP
      onStep(STEP)
      n++
    }
    return n
  }
}
