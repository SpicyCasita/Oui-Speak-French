/** Recent translations, newest first, kept on this device only. */
import type { Lang } from './lang'

export interface HistoryItem {
  from: Lang
  to: Lang
  src: string
  out: string
  /** epoch ms */
  at: number
}

const KEY = 'oui-speak-french.history.v1'
export const MAX_HISTORY = 25

const isLang = (l: unknown): l is Lang => l === 'en' || l === 'fr'

/** Accept current items and the first release's English → French shape ({ en, fr, at }). */
function normalize(i: unknown): HistoryItem | null {
  if (!i || typeof i !== 'object') return null
  const o = i as Record<string, unknown>
  const at = typeof o.at === 'number' ? o.at : 0
  if (typeof o.src === 'string' && typeof o.out === 'string' && isLang(o.from) && isLang(o.to)) {
    return { from: o.from, to: o.to, src: o.src, out: o.out, at }
  }
  if (typeof o.en === 'string' && typeof o.fr === 'string') return { from: 'en', to: 'fr', src: o.en, out: o.fr, at }
  return null
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    const items: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(items) ? items.map(normalize).filter((i): i is HistoryItem => i !== null) : []
  } catch {
    return []
  }
}

/** Add an item to the front, dropping an older copy of the same text in the same direction. */
export function addToHistory(items: HistoryItem[], item: HistoryItem): HistoryItem[] {
  const same = (i: HistoryItem) => i.from === item.from && i.src.trim().toLowerCase() === item.src.trim().toLowerCase()
  const next = [item, ...items.filter(i => !same(i))].slice(0, MAX_HISTORY)
  saveHistory(next)
  return next
}

export function saveHistory(items: HistoryItem[]): void {
  try {
    if (items.length) localStorage.setItem(KEY, JSON.stringify(items))
    else localStorage.removeItem(KEY)
  } catch { /* storage blocked: history just won't persist */ }
}
