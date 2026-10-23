import { detectLang, type Lang } from './i18n';

export interface Settings {
  lang: Lang;
  sound: boolean;
  quality: 'low' | 'high';
  reduceMotion: boolean;
}

const KEY = 'space-harvest.settings';

export function defaultSettings(navigatorLang?: string, prefersReducedMotion = false): Settings {
  return { lang: detectLang(navigatorLang), sound: true, quality: 'high', reduceMotion: prefersReducedMotion };
}

/** Lee los ajustes guardados; los campos que falten o sean inválidos toman el valor por defecto. */
export function parseSettings(raw: string | null, base: Settings): Settings {
  if (!raw) return base;
  try {
    const d = JSON.parse(raw) as Partial<Settings>;
    return {
      lang: d.lang === 'es' || d.lang === 'en' ? d.lang : base.lang,
      sound: typeof d.sound === 'boolean' ? d.sound : base.sound,
      quality: d.quality === 'low' || d.quality === 'high' ? d.quality : base.quality,
      reduceMotion: typeof d.reduceMotion === 'boolean' ? d.reduceMotion : base.reduceMotion,
    };
  } catch {
    return base;
  }
}

export function loadSettings(): Settings {
  const base = defaultSettings(navigator.language, matchMedia('(prefers-reduced-motion: reduce)').matches);
  try {
    return parseSettings(localStorage.getItem(KEY), base);
  } catch {
    return base;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* sin almacenamiento: los ajustes valen solo para esta sesión */
  }
}
