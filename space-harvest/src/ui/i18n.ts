export type Lang = 'es' | 'en';

export const STRINGS = {
  es: {
    'menu.play': 'JUGAR',
    'menu.continue': 'CONTINUAR',
    'menu.tagline': 'Cosecha, mina y capta la energía del Sol',
    'menu.summary': '{credits} ¢ · {modules} módulos',
    'settings.title': 'Ajustes',
    'settings.language': 'Idioma',
    'settings.sound': 'Sonido',
    'settings.quality': 'Calidad',
    'settings.reduceMotion': 'Reducir movimiento',
    'settings.on': 'Sí',
    'settings.off': 'No',
    'quality.low': 'Baja',
    'quality.high': 'Alta',
  },
  en: {
    'menu.play': 'PLAY',
    'menu.continue': 'CONTINUE',
    'menu.tagline': 'Harvest, mine and capture the Sun’s energy',
    'menu.summary': '{credits} ¢ · {modules} modules',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.sound': 'Sound',
    'settings.quality': 'Quality',
    'settings.reduceMotion': 'Reduce motion',
    'settings.on': 'On',
    'settings.off': 'Off',
    'quality.low': 'Low',
    'quality.high': 'High',
  },
} as const;

export type StringKey = keyof (typeof STRINGS)['es'];

/** Texto traducido; `{nombre}` se sustituye con `params`. Si falta en el idioma, cae al español. */
export function t(lang: Lang, key: StringKey, params: Record<string, string | number> = {}): string {
  const text: string = STRINGS[lang][key] ?? STRINGS.es[key];
  return text.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`));
}

export function detectLang(navigatorLang: string | undefined): Lang {
  return navigatorLang?.toLowerCase().startsWith('es') ? 'es' : 'en';
}
