import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchDishPhotos, imageSearchUrl, photosFromResponse } from './dishPhotos'

const store = new Map<string, string>()
globalThis.localStorage = {
  getItem: k => store.get(k) ?? null,
  setItem: (k, v) => void store.set(k, String(v)),
  removeItem: k => void store.delete(k),
  clear: () => store.clear(),
  key: i => [...store.keys()][i] ?? null,
  get length() { return store.size },
} as Storage

const RESPONSE = {
  query: {
    normalized: [{ from: 'Escargot', to: 'Escargot' }],
    redirects: [{ from: 'Beef bourguignon', to: 'Bœuf bourguignon' }],
    pages: {
      '1': { title: 'Bœuf bourguignon', thumbnail: { source: 'https://img/boeuf.jpg' } },
      '2': { title: 'Escargot', thumbnail: { source: 'https://img/escargot.jpg' } },
      '3': { title: 'Tartine' },
      '-1': { title: 'Not a page', missing: '' },
    },
  },
}

describe('photosFromResponse', () => {
  it('follows redirects back to the requested titles', () => {
    expect(photosFromResponse(['Beef bourguignon', 'Escargot', 'Tartine', 'Not a page'], RESPONSE)).toEqual({
      'Beef bourguignon': 'https://img/boeuf.jpg',
      Escargot: 'https://img/escargot.jpg',
      Tartine: null,
      'Not a page': null,
    })
  })
})

describe('fetchDishPhotos', () => {
  beforeEach(() => store.clear())

  it('asks Wikipedia once for all titles, with CORS-friendly params, and caches the answer', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(RESPONSE)))
    const titles = ['Beef bourguignon', 'Escargot', 'Tartine']
    expect(await fetchDishPhotos(titles, fetchFn)).toEqual({
      'Beef bourguignon': 'https://img/boeuf.jpg', Escargot: 'https://img/escargot.jpg', Tartine: null,
    })
    const url = new URL(String(fetchFn.mock.calls[0][0]))
    expect(url.hostname).toBe('en.wikipedia.org')
    expect(url.searchParams.get('origin')).toBe('*')
    expect(url.searchParams.get('titles')).toBe('Beef bourguignon|Escargot|Tartine')

    await fetchDishPhotos(titles, fetchFn)
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('returns no photos when offline, without caching the failure', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => { throw new TypeError('offline') })
    expect(await fetchDishPhotos(['Escargot'], fetchFn)).toEqual({ Escargot: null })
    await fetchDishPhotos(['Escargot'], fetchFn)
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
})

describe('imageSearchUrl', () => {
  it('opens Google Images for the French dish name', () => {
    const url = new URL(imageSearchUrl("Soupe à l'oignon"))
    expect(url.origin + url.pathname).toBe('https://www.google.com/search')
    expect(url.searchParams.get('udm')).toBe('2')
    expect(url.searchParams.get('q')).toBe("Soupe à l'oignon plat")
  })
})
