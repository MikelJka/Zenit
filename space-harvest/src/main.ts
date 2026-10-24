import { Application, Graphics } from 'pixi.js';
import { Game } from './sim/core/game';
import { MODULES } from './sim/registry';

async function boot(): Promise<void> {
  const host = document.getElementById('app');
  if (!host) return;
  const app = new Application();
  await app.init({ resizeTo: host, background: '#05070d', antialias: true });
  host.appendChild(app.canvas);

  const game = new Game(MODULES, 1);
  const dot = new Graphics().circle(0, 0, 24).fill(0xffd166);
  app.stage.addChild(dot);
  app.ticker.add((t) => {
    game.step(t.deltaMS);
    dot.position.set(app.screen.width / 2, app.screen.height / 2);
  });
}

void boot();
