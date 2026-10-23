// Caducidad de la comida (decisión de Mikel del 2026-10-23, opción B cambiada por él): cada unidad
// tiene su fecha de caducidad desde que se obtiene; mientras no llega está fresca y, al llegar, se
// estropea entera de golpe. Los montones guardan cada lote con lo que le queda. En una nevera con
// corriente, o cuando hace frío, el tiempo no corre. Puro y determinista: sin Phaser ni DOM.
import { lacksPower } from './power';
import { coldNow } from './seasons';
import type { World } from './world';

/** Está en una nevera terminada que tiene corriente. */
export function inFridge(w: World, x: number, y: number): boolean {
  const s = w.structures.at(x, y);
  return !!s && s.built && !!s.def.fridge && !lacksPower(s);
}

/** Una hora: la comida del suelo envejece y la que caduca se estropea. Devuelve cuánto se ha perdido. */
export function spoilHour(w: World): number {
  if (coldNow(w)) return 0;
  let lost = 0;
  for (const st of w.items.list()) {
    if (!st.lots || inFridge(w, st.x, st.y)) continue;
    lost += w.items.age(st.x, st.y, 1);
  }
  w.spoiled += lost;
  return lost;
}
