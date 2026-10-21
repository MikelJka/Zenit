// Dónde se guarda la partida. Hoy: el navegador (decidido por Mikel, opción S1).
// Para sincronizar en la nube más adelante (Google Play Games, Firebase…), basta con
// otra implementación de `SaveStore` y cambiar `store`; el resto del juego no se toca.
export interface SaveStore {
  /** Guardado en JSON (el de `pack`), o null si no hay. */
  read(): string | null;
  write(json: string): boolean;
}

const KEY = 'chatarrero.save';

export const localStore: SaveStore = {
  read() {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  write(json) {
    try {
      localStorage.setItem(KEY, json);
      return true;
    } catch {
      return false; // sin almacenamiento: se juega igual
    }
  },
};

export const store: SaveStore = localStore;
