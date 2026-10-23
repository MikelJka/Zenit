import { Game } from './sim/core/game';
import { Registry } from './sim/core/registry';
import { createStationScene } from './render/station';
import { t, type Lang, type StringKey } from './ui/i18n';
import { loadSettings, saveSettings, type Settings } from './ui/settings';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const settings: Settings = loadSettings();
const game = new Game(new Registry(), 1);

const scene = await createStationScene($('game'));

function render() {
  const lang = settings.lang;
  document.documentElement.lang = lang;
  scene.setReduceMotion(settings.reduceMotion);
  scene.setQuality(settings.quality);
  $('tagline').textContent = t(lang, 'menu.tagline');
  $('play').textContent = t(lang, 'menu.play');
  $('summary').textContent = t(lang, 'menu.summary', {
    credits: Math.floor(game.ctx.resources.credits ?? 0),
    modules: 0,
  });
  $('settings-btn').setAttribute('aria-label', t(lang, 'settings.title'));
  renderPanel(lang);
}

function toggleRow(label: StringKey, on: boolean, lang: Lang, onClick: () => void): HTMLElement {
  const row = document.createElement('div');
  row.className = 'row';
  const span = document.createElement('span');
  span.textContent = t(lang, label);
  const b = document.createElement('button');
  b.textContent = (on ? '✔ ' : '✘ ') + t(lang, on ? 'settings.on' : 'settings.off');
  b.onclick = () => { onClick(); saveSettings(settings); render(); };
  row.append(span, b);
  return row;
}

function renderPanel(lang: Lang) {
  const panel = $('panel');
  panel.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = t(lang, 'settings.title');
  panel.append(h);

  const langRow = document.createElement('div');
  langRow.className = 'row';
  const ls = document.createElement('span');
  ls.textContent = t(lang, 'settings.language');
  const lb = document.createElement('button');
  lb.textContent = lang === 'es' ? 'Español' : 'English';
  lb.onclick = () => { settings.lang = lang === 'es' ? 'en' : 'es'; saveSettings(settings); render(); };
  langRow.append(ls, lb);

  const qRow = document.createElement('div');
  qRow.className = 'row';
  const qs = document.createElement('span');
  qs.textContent = t(lang, 'settings.quality');
  const qb = document.createElement('button');
  qb.textContent = t(lang, settings.quality === 'high' ? 'quality.high' : 'quality.low');
  qb.onclick = () => { settings.quality = settings.quality === 'high' ? 'low' : 'high'; saveSettings(settings); render(); };
  qRow.append(qs, qb);

  const close = document.createElement('button');
  close.textContent = '✕';
  close.setAttribute('aria-label', 'Cerrar / Close');
  close.onclick = () => $('settings').classList.remove('open');

  panel.append(
    langRow,
    toggleRow('settings.sound', settings.sound, lang, () => { settings.sound = !settings.sound; }),
    qRow,
    toggleRow('settings.reduceMotion', settings.reduceMotion, lang, () => { settings.reduceMotion = !settings.reduceMotion; }),
    close,
  );
}

$('settings-btn').onclick = () => $('settings').classList.add('open');
render();
