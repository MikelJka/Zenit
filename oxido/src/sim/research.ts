// Investigación (fase 5, bloque 3 del catálogo): se elige un proyecto y avanza mientras un
// colono con el trabajo «Investigar» está en un banco de investigación. Determinista: sin azar.
import { RESEARCH, RESEARCH_REFERENCE_SKILL, ResearchDef, researchDef, Researchable, researchNeeds } from '../data/research';

export type { Researchable };
import { TICKS_PER_HOUR } from './time';

export interface ResearchState {
  /** Proyecto en marcha (o null si no se investiga nada). */
  current: string | null;
  /** Trabajo hecho en cada proyecto empezado (se guarda aunque se cambie de proyecto). */
  progress: Record<string, number>;
  /** Proyectos terminados, en el orden en que se terminaron. */
  done: string[];
}

export function newResearch(): ResearchState {
  return { current: null, progress: {}, done: [] };
}

/** Velocidad de un colono con Investigación `ref` (la misma fórmula que `workSpeed`, sin necesidades). */
const REFERENCE_SPEED = 0.6 + RESEARCH_REFERENCE_SKILL * 0.05;

/** Trabajo total de un proyecto: sus horas para un colono con la Investigación de referencia. */
export function researchCost(p: ResearchDef): number {
  return p.hours * TICKS_PER_HOUR * REFERENCE_SPEED;
}

export function isResearched(r: ResearchState, id: string): boolean {
  return r.done.includes(id);
}

/** Por cuánto se multiplica lo que guarda cada batería con lo investigado («Baterías mejoradas»: ×2). */
export function batteryMultiplier(r: ResearchState): number {
  let m = 1;
  for (const id of r.done) m *= researchDef(id)?.batteryMultiplier ?? 1;
  return m;
}

/** Por cuánto se multiplica el tiempo que tardan en cerrarse las heridas («Medicina avanzada»: ×0,75). */
export function woundHealTimeFactor(r: ResearchState): number {
  let m = 1;
  for (const id of r.done) m *= researchDef(id)?.woundHealTime ?? 1;
  return m;
}

/** Por cuánto se multiplica la probabilidad de que una herida se infecte («Medicina avanzada»: ×0,5). */
export function infectionChanceFactor(r: ResearchState): number {
  let m = 1;
  for (const id of r.done) m *= researchDef(id)?.infectionChance ?? 1;
  return m;
}

/** Por cuánto se multiplican los ⚙️ que sueltan las máquinas destruidas («Desguace de máquinas»: ×2). */
export function machinePartsMultiplier(r: ResearchState): number {
  let m = 1;
  for (const id of r.done) m *= researchDef(id)?.machineParts ?? 1;
  return m;
}

/** Las zanjas que tocan el agua se inundan (foso con agua): ya está terminado un proyecto que lo hace («Hidráulica»). */
export function trenchesFlood(r: ResearchState): boolean {
  return r.done.some((id) => !!researchDef(id)?.floodsTrenches);
}

/** Ya se puede usar: no pide investigación, o ya está hecha toda la que pide (planos nuevos, recetas…). */
export function unlocked(r: ResearchState, thing: Researchable): boolean {
  return researchNeeds(thing).every((q) => isResearched(r, q));
}

/** La primera investigación que aún le falta (para decir qué hay que investigar), o undefined. */
export function missingResearch(r: ResearchState, thing: Researchable): ResearchDef | undefined {
  const q = researchNeeds(thing).find((id) => !isResearched(r, id));
  return q ? researchDef(q) : undefined;
}

/**
 * Lo que desbloquea un proyecto (para avisar al terminarlo). Con `r`, solo lo que ya no pide nada más
 * (la mina casera pide «Trampas» y «Pólvora»: se avisa al terminar la segunda).
 */
export function unlockedBy<T extends Researchable>(list: readonly T[], id: string, r?: ResearchState): T[] {
  return list.filter((b) => researchNeeds(b).includes(id) && (!r || unlocked(r, b)));
}

/** Se puede empezar: existe, no está hecho y lo que pide antes ya está terminado. */
export function canResearch(r: ResearchState, id: string): boolean {
  const p = researchDef(id);
  return !!p && !isResearched(r, id) && p.requires.every((q) => isResearched(r, q));
}

/** Elige el proyecto en marcha (null para parar). Devuelve false si no se puede. */
export function chooseResearch(r: ResearchState, id: string | null): boolean {
  if (id !== null && !canResearch(r, id)) return false;
  r.current = id;
  return true;
}

/** Fracción hecha de un proyecto (0 a 1). */
export function researchFraction(r: ResearchState, id: string): number {
  if (isResearched(r, id)) return 1;
  const p = researchDef(id);
  return p ? Math.min(1, (r.progress[id] ?? 0) / researchCost(p)) : 0;
}

/**
 * Suma trabajo al proyecto en marcha. Devuelve el proyecto si con esto se termina
 * (queda en `done` y ya no hay proyecto en marcha).
 */
export function addResearch(r: ResearchState, amount: number): ResearchDef | null {
  const p = r.current ? researchDef(r.current) : undefined;
  if (!p || isResearched(r, p.id)) {
    r.current = null;
    return null;
  }
  r.progress[p.id] = (r.progress[p.id] ?? 0) + amount;
  if (r.progress[p.id] < researchCost(p)) return null;
  delete r.progress[p.id];
  r.done.push(p.id);
  r.current = null;
  return p;
}

/** Lee el estado guardado; lo que no se entienda se descarta (partidas antiguas: sin nada investigado). */
export function loadResearch(d: unknown): ResearchState {
  const out = newResearch();
  if (!d || typeof d !== 'object') return out;
  const s = d as Partial<ResearchState>;
  // Se recorre el árbol en orden para que lo terminado respete lo que pide antes.
  const done = Array.isArray(s.done) ? s.done : [];
  for (const p of RESEARCH) if (done.includes(p.id) && p.requires.every((q) => out.done.includes(q))) out.done.push(p.id);
  if (s.progress && typeof s.progress === 'object') {
    for (const [id, v] of Object.entries(s.progress)) {
      if (researchDef(id) && !out.done.includes(id) && typeof v === 'number' && Number.isFinite(v) && v > 0) out.progress[id] = v;
    }
  }
  if (typeof s.current === 'string' && canResearch(out, s.current)) out.current = s.current;
  return out;
}

/** Sitio de un proyecto en el dibujo del árbol: columna (`col`, 0 = sin requisitos) y fila (`row`). */
export interface ResearchTreeNode {
  id: string;
  col: number;
  row: number;
}

/** Dibujo del árbol de investigación: cada proyecto con su sitio y las flechas (de lo que pide a él). */
export interface ResearchTreeLayout {
  nodes: ResearchTreeNode[];
  edges: { from: string; to: string }[];
  cols: number;
  rows: number;
}

/**
 * Coloca los proyectos como un árbol que crece hacia la derecha (pedido por Mikel, Z#17): la columna
 * es la cadena más larga de requisitos que lleva hasta él y cada rama ocupa sus propias filas, con el
 * padre a la altura de su primer hijo. Si un proyecto pide dos cosas, cuelga de la más profunda y la
 * otra se une con una flecha. Solo depende de los datos: siempre sale igual.
 */
export function researchTreeLayout(projects: readonly ResearchDef[] = RESEARCH): ResearchTreeLayout {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const depth = new Map<string, number>();
  const depthOf = (id: string, seen: Set<string> = new Set()): number => {
    const known = depth.get(id);
    if (known !== undefined) return known;
    const p = byId.get(id);
    if (!p || seen.has(id)) return 0;
    seen.add(id);
    const reqs = p.requires.filter((q) => byId.has(q));
    const d = reqs.length ? 1 + Math.max(...reqs.map((q) => depthOf(q, seen))) : 0;
    depth.set(id, d);
    return d;
  };
  // De quién cuelga cada uno: el requisito más profundo (el primero si empatan).
  const children = new Map<string, string[]>();
  const roots: string[] = [];
  for (const p of projects) {
    const reqs = p.requires.filter((q) => byId.has(q));
    if (!reqs.length) {
      roots.push(p.id);
      continue;
    }
    let parent = reqs[0];
    for (const q of reqs) if (depthOf(q) > depthOf(parent)) parent = q;
    const list = children.get(parent) ?? [];
    list.push(p.id);
    children.set(parent, list);
  }
  const nodes: ResearchTreeNode[] = [];
  const placed = new Set<string>();
  let nextRow = 0;
  const place = (id: string): number => {
    placed.add(id);
    const kids = (children.get(id) ?? []).filter((k) => !placed.has(k));
    let row = nextRow;
    if (kids.length) row = Math.min(...kids.map(place));
    else nextRow++;
    nodes.push({ id, col: depthOf(id), row });
    return row;
  };
  for (const id of roots) if (!placed.has(id)) place(id);
  for (const p of projects) if (!placed.has(p.id)) place(p.id); // requisitos en bucle: no debería pasar
  nodes.sort((a, b) => a.row - b.row || a.col - b.col);
  const edges = projects.flatMap((p) => p.requires.filter((q) => byId.has(q)).map((q) => ({ from: q, to: p.id })));
  return { nodes, edges, cols: Math.max(1, ...nodes.map((n) => n.col + 1)), rows: Math.max(1, nextRow) };
}
