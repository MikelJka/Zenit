import { detectLang, type Lang } from './i18n';

export type Quality = 'low' | 'medium' | 'high';

export interface Settings {
  sound: boolean;
  lang: Lang;
  quality: Quality;
  reduceMotion: boolean;
}

export const SETTINGS_KEY = 'space-harvest-settings';

export function defaultSettings(navigatorLang?: string, prefersReducedMotion = false): Settings {
  return { sound: true, lang: detectLang(navigatorLang), quality: 'high', reduceMotion: prefersReducedMotion };
}

/** Carga ajustes guardados; lo que falte o sea inválido toma el valor por defecto. */
export function parseSettings(json: string | null, defaults: Settings): Settings {
  if (!json) return defaults;
  let raw: Partial<Settings>;
  try {
    raw = JSON.parse(json) as Partial<Settings>;
  } catch {
    return defaults;
  }
  return {
    sound: typeof raw.sound === 'boolean' ? raw.sound : defaults.sound,
    lang: raw.lang === 'es' || raw.lang === 'en' ? raw.lang : defaults.lang,
    quality: raw.quality === 'low' || raw.quality === 'medium' || raw.quality === 'high' ? raw.quality : defaults.quality,
    reduceMotion: typeof raw.reduceMotion === 'boolean' ? raw.reduceMotion : defaults.reduceMotion,
  };
}

export function loadSettings(): Settings {
  const defaults = defaultSettings(navigator.language, matchMedia('(prefers-reduced-motion: reduce)').matches);
  try {
    return parseSettings(localStorage.getItem(SETTINGS_KEY), defaults);
  } catch {
    return defaults;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}
