import { Application } from 'pixi.js';
import { MODULES } from './sim/registry';
import { advance, newGame } from './sim/core/game';

const state = newGame(MODULES, Date.now() >>> 0);

const app = new Application();
await app.init({ background: '#050814', resizeTo: window, antialias: true });
document.getElementById('app')!.appendChild(app.canvas);

app.ticker.add((t) => advance(state, MODULES, t.deltaMS / 1000));
