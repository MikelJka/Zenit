import type { SaveData } from './game'

const KEY = 'space-harvest-save'

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* sin almacenamiento: se juega sin guardar */
  }
}

export function readSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SaveData) : null
  } catch {
    return null
  }
}
