// Partidas de ejemplo para las capturas y el vídeo de anuncio. Escribe un JSON {early, mid, late, away} con partidas empaquetadas.
import { newGame } from '../../src/sim/game';
import { DEFAULT_BOT, playBot } from '../../src/sim/bot';
import { pack } from '../../src/sim/offline';

const play = (seconds: number) => {
  const s = newGame();
  playBot(s, seconds, { ...DEFAULT_BOT, checkEverySeconds: seconds > 7200 ? 600 : 1 });
  s.scrap = 5000; // con chatarra de sobra todas las líneas se ven trabajando
  return s;
};
// Con la hora de guardado un poco en el futuro no sale el aviso de «mientras no estabas» al abrir la partida.
const now = Date.now() + 3600e3;
const mid = play(26 * 3600);
process.stdout.write(
  JSON.stringify({
    early: pack(play(1500), now),
    mid: pack(mid, now),
    late: pack(play(4 * 86400), now),
    away: pack(mid, Date.now() - 3600e3),
  }),
);
