/**
 * Read English text from a photo with Tesseract.js, all on the device.
 * The library (and ~10 MB of English language data on first use) loads only when a photo is scanned.
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

export type OcrProgress = (status: string, fraction: number) => void

let workerPromise: Promise<Worker> | null = null
let progressListener: OcrProgress | undefined

function getWorker(): Promise<Worker> {
  workerPromise ??= import('tesseract.js').then(({ createWorker }) =>
    createWorker('eng', 1, {
      logger: m => progressListener?.(m.status, typeof m.progress === 'number' ? m.progress : 0),
    }),
  ).catch(e => {
    workerPromise = null
    throw e
  })
  return workerPromise
}

/** OCR a photo and return cleaned English text ('' if none was found). */
export async function readTextFromImage(file: Blob, onProgress?: OcrProgress): Promise<string> {
  progressListener = onProgress
  try {
    onProgress?.('preparing image', 0)
    const canvas = await prepareImage(file)
    onProgress?.('loading text reader', 0)
    const worker = await getWorker()
    const { data } = await worker.recognize(canvas)
    return cleanOcrText(data.text)
  } finally {
    progressListener = undefined
  }
}
