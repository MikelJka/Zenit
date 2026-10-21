import { describe, expect, it } from 'vitest';
import { missingEnglish, missingEnglishContent, achievementName, zoneName, helperName } from '../src/ui/texts';
import { ACHIEVEMENTS, ZONES } from '../src/sim/game';

describe('textos', () => {
  it('todo texto en español tiene su versión en inglés', () => {
    expect(missingEnglish()).toEqual([]);
  });
  it('zonas, ayudantes y logros tienen nombre en inglés', () => {
    expect(missingEnglishContent([...ZONES], [...ACHIEVEMENTS])).toEqual([]);
  });
  it('sin idioma elegido, lo que no se traduce cae al español del contenido', () => {
    expect(zoneName(ZONES[0])).toBeTruthy();
    expect(helperName(ZONES[0])).toBeTruthy();
    expect(achievementName(ACHIEVEMENTS[0])).toBeTruthy();
  });
});
