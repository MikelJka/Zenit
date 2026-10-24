import { describe, expect, it } from 'vitest';
import { ECONOMY, advance, canPrestige, earn, load, newGame, prestige, prestigeMultiplier, prestigeReward, serialize, tap, buy } from '../src/sim/game';
import { doubleOfflineEarnings } from '../src/sim/offline';

/** Partida con la zona 8 (coches) abierta y `earned` dólares ganados en la partida. */
function lateGame(earned: number) {
  const s = newGame();
  s.zones[ECONOMY.prestige.unlockZone].unlocked = true;
  s.zones[ECONOMY.prestige.unlockZone].machines = 1;
  s.zones.smelter.unlocked = true;
  s.zones.crusher.machineLevel = 7;
  s.scrapTrucks = 12;
  s.dockLevel = 4;
  earn(s, earned);
  return s;
}

describe('prestigio (Parte 28)', () => {
  it('Tornillos de oro = √(ganado en la partida / 1e9), hacia abajo', () => {
    expect(prestigeReward(lateGame(999_999_999))).toBe(0);
    expect(prestigeReward(lateGame(1e9))).toBe(1);
    expect(prestigeReward(lateGame(4e9))).toBe(2);
    expect(prestigeReward(lateGame(8.9e9))).toBe(2);
    expect(prestigeReward(lateGame(1e12))).toBe(31);
  });

  it('solo se puede reiniciar con la zona 8 abierta y al menos un tornillo', () => {
    const early = newGame();
    earn(early, 1e12);
    expect(canPrestige(early)).toBe(false);
    expect(prestige(early)).toBeNull();
    expect(canPrestige(lateGame(5e8))).toBe(false);
    expect(canPrestige(lateGame(1e9))).toBe(true);
  });

  it('el reinicio conserva Pase, racha, logros, total, destinos y tornillos; lo demás vuelve a cero', () => {
    const s = lateGame(9e9);
    s.goldScrews = 2;
    s.hasPass = true;
    s.streakDay = 4;
    s.lastClaimDay = 100;
    s.bestStreak = 6;
    s.achievements = ['a', 'b'];
    s.transports.rail.routesUnlocked = ['far'];
    s.transports.rail.route = 'far';
    s.transports.rail.level = 3;
    s.transports.sea.captainLevel = 5;
    const total = s.totalEarned;
    const n = prestige(s)!;
    expect(n.goldScrews).toBe(2 + 3);
    expect(n.prestiges).toBe(1);
    expect(n.hasPass).toBe(true);
    expect([n.streakDay, n.lastClaimDay, n.bestStreak]).toEqual([4, 100, 6]);
    expect(n.achievements).toEqual(['a', 'b']);
    expect(n.totalEarned).toBe(total);
    expect(n.transports.rail.routesUnlocked).toEqual(['far']);
    expect(n.transports.rail.route).toBe('far');
    expect(n.transports.rail.level).toBe(0);
    expect(n.transports.sea.captainLevel).toBe(0);
    expect(n.dollars).toBe(0);
    expect(n.runEarned).toBe(0);
    expect(n.scrapTrucks).toBe(0);
    expect(n.dockLevel).toBe(0);
    expect(n.zones.crusher.machineLevel).toBe(0);
    expect(n.zones.cars.unlocked).toBe(false);
    expect(n.zones.smelter.unlocked).toBe(false);
    // La partida vieja no se toca.
    expect(s.goldScrews).toBe(2);
  });

  it('cada tornillo da +5 % a lo que se cobra', () => {
    const play = (screws: number) => {
      const s = newGame();
      s.goldScrews = screws;
      for (let i = 0; i < 200; i++) tap(s);
      advance(s, 120);
      return s.dollars;
    };
    expect(prestigeMultiplier({ ...newGame(), goldScrews: 4 })).toBeCloseTo(1.2);
    expect(play(4)).toBeCloseTo(play(0) * 1.2, 6);
  });

  it('el dinero de la partida y el total suben juntos, y el de la partida se reinicia', () => {
    const s = newGame();
    for (let i = 0; i < 50; i++) tap(s);
    advance(s, 60);
    doubleOfflineEarnings(s, 10);
    expect(s.runEarned).toBeCloseTo(s.totalEarned, 9);
    buy(s, 'scrapTruck');
    expect(s.runEarned).toBeCloseTo(s.totalEarned, 9);
  });

  it('partidas antiguas: lo ganado cuenta como de esta partida y sin tornillos', () => {
    const old = JSON.parse(serialize(lateGame(4e9)));
    delete old.runEarned;
    delete old.goldScrews;
    delete old.prestiges;
    const s = load(JSON.stringify(old));
    expect(s.runEarned).toBe(4e9);
    expect(s.goldScrews).toBe(0);
    expect(prestigeReward(s)).toBe(2);
  });

  it('el reinicio sobrevive al guardado', () => {
    const n = prestige(lateGame(1e10))!;
    const back = load(serialize(n));
    expect(back.goldScrews).toBe(3);
    expect(back.runEarned).toBe(0);
  });
});
