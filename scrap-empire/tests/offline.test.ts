import { describe, expect, it } from 'vitest';
import { ECONOMY, advance, buy, newGame, tap } from '../src/sim/game';
import { doubleOfflineEarnings, pack, recoverLostTime, unpack } from '../src/sim/offline';

function playing() {
  const s = newGame();
  for (let i = 0; i < 40; i++) tap(s);
  advance(s, 1);
  s.dollars = 100;
  buy(s, 'scrapTruck');
  return s;
}

describe('guardado y ganancias con el juego cerrado', () => {
  it('sin partida guardada empieza una nueva', () => {
    const r = unpack(null, 1000);
    expect(r.state.dollars).toBe(0);
    expect(r.simulatedSeconds).toBe(0);
  });

  it('un archivo corrupto no rompe: partida nueva', () => {
    expect(unpack('{no es json', 1000).state.totalEarned).toBe(0);
  });

  it('guardar y cargar al instante conserva el estado', () => {
    const s = playing();
    const r = unpack(pack(s, 5000), 5000);
    expect(r.state).toEqual(s);
  });

  it('simula el tiempo cerrado y gana dólares', () => {
    const s = playing();
    const r = unpack(pack(s, 0), 600 * 1000);
    expect(r.simulatedSeconds).toBe(600);
    expect(r.dollarsEarned).toBeGreaterThan(0);
  });

  it('el tope de horas fuera frena la simulación', () => {
    const s = playing();
    const r = unpack(pack(s, 0), 10 * 3600 * 1000);
    expect(r.awaySeconds).toBe(36000);
    expect(r.simulatedSeconds).toBe(ECONOMY.offlineCapSeconds);
  });

  it('un reloj que va hacia atrás no resta tiempo', () => {
    const r = unpack(pack(playing(), 9000), 1000);
    expect(r.simulatedSeconds).toBe(0);
  });
});

describe('anuncios al volver', () => {
  it('pasar del tope deja segundos y dólares por recuperar, hasta el tope del Pase', () => {
    const s = playing();
    const r = unpack(pack(s, 0), 10 * 3600 * 1000);
    expect(r.simulatedSeconds).toBe(ECONOMY.offlineCapSeconds);
    expect(r.lostSeconds).toBe(ECONOMY.pass.offlineCapSeconds - ECONOMY.offlineCapSeconds);
    expect(r.lostDollars).toBeGreaterThan(0);
  });

  it('sin pasar del tope no hay nada que recuperar', () => {
    const s = playing();
    const r = unpack(pack(s, 0), 1800 * 1000);
    expect(r.lostSeconds).toBe(0);
    expect(r.lostDollars).toBe(0);
  });

  it('con el Pase el tope ya es el máximo y no queda nada que recuperar hasta las 8 h', () => {
    const s = playing();
    s.hasPass = true;
    const r = unpack(pack(s, 0), 6 * 3600 * 1000);
    expect(r.lostSeconds).toBe(0);
  });

  it('recuperar suma lo perdido y duplicar suma otra vez lo ganado', () => {
    const r = unpack(pack(playing(), 0), 5 * 3600 * 1000);
    const before = r.state.dollars;
    const gained = recoverLostTime(r.state, r.lostSeconds);
    expect(gained).toBeGreaterThan(0);
    expect(r.state.dollars).toBeCloseTo(before + gained);
    const extra = doubleOfflineEarnings(r.state, r.dollarsEarned);
    expect(extra).toBe(r.dollarsEarned);
    expect(doubleOfflineEarnings(r.state, -5)).toBe(0);
  });
});
