/**
 * English → French via the free MyMemory API (https://mymemory.translated.net/doc/spec.php).
 * No key needed; CORS-enabled; anonymous quota is about 5,000 characters a day per IP.
 * Requests are limited to 500 bytes of query, so long text is split on sentence boundaries.
 */

export const API_URL = 'https://api.mymemory.translated.net/get'
export const LANG_PAIR = 'en|fr'
/** MyMemory rejects q over 500 bytes; stay under it with room for multi-byte characters. */
export const MAX_CHUNK = 450

export class TranslateError extends Error {
  readonly kind: 'quota' | 'network' | 'service'
  constructor(kind: TranslateError['kind'], message: string) {
    super(message)
    this.name = 'TranslateError'
    this.kind = kind
  }
}

/** Split one paragraph into pieces of at most `max` characters, preferring sentence then word breaks. */
export function splitChunks(text: string, max = MAX_CHUNK): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  if (clean.length <= max) return [clean]

  const sentences = clean.match(/[^.!?…]+(?:[.!?…]+["'”’)\]]*|$)\s*/g) ?? [clean]
  const pieces: string[] = []
  for (const s of sentences.map(s => s.trim()).filter(Boolean)) {
    if (s.length <= max) { pieces.push(s); continue }
    // A single over-long sentence: break on words, and hard-cut any word longer than max.
    let line = ''
    for (const word of s.split(' ')) {
      for (let w = word; w; w = w.slice(max)) {
        const part = w.slice(0, max)
        if (line && line.length + 1 + part.length > max) { pieces.push(line); line = '' }
        line = line ? `${line} ${part}` : part
      }
    }
    if (line) pieces.push(line)
  }

  // Pack short sentences back together so we make as few requests as possible.
  const chunks: string[] = []
  for (const p of pieces) {
    const last = chunks.length - 1
    if (last >= 0 && chunks[last].length + 1 + p.length <= max) chunks[last] += ` ${p}`
    else chunks.push(p)
  }
  return chunks
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

/** MyMemory sometimes returns HTML entities (&#39;, &quot;) in translatedText. */
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : m
    }
    return ENTITIES[code.toLowerCase()] ?? m
  })
}

export interface Cache {
  get(key: string): string | undefined
  set(key: string, value: string): void
}

/** Small LRU kept in localStorage, so repeated phrases cost no quota and work offline. */
export function localStorageCache(storageKey = 'traduire.cache.v1', maxEntries = 300): Cache {
  let entries: [string, string][] = []
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) entries = JSON.parse(raw)
  } catch { /* private mode or corrupt: start empty */ }
  const map = new Map(entries)
  const save = () => {
    try { localStorage.setItem(storageKey, JSON.stringify([...map])) } catch { /* full or blocked */ }
  }
  return {
    get(key) {
      const v = map.get(key)
      if (v !== undefined) { map.delete(key); map.set(key, v) }
      return v
    },
    set(key, value) {
      map.delete(key)
      map.set(key, value)
      while (map.size > maxEntries) map.delete(map.keys().next().value!)
      save()
    },
  }
}

interface MyMemoryResponse {
  responseData?: { translatedText?: string }
  responseStatus?: number | string
  responseDetails?: string
  quotaFinished?: boolean
}

async function translateChunk(chunk: string, fetchFn: typeof fetch, signal?: AbortSignal): Promise<string> {
  const url = `${API_URL}?${new URLSearchParams({ q: chunk, langpair: LANG_PAIR })}`
  let res: Response
  try {
    res = await fetchFn(url, { signal })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new TranslateError('network', navigator.onLine === false
      ? "You're offline. Connect to translate new text."
      : "Couldn't reach the translation service. Try again.")
  }
  const data = (await res.json().catch(() => ({}))) as MyMemoryResponse
  const status = Number(data.responseStatus ?? res.status)
  const text = data.responseData?.translatedText ?? ''
  if (data.quotaFinished || status === 429 || /MYMEMORY WARNING/i.test(text)) {
    throw new TranslateError('quota', "Today's free translation quota is used up. It resets within 24 hours.")
  }
  if (!res.ok || status !== 200 || !text) {
    throw new TranslateError('service', data.responseDetails || `Translation failed (${status}).`)
  }
  return decodeEntities(text)
}

export interface TranslateOptions {
  fetchFn?: typeof fetch
  cache?: Cache
  signal?: AbortSignal
}

/** Translate English text to French, keeping line breaks between paragraphs. */
export async function translate(text: string, { fetchFn = fetch, cache, signal }: TranslateOptions = {}): Promise<string> {
  const paragraphs = text.split(/\n+/)
  const out: string[] = []
  for (const para of paragraphs) {
    const parts: string[] = []
    for (const chunk of splitChunks(para)) {
      const key = `${LANG_PAIR}:${chunk}`
      let fr = cache?.get(key)
      if (fr === undefined) {
        fr = await translateChunk(chunk, fetchFn, signal)
        cache?.set(key, fr)
      }
      parts.push(fr)
    }
    if (parts.length) out.push(parts.join(' '))
  }
  return out.join('\n')
}
