import { Application } from 'pixi.js';
import { modules } from './sim/registry';
import { newGame } from './sim/core/game';

async function start(): Promise<void> {
  const host = document.getElementById('app')!;
  const app = new Application();
  await app.init({ resizeTo: host, background: 0x05070d, antialias: true });
  host.appendChild(app.canvas);
  newGame(modules, Date.now());
}

void start();
