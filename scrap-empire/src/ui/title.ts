// Menú de inicio: logo, botón de jugar y resumen de la partida. Se salta con `?notitle` (pruebas y material de anuncio).
import { uiIcon } from './icons';
import { isMusicOn, isSfxOn, setMusicOn, setSfxOn, syncMusic } from './sound';
import { getLang, setLang, t, type Lang } from './texts';

export interface TitleInfo {
  /** Dólares ya formateados. */
  dollars: string;
  zonesOpen: number;
  zonesTotal: number;
  hasProgress: boolean;
  /** Guarda la partida antes de recargar al cambiar de idioma. */
  save: () => void;
  onPlay: () => void;
}

export function showTitle(root: HTMLElement, info: TitleInfo): void {
  if (new URLSearchParams(location.search).has('notitle')) return info.onPlay();
  const el = document.createElement('div');
  el.id = 'title';
  const base = import.meta.env.BASE_URL;
  const soundOn = (): boolean => isMusicOn() || isSfxOn();
  const lang = getLang();
  el.innerHTML = `
    <div class="title-bg" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="title-card">
      <img class="title-logo" src="${base}icon.svg" alt="" />
      <h1><span>SCRAP EMPIRE</span><small>IDLE FACTORY</small></h1>
      ${info.hasProgress ? `<p class="title-stats"><b>$${info.dollars}</b> · ${t('title.zones', { n: info.zonesOpen, total: info.zonesTotal })}</p>` : `<p class="title-stats">${t('title.tagline')}</p>`}
      <button id="play" type="button">${info.hasProgress ? t('title.continue') : t('title.play')}</button>
      <div class="title-row">
        <button type="button" data-lang="es" aria-pressed="${lang === 'es'}">ES</button>
        <button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button>
        <button type="button" id="title-sound" aria-pressed="${soundOn()}" aria-label="${t('settings.music')}">${uiIcon(soundOn() ? 'sound-on' : 'sound-off')}</button>
      </div>
    </div>
    <p class="title-foot">ZENIT STUDIO</p>
    <div class="title-hazard" aria-hidden="true"></div>`;
  root.appendChild(el);
  const close = (): void => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 400);
    syncMusic();
    info.onPlay();
  };
  el.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button');
    if (!b) return;
    if (b.id === 'play') return close();
    if (b.id === 'title-sound') {
      const on = !soundOn();
      setMusicOn(on);
      setSfxOn(on);
      b.innerHTML = uiIcon(on ? 'sound-on' : 'sound-off');
      b.setAttribute('aria-pressed', String(on));
      return;
    }
    const next = b.dataset.lang as Lang | undefined;
    if (next && next !== getLang()) {
      setLang(next);
      info.save();
      location.reload();
    }
  });
}
