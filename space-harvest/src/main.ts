import { Application, Graphics } from 'pixi.js';
import { Game } from './sim/core/game';
import { MODULES } from './sim/registry';

const SAVE_KEY = 'space-harvest-save';

function loadGame(): Game {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return Game.load(MODULES, raw);
  } catch {
    /* guardado corrupto o sin acceso: empezamos de cero */
  }
  return new Game(MODULES);
}

async function start(): Promise<void> {
  const host = document.getElementById('game')!;
  const app = new Application();
  await app.init({ resizeTo: host, background: '#05070f', antialias: true, resolution: devicePixelRatio, autoDensity: true });
  host.appendChild(app.canvas);

  const game = loadGame();
  const planet = new Graphics().circle(0, 0, 60).fill(0x4a7fd4);
  app.stage.addChild(planet);

  app.ticker.add((t) => {
    game.advance(t.deltaMS / 1000);
    planet.position.set(app.screen.width / 2, app.screen.height / 2);
  });
  setInterval(() => {
    try {
      localStorage.setItem(SAVE_KEY, game.serialize());
    } catch {
      /* sin espacio o modo privado */
    }
  }, 10000);
}

void start();
