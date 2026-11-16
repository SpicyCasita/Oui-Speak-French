import { describe, expect, it } from 'vitest'
import { screenBoxToVideo, shouldTranslate, similarity } from './live'

describe('screenBoxToVideo', () => {
  it('maps a box on a cover-scaled portrait screen to landscape video pixels', () => {
    // 1920x1080 video filling a 390x844 phone screen: scaled by 844/1080, left/right cropped.
    const scale = 844 / 1080
    const box = { x: 20, y: 200, width: 350, height: 200 }
    const r = screenBoxToVideo({ x: 0, y: 0, width: 390, height: 844 }, { width: 1920, height: 1080 }, box)
    const offsetX = (390 - 1920 * scale) / 2
    expect(r.x).toBe(Math.round((20 - offsetX) / scale))
    expect(r.y).toBe(Math.round(200 / scale))
    expect(r.width).toBe(Math.round(350 / scale))
    expect(r.height).toBe(Math.round(200 / scale))
  })

  it('accounts for where the video element sits on the page', () => {
    const r = screenBoxToVideo({ x: 10, y: 50, width: 100, height: 100 }, { width: 100, height: 100 }, { x: 20, y: 60, width: 50, height: 30 })
    expect(r).toEqual({ x: 10, y: 10, width: 50, height: 30 })
  })

  it('clamps to the video frame', () => {
    const r = screenBoxToVideo({ x: 0, y: 0, width: 100, height: 100 }, { width: 100, height: 100 }, { x: -20, y: 90, width: 200, height: 50 })
    expect(r).toEqual({ x: 0, y: 90, width: 100, height: 10 })
  })
})

describe('similarity', () => {
  it('ignores case, accents and punctuation', () => {
    expect(similarity('Sortie de secours', 'SORTIE DE SECOURS!')).toBe(1)
    expect(similarity('siège', 'siege')).toBe(1)
  })
  it('scores partial overlap', () => {
    expect(similarity('ne pas fumer', 'ne pas toucher')).toBeCloseTo(2 / 4)
    expect(similarity('entrée', 'sortie')).toBe(0)
  })
})

describe('shouldTranslate', () => {
  const sign = 'Et rangez votre petit sac sous le siège devant vous'
  it('waits until the same text is read twice in a row', () => {
    expect(shouldTranslate(sign, '', '')).toBe(false)
    expect(shouldTranslate(sign, sign, '')).toBe(true)
  })
  it('tolerates a slightly different read between frames', () => {
    expect(shouldTranslate(sign, 'Et rangez votre petit sac sous le siege devant', '')).toBe(true)
  })
  it("doesn't re-translate what's already shown", () => {
    expect(shouldTranslate(sign, sign, sign)).toBe(false)
    expect(shouldTranslate(sign, sign, 'Et rangez votre petit sac sous le siège')).toBe(false)
  })
  it('translates new text once it is steady', () => {
    expect(shouldTranslate('Sortie de secours', 'Sortie de secours', sign)).toBe(true)
  })
  it('ignores scraps', () => {
    expect(shouldTranslate('ok', 'ok', '')).toBe(false)
  })
})
