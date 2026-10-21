import { describe, expect, it } from 'vitest';
import { ECONOMY, advance, buy, claimGoldenTruck, load, newGame, purchases, serialize, tap } from '../src/sim/game';
import { claimGoal, goalDone, refreshDaily, rerollGoal } from '../src/sim/daily';

function producing() {
  const s = newGame();
  s.scrapTrucks = 6;
  s.dollars = 1000;
  s.zones.crusher.carts = 3;
  return s;
}

describe('objetivos diarios', () => {
  it('sortea 3 al día: fácil, medio y difícil, de tipos distintos', () => {
    const s = producing();
    expect(refreshDaily(s, 100)).toBe(true);
    expect(refreshDaily(s, 100)).toBe(false);
    const g = s.daily!.goals;
    expect(g.map((x) => x.level)).toEqual([1, 2, 4]);
    expect(new Set(g.map((x) => x.kind)).size).toBe(3);
    expect(g.every((x) => x.target > 0 && x.progress === 0)).toBe(true);
  });

  it('es determinista: el mismo día y estado dan los mismos objetivos', () => {
    const a = producing();
    const b = producing();
    refreshDaily(a, 77);
    refreshDaily(b, 77);
    expect(a.daily).toEqual(b.daily);
  });

  it('el pedido solo puede salir como objetivo fácil', () => {
    for (let day = 0; day < 60; day++) {
      const s = producing();
      refreshDaily(s, day);
      s.daily!.goals.forEach((x) => x.kind === 'orders' && expect(x.level).toBe(1));
    }
  });

  it('el progreso sube con tocar, comprar y jugar, y no pasa del objetivo', () => {
    const s = producing();
    s.daily = { day: 1, bonusPaid: false, goals: [
      { kind: 'taps', target: 3, progress: 0, level: 1, claimed: false, rerolled: false },
      { kind: 'buys', target: 2, progress: 0, level: 2, claimed: false, rerolled: false },
      { kind: 'working', zoneId: 'crusher', target: 5, progress: 0, level: 4, claimed: false, rerolled: false },
    ] };
    for (let i = 0; i < 10; i++) tap(s);
    buy(s, purchases(s)[0].id);
    buy(s, purchases(s)[0].id);
    advance(s, 20);
    const [taps, buys, working] = s.daily!.goals;
    expect(taps.progress).toBe(3);
    expect(buys.progress).toBe(2);
    expect(working.progress).toBe(5);
    expect(goalDone(taps) && goalDone(buys) && goalDone(working)).toBe(true);
  });

  it('cobrar da 10 min de producción una sola vez y los tres dan un camión dorado gratis', () => {
    const s = producing();
    advance(s, 30);
    refreshDaily(s, 5);
    s.daily!.goals.forEach((g) => (g.progress = g.target));
    const before = s.dollars;
    const reward = claimGoal(s, 0);
    expect(reward).toBeGreaterThan(0);
    expect(s.dollars).toBeCloseTo(before + reward, 6);
    expect(claimGoal(s, 0)).toBe(0);
    expect(s.freeGolden).toBe(false);
    claimGoal(s, 1);
    claimGoal(s, 2);
    expect(s.freeGolden).toBe(true);
    expect(s.goldenVisible).toBe(ECONOMY.dailyGoals.freeGoldenSeconds);
    claimGoldenTruck(s);
    expect(s.freeGolden).toBe(false);
  });

  it('el camión dorado gratis desaparece si no se toca a tiempo', () => {
    const s = producing();
    s.freeGolden = true;
    s.goldenVisible = 3;
    advance(s, 5);
    expect(s.freeGolden).toBe(false);
  });

  it('se puede cambiar un objetivo sin cumplir, una vez, por otro tipo del mismo nivel', () => {
    const s = producing();
    refreshDaily(s, 9);
    const old = s.daily!.goals[1];
    expect(rerollGoal(s, 1)).toBe(true);
    const next = s.daily!.goals[1];
    expect(next.level).toBe(old.level);
    expect(next.kind).not.toBe(old.kind);
    expect(next.rerolled).toBe(true);
    expect(rerollGoal(s, 1)).toBe(false);
    s.daily!.goals[0].progress = s.daily!.goals[0].target;
    expect(rerollGoal(s, 0)).toBe(false);
  });

  it('al día siguiente se sortean otros y se guardan en la partida', () => {
    const s = producing();
    refreshDaily(s, 3);
    s.daily!.goals[0].progress = 1;
    const copy = load(serialize(s));
    expect(copy.daily).toEqual(s.daily);
    expect(refreshDaily(copy, 4)).toBe(true);
    expect(copy.daily!.day).toBe(4);
    expect(copy.daily!.goals.every((g) => g.progress === 0)).toBe(true);
  });

  it('una partida antigua sin objetivos carga con valores por defecto', () => {
    const old = JSON.parse(serialize(newGame()));
    delete old.daily;
    delete old.freeGolden;
    const s = load(JSON.stringify(old));
    expect(s.daily).toBeNull();
    expect(s.freeGolden).toBe(false);
  });
});

describe('objetivos diarios: tope de camiones', () => {
  it('no piden más camiones de los que el muelle puede despachar', () => {
    const s = newGame();
    s.zones.crusher.machines = 1000;
    s.zones.crusher.carts = 200;
    s.scrapTrucks = 1000;
    for (let d = 0; d < 40; d++) {
      s.daily = null;
      refreshDaily(s, d);
      for (const g of s.daily!.goals) if (g.kind === 'trucks') expect(g.target).toBeLessThanOrEqual(((0.5 * ECONOMY.dailyGoals.windowSeconds) / ECONOMY.dock.returnSeconds) * g.level);
    }
  });
});
