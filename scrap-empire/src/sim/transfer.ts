/**
 * Código de partida para llevarla a otro dispositivo sin servidor: texto que se copia y se pega.
 * Envuelve el mismo JSON del guardado (con versión), así que las migraciones valen igual.
 */
const PREFIX = 'CHAT1:';

/** Convierte una partida guardada (`pack`) en un código de texto. */
export function toCode(saveJson: string): string {
  return PREFIX + btoa(encodeURIComponent(saveJson));
}

/** Devuelve el guardado dentro del código, o null si el texto no es un código válido. */
export function fromCode(code: string): string | null {
  const text = code.trim();
  if (!text.startsWith(PREFIX)) return null;
  try {
    const json = decodeURIComponent(atob(text.slice(PREFIX.length)));
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || typeof parsed.state !== 'object' || parsed.state === null) return null;
    return json;
  } catch {
    return null;
  }
}
