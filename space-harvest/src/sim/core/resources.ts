/** Recursos comunes: cada módulo puede leerlos y escribirlos, pero no tocar el código de otro módulo. */
export const RESOURCE_IDS = ['credits', 'energy', 'data'] as const;
export type ResourceId = (typeof RESOURCE_IDS)[number];
export type Resources = Record<ResourceId, number>;

export function emptyResources(): Resources {
  return { credits: 0, energy: 0, data: 0 };
}

/** ¿Alcanza `have` para pagar `cost`? */
export function canAfford(have: Resources, cost: Partial<Resources>): boolean {
  return RESOURCE_IDS.every((id) => have[id] >= (cost[id] ?? 0));
}

/** Descuenta `cost` si se puede pagar; devuelve si se pagó. */
export function pay(have: Resources, cost: Partial<Resources>): boolean {
  if (!canAfford(have, cost)) return false;
  for (const id of RESOURCE_IDS) have[id] -= cost[id] ?? 0;
  return true;
}
