// Lo que fabrica cada línea, dibujado en isométrico con una forma distinta por producto (por id de zona).
import { block, cyl, cylX, iso, wheel } from './iso';

/** Alto aproximado de cada producto, para apilarlos. */
export const PROP_HEIGHT: Record<string, number> = {
  crusher: 0.34,
  smelter: 0.27,
  sheet: 0.26,
  pipes: 0.34,
  beams: 0.2,
  'engine-parts': 0.3,
  engines: 0.3,
  cars: 0.34,
  wagons: 0.3,
  containers: 0.34,
};

/** Producto de la zona `id` con su esquina en el origen (huella de unos 0,4 × 0,4). */
export function propIso(id: string): string {
  switch (id) {
    case 'crusher':
      // Bloque de chatarra aplastada, con tiras de colores.
      return (
        block(0, 0, 0, 0.34, 0.34, 0.3, '#78716b') +
        block(0.0, 0.0, 0.07, 0.34, 0.34, 0.04, '#b5523b', { edge: false }) +
        block(0.0, 0.0, 0.17, 0.34, 0.34, 0.04, '#5f7d91', { edge: false }) +
        block(0.05, 0.05, 0.3, 0.12, 0.12, 0.04, '#c9a24a') +
        block(0.18, 0.15, 0.3, 0.12, 0.12, 0.03, '#9aa5ab')
      );
    case 'smelter':
      // Lingotes dorados apilados.
      return (
        block(0, 0, 0, 0.38, 0.16, 0.09, '#e0b13a', { top: '#ffe08a' }) +
        block(0, 0.18, 0, 0.38, 0.16, 0.09, '#e0b13a', { top: '#ffe08a' }) +
        block(0.05, 0.08, 0.09, 0.3, 0.16, 0.09, '#d9a52a', { top: '#fff0b0' })
      );
    case 'sheet': {
      // Pila de chapas finas.
      let s = '';
      for (let i = 0; i < 4; i++) s += block(i * 0.012, 0, i * 0.065, 0.38, 0.3, 0.055, '#aebfcc', { top: '#e8f1f7' });
      return s;
    }
    case 'pipes':
      // Tres tubos tumbados.
      return cylX(0, 0.4, 0.08, 0.08, 0.075, '#4f9a8a') + cylX(0, 0.4, 0.26, 0.08, 0.075, '#4f9a8a') + cylX(0, 0.4, 0.17, 0.22, 0.075, '#5fb0a0');
    case 'beams':
      // Dos vigas en I.
      return (
        block(0, 0.02, 0, 0.44, 0.2, 0.035, '#8d7bb5') +
        block(0, 0.1, 0.035, 0.44, 0.04, 0.09, '#7a68a3') +
        block(0, 0.02, 0.125, 0.44, 0.2, 0.035, '#a89ad0') +
        block(0.04, 0.2, 0.0, 0.44, 0.18, 0.035, '#8d7bb5') +
        block(0.04, 0.27, 0.035, 0.44, 0.04, 0.07, '#7a68a3')
      );
    case 'engine-parts': {
      // Engranaje con un pistón al lado.
      const [gx, gy] = iso(0.16, 0.16, 0.14);
      return (
        block(0.02, 0.02, 0, 0.28, 0.28, 0.12, '#8a8a8a') +
        `<g transform="translate(${gx.toFixed(1)} ${gy.toFixed(1)})"><ellipse rx="9" ry="5" fill="#d98a82" stroke="#2a1d14" stroke-width="0.9"/><ellipse rx="10.8" ry="6.2" fill="none" stroke="#7a2f29" stroke-width="2.4" stroke-dasharray="2.6 2.6"/><ellipse rx="3" ry="1.7" fill="#2a1d14"/></g>` +
        cyl(0.36, 0.3, 0, 0.06, 0.26, '#bdbdbd')
      );
    }
    case 'engines':
      // Bloque motor con tres cilindros arriba.
      return (
        block(0, 0.03, 0, 0.4, 0.3, 0.17, '#5d7fc4') +
        block(0.04, 0.07, 0.17, 0.09, 0.22, 0.1, '#334f8a') +
        block(0.155, 0.07, 0.17, 0.09, 0.22, 0.1, '#334f8a') +
        block(0.27, 0.07, 0.17, 0.09, 0.22, 0.1, '#334f8a') +
        block(0, 0.0, 0.08, 0.4, 0.04, 0.04, '#9a9a9a')
      );
    case 'cars':
      // Cochecito reconstruido.
      return (
        block(0, 0.02, 0.08, 0.48, 0.28, 0.12, '#d4a72c') +
        block(0.12, 0.05, 0.2, 0.24, 0.22, 0.1, '#e8c35a') +
        block(0.13, 0.27, 0.22, 0.22, 0.01, 0.06, '#bfe7ff', { edge: false }) +
        wheel(0.1, 0.3, 0.06) +
        wheel(0.38, 0.3, 0.06)
      );
    case 'wagons':
      // Vagón de tren con dos ruedas.
      return block(0, 0.03, 0.1, 0.5, 0.26, 0.17, '#b5523b') + block(0, 0.03, 0.27, 0.5, 0.26, 0.05, '#6e2c1d') + wheel(0.1, 0.29, 0.07) + wheel(0.4, 0.29, 0.07);
    case 'containers':
      // Contenedor de carga con rayas.
      return block(0, 0.02, 0, 0.5, 0.28, 0.28, '#2f8fa3') + block(0.1, 0.0, 0.02, 0.03, 0.02, 0.24, '#1b5563', { edge: false }) + block(0.24, 0.0, 0.02, 0.03, 0.02, 0.24, '#1b5563', { edge: false }) + block(0.38, 0.0, 0.02, 0.03, 0.02, 0.24, '#1b5563', { edge: false });
    default:
      return block(0, 0, 0, 0.34, 0.34, 0.28, '#c58a4a');
  }
}
