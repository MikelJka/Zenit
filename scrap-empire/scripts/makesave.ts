// Escribe en la salida una partida avanzada (para medir el rendimiento): uso `npx vite-node scripts/makesave.ts [días]`.
import { newGame } from '../src/sim/game';
import { DEFAULT_BOT, playBot } from '../src/sim/bot';
import { pack } from '../src/sim/offline';

const s = newGame();
playBot(s, Number(process.argv[2] ?? 2) * 86400, { ...DEFAULT_BOT, checkEverySeconds: 600 });
process.stdout.write(pack(s, Date.now()));
