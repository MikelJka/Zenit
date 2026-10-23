// 🐞 #1 (2026-10-22, opción B): botones «🎯 Cazar» y «🤝 Domar» en ⚒ Órdenes, por arrastre.
import { describe, expect, it } from 'vitest';
import { flatWorld } from './helpers';
import { hasAnimalMark, makeAnimal, markAnimalsArea, unmarkAnimalsArea, wouldMarkAnimal } from '../src/sim/animals';
import type { World } from '../src/sim/world';

function put(w: World, kind: Parameters<typeof makeAnimal>[1], x: number, y: number) {
  const a = makeAnimal(w, kind);
  a.tile = { x, y };
  a.pos = { x: x + 0.5, y: y + 0.5 };
  w.others.push(a);
  return a;
}
const area = { x0: 10, y0: 10, x1: 14, y1: 14 };

describe('órdenes de cazar y domar por arrastre', () => {
  it('🎯 Cazar marca a todos los animales salvajes del recuadro, y solo a ellos', () => {
    const w = flatWorld(1);
    const a = put(w, 'ciervo_mutado', 10, 10);
    const b = put(w, 'jabali', 14, 12);
    const fuera = put(w, 'ciervo_mutado', 15, 10);
    expect(markAnimalsArea(w.others, area, 'cazar')).toBe(2);
    expect(a.huntMarked && b.huntMarked).toBe(true);
    expect(fuera.huntMarked).toBeFalsy();
    // Las esquinas pueden ir en cualquier orden; los ya marcados no cuentan otra vez.
    expect(markAnimalsArea(w.others, { x0: 14, y0: 14, x1: 10, y1: 10 }, 'cazar')).toBe(0);
  });

  it('🤝 Domar solo marca a los que se dejan y quita la marca de cazar', () => {
    const w = flatWorld(1);
    const cabra = put(w, 'cabra_salvaje', 11, 11);
    const rata = put(w, 'rata_gigante', 12, 12);
    cabra.huntMarked = true;
    expect(wouldMarkAnimal(rata, 'domar')).toBe(false);
    expect(markAnimalsArea(w.others, area, 'domar')).toBe(1);
    expect(cabra.tameMarked).toBe(true);
    expect(cabra.huntMarked).toBe(false);
    expect(rata.tameMarked).toBeFalsy();
    // Y al revés: cazar le quita la de domar.
    expect(markAnimalsArea(w.others, area, 'cazar')).toBe(2);
    expect(cabra.tameMarked).toBe(false);
    expect(cabra.huntMarked).toBe(true);
  });

  it('no marca animales de carga, colonos ni saqueadores', () => {
    const w = flatWorld(1);
    const mula = put(w, 'cabra_salvaje', 11, 11);
    mula.tamed = true;
    const [c] = w.colonists;
    c.tile = { x: 12, y: 12 };
    expect(markAnimalsArea([...w.others, c], area, 'cazar')).toBe(0);
    expect(mula.huntMarked).toBeFalsy();
    expect(c.huntMarked).toBeFalsy();
  });

  it('«Quitar órdenes» les quita la marca a los del recuadro', () => {
    const w = flatWorld(1);
    const a = put(w, 'ciervo_mutado', 10, 10);
    const b = put(w, 'cabra_salvaje', 13, 13);
    const fuera = put(w, 'jabali', 20, 20);
    a.huntMarked = true;
    b.tameMarked = true;
    fuera.huntMarked = true;
    expect(unmarkAnimalsArea(w.others, area)).toBe(2);
    expect(hasAnimalMark(a) || hasAnimalMark(b)).toBe(false);
    expect(fuera.huntMarked).toBe(true);
    expect(unmarkAnimalsArea(w.others, area)).toBe(0);
  });
});
