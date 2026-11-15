/** Recent translations, newest first, kept on this device only. */

export interface HistoryItem {
  en: string
  fr: string
  /** epoch ms */
  at: number
}

const KEY = 'oui-speak-french.history.v1'
export const MAX_HISTORY = 25

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    const items = raw ? (JSON.parse(raw) as HistoryItem[]) : []
    return Array.isArray(items) ? items.filter(i => i && typeof i.en === 'string' && typeof i.fr === 'string') : []
  } catch {
    return []
  }
}

/** Add an item to the front, dropping an older copy of the same English text. */
export function addToHistory(items: HistoryItem[], item: HistoryItem): HistoryItem[] {
  const next = [item, ...items.filter(i => i.en.trim().toLowerCase() !== item.en.trim().toLowerCase())].slice(0, MAX_HISTORY)
  saveHistory(next)
  return next
}

export function saveHistory(items: HistoryItem[]): void {
  try {
    if (items.length) localStorage.setItem(KEY, JSON.stringify(items))
    else localStorage.removeItem(KEY)
  } catch { /* storage blocked: history just won't persist */ }
}
