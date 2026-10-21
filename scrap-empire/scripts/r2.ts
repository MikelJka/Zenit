import { newGame } from '../src/sim/game';
import { DEFAULT_BOT, playBot } from '../src/sim/bot';
const at = playBot(newGame(), 12 * 3600, { ...DEFAULT_BOT, stopWhenAllOpen: true });
console.log(Object.entries(at).map(([k, v]) => `${k} ${(v / 3600).toFixed(2)}h`).join(' · '));
