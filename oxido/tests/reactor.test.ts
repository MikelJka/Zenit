import { describe, expect, it } from 'vitest';
import { buildingDef } from '../src/data/buildings';
import { researchDef } from '../src/data/research';
import { REACTOR_IRRADIATION } from '../src/data/uranium';
import { blastAt } from '../src/sim/grenades';
import { updatePower } from '../src/sim/power';
import { coolDown } from '../src/sim/radiation';
import { loadWorld, serializeWorld } from '../src/sim/save';
import { TICKS_PER_DAY } from '../src/sim/time';
import { flatWorld } from './helpers';

/** Pone y termina una construcción al momento. */
function build(w: ReturnType<typeof flatWorld>, x: number, y: number, id: string) {
  expect(w.structures.place(x, y, id)).toBe(true);
  const s = id === 'cable' ? w.structures.cableAt(x, y)! : w.structures.mainAt(x, y)!;
  w.completeStructure(s);
  return s;
}

describe('energía nuclear y reactor pequeño', () => {
  it('«Energía nuclear» es un proyecto de 24 h y desbloquea el reactor', () => {
    const p = researchDef('energia_nuclear')!;
    expect(p.hours).toBe(24);
    const def = buildingDef('reactor')!;
    expect(def.research).toBe('energia_nuclear');
    expect(def.cost).toEqual({ metal: 40, componentes: 10 });
    expect(def.size).toEqual([3, 3]);
    expect(def.power).toBe(3000);
    expect(def.fuel).toMatchObject({ resource: 'uranio', hoursPerUnit: 48 });
    const w = flatWorld(1);
    expect(w.canBuild('reactor')).toBe(false);
    w.research.done.push('energia_nuclear');
    expect(w.canBuild('reactor')).toBe(true);
  });

  it('con ☢ da 3 000 W y gasta 1 ☢ cada 2 días; sin ☢, se para', () => {
    const w = flatWorld(1);
    const r = build(w, 5, 5, 'reactor');
    const lamp = build(w, 10, 6, 'lampara');
    build(w, 8, 6, 'cable');
    build(w, 9, 6, 'cable');
    updatePower(w.structures, 1);
    expect(r.powered).toBe(false);
    expect(lamp.powered).toBe(false);
    r.fuel = 1;
    const [net] = updatePower(w.structures, 1);
    expect(r.output).toBe(3000);
    expect(net.production).toBe(3000);
    expect(lamp.powered).toBe(true);
    updatePower(w.structures, 47);
    expect(r.fuel).toBeCloseTo(0, 6);
    updatePower(w.structures, 1);
    expect(r.powered).toBe(false);
  });

  it('los colonos le llevan ☢ del suelo y se pone en marcha', () => {
    const w = flatWorld(1);
    w.items.drop(4, 4, 'uranio', 3);
    const r = build(w, 10, 10, 'reactor');
    let ok = false;
    for (let t = 0; t < 20000 && !ok; t++) {
      w.step();
      ok = (r.fuel ?? 0) > 0 && !!r.powered;
    }
    expect(ok).toBe(true);
    expect(r.fuel ?? 0).toBeLessThanOrEqual(r.def.fuel!.capacity);
  });

  it('si le alcanza una explosión, irradia lo de alrededor unos días y luego se pasa', () => {
    const w = flatWorld(1);
    const r = build(w, 10, 10, 'reactor');
    const m = w.map;
    const R = REACTOR_IRRADIATION.radius;
    const i = (x: number, y: number) => y * m.width + x;
    const before = m.radiation[i(10 - R, 10)];
    blastAt(w, { x: 11, y: 11 }, 1, 1, 0.1, 'La granada', 'la granada');
    expect(r.hp).toBe(r.def.hp);
    expect(m.radiation[i(11, 11)]).toBeGreaterThan(0.9);
    expect(m.radiation[i(10 - R, 10)]).toBeGreaterThan(0.9);
    expect(m.radiation[i(12 + R, 12 + R)]).toBeGreaterThan(0.9);
    expect(w.hotTiles.has(i(10 - R - 1, 10))).toBe(false);
    // Se guarda con la partida.
    const back = loadWorld(serializeWorld(w));
    expect(back.hotTiles.size).toBe(w.hotTiles.size);
    coolDown(m, w.hotTiles, w.tick + Math.round(REACTOR_IRRADIATION.days * TICKS_PER_DAY));
    expect(m.radiation[i(10 - R, 10)]).toBe(before);
  });

  it('una explosión lejos no le hace nada', () => {
    const w = flatWorld(1);
    build(w, 10, 10, 'reactor');
    blastAt(w, { x: 20, y: 20 }, 1, 1, 0.1, 'La granada', 'la granada');
    expect(w.hotTiles.size).toBe(0);
  });
});
