// Pantalla principal en vertical (provisional, sin 3D todavía). Solo lee el estado y llama a la simulación.
import {
  ECONOMY,
  ROUTES,
  ZONES,
  SAVE_VERSION,
  captainPay,
  warehouseBonus,
  warehouseCapacity,
  captainTrip,
  useTransportAd,
  activateBoost,
  setRoute,
  advance,
  bottleneck,
  cartBatch,
  orderBonus,
  transportLoad,
  buy,
  canPrestige,
  prestige,
  prestigeReward,
  prestigeUnlocked,
  ACHIEVEMENTS,
  canBoost,
  checkAchievements,
  claimDaily,
  currentGoal,
  milestoneReward,
  claimGoldenTruck,
  dailyReward,
  dockLoad,
  dockProductCap,
  helperLevelsReady,
  incomePerSecond,
  purchases,
  scrapPerSecond,
  streakDayFor,
  tap,
  zoneCapacity,
  zoneRate,
  zoneStatus,
  type GameState,
  type Purchase,
} from '../sim/game';
import { claimGoal, goalDone, refreshDaily, rerollGoal } from '../sim/daily';
import type { DailyGoal } from '../sim/dailyCore';
import { nextStep, stepKey, type Step } from '../sim/advice';
import { TUTORIAL_END, tutorialStep, type TutorialStep } from '../sim/tutorial';
import { HELPER_LOOKS } from './look';
import { FORKLIFT, helperFace, esc, inlineIcon, productIcon, truck, uiIcon, type UiIconName } from './icons';
import { createYard, machineGrade } from './yard';
import { adPrivacyOptionsAvailable, buyPass, initAds, showAdPrivacyOptions, showRewardedAd } from './ads';
import { doubleOfflineEarnings, pack, recoverLostTime, unpack } from '../sim/offline';
import { fromCode, toCode } from '../sim/transfer';
import { achievementName, getLang, helperBio, helperName, setLang, t, zoneName, zoneProduct, type Lang } from './texts';
import { store } from './storage';
import { showTitle } from './title';
import { applyAccessibility, readFlag, writeFlag, isBigText, isHighContrast, reducedMotion, setBigText, setHighContrast, setReducedMotion } from './prefs';
import { buzz, isMuted, isMusicOn, isSfxOn, isVibeOn, play, setMuted, setMusicOn, setSfxOn, setVibeOn, syncMusic } from './sound';
import { installErrorCapture, capturedErrors } from './bugReport';
import { feedbackIssueUrl, type FeedbackKind } from '../sim/feedback';
import { cleanNick, getNick, rankingEnabled, setNick, submitScore, topScores } from './ranking';

const AUTOSAVE_MS = 10_000;
/** Interruptor del siguiente paso recomendado y el paso que se ocultó con la ✕. */
const NEXT_KEY = 'chatarrero.next';
const NEXT_HIDDEN_KEY = 'chatarrero.nextHidden';

function fmt(n: number): string {
  if (n < 1000) return n.toFixed(n < 10 ? 1 : 0);
  const units = ['K', 'M', 'B', 'T'];
  let i = -1;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  return n.toFixed(n < 10 ? 2 : 1) + units[i];
}

/** Número del día según la hora local (para la racha). */
function localDay(): number {
  const now = new Date();
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000);
}

function readSave(): string | null {
  return store.read();
}

function writeSave(state: GameState): void {
  store.write(pack(state, Date.now()));
}

function shopIcon(kind: string, zoneId?: string): string {
  const def = zoneId ? ZONES.find((z) => z.id === zoneId) : undefined;
  let inner = '';
  if (kind === 'carts' || kind === 'cartLevel') inner = `<g transform="scale(0.8) translate(-1 9)">${FORKLIFT}</g>`;
  else if (kind === 'helper' && def) inner = helperFace(HELPER_LOOKS[def.helper.id]);
  else if (def) inner = `<g transform="scale(1.3)">${productIcon(def.id)}</g>`;
  else if (kind === 'scrapTruck') inner = `<g transform="scale(0.42) translate(2 10)">${truck('#7d8b6a', '#9fb07f')}</g>`;
  else if (kind === 'dock') inner = `<g><rect x="-11" y="-2" width="10" height="9" fill="#c58a4a" stroke="#2a1d14"/><rect x="1" y="-2" width="10" height="9" fill="#c58a4a" stroke="#2a1d14"/><rect x="-5" y="-11" width="10" height="9" fill="#c58a4a" stroke="#2a1d14"/></g>`;
  return `<svg class="icon" viewBox="-16 -16 32 32" aria-hidden="true">${inner}</svg>`;
}

/** Ritmo por segundo: con decimales si es muy pequeño (las líneas del puerto producen menos de una pieza por segundo). */
function rateTxt(n: number): string {
  return n < 10 ? (n < 1 ? n.toFixed(3) : n.toFixed(1)) : fmt(n);
}

export function startApp(root: HTMLElement): void {
  // Con el pase, las recompensas se dan sin anuncio.
  let state!: GameState;
  const rewarded = async (): Promise<boolean> => state.hasPass || (await showRewardedAd());
  let busy = false;
  let importing = false;
  const result = unpack(readSave(), Date.now());
  state = result.state;
  root.innerHTML = `
    <main class="game">
      <div id="scene-wrap"></div>
      <header class="hud">
        <div class="money"><span class="coin">$</span><span id="dollars"></span></div>
        <span id="rate"></span>
        <button id="mute" type="button"></button>
        <button id="ranking-btn" type="button" aria-label="${t('ranking.title')}">${uiIcon('trophy')}</button>
        <button id="settings" type="button" aria-label="${t('settings.title')}">${uiIcon('gear')}</button>
      </header>
      <div id="stats"></div>
      <div id="toast" hidden></div>
      <div id="fps" hidden></div>
      <div id="welcome" hidden></div>
      <aside id="extras"></aside>
      <p id="tip">${t('tip')}</p>
      <div id="coach-spot" hidden></div>
      <div id="coach-hand" hidden>${uiIcon('finger')}</div>
      <div id="coach" hidden role="status"><svg class="coach-face" viewBox="-16 -16 32 32">${helperFace(HELPER_LOOKS[ZONES[0].helper.id])}</svg><div class="coach-body"><b>${helperName(ZONES[0])}</b><p class="coach-text"></p><div class="coach-btns"><button type="button" data-coach="skip">${t('tut.skip')}</button><button type="button" data-coach="ok" hidden>${t('tut.ok')}</button></div></div></div>
      <section id="sheet" hidden>
        <div class="sheet-head"><h2 id="sheet-title"></h2><button id="close-shop" type="button" aria-label="${t('close')}">✕</button></div>
        <div id="panel-info"></div>
        <div id="shop"></div>
        <div id="panel-more"></div>
        <div id="ranking" hidden></div>
        <form id="bug" hidden>
          <small>${t('bug.help')}</small>
          <div class="bug-kind"><button type="button" data-kind="bug" aria-pressed="true">${t('bug.kindBug')}</button><button type="button" data-kind="request">${t('bug.kindRequest')}</button></div>
          <textarea id="bug-text" rows="4" maxlength="3000" placeholder="${t('bug.placeholder')}"></textarea>
          <button type="submit">${t('bug.send')}</button>
        </form>
        <div id="goals" hidden></div>
        <div id="prestige" class="opt" hidden></div>
        <div id="achieve" hidden></div>
        <div id="lang" hidden>
          <b>${t('settings.language')}</b>
          <div><button type="button" data-lang="es" ${getLang() === 'es' ? 'aria-pressed="true"' : ''}>Español</button><button type="button" data-lang="en" ${getLang() === 'en' ? 'aria-pressed="true"' : ''}>English</button></div>
        </div>
        <div id="music" class="opt" hidden>
          <b>${t('settings.music')}</b>
          <div><button type="button" data-m="1" ${isMusicOn() ? 'aria-pressed="true"' : ''}>${t('settings.on')}</button><button type="button" data-m="0" ${isMusicOn() ? '' : 'aria-pressed="true"'}>${t('settings.off')}</button></div>
        </div>
        <div id="sfx" class="opt" hidden>
          <b>${t('settings.sfx')}</b>
          <div><button type="button" data-v="1" ${isSfxOn() ? 'aria-pressed="true"' : ''}>${t('settings.on')}</button><button type="button" data-v="0" ${isSfxOn() ? '' : 'aria-pressed="true"'}>${t('settings.off')}</button></div>
        </div>
        <div id="vibe" class="opt" hidden>
          <b>${t('settings.vibe')}</b>
          <div><button type="button" data-v="1" ${isVibeOn() ? 'aria-pressed="true"' : ''}>${t('settings.on')}</button><button type="button" data-v="0" ${isVibeOn() ? '' : 'aria-pressed="true"'}>${t('settings.off')}</button></div>
        </div>
        <div id="calm" class="opt" hidden>
          <b>${t('settings.calm')}</b>
          <div><button type="button" data-v="1" ${reducedMotion() ? 'aria-pressed="true"' : ''}>${t('settings.on')}</button><button type="button" data-v="0" ${reducedMotion() ? '' : 'aria-pressed="true"'}>${t('settings.off')}</button></div>
        </div>
        <div id="bigtext" class="opt" hidden>
          <b>${t('settings.bigtext')}</b>
          <div><button type="button" data-v="1" ${isBigText() ? 'aria-pressed="true"' : ''}>${t('settings.on')}</button><button type="button" data-v="0" ${isBigText() ? '' : 'aria-pressed="true"'}>${t('settings.off')}</button></div>
        </div>
        <div id="contrast" class="opt" hidden>
          <b>${t('settings.contrast')}</b>
          <div><button type="button" data-v="1" ${isHighContrast() ? 'aria-pressed="true"' : ''}>${t('settings.on')}</button><button type="button" data-v="0" ${isHighContrast() ? '' : 'aria-pressed="true"'}>${t('settings.off')}</button></div>
        </div>
        <div id="nextopt" class="opt" hidden>
          <b>${t('settings.next')}</b>
          <div><button type="button" data-v="1" ${readFlag(NEXT_KEY, true) ? 'aria-pressed="true"' : ''}>${t('settings.on')}</button><button type="button" data-v="0" ${readFlag(NEXT_KEY, true) ? '' : 'aria-pressed="true"'}>${t('settings.off')}</button></div>
        </div>
        <div id="quality" hidden>
          <b>${t('settings.quality')}</b>
          <div><button type="button" data-q="auto">${t('settings.qualityAuto')}</button><button type="button" data-q="low">${t('settings.qualityLow')}</button></div>
        </div>
        <div id="transfer" hidden>
          <b>${t('transfer.title')}</b>
          <small>${t('transfer.help')}</small>
          <div><button id="copy-code" type="button">${t('transfer.copy')}</button><button id="paste-code" type="button">${t('transfer.paste')}</button></div>
        </div>
        <div id="privacy" class="opt" hidden>
          <a href="${import.meta.env.BASE_URL}privacidad.html#${getLang()}" target="_blank" rel="noopener">${t('settings.privacy')}</a>
        </div>
        <div id="ad-privacy" class="opt" hidden>
          <button id="ad-privacy-btn" type="button">${t('settings.adPrivacy')}</button>
        </div>
      </section>
      <button id="bug-btn" type="button" aria-label="${t('bug.title')}">${uiIcon('bug')}</button>
    </main>`;
  const $ = (id: string) => root.querySelector<HTMLElement>('#' + id)!;
  if (result.simulatedSeconds > 60) {
    const w = $('welcome');
    w.hidden = false;
    // Anuncios al volver: ×2 a lo ganado (A3) y recuperar lo perdido por pasar del tope (A4).
    let doubled = false;
    let recovered = result.lostSeconds <= 0;
    const draw = () => {
      const hours = Math.round((result.lostSeconds / 3600) * 10) / 10;
      w.innerHTML = `<div class="welcome-text">${t('welcomeBack', { dollars: fmt(result.dollarsEarned), minutes: Math.round(result.simulatedSeconds / 60) })}</div>
        <div class="welcome-actions">
          ${doubled ? '' : `<button type="button" data-offline="double">${inlineIcon('ad', t('offline.double', { dollars: fmt(result.dollarsEarned) }))}</button>`}
          ${recovered ? '' : `<button type="button" data-offline="recover">${inlineIcon('ad', t('offline.recover', { hours, dollars: fmt(result.lostDollars) }))}</button>`}
          <button type="button" data-offline="close" aria-label="${t('close')}">✕</button>
        </div>`;
    };
    draw();
    w.addEventListener('click', async (e) => {
      const action = (e.target as HTMLElement).closest<HTMLElement>('button[data-offline]')?.dataset.offline;
      if (!action || busy) return;
      if (action === 'close') {
        w.hidden = true;
        return;
      }
      busy = true;
      try {
        if (!(await rewarded())) return;
        if (action === 'double' && !doubled) {
          doubled = true;
          doubleOfflineEarnings(state, result.dollarsEarned);
        }
        if (action === 'recover' && !recovered) {
          recovered = true;
          recoverLostTime(state, result.lostSeconds);
        }
        play('reward');
        writeSave(state);
        if (doubled && recovered) w.hidden = true;
        else draw();
      } finally {
        busy = false;
      }
    });
  }
  // Tutorial guiado (`src/sim/tutorial.ts`): bocadillo de Tuerca, mano que señala y el resto un poco más oscuro.
  // Las partidas que ya han jugado no lo ven. `chatarrero.tut` era el del tutorial de texto (4 = terminado).
  const TUT_KEY = 'chatarrero.tut2';
  // Siguiente paso recomendado: el calculado, cuándo, y el que el jugador ocultó con la ✕.
  let step: Step | null = null;
  let stepAt = -1e9;
  let hiddenStep = (() => {
    try {
      return localStorage.getItem(NEXT_HIDDEN_KEY) ?? '';
    } catch {
      return '';
    }
  })();
  let tut = (() => {
    try {
      const v = localStorage.getItem(TUT_KEY);
      if (v !== null) return Number(v) || 0;
      if (localStorage.getItem('chatarrero.tut') === '4') return TUTORIAL_END;
    } catch {
      // sin almacenamiento
    }
    return state.totalEarned > 0 ? TUTORIAL_END : 0;
  })();
  let taps = 0;
  const setTut = (n: number) => {
    tut = n;
    try {
      localStorage.setItem(TUT_KEY, String(n));
    } catch {
      // sin almacenamiento
    }
  };
  /** Paso del tutorial que se está enseñando (null si ya terminó). */
  let tutStep: TutorialStep | null = null;
  let lastTip = '';
  let lastCoach = '';
  let lastSpot = '';
  let lastTutIndex = -1;
  /** Lo que señala la mano: un elemento del mapa o de la interfaz, y el texto del bocadillo. */
  function coachFor(st: TutorialStep): { text: string; point: Element | null; ok: boolean } {
    const q = (sel: string) => root.querySelector(sel);
    if (st.id === 'done') return { text: t('tut.done'), point: null, ok: true };
    if (panel !== null && panel !== st.target) return { text: t('tut.close'), point: q('#close-shop'), ok: false };
    if (st.id === 'tap') return { text: t('tut.tap', { n: Math.min(taps, ECONOMY.tutorial.taps), total: ECONOMY.tutorial.taps }), point: q('#pile'), ok: false };
    if (panel !== st.target) return { text: t('tut.open', { where: panelTitle(st.target) }), point: q(`[data-sel="${st.target}"]`), ok: false };
    const p = st.purchase;
    if (!p) return { text: t('tut.close'), point: q('#close-shop'), ok: false };
    const button = q(`#shop button[data-id="${p.id}"]`);
    if (state.dollars < p.cost) return { text: t('tut.wait', { cost: fmt(p.cost - state.dollars) }), point: button, ok: false };
    const zone = p.zoneId ? zoneName(ZONES.find((z) => z.id === p.zoneId)!) : '';
    return { text: t('tut.' + st.id, { what: purchaseName(p), zone, cost: fmt(p.cost) }), point: button, ok: false };
  }
  function renderTip(): void {
    tutStep = tut >= TUTORIAL_END ? null : tutorialStep(state, tut, taps);
    if (!tutStep && tut < TUTORIAL_END) setTut(TUTORIAL_END);
    if (tutStep && tutStep.index !== tut) setTut(tutStep.index);
    const coach = $('coach');
    const hand = $('coach-hand');
    const spot = $('coach-spot');
    if (!tutStep) {
      if (!coach.hidden) [coach.hidden, hand.hidden, spot.hidden] = [true, true, true];
      if (lastTip !== 'tip') {
        lastTip = 'tip';
        $('tip').textContent = t('tip');
        $('tip').hidden = false;
      }
      return;
    }
    if (lastTip !== 'tut') {
      lastTip = 'tut';
      $('tip').hidden = true;
    }
    // Al empezar un paso del mapa, la cámara lo enseña.
    if (tutStep.index !== lastTutIndex) {
      lastTutIndex = tutStep.index;
      if (panel === null && tutStep.target !== 'pile' && tutStep.id !== 'done') scene.focus(tutStep.target);
    }
    const c = coachFor(tutStep);
    const key = c.text + '|' + c.ok + '|' + (panel === null) + '|' + !!c.point;
    if (key !== lastCoach) {
      lastCoach = key;
      coach.hidden = false;
      // Sin panel abierto, el bocadillo va abajo (la cámara deja el puesto arriba); con panel, arriba.
      coach.classList.toggle('low', panel === null);
      coach.querySelector('.coach-text')!.textContent = c.text;
      (coach.querySelector('[data-coach="ok"]') as HTMLElement).hidden = !c.ok;
      (coach.querySelector('[data-coach="skip"]') as HTMLElement).hidden = c.ok;
      // La mejora que pide, a la vista dentro de la lista (sin mover nada más de la pantalla).
      if (c.point instanceof HTMLElement && c.point.closest('#shop')) {
        for (const box of [$('shop'), $('sheet')]) {
          const b = box.getBoundingClientRect();
          const r = c.point.getBoundingClientRect();
          if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom + 8;
          else if (r.top < b.top) box.scrollTop -= b.top - r.top + 8;
        }
      }
    }
    // Mano y foco sobre lo que hay que tocar (si está en pantalla).
    const r = c.point?.getBoundingClientRect();
    const onScreen = !!r && r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
    const pos = onScreen ? `${Math.round(r!.left)},${Math.round(r!.top)},${Math.round(r!.width)},${Math.round(r!.height)}` : '';
    if (pos === lastSpot) return;
    lastSpot = pos;
    hand.hidden = spot.hidden = !onScreen;
    if (!onScreen) return;
    const pad = 6;
    Object.assign(spot.style, { left: `${r!.left - pad}px`, top: `${r!.top - pad}px`, width: `${r!.width + pad * 2}px`, height: `${r!.height + pad * 2}px` });
    Object.assign(hand.style, { left: `${r!.left + r!.width / 2}px`, top: `${r!.top + r!.height / 2}px` });
  }
  const scene = createYard($('scene-wrap'));
  scene.el.querySelector('#pile')!.addEventListener('click', () => {
    tap(state);
    taps++;
    play('tap');
    buzz(8);
    scene.pop('+' + ECONOMY.tap.scrap, 'pile');
  });
  $('coach').addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('button[data-coach]')) return;
    play('tap');
    setTut(TUTORIAL_END);
    lastStats = '';
  });
  const mute = $('mute');
  const showMute = () => {
    mute.innerHTML = uiIcon(isMuted() ? 'sound-off' : 'sound-on');
    mute.setAttribute('aria-label', t(isMuted() ? 'sound.off' : 'sound.on'));
  };
  showMute();
  mute.addEventListener('click', () => {
    setMuted(!isMuted());
    showMute();
    play('buy');
  });
  // Panel de mejoras del puesto tocado (zona, «dock» o «trucks») o ajustes.
  let panel: string | null = null;
  let lastShop = '';
  let lastGoals = '';
  let lastInfo = '';
  let lastMore = '';
  let moreOpen = false;
  const panelTitle = (sel: string): string => {
    if (sel === 'settings') return t('settings.title');
    if (sel === 'ranking') return t('ranking.title');
    if (sel === 'bug') return t('bug.title');
    if (sel === 'goals') return t('goals.title');
    if (sel === 'dock') return t('panel.dock');
    if (sel === 'trucks') return t('panel.trucks');
    const z = ZONES.find((x) => x.id === sel);
    return z ? zoneName(z) : '';
  };
  const openPanel = (sel: string | null) => {
    panel = sel;
    lastShop = lastInfo = lastMore = '';
    $('sheet').hidden = sel === null;
    $('transfer').hidden = sel !== 'settings';
    $('privacy').hidden = sel !== 'settings';
    $('ad-privacy').hidden = sel !== 'settings' || !adPrivacyOptionsAvailable();
    $('lang').hidden = sel !== 'settings';
    $('quality').hidden = sel !== 'settings';
    $('music').hidden = sel !== 'settings';
    $('sfx').hidden = sel !== 'settings';
    $('vibe').hidden = sel !== 'settings';
    $('calm').hidden = sel !== 'settings';
    $('bigtext').hidden = sel !== 'settings';
    $('contrast').hidden = sel !== 'settings';
    $('nextopt').hidden = sel !== 'settings';
    $('achieve').hidden = sel !== 'settings';
    $('prestige').hidden = sel !== 'settings';
    $('ranking').hidden = sel !== 'ranking';
    $('bug').hidden = sel !== 'bug';
    $('goals').hidden = sel !== 'goals';
    lastGoals = '';
    const global = sel === 'settings' || sel === 'ranking' || sel === 'goals' || sel === 'bug';
    $('panel-info').hidden = global;
    $('shop').hidden = global;
    $('panel-more').hidden = global;
    scene.setSelected(global ? null : sel);
    if (sel) $('sheet-title').textContent = panelTitle(sel);
    if (sel && !global) scene.focus(sel);
    if (sel === 'settings') {
      prestigeAsk = false;
      drawPrestige();
      drawAchievements();
    }
    if (sel === 'ranking') void drawRanking();
  };
  scene.onSelect((sel) => {
    play('tap');
    openPanel(panel === sel ? null : sel);
  });
  $('ad-privacy-btn').addEventListener('click', () => void showAdPrivacyOptions());
  // En la app: AdMob y consentimiento de anuncios de la UE (en la web no hace nada).
  void initAds();
  $('lang').addEventListener('click', (e) => {
    const next = (e.target as HTMLElement).closest<HTMLElement>('button[data-lang]')?.dataset.lang as Lang | undefined;
    if (!next || next === getLang()) return;
    setLang(next);
    writeSave(state);
    location.reload();
  });
  $('music').addEventListener('click', (e) => {
    const m = (e.target as HTMLElement).closest<HTMLElement>('button[data-m]');
    if (!m) return;
    setMusicOn(m.dataset.m === '1');
    $('music').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === m)));
  });
  const bindFlag = (id: string, set: (v: boolean) => void): void => {
    $(id).addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-v]');
      if (!b) return;
      set(b.dataset.v === '1');
      $(id).querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    });
  };
  bindFlag('sfx', setSfxOn);
  bindFlag('vibe', setVibeOn);
  bindFlag('bigtext', setBigText);
  bindFlag('contrast', setHighContrast);
  bindFlag('nextopt', (v) => {
    writeFlag(NEXT_KEY, v);
    lastStats = '';
  });
  applyAccessibility();
  bindFlag('calm', (v) => {
    setReducedMotion(v);
    writeSave(state);
    location.reload();
  });
  // La música arranca con el primer toque (los navegadores no dejan sonar antes).
  document.addEventListener('pointerdown', () => syncMusic(), { once: true });
  $('quality').addEventListener('click', (e) => {
    const q = (e.target as HTMLElement).closest<HTMLElement>('button[data-q]')?.dataset.q;
    if (!q) return;
    try {
      localStorage.setItem('chatarrero.quality', q);
    } catch {
      /* vale solo para esta sesión */
    }
    location.reload();
  });
  $('settings').addEventListener('click', () => openPanel(panel === 'settings' ? null : 'settings'));
  $('ranking-btn').addEventListener('click', () => openPanel(panel === 'ranking' ? null : 'ranking'));
  // Botón 🐞 (S2): abre en GitHub una incidencia de Zenit con etiquetas feedback y scrap-empire y los datos de la partida.
  installErrorCapture();
  let bugKind: FeedbackKind = 'bug';
  $('bug-btn').addEventListener('click', () => {
    play('tap');
    openPanel(panel === 'bug' ? null : 'bug');
  });
  $('bug').addEventListener('click', (e) => {
    const kind = (e.target as HTMLElement).closest<HTMLElement>('button[data-kind]')?.dataset.kind as FeedbackKind | undefined;
    if (!kind) return;
    bugKind = kind;
    $('bug').querySelectorAll<HTMLElement>('button[data-kind]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === kind)));
  });
  $('bug').addEventListener('submit', (e) => {
    e.preventDefault();
    const box = $('bug-text') as HTMLTextAreaElement;
    const text = box.value.trim();
    if (!text) return box.focus();
    writeSave(state);
    const url = feedbackIssueUrl(bugKind, text, {
      at: new Date().toISOString(),
      url: location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio}x`,
      lang: getLang(),
      saveVersion: SAVE_VERSION,
      playSeconds: state.time,
      dollars: state.dollars,
      totalEarned: state.totalEarned,
      zonesOpen: ZONES.filter((z) => state.zones[z.id]?.unlocked).map((z) => z.id),
      hasPass: state.hasPass,
      errors: capturedErrors(),
    });
    window.open(url, '_blank', 'noopener');
    box.value = '';
    openPanel(null);
    toast(t('bug.sent'));
  });

  // Prestigio (S4, Parte 28): bloque en Ajustes con los Tornillos de oro, lo que daría reiniciar y confirmación.
  let prestigeAsk = false;
  const screwPct = (n: number): string => fmt(Math.round(n * ECONOMY.prestige.bonusPerScrew * 1000) / 10);
  function drawPrestige(): void {
    const box = $('prestige');
    const have = state.goldScrews > 0 ? `<small>${t('prestige.have', { n: fmt(state.goldScrews), pct: screwPct(state.goldScrews) })}</small>` : '';
    if (!prestigeUnlocked(state)) {
      const zone = ZONES.find((z) => z.id === ECONOMY.prestige.unlockZone);
      box.innerHTML = `<b>${t('prestige.title')}</b>${have}<small>${t('prestige.locked', { zone: zone ? esc(zoneName(zone)) : '', pct: screwPct(1) })}</small>`;
      return;
    }
    const gain = prestigeReward(state);
    if (!canPrestige(state)) {
      box.innerHTML = `<b>${t('prestige.title')}</b>${have}<small>${t('prestige.notYet', { dollars: fmt(ECONOMY.prestige.screwDivisor) })}</small>`;
      return;
    }
    if (!prestigeAsk) {
      box.innerHTML = `<b>${t('prestige.title')}</b>${have}<small>${t('prestige.next', { n: fmt(gain), pct: screwPct(state.goldScrews + gain) })}</small><div><button type="button" data-prestige="ask">${t('prestige.button')}</button></div>`;
      return;
    }
    box.innerHTML = `<b>${t('prestige.confirmTitle')}</b><small>${t('prestige.keep')}</small><small>${t('prestige.lose')}</small><div><button type="button" data-prestige="no">${t('prestige.no')}</button><button type="button" data-prestige="yes">${t('prestige.yes', { n: fmt(gain) })}</button></div>`;
  }
  $('prestige').addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>('button[data-prestige]')?.dataset.prestige;
    if (!act) return;
    play('tap');
    if (act === 'yes') {
      const gain = prestigeReward(state);
      const next = prestige(state);
      if (!next) return drawPrestige();
      importing = true;
      if (!store.write(pack(next, Date.now()))) {
        importing = false;
        return;
      }
      try {
        sessionStorage.setItem('chatarrero.prestigeDone', String(gain));
      } catch {
        // sin aviso al volver
      }
      location.reload();
      return;
    }
    prestigeAsk = act === 'ask';
    drawPrestige();
  });
  function drawAchievements(): void {
    const h = Math.floor(state.time / 3600);
    const time = h > 0 ? `${h} h ${Math.floor((state.time % 3600) / 60)} min` : `${Math.floor(state.time / 60)} min`;
    const screws = state.goldScrews > 0 ? `<li>${t('stats.screws', { n: fmt(state.goldScrews), resets: state.prestiges })}</li>` : '';
    const stats = `<b>${t('stats.title')}</b><ul class="stats"><li>${t('stats.time', { time })}</li><li>${t('stats.earned', { n: fmt(state.totalEarned) })}</li><li>${t('stats.trucks', { n: fmt(state.trucksSent) })}</li><li>${t('stats.streak', { n: state.bestStreak })}</li>${screws}</ul>`;
    $('achieve').innerHTML = stats + `<b>${t('achieve.title', { n: state.achievements.length, total: ACHIEVEMENTS.length })}</b><ul>${ACHIEVEMENTS.map((a) => `<li class="${state.achievements.includes(a.id) ? 'got' : ''}">${state.achievements.includes(a.id) ? '★' : '○'} ${esc(achievementName(a))}</li>`).join('')}</ul>`;
  }
  async function drawRanking(): Promise<void> {
    const box = $('ranking');
    if (!rankingEnabled) {
      box.innerHTML = `<p class="empty">${t('ranking.off')}</p>`;
      return;
    }
    const nick = getNick();
    box.innerHTML = `<form id="nick-form"><input id="nick" maxlength="16" placeholder="${t('ranking.nick')}" value="${esc(nick)}" autocomplete="off"><button type="submit">${t('ranking.save')}</button></form><div id="rank-list">${t('ranking.loading')}</div>`;
    box.querySelector('form')!.addEventListener('submit', (e) => {
      e.preventDefault();
      const clean = cleanNick((box.querySelector('#nick') as HTMLInputElement).value);
      if (!clean) return alert(t('ranking.badNick'));
      setNick(clean);
      void sendScore().then(() => drawRanking());
    });
    try {
      const { list, me } = await topScores(50);
      box.querySelector('#rank-list')!.innerHTML = list.length
        ? `<ol>${list.map((r) => `<li class="${r.uid === me ? 'me' : ''}"><span>${esc(r.name)}</span><b>$${fmt(r.total)}</b></li>`).join('')}</ol>`
        : `<p class="empty">${t('ranking.empty')}</p>`;
    } catch {
      box.querySelector('#rank-list')!.innerHTML = `<p class="empty">${t('ranking.error')}</p>`;
    }
  }
  let sentTotal = -1;
  async function sendScore(): Promise<void> {
    const nick = getNick();
    if (!rankingEnabled || !nick || state.totalEarned === sentTotal) return;
    try {
      await submitScore(nick, state.totalEarned);
      sentTotal = state.totalEarned;
    } catch {
      // sin conexión: se reintenta en el siguiente envío
    }
  }
  setInterval(() => void sendScore(), 60_000);

  // Avisos breves (logros).
  let toastTimer = 0;
  function toast(text: string, icon?: UiIconName): void {
    const el = $('toast');
    el.innerHTML = icon ? inlineIcon(icon, text) : esc(text);
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (el.hidden = true), 3500);
  }
  // Aviso tras reiniciar con prestigio (el reinicio recarga la página).
  try {
    const done = sessionStorage.getItem('chatarrero.prestigeDone');
    if (done) {
      sessionStorage.removeItem('chatarrero.prestigeDone');
      toast(t('prestige.done', { n: fmt(Number(done)), pct: screwPct(state.goldScrews) }), 'trophy');
      play('reward');
    }
  } catch {
    // sin almacenamiento de sesión
  }
  // El estado abierto/cerrado de «Más datos» se recuerda entre redibujados.
  $('panel-more').addEventListener('toggle', (e) => (moreOpen = (e.target as HTMLDetailsElement).open), true);
  $('panel-info').addEventListener('click', (e) => {
    const ad = (e.target as HTMLElement).closest<HTMLElement>('button[data-tad]');
    if (ad && !busy) {
      busy = true;
      void (async () => {
        try {
          if (state.transports[ad.dataset.transport as 'rail' | 'sea'].adCooldown <= 0 && (await rewarded())) {
            if (useTransportAd(state, ad.dataset.transport as 'rail' | 'sea', ad.dataset.tad as 'now' | 'double')) {
              play('reward');
              writeSave(state);
            }
          }
        } finally {
          busy = false;
        }
      })();
      return;
    }
    const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-route]');
    if (b && setRoute(state, b.dataset.transport as 'rail' | 'sea', b.dataset.route!)) {
      play('tap');
      writeSave(state);
    }
  });
  showTitle(root, {
    dollars: fmt(state.dollars),
    zonesOpen: ZONES.filter((z) => state.zones[z.id].unlocked).length,
    zonesTotal: ZONES.length,
    hasProgress: state.time > 0,
    save: () => writeSave(state),
    onPlay: () => undefined,
  });
  $('close-shop').addEventListener('click', () => {
    openPanel(null);
  });
  scene.el.querySelector('#golden')!.addEventListener('click', async () => {
    if (busy || state.goldenVisible <= 0) return;
    busy = true;
    try {
      if (state.freeGolden || (await rewarded())) {
        claimGoldenTruck(state);
        play('reward');
      }
    } finally {
      busy = false;
    }
  });
  $('copy-code').addEventListener('click', async () => {
    const code = toCode(pack(state, Date.now()));
    try {
      await navigator.clipboard.writeText(code);
      alert(t('transfer.copied'));
    } catch {
      prompt(t('transfer.copyManual'), code);
    }
  });
  $('paste-code').addEventListener('click', () => {
    const json = fromCode(prompt(t('transfer.pastePrompt')) ?? '');
    if (json === null) return alert(t('transfer.invalid'));
    if (!confirm(t('transfer.confirm'))) return;
    importing = true;
    if (!store.write(json)) return alert(t('transfer.invalid'));
    location.reload();
  });
  $('shop').addEventListener('click', (e) => {
    const id = (e.target as HTMLElement).closest<HTMLElement>('button[data-id]')?.dataset.id;
    if (id && buy(state, id)) {
      play('buy');
      buzz(15);
      const btn = (e.target as HTMLElement).closest<HTMLElement>('button[data-id]');
      if (btn && !calmMotion) btn.animate([{ filter: 'brightness(2.2)', scale: '1.04' }, { filter: 'none', scale: '1' }], { duration: 320, easing: 'ease-out' });
      bumpDollars();
      if (id.startsWith('unlock:')) shakeScene();
    }
  });

  $('extras').addEventListener('click', async (e) => {
    const action = (e.target as HTMLElement).closest<HTMLElement>('button[data-action]')?.dataset.action;
    if (!action || busy) return;
    busy = true;
    try {
      if (action === 'goals') openPanel(panel === 'goals' ? null : 'goals');
      if (action === 'daily' && claimDaily(state, localDay()) > 0) play('reward');
      if (action === 'boost' && canBoost(state) && (await rewarded())) {
        activateBoost(state);
        play('reward');
      }
      if (action === 'pass' && !state.hasPass && (await buyPass(ECONOMY.pass.priceEur))) state.hasPass = true;
      writeSave(state);
    } finally {
      busy = false;
    }
  });

  const goalsReady = (): boolean => (state.daily?.goals ?? []).some((g) => goalDone(g) && !g.claimed);

  function goalText(g: DailyGoal): string {
    const zone = g.zoneId ? ZONES.find((z) => z.id === g.zoneId) : undefined;
    return t('goal.' + g.kind, { n: g.kind === 'working' ? Math.round(g.target / 60) : fmt(g.target), zone: zone ? zoneName(zone) : '', product: zone ? zoneProduct(zone) : '' });
  }
  function renderGoals(): string {
    const d = state.daily;
    if (!d) return '';
    const rows = d.goals
      .map((g, i) => {
        const done = goalDone(g);
        const pct = Math.floor((100 * g.progress) / g.target);
        const action = g.claimed
          ? `<span class="goal-ok">${inlineIcon('check', t('goals.claimed'))}</span>`
          : done
            ? `<button type="button" data-claim="${i}" class="goal-claim">${t('goals.claim')}</button>`
            : g.rerolled
              ? ''
              : `<button type="button" data-change="${i}" class="goal-change">${inlineIcon('ad', t('goals.change'))}</button>`;
        return `<li class="goal lv${g.level}"><div class="goal-text"><b>${goalText(g)}</b><small>${t('goals.level.' + g.level)} · ${fmt(Math.floor(g.progress))}/${fmt(g.target)}</small><div class="bar"><i style="width:${pct}%"></i></div></div>${action}</li>`;
      })
      .join('');
    return `<ul>${rows}</ul><p class="goal-note">${t(d.bonusPaid ? 'goals.bonusGot' : 'goals.bonus', { min: ECONOMY.dailyGoals.rewardMinutes })}</p>`;
  }
  $('goals').addEventListener('click', async (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button');
    if (!b || busy) return;
    busy = true;
    try {
      if (b.dataset.claim !== undefined && claimGoal(state, Number(b.dataset.claim)) > 0) {
        play('reward');
        bumpDollars();
        flyCoins();
      }
      if (b.dataset.change !== undefined && (await rewarded())) rerollGoal(state, Number(b.dataset.change));
      writeSave(state);
    } finally {
      busy = false;
    }
  });

  function renderExtras(): string {
    const today = localDay();
    const day = streakDayFor(state, today);
    const nextDay = (state.streakDay % ECONOMY.dailyStreak.rewardMinutes.length) + 1;
    const btn = (action: string, icon: string, label: string, enabled: boolean, cls = '') =>
      `<button type="button" class="${cls}" ${enabled ? `data-action="${action}"` : 'disabled'}><span class="ico">${icon}</span><span>${label}</span></button>`;
    const buttons = [
      state.boostSeconds > 0
        ? btn('boost', uiIcon('timer'), t('boost.activeShort', { minutes: Math.ceil(state.boostSeconds / 60) }), false, 'boost on')
        : canBoost(state)
          ? btn('boost', uiIcon('ad'), t('boost.short'), true, 'boost')
          : btn('boost', uiIcon('hourglass'), t('boost.waitShort', { minutes: Math.ceil(state.boostCooldown / 60) }), false, 'boost'),
      day > 0
        ? btn('daily', uiIcon('gift'), t('daily.short', { day }), dailyReward(state, today) > 0, 'daily ready')
        : btn('daily', uiIcon('gift'), t('daily.doneShort', { day: nextDay }), false, 'daily'),
      btn('goals', uiIcon('target'), t('goals.short', { n: (state.daily?.goals ?? []).filter((g) => g.claimed).length }), true, goalsReady() ? 'goals ready' : 'goals'),
      state.hasPass ? btn('pass', uiIcon('star'), t('pass.ownedShort'), false, 'pass') : btn('pass', uiIcon('star'), t('pass.short'), true, 'pass'),
    ];
    return buttons.join('');
  }

  let lastRailSent = state.transports.rail.sent;
  let lastSeaSent = state.transports.sea.sent;
  let lastEarned = state.totalEarned;
  let lastCooldown = state.truckCooldown;
  let lastExtras = '';
  let lastOrderKey = state.order ? `${state.order.zoneId}:${state.order.qty}:${state.ordersDone}` : '';
  let lastOrder: typeof state.order = state.order ? { ...state.order } : null;
  let lastOrdersDone = state.ordersDone;
  let lastStats = '';
  // Cifra de dólares que cuenta hacia arriba (o hacia abajo al comprar) en vez de saltar.
  let shownDollars = state.dollars;
  let lastRenderAt = performance.now();
  let lastDollarsTxt = '';
  let lastRateTxt = '';
  const calmMotion = reducedMotion();
  /** Pequeño rebote de la cifra de dólares (al comprar o cobrar). */
  function bumpDollars(): void {
    if (calmMotion) return;
    $('dollars').animate([{ scale: '1.18', color: '#ffe36b' }, { scale: '1' }], { duration: 300, easing: 'ease-out' });
  }

  /** Temblor suave del mapa al abrir una zona nueva. */
  function shakeScene(): void {
    if (calmMotion) return;
    $('scene-wrap').animate(
      [{ translate: '0 0' }, { translate: '-5px 3px' }, { translate: '4px -3px' }, { translate: '-3px -2px' }, { translate: '2px 2px' }, { translate: '0 0' }],
      { duration: 420, easing: 'ease-out' },
    );
  }

  /** Monedas que salen del muelle (parte baja de la pantalla) y vuelan al contador al cobrar un camión. */
  function flyCoins(): void {
    if (calmMotion) return;
    const to = $('dollars').getBoundingClientRect();
    const fromX = innerWidth * 0.5;
    const fromY = innerHeight * 0.45;
    for (let i = 0; i < 6; i++) {
      const c = document.createElement('span');
      c.className = 'flycoin';
      c.textContent = '$';
      document.body.appendChild(c);
      const dx = to.left + to.width / 2 - fromX;
      const dy = to.top + to.height / 2 - fromY;
      const spread = (i - 2.5) * 22;
      c.animate(
        [
          { transform: `translate(${spread}px, 0) scale(0.6)`, opacity: 1 },
          { transform: `translate(${spread * 1.4}px, -40px) scale(1)`, opacity: 1, offset: 0.3 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0.9 },
        ],
        { duration: 700 + i * 70, delay: i * 60, easing: 'ease-in', fill: 'backwards' },
      ).onfinish = () => {
        c.remove();
        if (i === 0) bumpDollars();
      };
      c.style.left = fromX + 'px';
      c.style.top = fromY + 'px';
    }
  }

  function render(): void {
    const nowMs = performance.now();
    const dtMs = Math.min(500, nowMs - lastRenderAt);
    lastRenderAt = nowMs;
    const gap = state.dollars - shownDollars;
    shownDollars = calmMotion || Math.abs(gap) < 0.5 ? state.dollars : shownDollars + gap * (1 - Math.exp(-dtMs / 120));
    refreshDaily(state, localDay());
    // Bocina del tren y sirena del barco al salir cada viaje.
    if (state.transports.rail.sent > lastRailSent) play('train');
    if (state.transports.sea.sent > lastSeaSent) play('ship');
    lastRailSent = state.transports.rail.sent;
    lastSeaSent = state.transports.sea.sent;
    // Los botones de extras solo se redibujan si cambian, para no perder el toque.
    const extras = renderExtras();
    if (extras !== lastExtras) {
      $('extras').innerHTML = extras;
      lastExtras = extras;
    }
    // Los textos de arriba solo se tocan si cambian (cada cambio obliga al navegador a recolocar la barra).
    const dollarsTxt = fmt(shownDollars);
    if (dollarsTxt !== lastDollarsTxt) {
      lastDollarsTxt = dollarsTxt;
      $('dollars').textContent = dollarsTxt;
    }
    const incomeTxt = t('incomeRate', { n: fmt(incomePerSecond(state)) });
    if (incomeTxt !== lastRateTxt) {
      lastRateTxt = incomeTxt;
      $('rate').textContent = incomeTxt;
    }
    // En pantallas táctiles (o si va justo) la escena se redibuja a 30 por segundo: se mueve igual y se pinta la mitad.
    const sceneNow = performance.now();
    if (sceneNow - lastSceneAt >= sceneEveryMs - 4) {
      lastSceneAt = sceneNow;
      scene.update(state);
    }
    // Sonido al cobrar un camión (el dinero sube y el camión se reinicia).
    if (state.totalEarned > lastEarned + 1e-9 && state.truckCooldown > lastCooldown) {
      play('cash');
      flyCoins();
    }
    lastEarned = state.totalEarned;
    lastCooldown = state.truckCooldown;
    renderStats();
    renderTip();
    celebrateLevels();
    const orderKey = state.order ? `${state.order.zoneId}:${state.order.qty}:${state.ordersDone}` : '';
    if (orderKey !== lastOrderKey) {
      if (state.ordersDone > lastOrdersDone && lastOrder) {
        toast(t('order.done', { bonus: fmt(orderBonus(state, lastOrder)) }), 'coin');
        play('reward');
      } else if (state.order && lastOrderKey === '') {
        const od = ZONES.find((z) => z.id === state.order!.zoneId)!;
        toast(t('order.new', { qty: state.order.qty, product: zoneProduct(od) }), 'target');
      }
      lastOrderKey = orderKey;
    }
    lastOrder = state.order ? { ...state.order } : null;
    lastOrdersDone = state.ordersDone;
    for (const a of checkAchievements(state)) {
      toast(t('achieve.got', { name: achievementName(a) }), 'medal');
      play('reward');
    }
    if (panel === 'goals') {
      const g = renderGoals();
      if (g !== lastGoals) {
        $('goals').innerHTML = g;
        lastGoals = g;
      }
      return;
    }
    if (panel === null || panel === 'settings') return;
    const sel = panel;
    const mine = purchases(state).filter((p) =>
      sel === 'dock' ? p.kind === 'dock' : sel === 'trucks' ? p.kind === 'scrapTruck' : p.zoneId === sel,
    );
    const info = renderInfo(sel);
    if (info !== lastInfo) {
      $('panel-info').innerHTML = info;
      lastInfo = info;
    }
    const more = renderMore(sel);
    if (more !== lastMore) {
      $('panel-more').innerHTML = more;
      lastMore = more;
    }
    const shop = mine
      .map((p) => {
        const def = p.zoneId ? ZONES.find((z) => z.id === p.zoneId) : undefined;
        const route = p.kind === 'route' ? p.id.split(':')[2] : '';
        const name = purchaseName(p);
        const routeDef = ROUTES.find((r) => r.id === route);
        const sub = p.kind === 'warehouse' ? t('sub.warehouse') : p.kind === 'captain' ? t('sub.captain') : p.kind === 'route' ? t('sub.route', { wait: routeDef!.wait, pay: routeDef!.pay }) : p.kind === 'transport' ? t('sub.transport.' + def!.transport) : p.kind === 'carts' || p.kind === 'cartLevel' ? t('sub.' + p.kind) : def ? (p.kind === 'unlock' ? zoneProduct(def) : zoneName(def)) : t('sub.' + p.kind);
        const cls = `${p.kind === 'unlock' ? 'unlock' : p.kind === 'helper' ? 'helper' : ''}${step && stepShown() && step.purchase.id === p.id ? ' rec' : ''}`;
        return `<button type="button" class="${cls}" data-id="${p.id}" ${p.cost > state.dollars ? 'disabled' : ''}>${shopIcon(p.kind, p.zoneId)}<span class="what"><b>${name}</b><small>${sub}</small></span><span class="price">$${fmt(p.cost)}</span></button>`;
      })
      .join('');
    // Solo se redibuja si cambia algo, para que los toques no se pierdan.
    if (shop !== lastShop) {
      $('shop').innerHTML = shop || `<p class="empty">${t('panel.empty')}</p>`;
      lastShop = shop;
    }
  }

  /** Nombre de una compra, como sale en la tienda. */
  function purchaseName(p: Purchase): string {
    const def = p.zoneId ? ZONES.find((z) => z.id === p.zoneId) : undefined;
    const kindKey = p.kind === 'transport' ? `transport.${def!.transport}` : '';
    const route = p.kind === 'route' ? p.id.split(':')[2] : '';
    return p.kind === 'warehouse' ? t('buy.warehouse.' + def!.transport) : p.kind === 'captain' ? t('buy.captain.' + def!.transport) : p.kind === 'route' ? t('buy.route', { route: t('route.' + route) }) : p.kind === 'helper' ? t('buy.helper', { helper: helperName(def!) }) : t('buy.' + p.kind + (kindKey ? `.${def!.transport}` : ''));
  }
  /** Puesto donde está la compra: la carretera (camiones de chatarra), el muelle o la línea. */
  const stepTarget = (p: Purchase): string => (p.kind === 'scrapTruck' ? 'trucks' : p.kind === 'dock' ? 'dock' : p.zoneId!);
  /** El paso se ve si está activado en ajustes, el tutorial ha terminado y el jugador no ha ocultado este mismo paso. */
  const stepShown = (): boolean => !!step && !tutStep && readFlag(NEXT_KEY, true) && stepKey(step) !== hiddenStep;
  function stepText(st: Step): string {
    const p = st.purchase;
    const zone = (id?: string) => (id ? zoneName(ZONES.find((z) => z.id === id)!) : '');
    const what = purchaseName(p);
    switch (st.reason) {
      case 'scrap':
        return t('next.scrap');
      case 'dock':
        return t('next.dock', { what });
      case 'carts':
        return t('next.carts', { zone: zone(st.zoneId), what });
      case 'unlock':
        return t('next.unlock', { zone: zone(p.zoneId), cost: fmt(p.cost) });
      case 'level':
        return t('next.level', { zone: zone(p.zoneId), what, cost: fmt(p.cost) });
      default:
        return t('next.best', { what, where: panelTitle(stepTarget(p)) });
    }
  }
  $('stats').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-step]');
    if (!b || !step) return;
    play('tap');
    if (b.dataset.step === 'go') {
      const target = stepTarget(step.purchase);
      if (panel !== target) openPanel(target);
      else scene.focus(target);
    } else {
      hiddenStep = stepKey(step);
      try {
        localStorage.setItem(NEXT_HIDDEN_KEY, hiddenStep);
      } catch {
        /* vale para esta sesión */
      }
      lastStats = '';
    }
  });

  /** Cuánta chatarra hay y dónde se atasca la fábrica. */
  function renderStats(): void {
    // El siguiente paso se recalcula cada 2 s (prueba cada compra en una copia de la partida).
    const nowMs = performance.now();
    if (nowMs - stepAt > 2000) {
      stepAt = nowMs;
      step = nextStep(state);
    }
    const nextHtml = step && stepShown() ? `<div class="next" role="group" aria-label="${t('next.title')}"><span class="next-text">${inlineIcon('finger', stepText(step))}</span><button type="button" data-step="go" class="next-go">${t('next.go')}</button><button type="button" data-step="hide" class="next-hide" aria-label="${t('next.hide')}">✕</button></div>` : '';
    const goal = currentGoal(state);
    const goalTxt =
      goal.kind === 'unlock'
        ? t('goal.unlock', { name: zoneName(ZONES.find((z) => z.id === goal.zoneId)!), cost: fmt(goal.cost), left: fmt(Math.max(0, goal.cost - state.dollars)) })
        : goal.kind === 'machineLevel'
          ? t('goal.level', { name: zoneName(ZONES.find((z) => z.id === goal.zoneId)!), level: goal.level, cost: fmt(goal.cost) })
          : '';
    const ord = state.order;
    const ordDef = ord ? ZONES.find((z) => z.id === ord.zoneId) : undefined;
    const orderTxt =
      ord && ordDef
        ? t('order.line', { qty: ord.qty, product: zoneProduct(ordDef), done: Math.min(ord.qty, Math.floor(ord.delivered)), time: `${Math.floor(ord.left / 60)}:${String(Math.floor(ord.left % 60)).padStart(2, '0')}` })
        : '';
    const html = `${goalTxt ? `<span class="goal">${inlineIcon('target', goalTxt)}</span>` : ''}${orderTxt ? `${goalTxt ? '<br>' : ''}<span class="order">${inlineIcon('coin', `${t('order.title')}: ${orderTxt}`)}</span>` : ''}${nextHtml}`;
    if (html !== lastStats) {
      lastStats = html;
      $('stats').innerHTML = html;
    }
  }

  /** Animación al llegar a un nivel múltiplo de 5 de cualquier mejora. */
  const FIELDS = [
    ['speed', 'level.speed'],
    ['capacity', 'level.capacity'],
    ['machines', 'level.machines'],
    ['machineLevel', 'level.machineLevel'],
    ['helperLevel', 'level.helper'],
  ] as const;
  const seen: Record<string, number> = {};
  function celebrateLevels(): void {
    for (const z of ZONES) {
      const zone = state.zones[z.id];
      for (const [field, key] of FIELDS) {
        const now = zone[field];
        const id = z.id + field;
        const prev = seen[id];
        seen[id] = now;
        if (prev === undefined || now <= prev || now % 5 !== 0) continue;
        const reward = field === 'machineLevel' ? ` +$${fmt(milestoneReward(z, zone))}` : '';
        scene.celebrate(z.id, t('levelUp', { what: t(key), n: now }) + reward, field === 'machineLevel');
        play('reward');
      }
    }
  }

  /** Destinos ya disponibles del tren o el barco, para elegir adónde va. */
  function routePills(id: 'rail' | 'sea'): string {
    const out = state.transports[id];
    const pills = ROUTES.filter((r) => r.id === 'local' || out.routesUnlocked.includes(r.id))
      .map((r) => `<button type="button" data-route="${r.id}" data-transport="${id}" aria-pressed="${r.id === out.route}">${t('route.' + r.id)}${r.id === 'local' ? '' : ` ×${r.pay}`}</button>`)
      .join('');
    const ready = out.adCooldown <= 0;
    const wait = Math.ceil(out.adCooldown / 60);
    const ad = (kind: 'now' | 'double', on: boolean) =>
      `<button type="button" data-tad="${kind}" data-transport="${id}" ${ready && on ? '' : 'disabled'}>${inlineIcon(ready ? 'ad' : 'hourglass', t('transportAd.' + kind))}</button>`;
    return `<div class="routes"><span>${t('route.title')}</span>${pills}</div>
      <div class="routes"><span>${t('captain.line.' + id, { lvl: out.captainLevel, max: ECONOMY.captain.maxLevel, pay: Math.round((captainPay(state, id) - 1) * 100), trip: Math.round((1 - captainTrip(state, id)) * 100) })}</span></div>
      <div class="routes">${ad('now', out.cooldown > 0)}${ad('double', !out.doubleNext)}${ready ? '' : `<span>${t('transportAd.wait', { min: wait })}</span>`}${out.doubleNext ? `<span>${t('transportAd.armed')}</span>` : ''}</div>`;
  }

  function renderInfo(sel: string): string {
    const def = ZONES.find((z) => z.id === sel);
    if (!def) return sel === 'dock' ? `<p>${t('info.dock', { load: dockLoad(state) })}</p>` : `<p>${t('info.trucks', { n: state.scrapTrucks })}</p>`;
    const zone = state.zones[def.id];
    if (!zone.unlocked) return `<p>${t('info.locked', { cost: fmt(def.unlockCost) })}</p>`;
    const status = zoneStatus(state, def);
    const jam = bottleneck(state);
    const ready = helperLevelsReady(zone);
    return `<div class="who">${`<svg class="icon" viewBox="-16 -16 32 32">${helperFace(HELPER_LOOKS[def.helper.id])}</svg>`}<div><b>${helperName(def)}</b> · ${t('lvl')} ${zone.helperLevel}/${ECONOMY.helpers.maxLevel}${ready > 0 ? ' ⬆' : ''}<br><span class="st-${status}">${t('status.' + status)}</span> · <b>${rateTxt(zoneRate(def, zone))}/s</b></div></div>
      <div class="jam-slot">${jam === 'none' ? '' : `<span class="jam">${inlineIcon('warning', t('jam.' + jam))}</span>`}</div>${def.transport ? routePills(def.transport) : ''}`;
  }

  /** Datos extra de una línea, plegados al final del panel para que las mejoras sean lo primero. */
  function renderMore(sel: string): string {
    const def = ZONES.find((z) => z.id === sel);
    if (!def || !state.zones[def.id].unlocked) return '';
    const zone = state.zones[def.id];
    return `<details id="more-info"${moreOpen ? ' open' : ''}><summary>${t('info.more')}</summary><p><small>${helperBio(def)}</small></p>
      <ul class="rows">
        <li>${zone.machines} ${t('info.machines')} (${t('lvl')} ${zone.machineLevel}, ${t('info.grade')} ${machineGrade(zone.machineLevel)})</li>
        <li>${t('info.carts', { n: zone.carts, batch: cartBatch(zone), trip: ECONOMY.carts.tripSeconds })}</li>
        ${
          def.transport
            ? `<li>${t('info.pallet')}: <b>${Math.floor(zone.buffer)}/${Math.floor(zoneCapacity(zone))}</b></li><li>${t('info.warehouse', { units: Math.floor(state.transports[def.transport].units), cap: warehouseCapacity(state, def.transport), bonus: Math.round((warehouseBonus(state, def.transport) - 1) * 100) })}</li><li>${t('info.transport', { name: t('transport.' + def.transport), units: Math.floor(state.transports[def.transport].units), load: transportLoad(def.transport, state), mult: ECONOMY.transports[def.transport].payMultiplier, sent: state.transports[def.transport].sent })}</li>`
            : `<li>${t('info.pallet')}: <b>${Math.floor(zone.buffer)}/${Math.floor(zoneCapacity(zone))}</b> · ${t('info.dockHas')}: <b>${Math.floor(state.dockByZone[def.id] ?? 0)}/${dockProductCap(state, def)}</b></li>`
        }
        <li>${t('info.scrapFlow', { in: fmt(scrapPerSecond(state)), cap: rateTxt(zoneRate(def, zone) * def.scrapPerUnit), pile: fmt(state.scrap) })}</li>
        <li>${t('info.stock', { pallets: fmt(ZONES.reduce((n, z) => n + state.zones[z.id].buffer, 0)), dock: fmt(state.dockUnits), load: dockLoad(state) })}</li>
        <li>${t('info.nextGrade', { n: 5 - (zone.machineLevel % 5) })}</li>
      </ul></details>`;
  }

  let last = performance.now();
  let lastSceneAt = 0;
  let sceneEveryMs = window.matchMedia?.('(pointer: coarse)').matches ? 32 : 0;
  // Calidad: automática (baja si los fotogramas tardan más de 45 ms durante 3 s) o fija en baja desde ajustes.
  const QUALITY_KEY = 'chatarrero.quality';
  let lowForced = false;
  try {
    lowForced = localStorage.getItem(QUALITY_KEY) === 'low';
  } catch {
    /* sin almacenamiento: automática */
  }
  let lowQuality = lowForced;
  const applyQuality = (): void => {
    scene.setLowQuality(lowQuality);
    $('scene-wrap').classList.toggle('lowq', lowQuality);
  };
  applyQuality();
  let slowSince = 0;
  let frameMs = 16;
  let lastSave = last;
  const showFps = new URLSearchParams(location.search).has('fps');
  let frames = 0;
  let fpsAt = performance.now();
  let worst = 0;
  let prevFrame = fpsAt;
  let prevTick = last;
  let lastWork = -1e9;
  const loop = (now: number) => {
    if (showFps) {
      frames++;
      worst = Math.max(worst, now - prevFrame);
      prevFrame = now;
      if (now - fpsAt >= 1000) {
        const el = $('fps');
        el.hidden = false;
        el.textContent = `${frames} fps · peor ${Math.round(worst)} ms`;
        frames = 0;
        worst = 0;
        fpsAt = now;
      }
    }
    frameMs = frameMs * 0.9 + Math.min(200, now - prevTick) * 0.1;
    prevTick = now;
    if (frameMs > 22) sceneEveryMs = Math.max(sceneEveryMs, 32);
    if (frameMs > 45 || lowForced) sceneEveryMs = Math.max(sceneEveryMs, 50);
    if (!lowQuality) {
      slowSince = frameMs > 45 ? slowSince || now : 0;
      if (slowSince && now - slowSince > 3000) {
        lowQuality = true;
        applyQuality();
      }
    }
    // En táctiles (o si va justo) todo el bucle va al ritmo de la escena: entre medias no se toca nada (ni el
    // contador de dinero), y el móvil trabaja la mitad. Los toques se atienden igual (van por sus eventos).
    if (now - lastWork < sceneEveryMs - 4) {
      requestAnimationFrame(loop);
      return;
    }
    lastWork = now;
    advance(state, Math.min((now - last) / 1000, 1));
    last = now;
    if (now - lastSave > AUTOSAVE_MS && !importing) {
      writeSave(state);
      lastSave = now;
    }
    render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !importing) writeSave(state);
  });
  window.addEventListener('pagehide', () => {
    if (!importing) writeSave(state);
  });
}
