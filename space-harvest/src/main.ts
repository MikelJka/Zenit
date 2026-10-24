import { Application, Graphics } from 'pixi.js';
import { Game } from './sim/core/game';
import { modules } from './sim/registry';

async function boot(): Promise<void> {
  const app = new Application();
  await app.init({ resizeTo: window, background: '#05070f', antialias: true });
  document.body.appendChild(app.canvas);

  const game = new Game(modules, Date.now() >>> 0);
  const star = new Graphics().circle(0, 0, 40).fill(0xffd27a);
  app.stage.addChild(star);
  const place = (): void => {
    star.position.set(app.screen.width / 2, app.screen.height / 2);
  };
  place();
  app.renderer.on('resize', place);

  app.ticker.add((t) => game.step(t.deltaMS));
}

void boot();
