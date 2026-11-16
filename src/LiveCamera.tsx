import { useEffect, useRef, useState } from 'react'
import { CheckIcon, PauseIcon, PlayIcon, SpeakerIcon, StopIcon, XIcon } from './Icons'
import { translationCache } from './lib/cache'
import { detectLanguage, other, type Lang } from './lib/lang'
import { screenBoxToVideo, shouldTranslate } from './lib/live'
import { readTextFromCanvas } from './lib/ocr'
import { canSpeak, speak, stopSpeaking } from './lib/speech'
import { translate, TranslateError } from './lib/translate'

export interface LiveResult {
  src: string
  out: string
  from: Lang
  to: Lang
}

interface Props {
  onClose(): void
  /** Keep this translation: show it on the main screen and add it to history. */
  onSave(result: LiveResult): void
  /** Camera streaming isn't available: take a still photo instead. */
  onFallback(): void
}

type Status = 'starting' | 'loading' | 'searching' | 'steadying' | 'translating' | 'showing' | 'denied' | 'failed'

const NAME: Record<Lang, string> = { en: 'English', fr: 'French' }
/** Widest frame crop handed to OCR; wider is slower without reading better. */
const MAX_OCR_WIDTH = 1600
/** Pause between reads, so the phone stays responsive and cool. */
const READ_GAP_MS = 400

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

/** Point the camera at text and see it translated, without taking a photo. */
export default function LiveCamera({ onClose, onSave, onFallback }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>('starting')
  const [loadingNote, setLoadingNote] = useState('')
  const [seen, setSeen] = useState('')
  const [result, setResult] = useState<LiveResult | null>(null)
  const [error, setError] = useState('')
  const [paused, setPaused] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const pausedRef = useRef(false)
  const alive = useRef(true)
  const previous = useRef('')
  const shown = useRef('')
  const quotaHit = useRef(false)
  const translating = useRef(false)
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    alive.current = true
    let stream: MediaStream | null = null
    const canvas = document.createElement('canvas')

    const grab = (): HTMLCanvasElement | null => {
      const v = video.current
      const box = frame.current
      if (!v || !box || v.readyState < 2 || !v.videoWidth) return null
      const r = screenBoxToVideo(v.getBoundingClientRect(), { width: v.videoWidth, height: v.videoHeight }, box.getBoundingClientRect())
      if (r.width < 40 || r.height < 20) return null
      const scale = Math.min(1, MAX_OCR_WIDTH / r.width)
      canvas.width = Math.round(r.width * scale)
      canvas.height = Math.round(r.height * scale)
      canvas.getContext('2d')!.drawImage(v, r.x, r.y, r.width, r.height, 0, 0, canvas.width, canvas.height)
      return canvas
    }

    const translateNow = async (text: string) => {
      abort.current?.abort()
      const ctrl = new AbortController()
      abort.current = ctrl
      // Pointed at a sign, the text is most likely French; detection decides when it can.
      const from = detectLanguage(text) ?? 'fr'
      const to = other(from)
      translating.current = true
      setStatus('translating')
      try {
        const out = await translate(text, { from, to, cache: translationCache, signal: ctrl.signal })
        if (ctrl.signal.aborted || !alive.current) return
        setResult({ src: text, out, from, to })
        setError('')
        setStatus('showing')
      } catch (e) {
        if ((e as Error).name === 'AbortError' || !alive.current) return
        shown.current = '' // let the same text be tried again
        if (e instanceof TranslateError && e.kind === 'quota') quotaHit.current = true
        setError(e instanceof TranslateError ? e.message : "Couldn't translate that. Still trying…")
        setStatus('showing')
      } finally {
        if (abort.current === ctrl) translating.current = false
      }
    }

    const loop = async () => {
      let first = true
      while (alive.current) {
        const c = !pausedRef.current && document.visibilityState === 'visible' ? grab() : null
        if (c) {
          try {
            const text = await readTextFromCanvas(c, first
              ? (s, f) => { if (s.includes('traineddata') || s.includes('core') || s.includes('tesseract')) setLoadingNote(f > 0 && f < 1 ? `${Math.round(f * 100)}%` : '') }
              : undefined)
            first = false
            if (!alive.current) break
            if (pausedRef.current) continue
            setSeen(text)
            if (!quotaHit.current && shouldTranslate(text, previous.current, shown.current)) {
              shown.current = text
              void translateNow(text)
            } else if (!translating.current) {
              // New text that isn't steady yet, the text already shown, or nothing in the box.
              setStatus(!text ? 'searching' : !quotaHit.current && shouldTranslate(text, text, shown.current) ? 'steadying' : 'showing')
            }
            previous.current = text
          } catch {
            if (!alive.current) break
            setError(navigator.onLine === false
              ? 'The text reader needs internet the first time it runs.'
              : "The text reader couldn't start. Try closing and reopening the camera.")
            await sleep(2000)
          }
        }
        await sleep(READ_GAP_MS)
      }
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(async s => {
        stream = s
        if (!alive.current) return s.getTracks().forEach(t => t.stop())
        const v = video.current!
        v.srcObject = s
        await v.play().catch(() => {})
        setStatus('loading')
        void loop()
      })
      .catch((e: Error) => {
        if (!alive.current) return
        setStatus(e.name === 'NotAllowedError' || e.name === 'SecurityError' ? 'denied' : 'failed')
      })

    return () => {
      alive.current = false
      abort.current?.abort()
      stream?.getTracks().forEach(t => t.stop())
      stopSpeaking()
    }
  }, [])

  const togglePause = () => {
    const next = !paused
    pausedRef.current = next
    setPaused(next)
    const v = video.current
    if (next) v?.pause()
    else {
      void v?.play()
      previous.current = ''
    }
  }

  const toggleSpeak = () => {
    if (!result) return
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    speak(result.out, result.to, () => setSpeaking(false))
  }

  const statusText = paused ? 'Paused'
    : status === 'starting' ? 'Starting camera…'
    : status === 'loading' ? `Loading text reader${loadingNote ? ` ${loadingNote}` : ''}… (first time only)`
    : status === 'searching' ? 'Point the box at some text'
    : status === 'steadying' ? 'Hold steady…'
    : status === 'translating' ? 'Translating…'
    : 'Live'

  if (status === 'denied' || status === 'failed') {
    return (
      <div className="live live-blocked" role="dialog" aria-label="Live camera">
        <button className="live-close" onClick={onClose} aria-label="Close camera"><XIcon /></button>
        <div className="live-message">
          <strong>{status === 'denied' ? 'Camera access is off' : "Couldn't start the camera"}</strong>
          <p>{status === 'denied'
            ? 'To translate live, allow camera access for this site in your browser settings (on iPhone: Settings → Apps → Safari → Camera).'
            : 'Check that this site is allowed to use the camera and that no other app is using it.'}</p>
          <button className="pill primary-pill" onClick={onFallback}>Take a photo instead</button>
        </div>
      </div>
    )
  }

  return (
    <div className="live" role="dialog" aria-label="Live camera translation">
      <video ref={video} className="live-video" playsInline muted autoPlay />
      <div className="live-frame" ref={frame} aria-hidden="true" />

      <div className="live-top">
        <button className="live-close" onClick={onClose} aria-label="Close camera"><XIcon /></button>
        <p className="live-status" role="status">{statusText}</p>
      </div>

      <section className="live-panel" aria-live="polite">
        {error && <p className="live-error">{error}</p>}
        {result ? (
          <>
            <p className="note">{NAME[result.from]} → {NAME[result.to]}</p>
            <p className="live-out" lang={result.to}>{result.out}</p>
            <p className="live-src" lang={result.from}>{result.src}</p>
          </>
        ) : seen ? (
          <p className="live-src">{seen}</p>
        ) : (
          <p className="live-hint">Fit a sign, menu or label inside the box. The translation appears here.</p>
        )}
        <div className="live-actions">
          <button className="pill" onClick={togglePause} aria-pressed={paused}>
            {paused ? <PlayIcon /> : <PauseIcon />}<span>{paused ? 'Resume' : 'Pause'}</span>
          </button>
          {result && canSpeak() && (
            <button className="pill" onClick={toggleSpeak} aria-pressed={speaking}>
              {speaking ? <StopIcon /> : <SpeakerIcon />}<span>{speaking ? 'Stop' : 'Listen'}</span>
            </button>
          )}
          {result && (
            <button className="pill primary-pill" onClick={() => onSave(result)}>
              <CheckIcon /><span>Save</span>
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
