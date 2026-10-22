import { describe, expect, it } from 'vitest';
import { BARREL_IRRADIATION, TOXIC_BARREL } from '../src/data/uranium';
import { fillBarrelStock, generateMap, Prop, PROP_INFO, RADIATION_THRESHOLD, rollStock } from '../src/sim/map';
import { coolDown, irradiate } from '../src/sim/radiation';
import { harvestAt } from '../src/sim/resources';
import { loadWorld, serializeWorld } from '../src/sim/save';
import { Rng } from '../src/sim/rng';
import { TICKS_PER_DAY } from '../src/sim/time';
import { flatWorld } from './helpers';

function putBarrel(world: ReturnType<typeof flatWorld>, x: number, y: number): number {
  const i = y * world.map.width + x;
  world.map.props[i] = Prop.ToxicBarrel;
  world.map.stock[i] = TOXIC_BARREL.amount[1];
  return i;
}

describe('barriles tóxicos y ☢ uranio', () => {
  it('el barril tóxico se saquea y da uranio', () => {
    const h = PROP_INFO[Prop.ToxicBarrel].harvest!;
    expect(h.job).toBe('saquear');
    expect(h.resource).toBe('uranio');
    expect(h.leaves).toBe(Prop.None);
    const rng = new Rng(3);
    for (let k = 0; k < 20; k++) {
      const n = rollStock(Prop.ToxicBarrel, rng);
      expect(n).toBeGreaterThanOrEqual(TOXIC_BARREL.amount[0]);
      expect(n).toBeLessThanOrEqual(TOXIC_BARREL.amount[1]);
    }
  });

  it('un colono saquea el barril marcado: sale ☢, la casilla queda irradiada unos días y luego se pasa', () => {
    const world = flatWorld(1);
    world.map.radiation.fill(0);
    const i = putBarrel(world, 9, 5);
    world.designations.add(9, 5, 'saquear');
    let t = 0;
    for (; t < 5000 && world.map.props[i] === Prop.ToxicBarrel; t++) world.step();
    expect(world.map.props[i]).toBe(Prop.None);
    for (let k = 0; k < 600; k++) world.step();
    expect(world.inventory().uranio).toBe(TOXIC_BARREL.amount[1]);
    // Irradiada la casilla y las de al lado.
    expect(world.map.radiation[i]).toBeGreaterThan(RADIATION_THRESHOLD);
    expect(world.map.radiation[i + 1]).toBeGreaterThan(RADIATION_THRESHOLD);
    expect(world.map.radiation[i + 3]).toBe(0);
    expect(world.log.some((l) => l.text.includes('Barril tóxico abierto'))).toBe(true);
    // Sigue irradiada tras guardar y cargar.
    const copy = loadWorld(serializeWorld(world));
    expect(copy.hotTiles.size).toBe(world.hotTiles.size);
    // Pasados los días, vuelve a como estaba.
    const end = world.tick + BARREL_IRRADIATION.days * TICKS_PER_DAY + TICKS_PER_DAY / 24;
    while (world.tick < end) world.step();
    expect(world.map.radiation[i]).toBe(0);
    expect(world.hotTiles.size).toBe(0);
    while (copy.tick < end) copy.step();
    expect(copy.map.radiation[i]).toBe(0);
  });

  it('una zona ya irradiada del mapa no cambia, y dos barriles juntos guardan la radiación de antes', () => {
    const world = flatWorld(0);
    const map = world.map;
    map.radiation.fill(0.2);
    const a = 10 * map.width + 10;
    map.radiation[a - 1] = 1;
    const hot = new Map();
    irradiate(map, hot, 10, 10, 100);
    expect(hot.has(a - 1)).toBe(false);
    irradiate(map, hot, 11, 10, 200);
    expect(hot.get(a)!.base).toBeCloseTo(0.2);
    expect(hot.get(a)!.until).toBe(200);
    coolDown(map, hot, 150);
    expect(map.radiation[a]).toBeGreaterThan(RADIATION_THRESHOLD);
    coolDown(map, hot, 200);
    expect(map.radiation[a]).toBeCloseTo(0.2);
    expect(map.radiation[a - 1]).toBe(1);
  });

  it('las partidas de antes: sus barriles reciben su ☢ al cargar y el resto del mapa no cambia', () => {
    const map = generateMap({ width: 100, height: 100, seed: 5 });
    const barrels: number[] = [];
    for (let i = 0; i < map.props.length; i++) if (map.props[i] === Prop.ToxicBarrel) barrels.push(i);
    expect(barrels.length).toBeGreaterThan(0);
    for (const i of barrels) expect(harvestAt(map, i % map.width, Math.floor(i / map.width))?.resource).toBe('uranio');
    const before = Array.from(map.stock);
    for (const i of barrels) map.stock[i] = 0;
    expect(fillBarrelStock(map)).toBe(barrels.length);
    expect(Array.from(map.stock)).toEqual(before);
  });
});
