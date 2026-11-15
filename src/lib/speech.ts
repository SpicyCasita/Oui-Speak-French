/** Thin wrappers over the Web Speech API: English dictation in, French speech out. */

// SpeechRecognition isn't in TypeScript's DOM lib yet; declare the parts we use.
interface RecognitionAlternative { transcript: string }
interface RecognitionResult { isFinal: boolean; 0: RecognitionAlternative; length: number }
interface RecognitionEvent extends Event { resultIndex: number; results: ArrayLike<RecognitionResult> }
interface RecognitionErrorEvent extends Event { error: string }
interface Recognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: ((e: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}
type RecognitionCtor = new () => Recognition

function recognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export const canListen = (): boolean => recognitionCtor() !== undefined
export const canSpeak = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings, or use the keyboard mic.',
  'service-not-allowed': "Speech recognition isn't available here. Use the mic key on your keyboard instead.",
  'audio-capture': 'No microphone was found.',
  network: 'Speech recognition needs an internet connection.',
}

export interface ListenHandlers {
  /** Full transcript so far: the finished words plus the current guess. */
  onTranscript(text: string, isFinal: boolean): void
  onError(message: string): void
  onEnd(): void
}

/** Start English dictation. Returns a function that stops listening (the final result still arrives). */
export function listen({ onTranscript, onError, onEnd }: ListenHandlers): () => void {
  const Ctor = recognitionCtor()
  if (!Ctor) {
    onError("This browser can't take dictation. Use the mic key on your keyboard instead.")
    onEnd()
    return () => {}
  }
  const rec = new Ctor()
  rec.lang = 'en-US'
  rec.continuous = true
  rec.interimResults = true

  let finalText = ''
  rec.onresult = e => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      if (r.isFinal) finalText += r[0].transcript
      else interim += r[0].transcript
    }
    onTranscript(joinSpaces(finalText + interim), interim === '')
  }
  rec.onerror = e => {
    // "no-speech" and "aborted" just mean nothing was said, or we stopped it ourselves.
    if (e.error !== 'no-speech' && e.error !== 'aborted') onError(ERROR_MESSAGES[e.error] ?? `Speech recognition error: ${e.error}`)
  }
  rec.onend = onEnd
  try {
    rec.start()
  } catch {
    onError("Couldn't start the microphone.")
    onEnd()
  }
  return () => rec.stop()
}

const joinSpaces = (s: string) => s.replace(/\s+/g, ' ').trim()

/** The best French voice: prefer fr-FR, then any French, then local voices over network ones. */
export function pickFrenchVoice(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const fr = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith('fr'))
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang.toLowerCase().replace('_', '-') === 'fr-fr' ? 2 : 0) + (v.localService ? 1 : 0) + (v.default ? 0.5 : 0)
  return fr.sort((a, b) => score(b) - score(a))[0]
}

/** Read text aloud in French, replacing anything already playing. Calls onEnd when it finishes or fails. */
export function speakFrench(text: string, onEnd?: () => void): void {
  if (!canSpeak() || !text.trim()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-FR'
  u.rate = 0.95
  const voice = pickFrenchVoice(synth.getVoices())
  if (voice) u.voice = voice
  u.onend = () => onEnd?.()
  u.onerror = () => onEnd?.()
  synth.speak(u)
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel()
}
