// Botón 🐞 (S2, aprobado por Mikel el 2026-10-23): formato de la incidencia que se abre en GitHub.
// Sin DOM: la interfaz recoge el texto y los datos, aquí solo se monta el enlace.

export const FEEDBACK_REPO = 'MikelJka/Zenit';
/** Etiquetas fijas: Zenit aloja varios juegos y la sesión de Scrap Empire filtra por estas dos. */
export const FEEDBACK_LABELS = ['feedback', 'scrap-empire'];
/** GitHub corta las URL muy largas; dejamos margen. */
const MAX_URL = 7000;

export type FeedbackKind = 'bug' | 'request';

const KIND_NAME: Record<FeedbackKind, string> = { bug: 'Fallo', request: 'Petición' };

/** Datos de la partida que acompañan al aviso (los rellena la interfaz). */
export interface FeedbackContext {
  /** Fecha y hora del envío (ISO). */
  at: string;
  url: string;
  userAgent: string;
  viewport: string;
  lang: string;
  saveVersion: number;
  /** Tiempo jugado en segundos. */
  playSeconds: number;
  dollars: number;
  totalEarned: number;
  zonesOpen: string[];
  hasPass: boolean;
  /** Errores de esta sesión del navegador, el más reciente al final. */
  errors: string[];
}

export function feedbackTitle(kind: FeedbackKind, text: string): string {
  const first = text.trim().split('\n')[0].trim() || 'Sin descripción';
  const short = first.length > 70 ? `${first.slice(0, 67)}…` : first;
  return `[${KIND_NAME[kind]}] ${short}`;
}

const playTime = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
};

export function feedbackBody(kind: FeedbackKind, text: string, ctx: FeedbackContext, maxErrors = 10): string {
  const lines = [
    text.trim() || '_Sin descripción_',
    '',
    '---',
    `- Tipo: ${KIND_NAME[kind]}`,
    `- Fecha: ${ctx.at}`,
    `- Tiempo jugado: ${playTime(ctx.playSeconds)}`,
    `- Dinero: ${Math.floor(ctx.dollars)} $ (ganado en total: ${Math.floor(ctx.totalEarned)} $)`,
    `- Zonas abiertas (${ctx.zonesOpen.length}): ${ctx.zonesOpen.join(', ') || 'ninguna'}`,
    `- Pase: ${ctx.hasPass ? 'sí' : 'no'}`,
    `- Idioma: ${ctx.lang} · versión de guardado: ${ctx.saveVersion}`,
    `- URL: ${ctx.url}`,
    `- Pantalla: ${ctx.viewport}`,
    `- Navegador: ${ctx.userAgent}`,
  ];
  if (ctx.errors.length > 0) {
    const shown = ctx.errors.slice(-Math.max(0, maxErrors));
    lines.push('', `**Errores detectados: ${ctx.errors.length}**`);
    if (shown.length > 0) lines.push('', '```', ...shown, '```');
  }
  lines.push('', '_Enviado desde el botón 🐞 de Scrap Empire._');
  return lines.join('\n');
}

/** Enlace al formulario de nueva incidencia en GitHub, ya rellenado y con las etiquetas. */
export function feedbackIssueUrl(kind: FeedbackKind, text: string, ctx: FeedbackContext): string {
  const build = (maxErrors: number, body = text) =>
    `https://github.com/${FEEDBACK_REPO}/issues/new?${new URLSearchParams({
      title: feedbackTitle(kind, text),
      body: feedbackBody(kind, body, ctx, maxErrors),
      labels: FEEDBACK_LABELS.join(','),
    }).toString()}`;
  for (const n of [10, 5, 2, 0]) {
    const url = build(n);
    if (url.length <= MAX_URL) return url;
  }
  return build(0, `${text.slice(0, 1500)}…`);
}
