import { describe, expect, it } from 'vitest'
import { advance, createClock, offlineSeconds } from '../src/sim/core/clock'
import { Game } from '../src/sim/core/game'
import type { SimModule } from '../src/sim/core/module'
import { Rng } from '../src/sim/core/rng'

interface CounterState { n: number }
const counter: SimModule<CounterState> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step: (s, ctx, dt) => { s.n += dt; ctx.common.credits += dt },
  serialize: (s) => s,
  load: (data) => ({ n: (data as CounterState | undefined)?.n ?? 0 }),
}

describe('Rng', () => {
  it('con la misma semilla da la misma secuencia', () => {
    const a = new Rng(42), b = new Rng(42)
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()))
  })
  it('int respeta los límites y el estado se restaura', () => {
    const r = new Rng(1)
    for (let i = 0; i < 200; i++) { const v = r.int(3, 6); expect(v).toBeGreaterThanOrEqual(3); expect(v).toBeLessThanOrEqual(6) }
    const s = r.getState(), x = r.next()
    r.setState(s)
    expect(r.next()).toBe(x)
  })
})

describe('reloj', () => {
  it('avanza en pasos fijos y descarta el resto', () => {
    const c = createClock(); let calls = 0
    expect(advance(c, 3.7, () => calls++)).toBe(3)
    expect(c.time).toBe(3); expect(calls).toBe(3)
  })
  it('limita el tiempo con el juego cerrado', () => {
    expect(offlineSeconds(0, 10_000, 5)).toBe(5)
    expect(offlineSeconds(10_000, 0, 5)).toBe(0)
  })
})

describe('Game', () => {
  it('guarda y carga sin perder estado', () => {
    const g = new Game([counter], 7); g.tick(10)
    const g2 = Game.load([counter], JSON.parse(JSON.stringify(g.save(1000))))
    expect(g2.common.credits).toBe(10)
    expect(g2.states.get('counter')).toEqual({ n: 10 })
    expect(g2.clock.time).toBe(10)
  })
  it('un módulo nuevo carga con valores por defecto en un guardado antiguo', () => {
    const old = new Game([], 1).save(0)
    const g = Game.load([counter], old)
    expect(g.states.get('counter')).toEqual({ n: 0 })
  })
})
