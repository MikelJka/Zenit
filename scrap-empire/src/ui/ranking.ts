// Ranking mundial de dinero generado (Firebase: inicio de sesión anónimo + Firestore, nivel gratuito).
// Se activa rellenando `src/data/firebase.json` (ver docs/RANKING.md). Firebase se carga solo al abrir el ranking.
import firebaseData from '../data/firebase.json';

export interface RankEntry {
  uid: string;
  name: string;
  total: number;
}

export const rankingEnabled = firebaseData.enabled && firebaseData.config.projectId !== '';

const NICK_KEY = 'chatarrero.nick';

export function getNick(): string {
  try {
    return localStorage.getItem(NICK_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Apodo de 3 a 16 caracteres sin símbolos raros; devuelve null si no vale. */
export function cleanNick(raw: string): string | null {
  const nick = raw.replace(/[^\p{L}\p{N} _.-]/gu, '').trim().replace(/\s+/g, ' ');
  return nick.length >= 3 && nick.length <= 16 ? nick : null;
}

export function setNick(nick: string): void {
  try {
    localStorage.setItem(NICK_KEY, nick);
  } catch {
    // sin almacenamiento: se pedirá otra vez
  }
}

async function connect() {
  const [{ initializeApp }, { getAuth, signInAnonymously }, fs] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
  const app = initializeApp(firebaseData.config);
  const auth = getAuth(app);
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  return { db: fs.getFirestore(app), uid: user.uid, fs };
}

let link: ReturnType<typeof connect> | null = null;
const session = () => (link ??= connect());

/** Sube lo generado en total por este jugador (solo sube, las reglas de Firestore lo exigen). */
export async function submitScore(name: string, total: number): Promise<void> {
  if (!rankingEnabled) return;
  const { db, uid, fs } = await session();
  await fs.setDoc(fs.doc(db, 'players', uid), { name, total: Math.floor(total), updatedAt: fs.serverTimestamp() });
}

/** Los mejores jugadores y el id del jugador actual. */
export async function topScores(limit = 50): Promise<{ list: RankEntry[]; me: string }> {
  const { db, uid, fs } = await session();
  const snap = await fs.getDocs(fs.query(fs.collection(db, 'players'), fs.orderBy('total', 'desc'), fs.limit(limit)));
  return { me: uid, list: snap.docs.map((d) => ({ uid: d.id, name: String(d.data().name ?? '?'), total: Number(d.data().total ?? 0) })) };
}
