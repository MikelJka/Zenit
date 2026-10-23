import { describe, expect, it } from 'vitest';
import { flatWorld } from './helpers';
import { makeDeal, startTrader } from '../src/sim/people';

// #6 del 🐞: revisión del cierre de un trato con la caravana.
describe('#6: cerrar un trato con el comerciante', () => {
  it('lo que llevan encima los colonos también sale al venderlo (no se cobra gratis)', () => {
    const w = flatWorld(1);
    const t = startTrader(w)!;
    t.trader!.stock = {};
    w.items.drop(5, 6, 'madera', 10);
    w.colonists[0].carrying = { resource: 'madera', amount: 5 };
    expect(w.inventory().madera).toBe(15);
    expect(makeDeal(w, t, { buy: {}, sell: { madera: 15 }, slaves: [], sellPrisoners: [] })).toBeNull();
    expect(w.inventory().madera).toBe(0);
    expect(w.colonists[0].carrying).toBeNull();
    expect(t.trader!.stock.madera).toBe(15);
  });

  it('lo comprado no se pierde aunque no quepa junto a la caravana', () => {
    const w = flatWorld(1);
    const t = startTrader(w)!;
    t.trader!.stock = { metal: 40 };
    // El suelo alrededor de la caravana está lleno de montones de piedra.
    const { x, y } = t.tile;
    for (let dy = -9; dy <= 9; dy++) for (let dx = -9; dx <= 9; dx++) w.items.addAt(x + dx, y + dy, 'piedra', 1);
    w.items.drop(5, 6, 'madera', 200);
    const before = w.inventory().metal;
    expect(makeDeal(w, t, { buy: { metal: 40 }, sell: { madera: 200 }, slaves: [], sellPrisoners: [] })).toBeNull();
    expect(w.inventory().metal).toBe(before + 40);
    expect(t.trader!.stock.metal).toBe(0);
  });

  it('cantidades con decimales o negativas no rompen el trato', () => {
    const w = flatWorld(1);
    const t = startTrader(w)!;
    t.trader!.stock = { metal: 20 };
    w.items.drop(5, 6, 'madera', 50);
    expect(makeDeal(w, t, { buy: { metal: 2.7, piedra: -3 }, sell: { madera: 50 }, slaves: [], sellPrisoners: [] })).toBeNull();
    expect(w.inventory().metal).toBe(2);
    expect(t.trader!.stock.metal).toBe(18);
    expect(t.trader!.stock.piedra ?? 0).toBe(0);
  });

  it('si ya no hay tanto, el aviso dice el nombre del recurso y lo que queda', () => {
    const w = flatWorld(1);
    const t = startTrader(w)!;
    w.items.drop(5, 6, 'madera', 3);
    const why = makeDeal(w, t, { buy: {}, sell: { madera: 10 }, slaves: [], sellPrisoners: [] });
    expect(why).toContain('madera');
    expect(why).toContain('3');
  });
});
