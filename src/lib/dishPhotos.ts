/**
 * Dish photos from Wikipedia: the lead image of each dish's article (English, else French).
 * One request covers up to 50 dishes (the API allows anonymous cross-origin use with origin=*).
 * Results, including "no photo", are kept on the device so a menu only costs one lookup.
 */

export type Wiki = 'en' | 'fr'
const api = (wiki: Wiki) => `https://${wiki}.wikipedia.org/w/api.php`
const KEY = 'oui-speak-french.photos.v2'
const BATCH = 50

/** Photo URL for each article title, or null when the article has no photo. */
export type PhotoMap = Record<string, string | null>

interface QueryResponse {
  query?: {
    normalized?: { from: string; to: string }[]
    redirects?: { from: string; to: string }[]
    pages?: Record<string, { title: string; missing?: string; thumbnail?: { source: string } }>
  }
}

// Cached per wiki: the same title can be a different article in English and French.
function loadCache(): PhotoMap {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') as PhotoMap } catch { return {} }
}
function saveCache(map: PhotoMap) {
  try { localStorage.setItem(KEY, JSON.stringify(map)) } catch { /* not kept */ }
}

/** Follow the API's title normalisations and redirects back to the titles we asked for. */
export function photosFromResponse(titles: string[], data: QueryResponse): PhotoMap {
  const q = data.query ?? {}
  const step = new Map<string, string>()
  for (const { from, to } of [...(q.normalized ?? []), ...(q.redirects ?? [])]) step.set(from, to)
  const byTitle = new Map<string, string | null>()
  for (const p of Object.values(q.pages ?? {})) byTitle.set(p.title, p.thumbnail?.source ?? null)
  const out: PhotoMap = {}
  for (const t of titles) {
    let cur = t
    for (let i = 0; i < 4 && step.has(cur); i++) cur = step.get(cur)!
    out[t] = byTitle.get(cur) ?? null
  }
  return out
}

/**
 * Look up photos for article titles on English (or French) Wikipedia, using the device cache first.
 * Network failures just mean no photos, and aren't cached.
 */
export async function fetchDishPhotos(titles: string[], fetchFn: typeof fetch = fetch, wiki: Wiki = 'en'): Promise<PhotoMap> {
  const all = loadCache()
  const cache: PhotoMap = {}
  for (const [k, v] of Object.entries(all)) if (k.startsWith(`${wiki}:`)) cache[k.slice(3)] = v
  const wanted = [...new Set(titles)].filter(t => !(t in cache))
  for (let i = 0; i < wanted.length; i += BATCH) {
    const chunk = wanted.slice(i, i + BATCH)
    const params = new URLSearchParams({
      action: 'query', format: 'json', origin: '*', redirects: '1',
      prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '480', titles: chunk.join('|'),
    })
    try {
      const res = await fetchFn(`${api(wiki)}?${params}`)
      if (!res.ok) continue
      Object.assign(cache, photosFromResponse(chunk, (await res.json()) as QueryResponse))
    } catch { /* offline: show the dishes without photos */ }
  }
  for (const [k, v] of Object.entries(cache)) all[`${wiki}:${k}`] = v
  saveCache(all)
  return Object.fromEntries(titles.map(t => [t, cache[t] ?? null]))
}
