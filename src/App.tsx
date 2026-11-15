import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { CameraIcon, CheckIcon, CopyIcon, MicIcon, PhotoIcon, SpeakerIcon, StopIcon, SwapIcon, XIcon } from './Icons'
import { addToHistory, loadHistory, saveHistory, type HistoryItem } from './lib/history'
import { detectLanguage, LANGS, other, type Lang } from './lib/lang'
import { readTextFromImage } from './lib/ocr'
import { canListen, canSpeak, listen, speak, stopSpeaking } from './lib/speech'
import { localStorageCache, translate, TranslateError } from './lib/translate'

const cache = localStorageCache('oui-speak-french.cache.v1')

type Busy = null | 'translating' | { ocr: string; fraction: number }

interface Result {
  src: string
  out: string
  from: Lang
  to: Lang
}

const OCR_STATUS: Record<string, string> = {
  'preparing image': 'Preparing photo…',
  'loading text reader': 'Loading text reader…',
  'loading tesseract core': 'Loading text reader…',
  'initializing tesseract': 'Loading text reader…',
  'loading language traineddata': 'Downloading text reader (first time only)…',
  'initializing api': 'Starting text reader…',
  'recognizing text': 'Reading text…',
}

const FROM_KEY = 'oui-speak-french.from'
const loadFrom = (): Lang => {
  try { return localStorage.getItem(FROM_KEY) === 'fr' ? 'fr' : 'en' } catch { return 'en' }
}
const saveFrom = (l: Lang) => {
  try { localStorage.setItem(FROM_KEY, l) } catch { /* not persisted */ }
}

export default function App() {
  const [from, setFromState] = useState<Lang>(loadFrom)
  const to = other(from)
  const [text, setText] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory)

  const stopListening = useRef<(() => void) | null>(null)
  const abort = useRef<AbortController | null>(null)

  const micSupported = canListen()
  const ttsSupported = canSpeak()

  const setFrom = (l: Lang) => {
    setFromState(l)
    saveFrom(l)
  }

  // Chrome loads voices asynchronously; ask early so the first tap on Listen has the right voice.
  useEffect(() => {
    if (!ttsSupported) return
    const synth = window.speechSynthesis
    synth.getVoices()
    const warm = () => synth.getVoices()
    synth.addEventListener?.('voiceschanged', warm)
    return () => synth.removeEventListener?.('voiceschanged', warm)
  }, [ttsSupported])

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }, [photoUrl])

  const quiet = () => {
    stopSpeaking()
    setSpeaking(false)
  }

  const run = useCallback(async (input: string, src: Lang) => {
    const source = input.trim()
    if (!source) return
    const dst = other(src)
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setError('')
    setBusy('translating')
    stopSpeaking()
    setSpeaking(false)
    try {
      const out = await translate(source, { from: src, to: dst, cache, signal: ctrl.signal })
      if (ctrl.signal.aborted) return
      setResult({ src: source, out, from: src, to: dst })
      setHistory(h => addToHistory(h, { from: src, to: dst, src: source, out, at: Date.now() }))
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setError(e instanceof TranslateError ? e.message : 'Something went wrong translating that. Try again.')
    } finally {
      if (abort.current === ctrl) {
        abort.current = null
        setBusy(null)
      }
    }
  }, [])

  /** Flip the direction. A finished translation becomes the new input, so you can reply to it. */
  const swap = () => {
    stopListening.current?.()
    abort.current?.abort()
    quiet()
    setFrom(to)
    if (result) {
      setText(result.out)
      setResult(null)
    }
    setNote('')
    setPhotoUrl('')
  }

  const toggleMic = () => {
    if (listening) {
      stopListening.current?.()
      return
    }
    setError('')
    setNote('')
    quiet()
    const before = text.trim()
    const lang = from
    let heard = ''
    setListening(true)
    stopListening.current = listen({
      lang,
      onTranscript: t => {
        heard = t
        setText(before ? `${before} ${t}` : t)
      },
      onError: setError,
      onEnd: () => {
        setListening(false)
        stopListening.current = null
        // Translate what was said as soon as dictation finishes.
        if (heard) void run(before ? `${before} ${heard}` : heard, lang)
      },
    })
  }

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same photo be picked again
    if (!file) return
    setError('')
    setNote('')
    quiet()
    setPhotoUrl(URL.createObjectURL(file))
    setBusy({ ocr: OCR_STATUS['preparing image'], fraction: 0 })
    try {
      const found = await readTextFromImage(file, (status, fraction) =>
        setBusy({ ocr: OCR_STATUS[status] ?? 'Reading text…', fraction: status === 'recognizing text' ? fraction : 0 }))
      setBusy(null)
      if (!found) {
        setError("Couldn't find any text in that photo. Try a closer, sharper, well-lit shot.")
        return
      }
      // Signs and menus could be in either language: translate whichever it is into the other.
      const src = detectLanguage(found) ?? from
      if (src !== from) setFrom(src)
      setNote(`Found ${src === 'fr' ? 'French' : 'English'} text`)
      setText(found)
      await run(found, src)
    } catch (err) {
      setBusy(null)
      setError(navigator.onLine === false
        ? 'The text reader needs internet the first time it runs.'
        : (err as Error).message || "Couldn't read that photo.")
    }
  }

  const toggleSpeak = () => {
    if (!result) return
    if (speaking) {
      quiet()
      return
    }
    setSpeaking(true)
    speak(result.out, result.to, () => setSpeaking(false))
  }

  const copy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.out)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError("Couldn't copy. Press and hold the text to copy it instead.")
    }
  }

  const clearAll = () => {
    stopListening.current?.()
    abort.current?.abort()
    quiet()
    setText('')
    setResult(null)
    setError('')
    setNote('')
    setPhotoUrl('')
    setBusy(null)
  }

  const pickHistory = (item: HistoryItem) => {
    quiet()
    setFrom(item.from)
    setText(item.src)
    setResult({ src: item.src, out: item.out, from: item.from, to: item.to })
    setError('')
    setNote('')
    setPhotoUrl('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const ocrBusy = busy !== null && busy !== 'translating'
  const stale = result !== null && (text.trim() !== result.src || from !== result.from)
  const fromName = from === 'en' ? 'English' : 'French'

  return (
    <main className="app">
      <header className="top">
        <h1>Oui Speak French</h1>
        <button className="pair" onClick={swap} aria-label={`Translating ${LANGS[from].name} to ${LANGS[to].name}. Tap to swap.`}>
          <span>{LANGS[from].name}</span>
          <SwapIcon />
          <span>{LANGS[to].name}</span>
        </button>
      </header>

      <section className="card input-card" aria-label={LANGS[from].name}>
        <div className="field">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void run(text, from) }}
            placeholder={micSupported
              ? `Tap the mic and speak ${fromName}, type, or scan a photo…`
              : `Type ${fromName}, dictate with your keyboard mic, or scan a photo…`}
            lang={from}
            rows={4}
            aria-label={`${fromName} text`}
          />
          {text && (
            <button className="icon-btn clear" onClick={clearAll} aria-label="Clear">
              <XIcon />
            </button>
          )}
        </div>

        {photoUrl && (
          <div className="photo">
            <img src={photoUrl} alt="Photo being translated" />
            {ocrBusy && (
              <div className="progress" role="status">
                <span>{busy.ocr}</span>
                <div className="bar"><div style={{ width: `${Math.round(busy.fraction * 100)}%` }} /></div>
              </div>
            )}
          </div>
        )}

        <div className="actions">
          {micSupported && (
            <button className={`mic ${listening ? 'live' : ''}`} onClick={toggleMic} aria-pressed={listening} disabled={ocrBusy}>
              {listening ? <StopIcon /> : <MicIcon />}
              <span>{listening ? 'Stop' : 'Speak'}</span>
            </button>
          )}
          <label className={`tool ${ocrBusy ? 'disabled' : ''}`}>
            <CameraIcon />
            <span>Camera</span>
            <input type="file" accept="image/*" capture="environment" onChange={onPhoto} disabled={ocrBusy || listening} hidden />
          </label>
          <label className={`tool ${ocrBusy ? 'disabled' : ''}`}>
            <PhotoIcon />
            <span>Photos</span>
            <input type="file" accept="image/*" onChange={onPhoto} disabled={ocrBusy || listening} hidden />
          </label>
        </div>

        <button className="primary" onClick={() => { setNote(''); void run(text, from) }}disabled={!text.trim() || busy !== null || listening}>
          {busy === 'translating' ? 'Translating…' : 'Translate'}
        </button>
        {!micSupported && <p className="hint">Tip: this browser can't take voice input directly. Tap the 🎤 key on your keyboard to dictate.</p>}
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      {result && (
        <section className={`card result ${stale ? 'stale' : ''}`} aria-label={LANGS[result.to].name} aria-live="polite">
          {note && <p className="note">{note} → {result.to === 'en' ? 'English' : 'French'}</p>}
          <p className="out" lang={result.to}>{result.out}</p>
          <div className="result-actions">
            {ttsSupported && (
              <button className="pill" onClick={toggleSpeak} aria-pressed={speaking}>
                {speaking ? <StopIcon /> : <SpeakerIcon />}
                <span>{speaking ? 'Stop' : 'Listen'}</span>
              </button>
            )}
            <button className="pill" onClick={copy}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          {stale && <p className="hint">The text changed. Tap Translate to update.</p>}
        </section>
      )}

      {history.length > 0 && (
        <section className="history" aria-label="Recent translations">
          <div className="history-head">
            <h2>Recent</h2>
            <button className="link" onClick={() => { saveHistory([]); setHistory([]) }}>Clear</button>
          </div>
          <ul>
            {history.map(item => (
              <li key={`${item.at}-${item.from}`}>
                <button onClick={() => pickHistory(item)}>
                  <span className="h-src" lang={item.from}>{item.src}</span>
                  <span className="h-out" lang={item.to}>{item.out}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="foot">
        Translations by <a href="https://mymemory.translated.net" target="_blank" rel="noreferrer">MyMemory</a>. Photos are read on your device.
      </footer>
    </main>
  )
}
