// Primeros pasos (propuesta D, aprobada por Mikel el 2026-10-22): guía opcional al empezar una
// partida nueva. Lo cuenta Nora, una voz por la radio (elegido por Mikel el 2026-10-23): una tarjeta
// con su radio dibujada, el texto que va saliendo letra a letra y una flecha que señala el botón que
// hay que tocar. Empieza con un saludo y acaba con una despedida. Los pasos están en `src/data/tutorial.json`; saber si un paso está hecho lo decide
// `src/sim/tutorial.ts` mirando la partida. La guía no cambia nada de la partida ni va en la
// partida guardada: su avance se recuerda en este navegador, junto a la semilla del mapa.
import { TUTORIAL_INTRO, TUTORIAL_NARRATOR, TUTORIAL_OUTRO, TUTORIAL_STEPS, TutorialTarget } from '../data/tutorial';
import { advanceTutorial } from '../sim/tutorial';
import type { World } from '../sim/world';

const STATE_KEY = 'oxido-primeros-pasos';
const WANT_KEY = 'oxido-primeros-pasos-quiero';

/** Si el jugador quiere la guía en las partidas nuevas (por defecto, sí). */
export function tutorialWanted(): boolean {
  try {
    return localStorage.getItem(WANT_KEY) !== '0';
  } catch {
    return true;
  }
}
export function setTutorialWanted(on: boolean): void {
  try {
    localStorage.setItem(WANT_KEY, on ? '1' : '0');
  } catch {
    // nada
  }
}

interface SavedState {
  seed: number;
  /** -1: el saludo de la radio; luego, el paso en curso. */
  step: number;
}
function readState(): SavedState | null {
  try {
    const s = JSON.parse(localStorage.getItem(STATE_KEY) ?? 'null') as SavedState | null;
    return s && typeof s.seed === 'number' && typeof s.step === 'number' ? s : null;
  } catch {
    return null;
  }
}
function writeState(s: SavedState | null): void {
  try {
    if (s) localStorage.setItem(STATE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STATE_KEY);
  } catch {
    // nada
  }
}

interface Options {
  getWorld: () => World | null;
  /** Categoría que se ve ahora en 🏗 Construir. */
  buildCategory: () => string;
  /** Suena la radio (un chasquido) al empezar a hablar. */
  onSpeak?: () => void;
}

/** Milisegundos por letra al escribir el texto. */
const TYPE_MS = 28;

/** Dibuja la radio de Nora (pixel art, 20×20) en un lienzo; `talk` enciende la luz y las ondas. */
function drawRadio(ctx: CanvasRenderingContext2D, talk: boolean, frame: number): void {
  const px = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };
  ctx.clearRect(0, 0, 20, 20);
  // Antena.
  px(14, 1, 1, 6, '#9a9a90');
  px(13, 0, 3, 1, talk && frame % 2 ? '#f0d060' : '#c0c0b0');
  // Ondas al hablar.
  if (talk) {
    const c = frame % 2 ? '#f0c040' : '#c89030';
    px(17, 1, 1, 2, c);
    px(18, 0, 1, 1, c);
    px(11, 1, 1, 2, c);
    px(10, 0, 1, 1, c);
  }
  // Caja oxidada con borde.
  px(1, 7, 18, 12, '#3a2418');
  px(2, 8, 16, 10, '#8a4a28');
  px(2, 8, 16, 1, '#b06838');
  px(2, 17, 16, 1, '#5a3018');
  // Altavoz (rejilla).
  px(3, 10, 7, 6, '#2a1a12');
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) px(4 + x * 2, 11 + y * 2, 1, 1, '#a07040');
  // Dial y aguja.
  px(11, 10, 6, 3, '#e8d8a0');
  px(11, 10, 6, 1, '#fff0c0');
  px(12 + (talk ? frame % 4 : 1), 10, 1, 3, '#c03020');
  // Botones y luz.
  px(11, 14, 2, 2, '#2a1a12');
  px(15, 14, 2, 2, '#2a1a12');
  px(14, 15, 1, 1, talk ? (frame % 2 ? '#80ff60' : '#40c030') : '#305028');
  // Patas.
  px(3, 19, 2, 1, '#2a1a12');
  px(15, 19, 2, 1, '#2a1a12');
}

export interface Tutorial {
  /** La próxima partida que se cargue empieza con la guía. */
  startOnNextMap(): void;
  /** Se ha cargado un mapa: sigue la guía si era de ese mapa; si no, la quita. */
  mapReady(seed: number): void;
}

const visible = (el: HTMLElement | null): el is HTMLElement => {
  if (!el || el.closest('[hidden]')) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};
const overlap = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

export function mountTutorial(opts: Options): Tutorial {
  const card = document.createElement('div');
  card.id = 'tutorial';
  card.className = 'panel';
  card.hidden = true;
  card.setAttribute('role', 'status');
  const portrait = document.createElement('canvas');
  portrait.className = 'tu-portrait';
  portrait.width = 20;
  portrait.height = 20;
  portrait.setAttribute('aria-hidden', 'true');
  const pctx = portrait.getContext('2d');
  const main = document.createElement('div');
  main.className = 'tu-main';
  const who = document.createElement('div');
  who.className = 'tu-who';
  who.textContent = `📻 ${TUTORIAL_NARRATOR.name} · ${TUTORIAL_NARRATOR.station}`;
  const head = document.createElement('div');
  head.className = 'tu-head';
  const title = document.createElement('strong');
  const skip = document.createElement('button');
  skip.type = 'button';
  skip.textContent = 'Saltar guía';
  skip.title = 'Quitar la guía de primeros pasos en esta partida';
  head.append(title, skip);
  const text = document.createElement('div');
  text.className = 'tu-text';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'tu-next';
  next.textContent = 'Te recibo ▸';
  next.hidden = true;
  main.append(who, head, text, next);
  card.append(portrait, main);
  const arrow = document.createElement('div');
  arrow.id = 'tutorial-arrow';
  arrow.hidden = true;
  arrow.setAttribute('aria-hidden', 'true');
  document.body.append(card, arrow);

  let state: SavedState | null = null;
  let pending = false;
  let finishedAt = 0;
  /** Para desplazar la hoja hasta el botón una sola vez por paso y elemento. */
  let scrolledTo: HTMLElement | null = null;

  skip.addEventListener('click', () => stop());
  next.addEventListener('click', () => {
    if (!state || state.step >= 0) return;
    state.step = 0;
    writeState(state);
    tick();
  });

  // Lo que dice la radio: el texto entero y cuántas letras se ven ya.
  let said = '';
  let shown = 0;
  let frame = 0;
  /** Cambia lo que dice; si es nuevo, empieza a escribirlo letra a letra con un chasquido. */
  function say(msg: string): void {
    if (msg === said) return;
    said = msg;
    shown = 0;
    text.textContent = '';
    opts.onSpeak?.();
  }
  // Tocar el texto lo enseña entero.
  text.addEventListener('click', () => {
    shown = said.length;
    text.textContent = said;
  });
  if (pctx) drawRadio(pctx, false, 0);
  window.setInterval(() => {
    if (card.hidden) return;
    frame++;
    const talking = shown < said.length;
    if (talking) {
      shown = Math.min(said.length, shown + 2);
      text.textContent = said.slice(0, shown);
    }
    if (pctx && (talking || frame % 6 === 0)) drawRadio(pctx, talking, Math.floor(frame / 3));
  }, TYPE_MS * 2);

  function stop(): void {
    if (state) writeState({ seed: state.seed, step: TUTORIAL_STEPS.length });
    state = null;
    card.hidden = true;
    arrow.hidden = true;
  }

  /** Elemento al que señalar para el paso: el botón de la barra, la pestaña o el botón de la hoja. */
  function targetElement(t: TutorialTarget | undefined): HTMLElement | null {
    if (!t) return null;
    if (t.menu === 'element') {
      for (const sel of t.selectors ?? []) {
        const el = document.querySelector<HTMLElement>(sel);
        if (visible(el)) return el;
      }
      return null;
    }
    const sheet = document.getElementById(t.menu === 'orders' ? 'order-modes' : 'build-modes');
    const bar = document.getElementById(t.menu === 'orders' ? 'orders-btn' : 'build-btn');
    if (!sheet || sheet.hidden) return bar;
    if (sheet.classList.contains('collapsed')) {
      const expand = sheet.querySelector<HTMLElement>('.ts-expand');
      return visible(expand) ? expand : bar;
    }
    let el: HTMLElement | null = null;
    if (t.menu === 'orders' && t.mode) el = sheet.querySelector<HTMLElement>(`button[data-mode="${t.mode}"]`);
    else if (t.build) {
      if (t.category && opts.buildCategory() !== t.category) el = sheet.querySelector<HTMLElement>(`#build-tabs button[data-cat="${t.category}"]`);
      else el = sheet.querySelector<HTMLElement>(`button[data-build="${t.build}"]`);
    }
    if (!el) return bar;
    // Ya está elegido: el jugador está marcando en el mapa, no hace falta flecha.
    if (el.classList.contains('active')) return null;
    if (scrolledTo !== el) {
      scrolledTo = el;
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    return visible(el) ? el : bar;
  }

  /** Pone la tarjeta abajo a la izquierda, o donde no tape las hojas ni la pista de la orden. */
  function placeCard(): void {
    const obstacles = ['order-modes', 'build-modes', 'design-hint', 'colonist-panel']
      .map((id) => document.getElementById(id))
      .filter(visible)
      .map((el) => el.getBoundingClientRect());
    const h = card.offsetHeight;
    const w = card.offsetWidth;
    const H = window.innerHeight;
    const tops = [H - 64 - h, ...obstacles.map((r) => r.top - 8 - h), 114];
    for (const top of tops) {
      if (top < 60) continue;
      const r = new DOMRect(8, top, w, h);
      if (!obstacles.some((o) => overlap(r, o))) {
        card.style.top = `${top}px`;
        return;
      }
    }
    card.style.top = '114px';
  }

  function placeArrow(target: HTMLElement | null): void {
    if (!target) {
      arrow.hidden = true;
      return;
    }
    const r = target.getBoundingClientRect();
    const up = r.top < 60; // sin sitio encima: debajo, apuntando hacia arriba
    arrow.hidden = false;
    arrow.classList.toggle('up', up);
    arrow.style.left = `${r.left + r.width / 2}px`;
    arrow.style.top = up ? `${r.bottom + 4}px` : `${r.top - 4}px`;
  }

  function render(): void {
    if (!state) return;
    if (state.step < 0) {
      // El saludo: espera a que el jugador conteste.
      title.textContent = TUTORIAL_INTRO.title;
      say(TUTORIAL_INTRO.text);
      skip.textContent = 'Saltar guía';
      next.hidden = false;
      arrow.hidden = true;
      card.hidden = false;
      placeCard();
      return;
    }
    next.hidden = true;
    const step = TUTORIAL_STEPS[state.step];
    if (!step) {
      // Terminada: la despedida un rato (hasta que acabe de hablar y se pueda leer) y fuera.
      title.textContent = `✅ ${TUTORIAL_OUTRO.title}`;
      say(TUTORIAL_OUTRO.text);
      skip.textContent = 'Cerrar';
      arrow.hidden = true;
      card.hidden = false;
      placeCard();
      if (Date.now() - finishedAt > 9000 + said.length * TYPE_MS) stop();
      return;
    }
    title.textContent = `${state.step + 1}/${TUTORIAL_STEPS.length} · ${step.title}`;
    say(step.text);
    skip.textContent = 'Saltar guía';
    card.hidden = false;
    placeCard();
    placeArrow(targetElement(step.target));
  }

  function tick(): void {
    const w = opts.getWorld();
    if (!state || !w || w.map.seed !== state.seed) {
      if (!state) return;
      card.hidden = true;
      arrow.hidden = true;
      return;
    }
    if (state.step >= 0 && state.step < TUTORIAL_STEPS.length) {
      const to = advanceTutorial(w, TUTORIAL_STEPS, state.step);
      if (to !== state.step) {
        state.step = to;
        scrolledTo = null;
        writeState(state);
        if (to >= TUTORIAL_STEPS.length) finishedAt = Date.now();
      }
    }
    render();
  }
  window.setInterval(tick, 300);
  window.addEventListener('resize', () => state && render());

  return {
    startOnNextMap() {
      pending = true;
    },
    mapReady(seed: number) {
      if (pending) {
        pending = false;
        state = { seed, step: -1 };
        writeState(state);
      } else {
        const saved = readState();
        state = saved && saved.seed === seed && saved.step < TUTORIAL_STEPS.length ? saved : null;
      }
      scrolledTo = null;
      said = '';
      if (!state) {
        card.hidden = true;
        arrow.hidden = true;
      }
    },
  };
}
