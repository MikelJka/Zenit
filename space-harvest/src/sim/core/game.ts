import { advance, createClock, type Clock } from './clock'
import type { CommonState, SimContext, SimModule } from './module'
import { Rng } from './rng'

export const SAVE_VERSION = 1

export interface SaveData {
  version: number
  savedAtMs: number
  clock: number
  rng: number
  common: CommonState
  modules: Record<string, { version: number; data: unknown }>
}

export class Game {
  readonly clock: Clock = createClock()
  readonly common: CommonState = { credits: 0 }
  readonly rng: Rng
  readonly states = new Map<string, unknown>()

  constructor(readonly mods: SimModule[], seed: number) {
    this.rng = new Rng(seed)
    for (const m of mods) this.states.set(m.id, m.init())
  }

  private get ctx(): SimContext {
    return { common: this.common, rng: this.rng }
  }

  /** Avanza la simulación `seconds` segundos (también sirve para las ganancias con el juego cerrado). */
  tick(seconds: number): void {
    advance(this.clock, seconds, (dt) => {
      for (const m of this.mods) m.step(this.states.get(m.id), this.ctx, dt)
    })
  }

  save(nowMs: number): SaveData {
    const modules: SaveData['modules'] = {}
    for (const m of this.mods) {
      modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) }
    }
    return {
      version: SAVE_VERSION,
      savedAtMs: nowMs,
      clock: this.clock.time,
      rng: this.rng.getState(),
      common: { ...this.common },
      modules,
    }
  }

  /** Carga un guardado; un módulo ausente en el guardado arranca con sus valores por defecto. */
  static load(mods: SimModule[], data: SaveData): Game {
    const g = new Game(mods, 0)
    g.clock.time = data.clock
    g.rng.setState(data.rng)
    g.common.credits = data.common?.credits ?? 0
    for (const m of mods) {
      const saved = data.modules?.[m.id]
      g.states.set(m.id, m.load(saved?.data, saved?.version))
    }
    return g
  }
}
