// Zenit #14: tras fabricar cuchillos en el banco de trabajo, no deja fabricar otra cosa.
import { describe, expect, it } from 'vitest';
import { flatWorld } from './helpers';
import { recipeDef } from '../src/data/recipes';

function buildNow(world: ReturnType<typeof flatWorld>, x: number, y: number, id: string) {
  expect(world.structures.place(x, y, id, 0)).toBe(true);
  const s = world.structures.at(x, y)!;
  for (const [r, n] of Object.entries(s.def.cost)) world.structures.deliver(s, r as never, n as number);
  world.completeStructure(s);
  return s;
}
const bill = (id: string, target = 1, mode: 'count' | 'until' = 'count') => ({ recipe: recipeDef(id)!, target, paused: false, mode });

describe('banco de trabajo: cambiar de receta (Zenit #14)', () => {
  for (const furniture of [null, 'estanteria_madera', 'armero'] as const) {
    it(`tras los cuchillos fabrica lo siguiente${furniture ? ` (con ${furniture})` : ''}`, () => {
      const w = flatWorld(1);
      const bench = buildNow(w, 10, 10, 'banco_trabajo');
      if (furniture) buildNow(w, 16, 16, furniture);
      w.createStorageZone({ x0: 3, y0: 12, x1: 6, y1: 15 });
      w.items.drop(8, 14, 'chatarra', 30);
      w.items.drop(14, 8, 'madera', 30);
      w.step();
      expect(w.setStationBill(bench, bill('fabricar_cuchillo', 2))).toBe(true);
      const has = (r: string) => (w.inventory() as Record<string, number>)[r] ?? 0;
      // (un cuchillo se lo queda el colono como arma)
      for (let i = 0; i < 20000 && bench.bill!.target > 0; i++) w.step();
      expect(bench.bill!.target).toBe(0);
      for (let i = 0; i < 3000; i++) w.step();
      expect(w.setStationBill(bench, bill('fabricar_palo', 2))).toBe(true);
      for (let i = 0; i < 20000 && bench.bill!.target > 0; i++) w.step();
      expect(bench.bill!.target).toBe(0);
      expect(has('palo')).toBeGreaterThan(0);
    });
  }
});
