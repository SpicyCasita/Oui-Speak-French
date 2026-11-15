import { beforeEach, describe, expect, it } from 'vitest'
import { addToHistory, loadHistory, MAX_HISTORY } from './history'

// Minimal in-memory localStorage for the node test environment.
const store = new Map<string, string>()
globalThis.localStorage = {
  getItem: k => store.get(k) ?? null,
  setItem: (k, v) => void store.set(k, String(v)),
  removeItem: k => void store.delete(k),
  clear: () => store.clear(),
  key: i => [...store.keys()][i] ?? null,
  get length() { return store.size },
} as Storage

describe('history', () => {
  beforeEach(() => store.clear())

  it('adds newest first and persists', () => {
    let h = addToHistory([], { en: 'Hello', fr: 'Bonjour', at: 1 })
    h = addToHistory(h, { en: 'Thanks', fr: 'Merci', at: 2 })
    expect(h.map(i => i.en)).toEqual(['Thanks', 'Hello'])
    expect(loadHistory()).toEqual(h)
  })

  it('moves a repeated phrase to the top instead of duplicating it', () => {
    let h = addToHistory([], { en: 'Hello', fr: 'Bonjour', at: 1 })
    h = addToHistory(h, { en: 'Thanks', fr: 'Merci', at: 2 })
    h = addToHistory(h, { en: 'hello ', fr: 'Bonjour', at: 3 })
    expect(h.map(i => i.at)).toEqual([3, 2])
  })

  it('caps the list length', () => {
    let h: ReturnType<typeof loadHistory> = []
    for (let i = 0; i < MAX_HISTORY + 5; i++) h = addToHistory(h, { en: `p${i}`, fr: `f${i}`, at: i })
    expect(h).toHaveLength(MAX_HISTORY)
    expect(h[0].en).toBe(`p${MAX_HISTORY + 4}`)
  })

  it('survives corrupt storage', () => {
    store.set('traduire.history.v1', '{not json')
    expect(loadHistory()).toEqual([])
  })
})
