import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { findMenuItems, foldMenuText, MENU_ITEMS, type MenuItem } from './data/menu'
import { CameraIcon, PhotoIcon, SpeakerIcon, XIcon } from './Icons'
import { translationCache } from './lib/cache'
import { fetchDishPhotos, imageSearchUrl } from './lib/dishPhotos'
import { readLinesFromImage } from './lib/ocr'
import { canSpeak, speak, stopSpeaking } from './lib/speech'
import { translate, TranslateError } from './lib/translate'

type Photos = Record<string, string | null | undefined>

/** English Wikipedia first; for dishes it has no photo for, try French Wikipedia by the French name. */
async function loadPhotos(items: MenuItem[]): Promise<Photos> {
  const dishes = items.filter(i => i.kind === 'dish' && i.wiki)
  const en = await fetchDishPhotos(dishes.map(d => d.wiki!))
  const missing = dishes.filter(d => !en[d.wiki!])
  const fr = missing.length ? await fetchDishPhotos(missing.map(d => d.fr), fetch, 'fr') : {}
  return Object.fromEntries(dishes.map(d => [d.id, en[d.wiki!] ?? fr[d.fr] ?? null]))
}

const STATUS: Record<string, string> = {
  'preparing image': 'Preparing photo…',
  'loading language traineddata': 'Downloading text reader (first time only)…',
  'recognizing text': 'Reading the menu…',
}

/** Lines that are only prices, numbers or headings like "ENTRÉES" carry nothing to translate. */
const worthTranslating = (line: string) => (line.match(/\p{L}/gu)?.length ?? 0) >= 4

/** Photograph a French menu: see what the dishes are, with pictures and plain-English descriptions. */
export default function MenuScan() {
  const [photoUrl, setPhotoUrl] = useState('')
  const [busy, setBusy] = useState<{ note: string; fraction: number } | null>(null)
  const [lines, setLines] = useState<string[] | null>(null)
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<Photos>({})
  const [translated, setTranslated] = useState<Record<number, string>>({})
  const [error, setError] = useState('')
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const cameraInput = useRef<HTMLInputElement>(null)
  const libraryInput = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }, [photoUrl])
  useEffect(() => () => stopSpeaking(), [])

  // What to explain: guide entries found on the scanned menu, or matching a typed search.
  const found = useMemo(() => {
    const q = query.trim()
    if (q.length >= 2) {
      const fq = foldMenuText(q).trim()
      const byName = MENU_ITEMS.filter(i => foldMenuText(`${i.fr} ${i.en}`).includes(fq))
      return [...new Set([...findMenuItems(q).map(m => m.item), ...byName])]
    }
    return lines ? findMenuItems(lines.join('\n')).map(m => m.item) : []
  }, [lines, query])
  const dishes = found.filter(i => i.kind === 'dish')
  const terms = found.filter(i => i.kind === 'term')

  // Menu lines with nothing from the guide in them: offered for translation on tap.
  const otherLines = useMemo(() => (lines ?? [])
    .map((line, n) => ({ line, n }))
    .filter(({ line }) => worthTranslating(line) && findMenuItems(line).length === 0), [lines])

  useEffect(() => {
    const need = dishes.filter(d => !(d.id in photos))
    if (!need.length) return
    let live = true
    void loadPhotos(need).then(p => { if (live) setPhotos(cur => ({ ...cur, ...p })) })
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when the dish list changes
  }, [dishes.map(d => d.id).join()])

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setQuery('')
    setTranslated({})
    setLines(null)
    setPhotoUrl(URL.createObjectURL(file))
    setBusy({ note: STATUS['preparing image'], fraction: 0 })
    try {
      const read = await readLinesFromImage(file, (status, fraction) =>
        setBusy({ note: STATUS[status] ?? 'Loading text reader…', fraction: status === 'recognizing text' ? fraction : 0 }))
      setLines(read)
      if (!read.length) setError("Couldn't read any text. Get closer, keep the menu flat and well lit, and try again.")
    } catch (err) {
      setError(navigator.onLine === false
        ? 'The text reader needs internet the first time it runs.'
        : (err as Error).message || "Couldn't read that photo.")
    } finally {
      setBusy(null)
    }
  }

  const translateLine = async (n: number, line: string) => {
    setTranslated(t => ({ ...t, [n]: '…' }))
    try {
      const out = await translate(line, { from: 'fr', to: 'en', cache: translationCache })
      setTranslated(t => ({ ...t, [n]: out }))
    } catch (e) {
      setTranslated(t => ({ ...t, [n]: e instanceof TranslateError ? e.message : "Couldn't translate this line." }))
    }
  }

  const say = (item: MenuItem) => {
    if (speakingId === item.id) {
      stopSpeaking()
      setSpeakingId(null)
      return
    }
    setSpeakingId(item.id)
    speak(item.fr, 'fr', () => setSpeakingId(cur => (cur === item.id ? null : cur)), 0.85)
  }

  const scanned = lines !== null && !query.trim()

  return (
    <div className="menu-scan">
      <div className="menu-actions">
        <button className="pill primary-pill" onClick={() => cameraInput.current?.click()} disabled={busy !== null}>
          <CameraIcon /><span>Photograph a menu</span>
        </button>
        <button className="pill" onClick={() => libraryInput.current?.click()} disabled={busy !== null} aria-label="Choose a menu photo">
          <PhotoIcon />
        </button>
        <input ref={cameraInput} type="file" accept="image/*" capture="environment" onChange={onPhoto} hidden />
        <input ref={libraryInput} type="file" accept="image/*" onChange={onPhoto} hidden />
      </div>

      <div className="search">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Or look up a dish: magret, tartare…"
          aria-label="Look up a dish"
          enterKeyHint="search"
        />
        {query && <button className="icon-btn" onClick={() => setQuery('')} aria-label="Clear search"><XIcon /></button>}
      </div>

      {photoUrl && !query.trim() && (
        <div className="photo">
          <img src={photoUrl} alt="Menu photo" />
          {busy && (
            <div className="progress" role="status">
              <span>{busy.note}</span>
              <div className="bar"><div style={{ width: `${Math.round(busy.fraction * 100)}%` }} /></div>
            </div>
          )}
        </div>
      )}

      {error && <p className="error" role="alert">{error}</p>}

      {!photoUrl && !query.trim() && (
        <div className="empty">
          <strong>What's on the menu?</strong>
          <p>Photograph a French menu to see what each dish is, with a picture and a plain-English description.</p>
        </div>
      )}

      {(scanned || query.trim().length >= 2) && !busy && (
        <>
          {dishes.length > 0 && (
            <section className="dishes" aria-label="Dishes">
              <h2>{scanned ? `Dishes on this menu (${dishes.length})` : 'Dishes'}</h2>
              <ul>
                {dishes.map(d => (
                  <li key={d.id} className="dish">
                    {photos[d.id] || photos[d.id] === undefined ? (
                      <div className="dish-photo">
                        {photos[d.id]
                          ? <img src={photos[d.id]!} alt={d.en} loading="lazy" />
                          : <span aria-hidden="true">…</span>}
                      </div>
                    ) : (
                      <a className="dish-photo no-photo" href={imageSearchUrl(d.fr)} target="_blank" rel="noreferrer">
                        <span aria-hidden="true">🔍</span>
                        <span>Search photos</span>
                      </a>
                    )}
                    <div className="dish-text">
                      <div className="dish-head">
                        <span className="dish-fr" lang="fr">{d.fr}</span>
                        {canSpeak() && (
                          <button className={`say ${speakingId === d.id ? 'on' : ''}`} onClick={() => say(d)} aria-label={`Say ${d.fr}`}>
                            <SpeakerIcon />
                          </button>
                        )}
                      </div>
                      <span className="dish-en">{d.en}</span>
                      <p className="dish-desc">{d.desc}</p>
                      <a className="more-photos" href={imageSearchUrl(d.fr)} target="_blank" rel="noreferrer">
                        More photos on Google ↗
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {terms.length > 0 && (
            <section className="terms" aria-label="Menu words">
              <h2>Menu words</h2>
              <dl>
                {terms.map(t => (
                  <div key={t.id}>
                    <dt lang="fr">{t.fr}</dt>
                    <dd>{t.desc}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {scanned && otherLines.length > 0 && (
            <section className="other-lines" aria-label="Other lines on the menu">
              <h2>Everything else on the menu</h2>
              <p className="hint">Tap a line to translate it, or see photos of it on Google.</p>
              <ul>
                {otherLines.map(({ line, n }) => (
                  <li key={n}>
                    <button onClick={() => translateLine(n, line)} disabled={translated[n] !== undefined}>
                      <span lang="fr">{line}</span>
                      {translated[n] && <span className="line-en">{translated[n]}</span>}
                    </button>
                    <a className="line-photos" href={imageSearchUrl(line.replace(/[\d.,]+\s*(€|eur)?\s*$/i, '').trim())} target="_blank" rel="noreferrer" aria-label={`Photos of ${line}`}>
                      Photos ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {found.length === 0 && (
            <p className="hint center">{query.trim()
              ? 'Not in the guide. Try the Translate tab.'
              : 'No dishes from the guide found. The lines below can still be translated.'}</p>
          )}
        </>
      )}

      {dishes.some(d => photos[d.id]) && <p className="foot">Dish photos from Wikipedia. They show the typical dish; the restaurant's own will look different.</p>}
    </div>
  )
}
