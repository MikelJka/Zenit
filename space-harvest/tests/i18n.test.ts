import { describe, expect, it } from 'vitest';
import { STRINGS, detectLang, t } from '../src/ui/i18n';
import { defaultSettings, parseSettings } from '../src/ui/settings';

describe('textos es/en', () => {
  it('ambos idiomas tienen las mismas claves', () => {
    expect(Object.keys(STRINGS.en).sort()).toEqual(Object.keys(STRINGS.es).sort());
  });
  it('sustituye parámetros', () => {
    expect(t('es', 'menu.summary', { credits: 12, modules: 3 })).toBe('12 ¢ · 3 módulos');
    expect(t('en', 'menu.play')).toBe('PLAY');
  });
  it('detecta el idioma del navegador', () => {
    expect(detectLang('es-ES')).toBe('es');
    expect(detectLang('fr')).toBe('en');
    expect(detectLang(undefined)).toBe('en');
  });
});

describe('ajustes', () => {
  const base = defaultSettings('es', false);
  it('usa los valores por defecto si no hay nada o está roto', () => {
    expect(parseSettings(null, base)).toEqual(base);
    expect(parseSettings('{no json', base)).toEqual(base);
  });
  it('ignora campos inválidos y conserva los válidos', () => {
    const s = parseSettings(JSON.stringify({ lang: 'en', sound: 'x', quality: 'low' }), base);
    expect(s).toEqual({ ...base, lang: 'en', quality: 'low' });
  });
});
