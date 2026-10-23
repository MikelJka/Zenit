import { createGame } from './sim/registry';

// Arranque mínimo del Hito 0: la simulación vive sin dibujado; el menú y el mapa llegan en las siguientes tareas.
const game = createGame([], 1);
document.getElementById('app')!.textContent = `Space Harvest — t=${game.clock.time}s`;
