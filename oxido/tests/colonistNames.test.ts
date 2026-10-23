import { describe, expect, it } from 'vitest';
import { World } from '../src/sim/world';
import { loadWorld, serializeWorld } from '../src/sim/save';
import { FIRST_NAMES } from '../src/data/colonists';

const names = (w: World) => w.colonists.map((c) => c.name);

describe('nombres de los colonos sin repetir (Z#15)', () => {
  it('los colonos del principio no se repiten, con cualquier semilla', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const w = new World({ seed, width: 40, height: 40, colonists: 8 });
      expect(new Set(names(w)).size).toBe(w.colonists.length);
    }
  });

  it('los que llegan después (supervivientes, prisioneros…) tampoco se llaman como nadie', () => {
    const w = new World({ seed: 538395, width: 40, height: 40, colonists: 3 });
    for (let i = 0; i < 20; i++) {
      const p = w.makePawn('colono');
      w.joinColony(p, 'se une');
    }
    expect(w.colonists.length).toBe(23);
    expect(new Set(names(w)).size).toBe(23);
  });

  it('una partida guardada con dos colonos iguales los separa al cargar (el primero se queda su nombre)', () => {
    const w = new World({ seed: 7, width: 40, height: 40, colonists: 4 });
    const first = w.colonists[0].name;
    w.colonists[2].name = first;
    w.colonists[3].name = first;
    const back = loadWorld(serializeWorld(w));
    expect(back.colonists[0].name).toBe(first);
    expect(new Set(names(back)).size).toBe(4);
    for (const n of names(back)) expect(FIRST_NAMES).toContain(n);
  });

  it('si se acaban los nombres, se repite antes que fallar', () => {
    const w = new World({ seed: 3, width: 40, height: 40, colonists: 1 });
    for (let i = 0; i < FIRST_NAMES.length + 3; i++) w.joinColony(w.makePawn('colono'), 'se une');
    expect(new Set(names(w)).size).toBe(FIRST_NAMES.length);
  });
});
