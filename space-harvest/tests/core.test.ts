import { describe, expect, it } from 'vitest'
import { STEP } from '../src/sim/core/clock'
import type { SimModule } from '../src/sim/core/module'
import { Rng } from '../src/sim/core/rng'
import { Registry } from '../src/sim/registry'

describe('Rng', () => {
  it('es determinista con la misma semilla', () => {
    const a = new Rng(42), b = new Rng(42)
    for (let i = 0; i < 10; i++) expect(a.next()).toBe(b.next())
  })
  it('int respeta los límites', () => {
    const r = new Rng(7)
    for (let i = 0; i < 200; i++) {
      const n = r.int(3, 5)
      expect(n).toBeGreaterThanOrEqual(3)
      expect(n).toBeLessThanOrEqual(5)
    }
  })
  it('restaura el estado', () => {
    const a = new Rng(5)
    a.next()
    const b = new Rng(0)
    b.setState(a.getState())
    expect(b.next()).toBe(a.next())
  })
})

const counter: SimModule<{ n: number }> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, shared, dt) => {
    s.n++
    shared.credits += dt
  },
  serialize: (s) => s,
  load: (d) => ({ n: (d as { n?: number })?.n ?? 0 }),
}

describe('Registry', () => {
  it('avanza con pasos fijos', () => {
    const r = new Registry([counter])
    r.advance(10)
    expect(r.state<{ n: number }>('counter').n).toBe(Math.round(10 / STEP))
    expect(r.shared.credits).toBeCloseTo(10)
  })
  it('guardar y cargar da el mismo estado', () => {
    const a = new Registry([counter])
    a.advance(5)
    const b = new Registry([counter])
    b.load(JSON.parse(JSON.stringify(a.save())))
    expect(b.state<{ n: number }>('counter').n).toBe(50)
    expect(b.shared.credits).toBeCloseTo(a.shared.credits)
  })
  it('un módulo ausente en la partida empieza por defecto', () => {
    const a = new Registry([])
    const b = new Registry([counter])
    b.load(a.save())
    expect(b.state<{ n: number }>('counter').n).toBe(0)
  })
})
