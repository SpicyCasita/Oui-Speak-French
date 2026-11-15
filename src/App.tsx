import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { CameraIcon, CheckIcon, CopyIcon, MicIcon, PhotoIcon, SpeakerIcon, StopIcon, XIcon } from './Icons'
import { addToHistory, loadHistory, saveHistory, type HistoryItem } from './lib/history'
import { readTextFromImage } from './lib/ocr'
import { canListen, canSpeak, listen, speakFrench, stopSpeaking } from './lib/speech'
import { localStorageCache, translate, TranslateError } from './lib/translate'

const cache = localStorageCache()

type Busy = null | 'translating' | { ocr: string; fraction: number }

const OCR_STATUS: Record<string, string> = {
  'preparing image': 'Preparing photo…',
  'loading text reader': 'Loading text reader…',
  'loading tesseract core': 'Loading text reader…',
  'initializing tesseract': 'Loading text reader…',
  'loading language traineddata': 'Downloading English reader (first time only)…',
  'initializing api': 'Starting text reader…',
  'recognizing text': 'Reading text…',
}

export default function App() {
  const [en, setEn] = useState('')
  const [fr, setFr] = useState('')
  const [frFor, setFrFor] = useState('')
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory)

  const stopListening = useRef<(() => void) | null>(null)
  const abort = useRef<AbortController | null>(null)

  const micSupported = canListen()
  const ttsSupported = canSpeak()

  // Chrome loads voices asynchronously; ask early so the first tap on Listen has a French voice.
  useEffect(() => {
    if (!ttsSupported) return
    const synth = window.speechSynthesis
    synth.getVoices()
    const warm = () => synth.getVoices()
    synth.addEventListener?.('voiceschanged', warm)
    return () => synth.removeEventListener?.('voiceschanged', warm)
  }, [ttsSupported])

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }, [photoUrl])

  const run = useCallback(async (text: string) => {
    const source = text.trim()
    if (!source) return
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setError('')
    setBusy('translating')
    stopSpeaking()
    setSpeaking(false)
    try {
      const out = await translate(source, { cache, signal: ctrl.signal })
      if (ctrl.signal.aborted) return
      setFr(out)
      setFrFor(source)
      setHistory(h => addToHistory(h, { en: source, fr: out, at: Date.now() }))
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

  const toggleMic = () => {
    if (listening) {
      stopListening.current?.()
      return
    }
    setError('')
    stopSpeaking()
    setSpeaking(false)
    const before = en.trim()
    let heard = ''
    setListening(true)
    stopListening.current = listen({
      onTranscript: text => {
        heard = text
        setEn(before ? `${before} ${text}` : text)
      },
      onError: setError,
      onEnd: () => {
        setListening(false)
        stopListening.current = null
        // Translate what was said as soon as dictation finishes.
        if (heard) void run(before ? `${before} ${heard}` : heard)
      },
    })
  }

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same photo be picked again
    if (!file) return
    setError('')
    setPhotoUrl(URL.createObjectURL(file))
    setBusy({ ocr: OCR_STATUS['preparing image'], fraction: 0 })
    try {
      const text = await readTextFromImage(file, (status, fraction) =>
        setBusy({ ocr: OCR_STATUS[status] ?? 'Reading text…', fraction: status === 'recognizing text' ? fraction : 0 }))
      setBusy(null)
      if (!text) {
        setError("Couldn't find any text in that photo. Try a closer, sharper, well-lit shot.")
        return
      }
      setEn(text)
      await run(text)
    } catch (err) {
      setBusy(null)
      setError(navigator.onLine === false
        ? 'The text reader needs internet the first time it runs.'
        : (err as Error).message || "Couldn't read that photo.")
    }
  }

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    speakFrench(fr, () => setSpeaking(false))
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fr)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setError("Couldn't copy. Press and hold the text to copy it instead.")
    }
  }

  const clearAll = () => {
    stopListening.current?.()
    abort.current?.abort()
    stopSpeaking()
    setSpeaking(false)
    setEn('')
    setFr('')
    setFrFor('')
    setError('')
    setPhotoUrl('')
    setBusy(null)
  }

  const pickHistory = (item: HistoryItem) => {
    stopSpeaking()
    setSpeaking(false)
    setEn(item.en)
    setFr(item.fr)
    setFrFor(item.en)
    setError('')
    setPhotoUrl('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const ocrBusy = busy !== null && busy !== 'translating'
  const stale = fr !== '' && en.trim() !== frFor

  return (
    <main className="app">
      <header className="top">
        <h1>Traduire</h1>
        <p className="pair"><span>English</span><span aria-hidden="true">→</span><span>Français</span></p>
      </header>

      <section className="card input-card" aria-label="English">
        <div className="field">
          <textarea
            value={en}
            onChange={e => setEn(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void run(en) }}
            placeholder={micSupported ? 'Tap the mic and speak, type, or scan a photo…' : 'Type, dictate with your keyboard mic, or scan a photo…'}
            lang="en"
            rows={4}
            aria-label="English text"
          />
          {en && (
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

        <button className="primary" onClick={() => run(en)} disabled={!en.trim() || busy !== null || listening}>
          {busy === 'translating' ? 'Translating…' : 'Translate'}
        </button>
        {!micSupported && <p className="hint">Tip: this browser can't take voice input directly. Tap the 🎤 key on your keyboard to dictate.</p>}
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      {fr && (
        <section className={`card result ${stale ? 'stale' : ''}`} aria-label="French" aria-live="polite">
          <p className="fr" lang="fr">{fr}</p>
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
          {stale && <p className="hint">The English changed. Tap Translate to update.</p>}
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
              <li key={item.at}>
                <button onClick={() => pickHistory(item)}>
                  <span className="h-en" lang="en">{item.en}</span>
                  <span className="h-fr" lang="fr">{item.fr}</span>
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
