import type { SimModule } from './module';
import type { Game } from './save';
import { tick } from './clock';

/** Avanza la partida `seconds` en pasos de 1 s; sirve para el juego abierto y para las ganancias con el juego cerrado. */
export function advance(g: Game, modules: readonly SimModule[], seconds: number): number {
  return tick(g.clock, seconds, (dt) => {
    for (const m of modules) m.step(g.game, g.game.modules[m.id], dt);
  });
}

/** Segundos a simular al volver: lo transcurrido desde el último guardado, con tope. */
export function offlineSeconds(savedAt: number, now: number, capSeconds: number): number {
  return Math.max(0, Math.min((now - savedAt) / 1000, capSeconds));
}
