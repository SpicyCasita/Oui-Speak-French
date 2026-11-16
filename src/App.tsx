import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react'
import { CameraIcon, CheckIcon, CopyIcon, MicIcon, PhotoIcon, SendIcon, SpeakerIcon, StopIcon, XIcon } from './Icons'
import { addToHistory, loadHistory, saveHistory, type HistoryItem } from './lib/history'
import { detectLanguage, LANGS, other, type Lang } from './lib/lang'
import { readTextFromImage } from './lib/ocr'
import LiveCamera, { type LiveResult } from './LiveCamera'
import { canStreamCamera } from './lib/live'
import Phrasebook from './Phrasebook'
import { canListen, canSpeak, listen, speak, stopSpeaking } from './lib/speech'
import { translate, TranslateError } from './lib/translate'
import { translationCache as cache } from './lib/cache'

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

type Tab = 'translate' | 'phrases'
const TAB_KEY = 'oui-speak-french.tab'
const loadTab = (): Tab => {
  try { return localStorage.getItem(TAB_KEY) === 'phrases' ? 'phrases' : 'translate' } catch { return 'translate' }
}

const NAME: Record<Lang, string> = { en: 'English', fr: 'French' }

/** The last source language, used when text is too short to tell (e.g. "OK", a place name). */
const LAST_KEY = 'oui-speak-french.from'
const loadLast = (): Lang => {
  try { return localStorage.getItem(LAST_KEY) === 'fr' ? 'fr' : 'en' } catch { return 'en' }
}
const saveLast = (l: Lang) => {
  try { localStorage.setItem(LAST_KEY, l) } catch { /* not persisted */ }
}

export default function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState('')
  const [listening, setListening] = useState<Lang | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory)
  const [tab, setTab] = useState<Tab>(loadTab)
  const [live, setLive] = useState(false)
  const captureInput = useRef<HTMLInputElement>(null)

  const stopListening = useRef<(() => void) | null>(null)
  const abort = useRef<AbortController | null>(null)
  const lastFrom = useRef<Lang>(loadLast())
  const textarea = useRef<HTMLTextAreaElement>(null)
  const stage = useRef<HTMLElement>(null)

  const micSupported = canListen()
  const ttsSupported = canSpeak()

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

  // Grow the input with its text, up to the CSS max-height.
  useLayoutEffect(() => {
    const el = textarea.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [text])

  // Each new translation starts at the top of the stage.
  useEffect(() => { stage.current?.scrollTo({ top: 0 }) }, [result])

  const switchTab = (t: Tab) => {
    if (t === tab) return
    stopListening.current?.()
    stopSpeaking()
    setSpeaking(false)
    setTab(t)
    try { localStorage.setItem(TAB_KEY, t) } catch { /* not persisted */ }
    stage.current?.scrollTo({ top: 0 })
  }

  const quiet = () => {
    stopSpeaking()
    setSpeaking(false)
  }

  /** Translate into the opposite language. `src` is known for speech; otherwise it's detected. */
  const run = useCallback(async (input: string, src?: Lang) => {
    const source = input.trim()
    if (!source) return
    const from = src ?? detectLanguage(source) ?? lastFrom.current
    const to = other(from)
    lastFrom.current = from
    saveLast(from)
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setError('')
    setBusy('translating')
    stopSpeaking()
    setSpeaking(false)
    try {
      const out = await translate(source, { from, to, cache, signal: ctrl.signal })
      if (ctrl.signal.aborted) return
      setResult({ src: source, out, from, to })
      setHistory(h => addToHistory(h, { from, to, src: source, out, at: Date.now() }))
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

  const toggleMic = (lang: Lang) => {
    if (listening) {
      stopListening.current?.()
      return
    }
    setError('')
    quiet()
    setPhotoUrl('')
    let heard = ''
    setText('')
    setListening(lang)
    stopListening.current = listen({
      lang,
      onTranscript: t => {
        heard = t
        setText(t)
      },
      onError: setError,
      onEnd: () => {
        setListening(null)
        stopListening.current = null
        // Translate what was said as soon as dictation finishes.
        if (heard) void run(heard, lang)
      },
    })
  }

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same photo be picked again
    if (!file) return
    setError('')
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
      setText(found)
      await run(found)
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
    setPhotoUrl('')
    setBusy(null)
  }

  /** Camera button: live translation where the phone can stream video, otherwise a still photo. */
  const openCamera = () => {
    if (ocrBusy || listening) return
    if (canStreamCamera()) {
      quiet()
      setError('')
      setLive(true)
    } else captureInput.current?.click()
  }

  const saveLive = (r: LiveResult) => {
    setLive(false)
    lastFrom.current = r.from
    saveLast(r.from)
    setText(r.src)
    setResult(r)
    setPhotoUrl('')
    setError('')
    setHistory(h => addToHistory(h, { ...r, at: Date.now() }))
  }

  const pickHistory = (item: HistoryItem) => {
    quiet()
    setText(item.src)
    setResult({ src: item.src, out: item.out, from: item.from, to: item.to })
    setError('')
    setPhotoUrl('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const ocrBusy = busy !== null && busy !== 'translating'
  const translating = busy === 'translating'
  const stale = result !== null && !translating && listening === null && text.trim() !== '' && text.trim() !== result.src

  const micButton = (lang: Lang) => {
    const live = listening === lang
    return (
      <button
        className={`mic ${live ? 'live' : ''}`}
        onClick={() => toggleMic(lang)}
        aria-pressed={live}
        aria-label={live ? 'Stop listening' : `Speak ${NAME[lang]}`}
        disabled={ocrBusy || (listening !== null && !live)}
      >
        {live ? <StopIcon /> : <MicIcon />}
        <span>{live ? 'Stop' : LANGS[lang].name}</span>
      </button>
    )
  }

  return (
    <div className="app">
      <header className="top">
        <h1>Oui Speak French</h1>
        <nav className="tabs" aria-label="Sections">
          <button className={tab === 'translate' ? 'on' : ''} aria-current={tab === 'translate' ? 'page' : undefined} onClick={() => switchTab('translate')}>Translate</button>
          <button className={tab === 'phrases' ? 'on' : ''} aria-current={tab === 'phrases' ? 'page' : undefined} onClick={() => switchTab('phrases')}>Phrases</button>
        </nav>
      </header>

      <main className="stage" ref={stage}>
        {tab === 'phrases' ? <Phrasebook /> : <>
        {error && <p className="error" role="alert">{error}</p>}

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

        {listening ? (
          <section className="result" aria-live="polite">
            <p className="note">Listening · {NAME[listening]}</p>
            <p className="out" lang={listening}>{text || '…'}</p>
          </section>
        ) : result ? (
          <section className={`result ${stale ? 'stale' : ''} ${translating ? 'pending' : ''}`} aria-label={NAME[result.to]} aria-live="polite">
            <p className="note">{NAME[result.from]} → {NAME[result.to]}</p>
            <p className="src" lang={result.from}>{result.src}</p>
            <p className="out" lang={result.to}>{result.out}</p>
            <div className="result-actions">
              {ttsSupported && (
                <button className="pill primary-pill" onClick={toggleSpeak} aria-pressed={speaking}>
                  {speaking ? <StopIcon /> : <SpeakerIcon />}
                  <span>{speaking ? 'Stop' : 'Listen'}</span>
                </button>
              )}
              <button className="pill" onClick={copy}>
                {copied ? <CheckIcon /> : <CopyIcon />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            {stale
              ? <p className="hint">The text changed. Tap the arrow to translate it.</p>
              : !translating && (
                <button className="link flip" onClick={() => run(result.src, result.to)}>
                  Actually {NAME[result.to]}? Translate to {NAME[result.from]}
                </button>
              )}
          </section>
        ) : translating ? (
          <section className="result pending" aria-live="polite">
            <p className="note">Translating…</p>
            <p className="out">{text}</p>
          </section>
        ) : !ocrBusy && (
          <div className="empty">
            <strong>Bonjour!</strong>
            <p>Speak, type, or snap a photo in English or French. It translates to the other one.</p>
          </div>
        )}

        {!listening && history.length > 0 && (
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

        </>}
        <p className="foot">
          Translations by <a href="https://mymemory.translated.net" target="_blank" rel="noreferrer">MyMemory</a>. Photos are read on your device.
        </p>
      </main>

      {tab === 'translate' && <footer className="dock">
        {!micSupported && <p className="hint">Tip: tap the 🎤 key on your keyboard to dictate.</p>}
        <div className="composer">
          <textarea
            ref={textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              // Enter translates; Shift+Enter adds a line.
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                if (text.trim() && busy === null && listening === null) void run(text)
              }
            }}
            placeholder="Type English or French…"
            lang={listening ?? undefined}
            rows={1}
            enterKeyHint="go"
            aria-label="Text to translate"
          />
          {text && (
            <button className="icon-btn" onClick={clearAll} aria-label="Clear">
              <XIcon />
            </button>
          )}
          <button className="icon-btn send" onClick={() => run(text)} disabled={!text.trim() || busy !== null || listening !== null} aria-label="Translate">
            <SendIcon />
          </button>
        </div>
        <div className="actions">
          {micSupported && micButton('en')}
          {micSupported && micButton('fr')}
          <button className="tool" onClick={openCamera} disabled={ocrBusy || listening !== null} aria-label="Live camera translation">
            <CameraIcon />
          </button>
          <input ref={captureInput} type="file" accept="image/*" capture="environment" onChange={onPhoto} hidden />
          <label className={`tool ${ocrBusy || listening ? 'disabled' : ''}`} aria-label="Choose a photo">
            <PhotoIcon />
            <input type="file" accept="image/*" onChange={onPhoto} disabled={ocrBusy || listening !== null} hidden />
          </label>
        </div>
      </footer>}

      {live && (
        <LiveCamera
          onClose={() => setLive(false)}
          onSave={saveLive}
          onFallback={() => { setLive(false); captureInput.current?.click() }}
        />
      )}
    </div>
  )
}
