/**
 * Read French and English text from a photo with Tesseract.js, all on the device.
 * The library and its language data (a few MB, cached after the first scan) load only when a photo is scanned.
 */
import type { Worker } from 'tesseract.js'

/** Longest side, in pixels, we hand to OCR. Phone photos are 4000px+, which is slow and no more accurate. */
export const MAX_SIDE = 2000

/** Scale (w, h) to fit inside max×max, never enlarging. */
export function fitWithin(w: number, h: number, max = MAX_SIDE): { width: number; height: number } {
  const s = Math.min(1, max / Math.max(w, h))
  return { width: Math.round(w * s), height: Math.round(h * s) }
}

/** Decode the image (respecting EXIF rotation) and shrink it onto a canvas. */
export async function prepareImage(file: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => loadViaImg(file))
  const { width, height } = fitWithin(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, width, height)
  if ('close' in bitmap) bitmap.close()
  return canvas
}

function loadViaImg(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file isn't an image this browser can open.")) }
    img.src = url
  })
}

/**
 * Turn raw OCR lines into text that translates well: rejoin words hyphenated across lines,
 * merge lines of the same paragraph, keep blank-line paragraph breaks, drop stray symbols.
 */
export function cleanOcrText(raw: string): string {
  return raw
    .replace(/\r/g, '')
    .replace(/(\w)-\n(\w)/g, '$1$2')
    .split(/\n\s*\n/)
    .map(p => p
      .split('\n')
      .map(l => l.trim())
      .filter(l => /[A-Za-z0-9]/.test(l))
      .join(' ')
      .replace(/[ \t]+/g, ' ')
      .trim())
    .filter(Boolean)
    .join('\n')
}

/** Words the reader is less sure of than this (0-100) are treated as noise. */
export const MIN_WORD_CONFIDENCE = 55
/** Lines the reader is less sure of than this are dropped entirely. */
export const MIN_LINE_CONFIDENCE = 50

interface OcrWord { text: string; confidence: number }
interface OcrLine { confidence: number; words: OcrWord[] }
interface OcrParagraph { lines: OcrLine[] }

/**
 * Keep only text that looks real. Pictures, logos and textures in a photo come back as short,
 * low-confidence scraps like "{ P u" or "| (" which would otherwise be translated as gibberish.
 * Returns raw text: lines separated by \n, paragraphs by a blank line.
 */
export function keepConfidentText(paragraphs: OcrParagraph[]): string {
  return paragraphs
    .map(p => p.lines
      .filter(l => l.confidence >= MIN_LINE_CONFIDENCE)
      .map(l => l.words.filter(w => w.confidence >= MIN_WORD_CONFIDENCE && /[\p{L}\p{N}]/u.test(w.text)))
      // A real line has a word of 3+ letters, or a short one read with high confidence ("OK", "Wi").
      .filter(words => words.some(w => {
        const letters = w.text.match(/\p{L}/gu)?.length ?? 0
        return letters >= 3 || (letters === 2 && w.confidence >= 80)
      }))
      .map(words => words.map(w => w.text.trim()).join(' '))
      .join('\n'))
    .filter(Boolean)
    .join('\n\n')
}

export type OcrProgress = (status: string, fraction: number) => void

let workerPromise: Promise<Worker> | null = null
let progressListener: OcrProgress | undefined

function getWorker(): Promise<Worker> {
  workerPromise ??= import('tesseract.js').then(({ createWorker }) =>
    createWorker(['fra', 'eng'], 1, {
      logger: m => progressListener?.(m.status, typeof m.progress === 'number' ? m.progress : 0),
    }),
  ).catch(e => {
    workerPromise = null
    throw e
  })
  return workerPromise
}

/** Read text from an already-prepared canvas (a photo or a camera frame). Returns cleaned text, '' if none. */
export async function readTextFromCanvas(canvas: HTMLCanvasElement, onProgress?: OcrProgress): Promise<string> {
  progressListener = onProgress
  try {
    onProgress?.('loading text reader', 0)
    const worker = await getWorker()
    const { data } = await worker.recognize(canvas, {}, { blocks: true, text: true })
    const raw = data.blocks ? keepConfidentText(data.blocks.flatMap(b => b.paragraphs)) : data.text
    return cleanOcrText(raw)
  } finally {
    progressListener = undefined
  }
}

/** OCR a photo and return cleaned text ('' if none was found). */
export async function readTextFromImage(file: Blob, onProgress?: OcrProgress): Promise<string> {
  onProgress?.('preparing image', 0)
  const canvas = await prepareImage(file)
  return readTextFromCanvas(canvas, onProgress)
}
