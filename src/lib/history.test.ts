import { beforeEach, describe, expect, it } from 'vitest'
import { addToHistory, loadHistory, MAX_HISTORY, type HistoryItem } from './history'

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

const KEY = 'oui-speak-french.history.v1'
const enFr = (src: string, out: string, at: number): HistoryItem => ({ from: 'en', to: 'fr', src, out, at })

describe('history', () => {
  beforeEach(() => store.clear())

  it('adds newest first and persists', () => {
    let h = addToHistory([], enFr('Hello', 'Bonjour', 1))
    h = addToHistory(h, { from: 'fr', to: 'en', src: 'Merci', out: 'Thanks', at: 2 })
    expect(h.map(i => i.src)).toEqual(['Merci', 'Hello'])
    expect(loadHistory()).toEqual(h)
  })

  it('moves a repeated phrase to the top instead of duplicating it', () => {
    let h = addToHistory([], enFr('Hello', 'Bonjour', 1))
    h = addToHistory(h, enFr('Thanks', 'Merci', 2))
    h = addToHistory(h, enFr('hello ', 'Bonjour', 3))
    expect(h.map(i => i.at)).toEqual([3, 2])
  })

  it('keeps the same text translated in different directions as separate items', () => {
    let h = addToHistory([], enFr('Ok', 'Ok', 1))
    h = addToHistory(h, { from: 'fr', to: 'en', src: 'Ok', out: 'Ok', at: 2 })
    expect(h).toHaveLength(2)
  })

  it('caps the list length', () => {
    let h: HistoryItem[] = []
    for (let i = 0; i < MAX_HISTORY + 5; i++) h = addToHistory(h, enFr(`p${i}`, `f${i}`, i))
    expect(h).toHaveLength(MAX_HISTORY)
    expect(h[0].src).toBe(`p${MAX_HISTORY + 4}`)
  })

  it('reads items saved by the first, English-to-French-only release', () => {
    store.set(KEY, JSON.stringify([{ en: 'Hello', fr: 'Bonjour', at: 5 }, { junk: true }]))
    expect(loadHistory()).toEqual([enFr('Hello', 'Bonjour', 5)])
  })

  it('survives corrupt storage', () => {
    store.set(KEY, '{not json')
    expect(loadHistory()).toEqual([])
  })
})
