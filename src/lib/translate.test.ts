import { describe, expect, it, vi } from 'vitest'
import { decodeEntities, MAX_CHUNK, splitChunks, translate, TranslateError, type Cache } from './translate'

const memCache = (): Cache & { map: Map<string, string> } => {
  const map = new Map<string, string>()
  return { map, get: k => map.get(k), set: (k, v) => void map.set(k, v) }
}

const ok = (translatedText: string) =>
  new Response(JSON.stringify({ responseData: { translatedText }, responseStatus: 200 }), { status: 200 })

describe('splitChunks', () => {
  it('returns short text as one chunk, whitespace normalized', () => {
    expect(splitChunks('  Hello   there.\tHow are you?  ')).toEqual(['Hello there. How are you?'])
  })

  it('returns nothing for blank text', () => {
    expect(splitChunks('   ')).toEqual([])
  })

  it('splits long text on sentence boundaries and packs sentences up to the limit', () => {
    const s = 'This is a sentence of moderate length. '
    const chunks = splitChunks(s.repeat(30))
    expect(chunks.length).toBeGreaterThan(1)
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(MAX_CHUNK)
      expect(c.endsWith('.')).toBe(true)
    }
    expect(chunks.join(' ')).toBe(s.repeat(30).trim())
  })

  it('breaks an over-long sentence on words, and hard-cuts an over-long word', () => {
    const words = Array.from({ length: 200 }, (_, i) => `word${i}`).join(' ')
    const chunks = splitChunks(words, 50)
    expect(chunks.every(c => c.length <= 50)).toBe(true)
    expect(chunks.join(' ')).toBe(words)

    const blob = 'x'.repeat(120)
    expect(splitChunks(blob, 50)).toEqual(['x'.repeat(50), 'x'.repeat(50), 'x'.repeat(20)])
  })
})

describe('decodeEntities', () => {
  it('decodes named and numeric entities', () => {
    expect(decodeEntities('C&#39;est l&apos;heure &amp; &quot;ok&quot; &#x00e9;')).toBe(`C'est l'heure & "ok" é`)
  })
  it('leaves unknown entities alone', () => {
    expect(decodeEntities('&bogus;')).toBe('&bogus;')
  })
})

describe('translate', () => {
  it('calls MyMemory with en|fr and decodes the result', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => ok("Où est la gare&#39;?"))
    const out = await translate('Where is the train station?', { fetchFn })
    expect(out).toBe("Où est la gare'?")
    const url = new URL(String(fetchFn.mock.calls[0][0]))
    expect(url.origin + url.pathname).toBe('https://api.mymemory.translated.net/get')
    expect(url.searchParams.get('langpair')).toBe('en|fr')
    expect(url.searchParams.get('q')).toBe('Where is the train station?')
  })

  it('translates French to English when asked, caching per direction', async () => {
    const cache = memCache()
    const fetchFn = vi.fn<typeof fetch>(async () => ok('Exit'))
    expect(await translate('Sortie', { from: 'fr', to: 'en', fetchFn, cache })).toBe('Exit')
    expect(new URL(String(fetchFn.mock.calls[0][0])).searchParams.get('langpair')).toBe('fr|en')
    expect(cache.map.get('fr|en:Sortie')).toBe('Exit')
  })

  it('keeps paragraphs on separate lines and skips blank ones', async () => {
    const fetchFn = vi.fn(async (input: RequestInfo | URL) => ok(`FR(${new URL(String(input)).searchParams.get('q')})`))
    expect(await translate('Hello.\n\nGoodbye.', { fetchFn })).toBe('FR(Hello.)\nFR(Goodbye.)')
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('uses the cache instead of fetching again', async () => {
    const cache = memCache()
    const fetchFn = vi.fn(async () => ok('Bonjour'))
    await translate('Hello', { fetchFn, cache })
    await translate('Hello', { fetchFn, cache })
    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(cache.map.get('en|fr:Hello')).toBe('Bonjour')
  })

  it('reports an exhausted quota clearly', async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify({
      responseData: { translatedText: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY.' },
      responseStatus: 429,
    })))
    const err = await translate('Hello', { fetchFn }).catch(e => e)
    expect(err).toBeInstanceOf(TranslateError)
    expect(err.kind).toBe('quota')
  })

  it('reports a network failure', async () => {
    const fetchFn = vi.fn(async () => { throw new TypeError('Failed to fetch') })
    const err = await translate('Hello', { fetchFn }).catch(e => e)
    expect(err).toBeInstanceOf(TranslateError)
    expect(err.kind).toBe('network')
  })

  it('reports a service error and caches nothing', async () => {
    const cache = memCache()
    const fetchFn = vi.fn(async () => new Response(JSON.stringify({ responseStatus: 403, responseDetails: 'INVALID LANGUAGE PAIR' })))
    const err = await translate('Hello', { fetchFn, cache }).catch(e => e)
    expect(err.kind).toBe('service')
    expect(err.message).toBe('INVALID LANGUAGE PAIR')
    expect(cache.map.size).toBe(0)
  })
})
