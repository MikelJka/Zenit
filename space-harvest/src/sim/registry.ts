import { Clock } from './core/clock'
import type { Shared, SimModule } from './core/module'
import { Rng } from './core/rng'

export const SAVE_VERSION = 1

export interface SaveData {
  version: number
  time: number
  shared: { credits: number; energy: number; rng: number }
  modules: Record<string, { version: number; data: unknown }>
}

/** Módulos activos, en su orden de ejecución, con el estado de cada uno. */
export class Registry {
  readonly shared: Shared
  readonly clock = new Clock()
  private readonly states = new Map<string, unknown>()

  constructor(
    private readonly modules: SimModule<any>[],
    seed = 1,
  ) {
    this.shared = { credits: 0, energy: 0, rng: new Rng(seed) }
    for (const m of modules) this.states.set(m.id, m.init(this.shared))
  }

  state<S>(id: string): S {
    return this.states.get(id) as S
  }

  /** Avanza `seconds` de juego (también las ganancias con el juego cerrado). */
  advance(seconds: number): void {
    this.clock.advance(seconds, (dt) => {
      for (const m of this.modules) m.step(this.states.get(m.id), this.shared, dt)
    })
  }

  save(): SaveData {
    const modules: SaveData['modules'] = {}
    for (const m of this.modules) {
      modules[m.id] = { version: m.version, data: m.serialize(this.states.get(m.id)) }
    }
    const { credits, energy, rng } = this.shared
    return { version: SAVE_VERSION, time: this.clock.time, shared: { credits, energy, rng: rng.getState() }, modules }
  }

  /** Carga una partida; los módulos que faltan en ella empiezan con su valor por defecto. */
  load(data: SaveData): void {
    this.shared.credits = data.shared?.credits ?? 0
    this.shared.energy = data.shared?.energy ?? 0
    this.shared.rng.setState(data.shared?.rng ?? 1)
    this.clock.time = data.time ?? 0
    for (const m of this.modules) {
      const saved = data.modules?.[m.id]
      this.states.set(m.id, saved ? m.load(saved.data, saved.version, this.shared) : m.init(this.shared))
    }
  }
}
