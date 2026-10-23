// #4: los almacenes no se dibujan encima de objetos, lo que se construye encima de uno lo recorta
// y los muebles de guardar (nevera, estantería, armario, armero) llevan su propio inventario.
import { describe, expect, it } from 'vitest';
import { flatWorld } from './helpers';
import { loadWorld, serializeWorld } from '../src/sim/save';
import { FURNITURE_PRIORITY } from '../src/sim/zones';

function buildNow(world: ReturnType<typeof flatWorld>, x: number, y: number, id: string, rot: 0 | 1 = 0) {
  expect(world.structures.place(x, y, id, rot)).toBe(true);
  const s = world.structures.at(x, y)!;
  for (const [r, n] of Object.entries(s.def.cost)) world.structures.deliver(s, r as never, n as number);
  world.completeStructure(s);
  return s;
}

describe('almacenes y muebles de guardar (#4)', () => {
  it('un almacén dibujado no incluye las casillas con un objeto encima', () => {
    const world = flatWorld(1);
    buildNow(world, 12, 12, 'cama');
    world.step();
    const z = world.createStorageZone({ x0: 10, y0: 10, x1: 14, y1: 14 })!;
    expect(z).not.toBeNull();
    expect(world.zones.at(12, 12)?.id).not.toBe(z.id);
    expect(world.zones.at(11, 11)?.id).toBe(z.id);
  });

  it('al poner un objeto (aunque sea un plano) dentro de un almacén, esa casilla sale de él', () => {
    const world = flatWorld(1);
    const z = world.createStorageZone({ x0: 10, y0: 10, x1: 14, y1: 14 })!;
    expect(z.tiles.size).toBe(25);
    expect(world.structures.place(12, 12, 'cama', 0)).toBe(true);
    world.step();
    expect(world.zones.at(12, 12)).toBeUndefined();
    expect(z.tiles.size).toBe(25 - world.structures.tilesOf(world.structures.at(12, 12)!).length);
  });

  it('una nevera terminada tiene su inventario: solo comida, prioridad alta, y se llena sola', () => {
    const world = flatWorld(1);
    const fridge = buildNow(world, 12, 12, 'nevera');
    world.step();
    const inv = world.zones.ofFurniture(fridge.id)!;
    expect(inv).toBeDefined();
    expect(inv.name).toBe('Nevera');
    expect(inv.priority).toBe(FURNITURE_PRIORITY);
    expect(inv.tiles.size).toBe(world.structures.tilesOf(fridge).length);
    expect(inv.accepts.carne).toBe(true);
    expect(inv.accepts.madera).toBe(false);
    // Comida suelta al lado: un colono la mete en la nevera sin dibujar ningún almacén.
    world.items.drop(8, 8, 'carne', 20);
    for (let i = 0; i < 4000 && !world.structures.tilesOf(fridge).some((t) => world.items.at(t.x, t.y)?.resource === 'carne'); i++) world.step();
    expect(world.structures.tilesOf(fridge).some((t) => world.items.at(t.x, t.y)?.resource === 'carne')).toBe(true);
  });

  it('el inventario de un mueble no se borra a mano ni con «quitar almacén»; al demolerlo desaparece', () => {
    const world = flatWorld(1);
    const shelf = buildNow(world, 12, 12, 'estanteria_madera');
    world.step();
    const inv = world.zones.ofFurniture(shelf.id)!;
    expect(world.zones.delete(inv.id)).toBe(false);
    expect(world.removeZonesArea({ x0: 10, y0: 10, x1: 14, y1: 14 })).toBe(0);
    expect(world.zones.get(inv.id)).toBe(inv);
    world.structures.demolish(shelf);
    world.step();
    expect(world.zones.ofFurniture(shelf.id)).toBeUndefined();
    expect(world.zones.at(12, 12)).toBeUndefined();
  });

  it('el armero solo acepta armas y munición', () => {
    const world = flatWorld(1);
    const rack = buildNow(world, 12, 12, 'armero');
    world.step();
    const inv = world.zones.ofFurniture(rack.id)!;
    expect(inv.accepts.cuchillo).toBe(true);
    expect(inv.accepts.carne).toBe(false);
  });

  it('se guarda la prioridad y el filtro del inventario; las partidas viejas con un almacén encima de la nevera se arreglan', () => {
    const world = flatWorld(1);
    const fridge = buildNow(world, 12, 12, 'nevera');
    world.step();
    const inv = world.zones.ofFurniture(fridge.id)!;
    world.zones.setPriority(inv.id, 4);
    world.zones.setAccepts(inv.id, 'carne', false);
    const back = loadWorld(serializeWorld(world));
    back.step();
    const again = back.zones.ofFurniture(fridge.id)!;
    expect(again.priority).toBe(4);
    expect(again.accepts.carne).toBe(false);
    expect(back.zones.all().filter((z) => z.furniture === fridge.id)).toHaveLength(1);

    // Partida de antes: un almacén dibujado encima de la nevera y sin inventario propio.
    const data = JSON.parse(JSON.stringify(serializeWorld(world)));
    const tiles = world.structures.tilesOf(fridge).map((t) => t.y * world.map.width + t.x);
    data.zones = [{ id: 1, name: 'Almacén 1', priority: 2, accepts: {}, tiles: [...tiles, 10 * world.map.width + 10] }];
    const old = loadWorld(data);
    old.step();
    expect(old.zones.ofFurniture(fridge.id)?.tiles.size).toBe(tiles.length);
    expect(old.zones.get(1)?.tiles.size).toBe(1);
  });
});
