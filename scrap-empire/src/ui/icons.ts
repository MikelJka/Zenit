// Iconos 2D en SVG (caras de los ayudantes, productos, camión y carretilla) para la tienda y las placas.
import type { HelperLook } from './look';

/** Cara de un ayudante centrada en (0,0), radio ~13. */
export function helperFace(look: HelperLook): string {
  const { skin, hair, gear, accessory } = look;
  const eyes = `<circle cx="-4.5" cy="-1" r="1.7" fill="#2a1d14"/><circle cx="4.5" cy="-1" r="1.7" fill="#2a1d14"/>`;
  const smile = `<path d="M-5 4 Q0 9 5 4" stroke="#2a1d14" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  const cheeks = `<circle cx="-8" cy="3" r="2.2" fill="#ff8a80" opacity="0.45"/><circle cx="8" cy="3" r="2.2" fill="#ff8a80" opacity="0.45"/>`;
  const head = `<circle r="12" fill="${skin}" stroke="#2a1d14" stroke-width="1.4"/>`;
  const hairCap = `<path d="M-12 -2 Q-12 -14 0 -14 Q12 -14 12 -2 Q6 -9 0 -9 Q-6 -9 -12 -2Z" fill="${hair}"/>`;
  let extra = '';
  switch (accessory) {
    case 'hardhat':
      extra = `<path d="M-14 -5 Q-13 -18 0 -18 Q13 -18 14 -5Z" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/><rect x="-15" y="-6" width="30" height="3" rx="1.5" fill="${gear}" stroke="#2a1d14" stroke-width="1"/>
        <path d="M-13 4 q-4 4 -2 9 M13 4 q4 4 2 9" stroke="${hair}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      break;
    case 'goggles':
      extra = `${hairCap}<rect x="-12" y="-9" width="24" height="3" fill="#2a1d14"/><circle cx="-5" cy="-8" r="3.6" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/><circle cx="5" cy="-8" r="3.6" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/>`;
      break;
    case 'beard':
      extra = `<path d="M-11 1 Q-12 15 0 16 Q12 15 11 1 Q6 7 0 7 Q-6 7 -11 1Z" fill="${hair}"/><path d="M-4 7 Q0 9 4 7" stroke="#2a1d14" stroke-width="1.4" fill="none"/>`;
      break;
    case 'cap':
      extra = `<path d="M-12 -4 Q-12 -15 0 -15 Q12 -15 12 -4Z" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/><path d="M2 -5 L18 -4 Q17 -1 2 -2Z" fill="${gear}" stroke="#2a1d14" stroke-width="1"/><path d="M-6 5 Q0 3 6 5" stroke="${hair}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      break;
    case 'bandana':
      extra = `${hairCap}<path d="M-12 -6 Q0 -12 12 -6 L12 -3 Q0 -9 -12 -3Z" fill="${gear}"/><path d="M11 -5 l6 -3 l-1 6Z" fill="${gear}"/><circle cx="-6" cy="-7" r="0.9" fill="#fff"/><circle cx="3" cy="-8" r="0.9" fill="#fff"/>`;
      break;
    case 'spiky':
      extra = `<path d="M-12 -3 L-10 -16 L-5 -10 L-1 -19 L3 -10 L8 -17 L9 -9 L13 -12 L12 -3 Q0 -9 -12 -3Z" fill="${hair}"/><path d="M13 -6 q2 3 0 5 q-2 -2 0 -5Z" fill="#7fd3ff"/>`;
      break;
    case 'glasses':
      extra = `<path d="M-14 -5 Q-13 -18 0 -18 Q13 -18 14 -5Z" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/><path d="M-2 -16 l3 0 l-2 4 l3 0 l-5 7 l1 -5 l-3 0Z" fill="#fff6b0"/>
        <circle cx="-4.5" cy="-1" r="3.6" fill="none" stroke="#2a1d14" stroke-width="1.3"/><circle cx="4.5" cy="-1" r="3.6" fill="none" stroke="#2a1d14" stroke-width="1.3"/>`;
      break;
    case 'helmet':
      extra = `<path d="M-13 2 Q-14 -17 0 -17 Q14 -17 13 2 L9 2 L9 -4 L-9 -4 L-9 2Z" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/><rect x="-2" y="-17" width="4" height="13" fill="#fff" opacity="0.85"/>`;
      break;
  }
  return `${head}${cheeks}${eyes}${smile}${extra}`;
}

/** Icono del producto de cada zona centrado en (0,0), unos 16 px. */
export function productIcon(id: string): string {
  switch (id) {
    case 'crusher':
      return `<path d="M-7 -3 L0 -7 L7 -3 L7 5 L0 9 L-7 5Z" fill="#8f8f8f" stroke="#3b3b3b"/><path d="M-7 -3 L0 1 L7 -3 M0 1 L0 9" stroke="#3b3b3b" fill="none"/>`;
    case 'smelter':
      return `<path d="M-8 4 L-5 -4 L5 -4 L8 4Z" fill="#f2c14e" stroke="#8a6410"/><path d="M-4 -2 L3 -2" stroke="#fff3c4" stroke-width="1.5"/>`;
    case 'sheet':
      return `<path d="M-9 2 L-3 -5 L9 -5 L3 2Z" fill="#b7c7d3" stroke="#4d6070"/><path d="M-9 2 L-9 4 L3 4 L3 2 M3 4 L9 -3 L9 -5" stroke="#4d6070" fill="#91a4b2"/>`;
    case 'pipes':
      return `<rect x="-8" y="-4" width="14" height="8" rx="1" fill="#7fb9ac" stroke="#2d6156"/><ellipse cx="6" cy="0" rx="2.5" ry="4" fill="#2d6156"/>`;
    case 'beams':
      return `<path d="M-9 -5 H9 V-2 H2 V2 H9 V5 H-9 V2 H-2 V-2 H-9Z" fill="#b3a6d6" stroke="#57487d"/>`;
    case 'engine-parts':
      return `<circle r="6" fill="#d98a82" stroke="#7a2f29" stroke-width="1.2"/><circle r="2.2" fill="#7a2f29"/><path d="M0 -9 V-6 M0 6 V9 M-9 0 H-6 M6 0 H9 M-6.4 -6.4 L-4.2 -4.2 M6.4 6.4 L4.2 4.2 M6.4 -6.4 L4.2 -4.2 M-6.4 6.4 L-4.2 4.2" stroke="#7a2f29" stroke-width="2.4"/>`;
    case 'engines':
      return `<rect x="-8" y="-3" width="16" height="9" rx="2" fill="#8fa8dc" stroke="#334f8a"/><rect x="-6" y="-8" width="4" height="5" fill="#8fa8dc" stroke="#334f8a"/><rect x="2" y="-8" width="4" height="5" fill="#8fa8dc" stroke="#334f8a"/>`;
    case 'cars':
      return `<path d="M-10 3 L-10 -1 L-5 -2 L-2 -6 L5 -6 L8 -2 L10 -1 L10 3Z" fill="#e8c35a" stroke="#8f6d12"/><circle cx="-5" cy="4" r="2.6" fill="#2a1d14"/><circle cx="5" cy="4" r="2.6" fill="#2a1d14"/>`;
    case 'wagons':
      return `<path d="M-10 2 L-10 -4 L10 -4 L10 2Z" fill="#b5523b" stroke="#6e2c1d"/><circle cx="-5" cy="4" r="2.6" fill="#2a1d14"/><circle cx="5" cy="4" r="2.6" fill="#2a1d14"/>`;
    case 'containers':
      return `<rect x="-9" y="-5" width="18" height="10" rx="1" fill="#2f8fa3" stroke="#1b5563"/><path d="M-4 -5 V5 M0 -5 V5 M4 -5 V5" stroke="#1b5563"/>`;
    default:
      return '';
  }
}

export function truck(color: string, cab: string, load = ''): string {
  return `<g>
    <rect x="-34" y="-22" width="44" height="22" rx="3" fill="${color}" stroke="#2a1d14" stroke-width="1.5"/>
    ${load}
    <path d="M10 -16 L22 -16 L30 -6 L30 0 L10 0Z" fill="${cab}" stroke="#2a1d14" stroke-width="1.5"/>
    <path d="M13 -13 L21 -13 L26 -7 L13 -7Z" fill="#bfe7ff" stroke="#2a1d14" stroke-width="1"/>
    <circle cx="-22" cy="1" r="6" fill="#2a1d14"/><circle cx="-22" cy="1" r="2.4" fill="#9a9a9a"/>
    <circle cx="20" cy="1" r="6" fill="#2a1d14"/><circle cx="20" cy="1" r="2.4" fill="#9a9a9a"/>
  </g>`;
}

export const FORKLIFT = `<g>
  <rect x="-9" y="-12" width="14" height="10" rx="2" fill="#f4c430" stroke="#2a1d14" stroke-width="1.2"/>
  <path d="M-7 -12 L-7 -19 L3 -19 L3 -12" stroke="#2a1d14" stroke-width="1.6" fill="none"/>
  <path d="M6 -16 L6 -2 L12 -2" stroke="#2a1d14" stroke-width="1.8" fill="none"/>
  <rect x="7" y="-8" width="7" height="6" fill="#b07a45" stroke="#2a1d14" stroke-width="1"/>
  <circle cx="-5" cy="-1" r="3" fill="#2a1d14"/><circle cx="3" cy="-1" r="3" fill="#2a1d14"/>
</g>`;


/** Iconos de la interfaz (barra de arriba y botones de extras), 24×24, con relieve y contorno propios. */
export type UiIconName = 'trophy' | 'gear' | 'sound-on' | 'sound-off' | 'timer' | 'ad' | 'hourglass' | 'gift' | 'star' | 'target' | 'finger' | 'coin' | 'cart' | 'check' | 'warning' | 'medal' | 'bug';

/** Icono pequeño que va delante de un texto (el texto se escapa). */
export function inlineIcon(name: UiIconName, text: string): string {
  return uiIcon(name).replace('class="uiicon"', 'class="uiicon inline"') + esc(text);
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function uiIcon(name: UiIconName): string {
  const o = 'stroke="#2a1d14" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"';
  let body = '';
  switch (name) {
    case 'trophy':
      body = `<path d="M7 4h10v5a5 5 0 0 1-10 0Z" fill="#f2c14e" ${o}/><path d="M7 6H4q0 5 4 5.5M17 6h3q0 5-4 5.5" fill="none" ${o}/><path d="M12 14v3M8 20h8l-1-3H9Z" fill="#d99a1f" ${o}/><path d="M9.5 6v3" stroke="#fff3c4" stroke-width="1.4" stroke-linecap="round"/>`;
      break;
    case 'bug':
      body = `<path d="M9 7.5a3 3 0 0 1 6 0" fill="#7a4a2a" ${o}/><ellipse cx="12" cy="14" rx="5.2" ry="6.2" fill="#e0584a" ${o}/><path d="M12 8v12M6.8 12H3.5M17.2 12h3.3M7 16.5l-3 2M17 16.5l3 2M7.6 9.5 5 7.5M16.4 9.5 19 7.5" fill="none" ${o}/><circle cx="9.7" cy="12.5" r="1" fill="#2a1d14"/><circle cx="14.3" cy="15.5" r="1" fill="#2a1d14"/>`;
      break;
    case 'gear':
      body = `<path d="M12 3l1.6 2.2 2.7-.6.9 2.6 2.6.9-.6 2.7L21 12l-2.2 1.6.6 2.7-2.6.9-.9 2.6-2.7-.6L12 21l-1.6-2.2-2.7.6-.9-2.6-2.6-.9.6-2.7L3 12l2.2-1.6-.6-2.7 2.6-.9.9-2.6 2.7.6Z" fill="#b9c2c9" ${o}/><circle cx="12" cy="12" r="3.2" fill="#4d6070" ${o}/>`;
      break;
    case 'sound-on':
    case 'sound-off':
      body = `<path d="M4 9h3.5L12 5v14l-4.5-4H4Z" fill="#e6c98a" ${o}/>` +
        (name === 'sound-on'
          ? `<path d="M15 9.5q2 2.5 0 5M17.5 7q4 5 0 10" fill="none" ${o}/>`
          : `<path d="M15.5 9.5l5 5M20.5 9.5l-5 5" fill="none" stroke="#e0584a" stroke-width="2" stroke-linecap="round"/>`);
      break;
    case 'timer':
      body = `<circle cx="12" cy="13" r="7.5" fill="#fff6d8" ${o}/><path d="M12 8.5V13l3 2M9.5 3h5" fill="none" ${o}/>`;
      break;
    case 'ad':
      body = `<rect x="3" y="5" width="18" height="12" rx="2" fill="#3a4a5c" ${o}/><path d="M10 8.5v5l4.5-2.5Z" fill="#fff" ${o}/><path d="M8 20h8" fill="none" ${o}/>`;
      break;
    case 'hourglass':
      body = `<path d="M7 3h10M7 21h10M8 3c0 5 4 5 4 9s-4 4-4 9M16 3c0 5-4 5-4 9s4 4 4 9" fill="#f2d79a" ${o}/>`;
      break;
    case 'gift':
      body = `<rect x="4" y="10" width="16" height="10" rx="1.5" fill="#e0584a" ${o}/><rect x="3" y="7" width="18" height="4" rx="1.2" fill="#f07a6c" ${o}/><path d="M12 7v13" stroke="#f2c14e" stroke-width="3"/><path d="M12 7c-4-5-7-1-3 0M12 7c4-5 7-1 3 0" fill="none" ${o}/>`;
      break;
    case 'star':
      body = `<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8Z" fill="#f2c14e" ${o}/>`;
      break;
    case 'target':
      body = `<circle cx="12" cy="12" r="8.5" fill="#fff6d8" ${o}/><circle cx="12" cy="12" r="5" fill="#e0584a" ${o}/><circle cx="12" cy="12" r="1.8" fill="#fff6d8" ${o}/>`;
      break;
    case 'finger':
      body = `<path d="M9 11V5.5a1.6 1.6 0 0 1 3.2 0V11h1.3a2 2 0 0 1 2 .6 2 2 0 0 1 2.6 1.3l.4 1.4V17q0 4-4 4h-2.5q-2 0-3.2-1.6L5.5 15q.8-1.2 2.3-.4L9 15.5Z" fill="#f5cfa0" ${o}/>`;
      break;
    case 'coin':
      body = `<circle cx="12" cy="12" r="8.5" fill="#f2c14e" ${o}/><circle cx="12" cy="12" r="5.6" fill="#f7d77a" ${o}/><path d="M12 8.2v7.6M14 9.6q-1.4-1-2.6-.6-1.6.6-.8 1.8c.8 1 3.6.6 3.2 2.2-.3 1.4-2.6 1.4-4 .4" fill="none" stroke="#8a6410" stroke-width="1.3" stroke-linecap="round"/>`;
      break;
    case 'cart':
      body = `<path d="M3 5h3l2.4 10h9.4L20 8H7" fill="#b9c2c9" ${o}/><circle cx="9.5" cy="19" r="1.8" fill="#4d6070" ${o}/><circle cx="16.5" cy="19" r="1.8" fill="#4d6070" ${o}/>`;
      break;
    case 'check':
      body = `<circle cx="12" cy="12" r="9" fill="#6fcf7f" ${o}/><path d="M7.5 12.5l3 3 6-7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;
    case 'warning':
      body = `<path d="M12 3.5l9 16H3Z" fill="#ffb347" ${o}/><path d="M12 9.5v5" stroke="#2a1d14" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.1" fill="#2a1d14"/>`;
      break;
    case 'medal':
      body = `<path d="M8 3l4 7 4-7" fill="#e0584a" ${o}/><circle cx="12" cy="15" r="6" fill="#f2c14e" ${o}/><path d="M12 11.5l1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.2-2.3 1.2.5-2.5-1.8-1.7 2.5-.3Z" fill="#fff3c4"/>`;
      break;
  }
  return `<svg class="uiicon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">${body}</svg>`;
}
