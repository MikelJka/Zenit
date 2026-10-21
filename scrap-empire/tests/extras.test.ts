import { describe, expect, it } from 'vitest';
import {
  ECONOMY,
  activateBoost,
  advance,
  canBoost,
  claimDaily,
  claimGoldenTruck,
  dailyReward,
  incomePerSecond,
  load,
  newGame,
  offlineCapSeconds,
  streakDayFor,
  tap,
} from '../src/sim/game';
import { pack, unpack } from '../src/sim/offline';

function producing() {
  const s = newGame();
  s.scrapTrucks = 4;
  s.zones.crusher.carts = 3;
  return s;
}

describe('racha de 7 días', () => {
  it('sube un día cada día seguido y vuelve a empezar tras el 7', () => {
    const s = producing();
    const days: number[] = [];
    for (let d = 100; d < 109; d++) {
      days.push(streakDayFor(s, d));
      claimDaily(s, d);
    }
    expect(days).toEqual([1, 2, 3, 4, 5, 6, 7, 1, 2]);
  });

  it('solo se cobra una vez al día', () => {
    const s = producing();
    expect(claimDaily(s, 5)).toBeGreaterThan(0);
    expect(claimDaily(s, 5)).toBe(0);
  });

  it('si se falta un día, vuelve al día 1', () => {
    const s = producing();
    claimDaily(s, 10);
    claimDaily(s, 11);
    claimDaily(s, 12);
    expect(streakDayFor(s, 14)).toBe(1);
  });

  it('el día 1 da 10 min de producción y el día 7, 2 h', () => {
    const s = producing();
    expect(dailyReward(s, 0)).toBeCloseTo(10 * 60 * incomePerSecond(s), 6);
    s.streakDay = 6;
    s.lastClaimDay = 0;
    expect(dailyReward(s, 1)).toBeCloseTo(120 * 60 * incomePerSecond(s), 6);
  });
});

describe('empujón ×2', () => {
  it('dobla lo que pagan los camiones durante 30 min y luego hay que esperar', () => {
    const a = producing();
    const b = producing();
    expect(activateBoost(b)).toBe(true);
    advance(a, 600);
    advance(b, 600);
    expect(b.dollars).toBeCloseTo(2 * a.dollars, 6);
    expect(canBoost(b)).toBe(false);
    advance(b, ECONOMY.boost.seconds - 600 + 1);
    expect(b.boostSeconds).toBe(0);
    expect(canBoost(b)).toBe(false);
    advance(b, ECONOMY.boost.cooldownSeconds);
    expect(canBoost(b)).toBe(true);
  });
});

describe('camión dorado', () => {
  it('aparece cada 15 min y espera 20 s', () => {
    const s = newGame();
    advance(s, ECONOMY.goldenTruck.everySeconds - 1);
    expect(s.goldenVisible).toBe(0);
    advance(s, 1);
    expect(s.goldenVisible).toBe(ECONOMY.goldenTruck.visibleSeconds);
    advance(s, ECONOMY.goldenTruck.visibleSeconds);
    expect(s.goldenVisible).toBe(0);
  });

  it('si se toca a tiempo paga ×10 lo que hay en el muelle', () => {
    const s = newGame();
    s.dockUnits = 5;
    s.dockValue = 20;
    expect(claimGoldenTruck(s)).toBe(0);
    s.goldenVisible = 5;
    expect(claimGoldenTruck(s)).toBe(200);
    expect(s.dollars).toBe(200);
    expect(s.dockUnits).toBe(0);
    expect(claimGoldenTruck(s)).toBe(0);
  });
});

describe('Pase de chatarrero', () => {
  it('sube el tope de lo ganado fuera de 1 h a 8 h', () => {
    const s = producing();
    expect(offlineCapSeconds(s)).toBe(3600);
    s.hasPass = true;
    expect(offlineCapSeconds(s)).toBe(8 * 3600);
    const r = unpack(pack(s, 0), 10 * 3600 * 1000);
    expect(r.simulatedSeconds).toBe(8 * 3600);
  });

  it('las partidas antiguas no tienen pase ni racha', () => {
    const s = load(JSON.stringify({ dollars: 3 }));
    expect(s.hasPass).toBe(false);
    expect(s.streakDay).toBe(0);
    expect(s.lastClaimDay).toBe(-1);
    tap(s);
  });
});

describe('premio diario sin producción', () => {
  it('al empezar no se puede cobrar ni se gasta la racha', () => {
    const s = newGame();
    expect(claimDaily(s, 3)).toBe(0);
    expect(s.lastClaimDay).toBe(-1);
  });
});
