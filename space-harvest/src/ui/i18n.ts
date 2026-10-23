import texts from '../data/texts.json';

export type Lang = 'es' | 'en';
export const LANGS: Lang[] = ['es', 'en'];

type TextId = keyof (typeof texts)['es'];

/** Devuelve el texto en `lang`; si falta, cae al español y, si tampoco está, devuelve el id. */
export function t(lang: Lang, id: string, params: Record<string, string | number> = {}): string {
  const table = texts as Record<string, Record<string, string>>;
  const raw = table[lang]?.[id] ?? table.es?.[id] ?? id;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`));
}

export function missingTexts(): { lang: Lang; id: string }[] {
  const out: { lang: Lang; id: string }[] = [];
  const ids = Object.keys(texts.es) as TextId[];
  for (const lang of LANGS) {
    const table = texts[lang] as Record<string, string>;
    for (const id of ids) if (!(id in table)) out.push({ lang, id });
  }
  return out;
}

/** Idioma inicial según el del navegador. */
export function detectLang(navigatorLang: string | undefined): Lang {
  return navigatorLang?.toLowerCase().startsWith('en') ? 'en' : 'es';
}
