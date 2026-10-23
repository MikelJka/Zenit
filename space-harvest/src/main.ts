import { Application, Graphics } from 'pixi.js';
import { advanceOffline } from './sim/core/clock';
import { load } from './sim/core/save';
import { activeModules, Registry } from './sim/registry';

const registry = new Registry(activeModules);
const state = load(localStorage.getItem('space-harvest-save'), registry, Date.now());
advanceOffline(state, registry, Date.now());

async function start(): Promise<void> {
  const app = new Application();
  await app.init({ resizeTo: window, background: '#05070d', antialias: true });
  document.getElementById('app')!.appendChild(app.canvas);
  const mark = new Graphics().circle(0, 0, 40).fill(0x4fc3f7);
  app.stage.addChild(mark);
  const place = (): void => {
    mark.position.set(app.screen.width / 2, app.screen.height / 2);
  };
  place();
  app.renderer.on('resize', place);
}

void start();
