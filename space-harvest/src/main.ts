import { Application, Graphics } from 'pixi.js';
import { Game } from './sim/core/game';
import { modules } from './sim/registry';

async function main(): Promise<void> {
  const game = new Game(modules);
  const app = new Application();
  await app.init({ resizeTo: window, background: 0x05070f, antialias: true });
  document.getElementById('app')!.appendChild(app.canvas);

  // Marcador provisional del Hito 0: la estación se dibujará en las siguientes sesiones.
  const core = new Graphics().circle(0, 0, 40).fill(0x4fb3ff);
  app.stage.addChild(core);
  app.ticker.add((t) => {
    game.tick(t.deltaMS / 1000);
    core.position.set(app.screen.width / 2, app.screen.height / 2);
  });
}

main();
