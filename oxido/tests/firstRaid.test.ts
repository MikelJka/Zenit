import { describe, expect, it } from 'vitest';
import { World, TICKS_PER_DAY } from '../src/sim/world';
import { loadWorld, serializeWorld } from '../src/sim/save';
import { DIFFICULTIES, FIRST_RAID, FIRST_RAID_DAY, firstRaidCountdown } from '../src/sim/storyteller';
import { runStoryteller } from '../src/sim/people';

const raiders = (w: World) => w.others.filter((o) => o.role === 'saqueador' && o.raider);

function quietWorld(level: 'normal' | 'brutal' = 'normal'): World {
  const w = new World({ seed: 11, width: 50, height: 50, difficulty: { level, graceDays: DIFFICULTIES[level].graceDays } });
  w.schedule.nextWanderer = w.schedule.nextTrader = Number.MAX_SAFE_INTEGER;
  return w;
}

describe('primer raid (#2 del 🐞)', () => {
  it('en Normal llega a los 7 días; en las demás durezas, 2 días más tarde que antes', () => {
    expect(FIRST_RAID_DAY).toBe(7);
    expect(quietWorld().schedule.nextRaid).toBe(7 * TICKS_PER_DAY);
    expect(DIFFICULTIES.tranquila.graceDays).toBe(10);
    expect(DIFFICULTIES.dura.graceDays).toBe(6);
    expect(DIFFICULTIES.brutal.graceDays).toBe(5);
  });

  it('siempre es pequeño: 2 saqueadores con palos y sin chalecos, también en Brutal y con mucha riqueza', () => {
    for (const level of ['normal', 'brutal'] as const) {
      const w = quietWorld(level);
      w.tick = w.schedule.nextRaid;
      runStoryteller(w);
      const rs = raiders(w);
      expect(rs.length).toBe(FIRST_RAID.size);
      for (const r of rs) {
        expect(r.weapon).toBe('palo');
        expect(r.vest).toBeNull();
        expect(r.vehicle).toBeUndefined();
      }
      expect(w.schedule.firstRaidDone).toBe(true);
      expect(w.schedule.nextRaid).toBeGreaterThan(w.tick);
    }
  });

  it('avisa el día antes una sola vez y el siguiente raid ya es normal', () => {
    const w = quietWorld();
    w.tick = w.schedule.nextRaid - TICKS_PER_DAY - 1;
    runStoryteller(w);
    expect(w.log.some((l) => l.text.includes('horizonte'))).toBe(false);
    w.tick += 1;
    runStoryteller(w);
    const warned = () => w.log.filter((l) => l.text.includes('horizonte')).length;
    expect(warned()).toBe(1);
    w.tick += 10;
    runStoryteller(w);
    expect(warned()).toBe(1);
    w.tick = w.schedule.nextRaid;
    runStoryteller(w);
    expect(raiders(w).length).toBe(2);
    expect(warned()).toBe(1);
  });

  it('la cuenta atrás se ve desde el día 3 hasta que llega el raid', () => {
    const w = quietWorld();
    const cd = () => firstRaidCountdown(w);
    expect(cd()).toBeNull(); // día 1
    while (w.day < 3) w.tick += 60;
    expect(cd()).toBe(5); // llega al empezar el día 8
    w.tick = w.schedule.nextRaid - TICKS_PER_DAY;
    expect(cd()).toBe(1);
    w.tick = w.schedule.nextRaid - 10;
    expect(cd()).toBe(0);
    w.tick = w.schedule.nextRaid;
    expect(cd()).toBeNull();
    w.tick -= 10;
    w.schedule.firstRaidDone = true;
    expect(cd()).toBeNull();
  });

  it('se guarda; las partidas antiguas que ya pasaron el primer raid no lo repiten', () => {
    const w = quietWorld();
    w.schedule.firstRaidWarned = true;
    const back = loadWorld(JSON.stringify(serializeWorld(w)));
    expect(back.schedule.firstRaidWarned).toBe(true);
    expect(back.schedule.firstRaidDone).toBe(false);
    const old = JSON.parse(JSON.stringify(serializeWorld(w)));
    delete old.schedule.firstRaidDone;
    delete old.schedule.firstRaidWarned;
    expect(loadWorld(JSON.stringify(old)).schedule.firstRaidDone).toBe(false);
    old.tick = 20 * TICKS_PER_DAY;
    expect(loadWorld(JSON.stringify(old)).schedule.firstRaidDone).toBe(true);
  });
});
