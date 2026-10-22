import { describe, expect, it } from 'vitest';
import { Game, offlineSeconds } from '../src/sim/core/game';
import { Registry } from '../src/sim/core/registry';
import type { GameModule } from '../src/sim/core/module';

interface S { n: number }
const counter: GameModule<S> = {
  id: 'counter',
  version: 1,
  init: () => ({ n: 0 }),
  step(s, dt, ctx) {
    s.n += dt;
    ctx.resources.credits = (ctx.resources.credits ?? 0) + dt * 2;
  },
  serialize: (s) => ({ n: s.n }),
  load: (d) => ({ n: (d as S | undefined)?.n ?? 0 }),
};

function make(): Registry {
  const r = new Registry();
  r.register(counter);
  return r;
}

describe('núcleo', () => {
  it('avanza en pasos fijos y acumula recursos', () => {
    const g = new Game(make(), 1);
    g.advance(10.5);
    expect(g.state<S>('counter').n).toBeCloseTo(10.5);
    expect(g.ctx.resources.credits).toBeCloseTo(21);
  });

  it('guarda y carga sin perder estado ni semilla', () => {
    const g = new Game(make(), 7);
    g.advance(5);
    g.ctx.rng.next();
    const data = JSON.parse(JSON.stringify(g.save(1000, 7)));
    const h = Game.load(make(), data);
    expect(h.state<S>('counter').n).toBe(5);
    expect(h.ctx.resources.credits).toBe(10);
    expect(h.ctx.rng.next()).toBe(g.ctx.rng.next());
  });

  it('una partida antigua sin el módulo recibe el valor por defecto', () => {
    const g = new Game(make(), 1);
    const data = g.save(0, 1);
    delete data.modules.counter;
    expect(Game.load(make(), data).state<S>('counter').n).toBe(0);
  });

  it('rechaza módulos repetidos', () => {
    const r = make();
    expect(() => r.register(counter)).toThrow();
  });

  it('offline respeta el tope y no sale negativo', () => {
    expect(offlineSeconds(0, 3_600_000, 1800)).toBe(1800);
    expect(offlineSeconds(5000, 1000, 1800)).toBe(0);
    expect(offlineSeconds(0, 90_000, 1800)).toBe(90);
  });
});
