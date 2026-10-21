// Sonidos sintetizados con Web Audio: sin archivos de terceros (coste cero). Solo la interfaz los usa.
import { readFlag, writeFlag } from './prefs';

const KEY = 'chatarrero.mute';
const SFX_KEY = 'chatarrero.sfx';
const VIBE_KEY = 'chatarrero.vibe';

let sfxOn = readFlag(SFX_KEY, true);
let vibeOn = readFlag(VIBE_KEY, true);

let ctx: AudioContext | null = null;
let muted = (() => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
})();

export type Sfx = 'tap' | 'buy' | 'cash' | 'reward' | 'train' | 'ship';

// Notas (Hz) y duración de cada sonido; el tipo de onda da el carácter.
const SFX: Record<Sfx, { notes: number[]; step: number; wave: OscillatorType; gain: number }> = {
  tap: { notes: [180, 120], step: 0.04, wave: 'square', gain: 0.08 },
  buy: { notes: [523, 659], step: 0.07, wave: 'triangle', gain: 0.14 },
  cash: { notes: [880, 1175, 1568], step: 0.06, wave: 'sine', gain: 0.14 },
  reward: { notes: [523, 659, 784, 1047], step: 0.08, wave: 'triangle', gain: 0.16 },
  // Bocina del tren (dos tonos) y sirena grave del barco.
  train: { notes: [311, 247], step: 0.3, wave: 'sawtooth', gain: 0.06 },
  ship: { notes: [73, 73.6], step: 0.7, wave: 'sawtooth', gain: 0.09 },
};

/** Vibración corta en el móvil (si el aparato lo permite). */
export function buzz(ms = 12): void {
  if (vibeOn) navigator.vibrate?.(ms);
}

export function isSfxOn(): boolean {
  return sfxOn;
}

export function setSfxOn(value: boolean): void {
  sfxOn = value;
  writeFlag(SFX_KEY, value);
}

export function isVibeOn(): boolean {
  return vibeOn;
}

export function setVibeOn(value: boolean): void {
  vibeOn = value;
  writeFlag(VIBE_KEY, value);
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  syncMusic();
  try {
    localStorage.setItem(KEY, value ? '1' : '0');
  } catch {
    /* sin almacenamiento: se juega igual */
  }
}

export function play(name: Sfx): void {
  if (muted || !sfxOn || typeof AudioContext === 'undefined') return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const def = SFX[name];
    const t0 = ctx.currentTime;
    def.notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const g = ctx!.createGain();
      const start = t0 + i * def.step;
      osc.type = def.wave;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(def.gain, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + def.step * 2);
      osc.connect(g).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + def.step * 2);
    });
  } catch {
    /* sin audio: se juega igual */
  }
}

// Música ambiental: acordes suaves de ondas sinusoidales en bucle, con su propio interruptor y volumen.
const MUSIC_KEY = 'chatarrero.music';
const CHORDS = [
  [110, 165, 220, 277],
  [87.3, 131, 175, 220],
  [98, 147, 196, 247],
  [82.4, 123, 165, 207],
];
const CHORD_SECONDS = 6;
let musicOn = (() => {
  try {
    return localStorage.getItem(MUSIC_KEY) !== '0';
  } catch {
    return true;
  }
})();
let musicGain: GainNode | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let chordIdx = 0;
let nextChord = 0;

export function isMusicOn(): boolean {
  return musicOn;
}

export function setMusicOn(value: boolean): void {
  musicOn = value;
  try {
    localStorage.setItem(MUSIC_KEY, value ? '1' : '0');
  } catch {
    /* sin almacenamiento: se juega igual */
  }
  syncMusic();
}

/** Arranca o para la música según el interruptor y el silencio general; llamar tras un gesto del jugador. */
export function syncMusic(): void {
  const want = musicOn && !muted && typeof AudioContext !== 'undefined';
  if (!want) {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
    if (musicGain && ctx) musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    return;
  }
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    if (!musicGain) {
      musicGain = ctx.createGain();
      musicGain.connect(ctx.destination);
    }
    musicGain.gain.setTargetAtTime(0.5, ctx.currentTime, 0.5);
    if (musicTimer) return;
    nextChord = ctx.currentTime + 0.1;
    const tick = () => {
      while (ctx && nextChord < ctx.currentTime + 2) {
        scheduleChord(nextChord);
        nextChord += CHORD_SECONDS;
      }
    };
    tick();
    musicTimer = setInterval(tick, 1000);
  } catch {
    /* sin audio: se juega igual */
  }
}

function scheduleChord(start: number): void {
  const c = ctx!;
  for (const freq of CHORDS[chordIdx++ % CHORDS.length]) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(0.03, start + 2);
    g.gain.linearRampToValueAtTime(0.0001, start + CHORD_SECONDS + 1.5);
    osc.connect(g).connect(musicGain!);
    osc.start(start);
    osc.stop(start + CHORD_SECONDS + 1.6);
  }
}
