// Caducidad de la comida por lotes (decisión de Mikel del 2026-10-23).
import { describe, expect, it } from 'vitest';
import { flatWorld } from './helpers';
import { SHELF_LIFE_HOURS } from '../src/data/spoilage';
import { describeStack } from '../src/sim/items';
import { RESOURCE_NAMES } from '../src/data/resources';
import { loadWorld, serializeWorld } from '../src/sim/save';
import { spoilHour } from '../src/sim/spoilage';
import { TICKS_PER_DAY } from '../src/sim/time';

describe('caducidad de la comida por lotes', () => {
  it('duraciones elegidas por Mikel', () => {
    expect(SHELF_LIFE_HOURS).toEqual({ carne: 48, pescado: 48, leche: 48, comida: 96, huevos: 168, setas: 168, patata: 480, maiz: 720 });
  });

  it('al juntar montones cada lote guarda su fecha y se coge primero lo que caduca antes', () => {
    const w = flatWorld(1, { spoilage: true });
    w.tick = 12 * TICKS_PER_DAY; // verano, sin frío
    w.items.addAt(4, 4, 'pescado', 10);
    for (let h = 0; h < 30; h++) spoilHour(w);
    w.items.addAt(4, 4, 'pescado', 5); // pescado nuevo en el mismo montón
    expect(w.items.at(4, 4)!.lots).toEqual([{ n: 10, h: 18 }, { n: 5, h: 48 }]);
    expect(describeStack(w.items.at(4, 4)!, RESOURCE_NAMES)).toBe('Pescado ×15 (lo primero caduca en 18 h)');
    // Al comer o coger, primero el más viejo.
    const got = w.items.take(4, 4, 12)!;
    expect(got.lots).toEqual([{ n: 10, h: 18 }, { n: 2, h: 48 }]);
    expect(w.items.at(4, 4)!.lots).toEqual([{ n: 3, h: 48 }]);
    // Lo cogido conserva su fecha al dejarlo en otro sitio.
    w.items.drop(25, 25, got.resource, got.amount, got.lots);
    expect(w.items.at(25, 25)!.lots).toEqual([{ n: 10, h: 18 }, { n: 2, h: 48 }]);
    // A las 18 h se estropea de golpe el lote viejo entero; el nuevo sigue.
    for (let h = 0; h < 17; h++) spoilHour(w);
    expect(w.items.at(25, 25)!.amount).toBe(12);
    expect(spoilHour(w)).toBe(10);
    expect(w.items.at(25, 25)!.amount).toBe(2);
    expect(w.items.at(25, 25)!.lots).toEqual([{ n: 2, h: 30 }]);
  });

  it('lo que no caduca no lleva lotes ni fecha', () => {
    const w = flatWorld(1);
    w.items.addAt(2, 2, 'madera', 20);
    expect(w.items.at(2, 2)!.lots).toBeUndefined();
    expect(w.items.take(2, 2, 5)!.lots).toBeUndefined();
    expect(describeStack(w.items.at(2, 2)!, RESOURCE_NAMES)).toBe('Madera ×15');
  });

  it('las partidas guardan los lotes; las antiguas empiezan con la duración entera', () => {
    const w = flatWorld(1, { spoilage: true });
    w.tick = 12 * TICKS_PER_DAY;
    w.items.addAt(5, 5, 'carne', 6);
    for (let h = 0; h < 10; h++) spoilHour(w);
    w.items.addAt(5, 5, 'carne', 4);
    const data = serializeWorld(w);
    const back = loadWorld(JSON.parse(JSON.stringify(data)));
    expect(back.items.at(5, 5)!.lots).toEqual([{ n: 6, h: 38 }, { n: 4, h: 48 }]);
    // Partida de antes de la caducidad: sin lotes.
    const old = JSON.parse(JSON.stringify(data));
    for (const it of old.items) delete it.lots;
    const back2 = loadWorld(old);
    expect(back2.items.at(5, 5)!.lots).toEqual([{ n: 10, h: 48 }]);
  });

  it('un colono que lleva comida al almacén conserva sus fechas', () => {
    const w = flatWorld(1, { spoilage: true });
    w.tick = 12 * TICKS_PER_DAY;
    w.items.addAt(3, 3, 'carne', 5);
    for (let h = 0; h < 20; h++) spoilHour(w);
    w.zones.create({ x0: 15, y0: 15, x1: 17, y1: 17 });
    for (let i = 0; i < 4000 && !w.items.list().some((s) => s.x >= 15 && s.y >= 15); i++) w.step();
    const moved = w.items.list().find((s) => s.resource === 'carne')!;
    expect(moved.x).toBeGreaterThanOrEqual(15);
    expect(moved.lots!.length).toBe(1);
    // Han pasado unas horas más mientras lo llevaba, pero no ha vuelto a la duración entera.
    expect(moved.lots![0].h).toBeLessThanOrEqual(28);
  });
});
