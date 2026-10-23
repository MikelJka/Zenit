// Errores de esta sesión del navegador, para adjuntarlos al aviso del botón 🐞.
// Solo en memoria: no se guardan entre partidas.

const errors: string[] = [];
const MAX = 20;

function describe(value: unknown): string {
  if (value instanceof Error) {
    const where = value.stack?.split('\n').slice(1, 3).map((l) => l.trim()).join(' | ');
    return where ? `${value.name}: ${value.message} @ ${where}` : `${value.name}: ${value.message}`;
  }
  return typeof value === 'string' ? value : String(value);
}

function record(source: string, message: string): void {
  const line = `${new Date().toISOString().slice(11, 19)} [${source}] ${message.slice(0, 400)}`;
  if (errors.length > 0 && errors[errors.length - 1].endsWith(message.slice(0, 400))) return;
  errors.push(line);
  if (errors.length > MAX) errors.shift();
}

let installed = false;
/** Recoge excepciones y promesas rechazadas. Se llama una vez al arrancar. */
export function installErrorCapture(): void {
  if (installed) return;
  installed = true;
  window.addEventListener('error', (ev) => {
    const where = ev.filename ? ` (${ev.filename.split('/').pop()}:${ev.lineno}:${ev.colno})` : '';
    record('error', ev.error ? describe(ev.error) : `${ev.message}${where}`);
  });
  window.addEventListener('unhandledrejection', (ev) => record('promesa', describe(ev.reason)));
}

export function capturedErrors(): string[] {
  return [...errors];
}
