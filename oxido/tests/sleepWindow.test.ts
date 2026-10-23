// Sueño (#5 del 🐞, decisión de Mikel del 2026-10-23, opción B): 6 h en cama y 7 en el suelo,
// en la franja de 21:00 a 07:00 (los «Nocturno», de 09:00 a 19:00); fuera, solo si están agotados.
import { describe, expect, it } from 'vitest';
import { flatWorld } from './helpers';
import { TICKS_PER_HOUR } from '../src/sim/time';
import { EXHAUSTED, inSleepWindow, sleepWindowOf, SLEEP_HOURS_BED, SLEEP_HOURS_GROUND } from '../src/sim/needs';
import { NIGHT_OWL_SLEEP_WINDOW, SLEEP_WINDOW } from '../src/data/sleep';
import { TRAITS } from '../src/data/colonists';

type W = ReturnType<typeof flatWorld>;

/** Avanza el reloj (sin simular) hasta la hora `h`. */
function setHour(w: W, h: number): void {
  while (Math.abs(w.hour - h) > 0.01) w.tick++;
}

function tiredColonist(w: W, rest: number) {
  const c = w.colonists[0];
  c.needs.rest = rest;
  c.needs.food = 1;
  c.needs.water = 1;
  return c;
}

describe('sueño (#5 del 🐞)', () => {
  it('los números elegidos por Mikel', () => {
    expect(SLEEP_HOURS_BED).toBe(6);
    expect(SLEEP_HOURS_GROUND).toBe(7);
    expect(SLEEP_WINDOW).toEqual({ from: 21, to: 7 });
    expect(NIGHT_OWL_SLEEP_WINDOW).toEqual({ from: 9, to: 19 });
  });

  it('la franja cruza la medianoche', () => {
    expect(inSleepWindow(SLEEP_WINDOW, 21)).toBe(true);
    expect(inSleepWindow(SLEEP_WINDOW, 23.5)).toBe(true);
    expect(inSleepWindow(SLEEP_WINDOW, 3)).toBe(true);
    expect(inSleepWindow(SLEEP_WINDOW, 6.99)).toBe(true);
    expect(inSleepWindow(SLEEP_WINDOW, 7)).toBe(false);
    expect(inSleepWindow(SLEEP_WINDOW, 14)).toBe(false);
    expect(inSleepWindow(SLEEP_WINDOW, 20.9)).toBe(false);
    expect(inSleepWindow(NIGHT_OWL_SLEEP_WINDOW, 12)).toBe(true);
    expect(inSleepWindow(NIGHT_OWL_SLEEP_WINDOW, 22)).toBe(false);
  });

  it('los «Nocturno» tienen la franja de día', () => {
    const w = flatWorld(1);
    const c = w.colonists[0];
    c.traits = [];
    expect(sleepWindowOf(c)).toEqual(SLEEP_WINDOW);
    c.traits = [TRAITS.find((t) => t.id === 'nocturno')!];
    expect(sleepWindowOf(c)).toEqual(NIGHT_OWL_SLEEP_WINDOW);
  });

  it('de día, cansado pero no agotado, no se acuesta', () => {
    const w = flatWorld(1, { needs: true });
    const c = tiredColonist(w, 0.2);
    c.traits = [];
    setHour(w, 12);
    for (let t = 0; t < TICKS_PER_HOUR; t++) w.step();
    expect(c.activity).not.toBe('sleeping');
  });

  it('de día, agotado, sí se acuesta', () => {
    const w = flatWorld(1, { needs: true });
    const c = tiredColonist(w, EXHAUSTED - 0.02);
    c.traits = [];
    setHour(w, 12);
    let slept = false;
    for (let t = 0; t < TICKS_PER_HOUR && !slept; t++) {
      w.step();
      slept = c.activity === 'sleeping';
    }
    expect(slept).toBe(true);
  });

  it('a las 21:00, cansado, se acuesta; un «Nocturno» a esa hora no', () => {
    for (const owl of [false, true]) {
      const w = flatWorld(1, { needs: true });
      const c = tiredColonist(w, 0.3);
      c.traits = owl ? [TRAITS.find((t) => t.id === 'nocturno')!] : [];
      setHour(w, 21.1);
      let slept = false;
      for (let t = 0; t < TICKS_PER_HOUR && !slept; t++) {
        w.step();
        slept = c.activity === 'sleeping';
      }
      expect(slept).toBe(!owl);
    }
  });

  it('un «Nocturno» cansado se acuesta de día', () => {
    const w = flatWorld(1, { needs: true });
    const c = tiredColonist(w, 0.3);
    c.traits = [TRAITS.find((t) => t.id === 'nocturno')!];
    setHour(w, 10);
    let slept = false;
    for (let t = 0; t < TICKS_PER_HOUR && !slept; t++) {
      w.step();
      slept = c.activity === 'sleeping';
    }
    expect(slept).toBe(true);
  });
});
