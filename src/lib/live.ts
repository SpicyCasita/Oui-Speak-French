/**
 * Helpers for live camera translation: which part of the video frame to read, and when a
 * newly read text is worth sending for translation (the free API has a daily quota, and
 * OCR of a shaky hand-held frame changes slightly every time).
 */

/** Whether this browser can stream the camera into the page (needs HTTPS). */
export const canStreamCamera = () => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

export interface Rect { x: number; y: number; width: number; height: number }

/**
 * Map an on-screen box to video pixels, for a <video> shown with `object-fit: cover`
 * (scaled to fill its element, overflow cropped equally on both sides).
 */
export function screenBoxToVideo(element: Rect, video: { width: number; height: number }, box: Rect): Rect {
  const scale = Math.max(element.width / video.width, element.height / video.height)
  const offsetX = (element.width - video.width * scale) / 2
  const offsetY = (element.height - video.height * scale) / 2
  const toVideoX = (x: number) => (x - element.x - offsetX) / scale
  const toVideoY = (y: number) => (y - element.y - offsetY) / scale
  const x0 = Math.max(0, toVideoX(box.x))
  const y0 = Math.max(0, toVideoY(box.y))
  const x1 = Math.min(video.width, toVideoX(box.x + box.width))
  const y1 = Math.min(video.height, toVideoY(box.y + box.height))
  return { x: Math.round(x0), y: Math.round(y0), width: Math.max(0, Math.round(x1 - x0)), height: Math.max(0, Math.round(y1 - y0)) }
}

const words = (s: string) => new Set(s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9]+/g) ?? [])

/** How alike two texts are, 0 to 1, by the overlap of their words (order and punctuation ignored). */
export function similarity(a: string, b: string): number {
  const A = words(a)
  const B = words(b)
  if (A.size === 0 && B.size === 0) return 1
  let both = 0
  for (const w of A) if (B.has(w)) both += 1
  return both / (A.size + B.size - both)
}

/** Two reads this alike count as the same text held steady in front of the camera. */
export const STEADY = 0.7
/** A steady text this alike to what's already translated isn't translated again. */
export const SAME_AS_SHOWN = 0.8

/**
 * Translate `current` only when it has real words, it matches the previous read (so the
 * camera is steady on it, not mid-sweep), and it's different from what's already shown.
 */
export function shouldTranslate(current: string, previous: string, shown: string): boolean {
  if ((current.match(/\p{L}/gu)?.length ?? 0) < 3) return false
  if (similarity(current, previous) < STEADY) return false
  return !shown || similarity(current, shown) < SAME_AS_SHOWN
}
