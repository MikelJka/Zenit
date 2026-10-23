// Velocidad de movimiento (#3 del 🐞, decisión de Mikel del 2026-10-23, opción A):
// todo va a ×0,75 y un herido, −30 %.
import { describe, expect, it } from 'vitest';
import { flatWorld } from './helpers';
import { GLOBAL_MOVE_SPEED, WOUNDED_WALK_FACTOR } from '../src/data/movement';
import { TICKS_PER_SECOND } from '../src/sim/world';
import { walkSpeedMultiplier } from '../src/sim/colonist';
import { hurt } from '../src/sim/health';
import { makeCreature } from '../src/sim/people';

type W = ReturnType<typeof flatWorld>;

/** Casillas que avanza `c` en un paso de movimiento por una recta hacia el este. */
function stepDistance(w: W, c: W['colonists'][number]): number {
  c.path = [];
  for (let x = c.tile.x + 1; x < c.tile.x + 10; x++) c.path.push({ x, y: c.tile.y });
  const x0 = c.pos.x;
  w.moveAlongPath(c);
  return c.pos.x - x0;
}

describe('velocidad (#3 del 🐞)', () => {
  it('los números elegidos por Mikel: ×0,75 para todos y −30 % el herido', () => {
    expect(GLOBAL_MOVE_SPEED).toBe(0.75);
    expect(WOUNDED_WALK_FACTOR).toBe(0.7);
  });

  it('un colono sano camina a 3 × 0,75 casillas por segundo en terreno llano', () => {
    const w = flatWorld(1);
    const [c] = w.colonists;
    c.traits = [];
    const cost = w.moveCostAt(c.tile.x + 1, c.tile.y);
    expect(stepDistance(w, c)).toBeCloseTo((3 * 0.75 * walkSpeedMultiplier(c)) / TICKS_PER_SECOND / cost, 6);
  });

  it('con una herida va un 30 % más despacio; curada del todo, vuelve a su paso', () => {
    const w = flatWorld(1);
    const [c] = w.colonists;
    c.traits = [];
    const sano = walkSpeedMultiplier(c);
    hurt(c, 0.1, 'la pierna izquierda', true);
    expect(c.wounds.length).toBe(1);
    expect(walkSpeedMultiplier(c)).toBeCloseTo(sano * 0.7, 6);
    const wd = stepDistance(w, c);
    const w2 = flatWorld(1);
    const h = w2.colonists[0];
    h.traits = [];
    expect(wd / stepDistance(w2, h)).toBeCloseTo(0.7, 6);
    c.wounds = [];
    expect(walkSpeedMultiplier(c)).toBeCloseTo(sano, 6);
  });

  it('enemigos y animales usan la misma base (×0,75) y también van más lentos heridos', () => {
    const w = flatWorld(1);
    const dog = w.makePawn('saqueador');
    makeCreature(w, dog, 'perro_mutante', 1);
    dog.tile = { x: 10, y: 10 };
    dog.pos = { x: 10.5, y: 10.5 };
    const d = stepDistance(w, dog);
    const cost = w.moveCostAt(dog.tile.x, dog.tile.y);
    expect(d).toBeCloseTo((3 * 0.75 * walkSpeedMultiplier(dog)) / TICKS_PER_SECOND / cost, 6);
    hurt(dog, 0.05, 'el pecho', true);
    expect(stepDistance(w, dog)).toBeCloseTo(d * 0.7, 6);
  });
});
