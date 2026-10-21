/** Tipos y contador de los objetivos diarios. Sin dependencias, para que `game.ts` pueda apuntar el progreso sin ciclos. */
export type DailyKind = 'trucks' | 'units' | 'buys' | 'orders' | 'taps' | 'working';

export interface DailyGoal {
  kind: DailyKind;
  /** Producto (id de zona) de «entregar» y «línea trabajando». */
  zoneId?: string;
  target: number;
  progress: number;
  /** Multiplicador de dificultad: 1 fácil, 2 medio, 4 difícil. */
  level: 1 | 2 | 4;
  claimed: boolean;
  /** Ya se cambió una vez hoy (con anuncio). */
  rerolled: boolean;
}

export interface DailyState {
  /** Número de día local en que se sortearon. */
  day: number;
  goals: DailyGoal[];
  /** Ya se dio el camión dorado gratis por cumplir los tres. */
  bonusPaid: boolean;
}

/** Suma `amount` al progreso de los objetivos de ese tipo (y de esa zona, si el objetivo la pide). */
export function dailyAdd(daily: DailyState | null, kind: DailyKind, amount: number, zoneId?: string): void {
  if (!daily) return;
  for (const g of daily.goals) {
    if (g.kind !== kind || (g.zoneId && g.zoneId !== zoneId)) continue;
    g.progress = Math.min(g.target, g.progress + amount);
  }
}
