import { Application, Graphics } from 'pixi.js';
import { Game } from './sim/core/game';
import { activeModules } from './sim/registry';

async function start(): Promise<void> {
  const host = document.getElementById('app')!;
  const app = new Application();
  await app.init({ resizeTo: host, background: 0x05070d, antialias: true });
  host.appendChild(app.canvas);

  const game = new Game(activeModules);
  const dot = new Graphics().circle(0, 0, 40).fill(0x6fb4ff);
  app.stage.addChild(dot);
  app.ticker.add((t) => {
    game.update(t.deltaMS / 1000);
    dot.position.set(app.screen.width / 2, app.screen.height / 2);
  });
}

void start();
