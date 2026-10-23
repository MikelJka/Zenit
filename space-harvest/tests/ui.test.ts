import { describe, expect, it } from 'vitest';
import { detectLang, missingTexts, t } from '../src/ui/i18n';
import { defaultSettings, parseSettings } from '../src/ui/settings';

describe('i18n', () => {
  it('todos los textos existen en es y en', () => {
    expect(missingTexts()).toEqual([]);
  });
  it('traduce, cae al id y sustituye parámetros', () => {
    expect(t('en', 'menu.play')).toBe('Play');
    expect(t('es', 'no.existe')).toBe('no.existe');
    expect(t('es', 'x {n}', { n: 3 })).toBe('x 3');
    expect(t('es', 'x {n}')).toBe('x {n}');
  });
  it('detecta el idioma del navegador', () => {
    expect(detectLang('en-GB')).toBe('en');
    expect(detectLang('es-ES')).toBe('es');
    expect(detectLang(undefined)).toBe('es');
  });
});

describe('ajustes', () => {
  const d = defaultSettings('es-ES');
  it('usa los valores por defecto si no hay nada o está roto', () => {
    expect(parseSettings(null, d)).toEqual(d);
    expect(parseSettings('{no json', d)).toEqual(d);
  });
  it('mezcla lo guardado con los valores por defecto', () => {
    const s = parseSettings('{"lang":"en","quality":"raro","sound":false}', d);
    expect(s).toEqual({ ...d, lang: 'en', sound: false });
  });
});
