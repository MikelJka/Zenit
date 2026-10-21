// Preferencias de ajustes guardadas en el aparato (solo interfaz, no son parte de la partida).
const CALM_KEY = 'chatarrero.calm';

/** Lee un interruptor guardado; sin valor guardado devuelve el de por defecto. */
export function readFlag(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}

export function writeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    /* sin almacenamiento: vale para esta sesión */
  }
}

/** «Reducir movimiento»: lo elegido en ajustes o, si no se ha tocado, lo que pide el sistema. */
export function reducedMotion(): boolean {
  return readFlag(CALM_KEY, window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
}

export function setReducedMotion(value: boolean): void {
  writeFlag(CALM_KEY, value);
}

const BIGTEXT_KEY = 'chatarrero.bigtext';
const CONTRAST_KEY = 'chatarrero.contrast';

export function isBigText(): boolean {
  return readFlag(BIGTEXT_KEY, false);
}

export function setBigText(value: boolean): void {
  writeFlag(BIGTEXT_KEY, value);
  applyAccessibility();
}

export function isHighContrast(): boolean {
  return readFlag(CONTRAST_KEY, window.matchMedia?.('(prefers-contrast: more)').matches ?? false);
}

export function setHighContrast(value: boolean): void {
  writeFlag(CONTRAST_KEY, value);
  applyAccessibility();
}

/** Pone en <html> las clases de «texto grande» y «alto contraste» que usa style.css. */
export function applyAccessibility(): void {
  document.documentElement.classList.toggle('bigtext', isBigText());
  document.documentElement.classList.toggle('contrast', isHighContrast());
}
