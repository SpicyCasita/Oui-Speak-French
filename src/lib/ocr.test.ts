import { describe, expect, it } from 'vitest'
import { cleanOcrText, fitWithin } from './ocr'

describe('fitWithin', () => {
  it('shrinks the longest side to the limit, keeping aspect ratio', () => {
    expect(fitWithin(4032, 3024, 2000)).toEqual({ width: 2000, height: 1500 })
    expect(fitWithin(3024, 4032, 2000)).toEqual({ width: 1500, height: 2000 })
  })
  it('never enlarges', () => {
    expect(fitWithin(800, 600, 2000)).toEqual({ width: 800, height: 600 })
  })
})

describe('cleanOcrText', () => {
  it('merges lines of a paragraph and keeps paragraph breaks', () => {
    expect(cleanOcrText('Please keep\nthe door closed\n\nNo smoking\n')).toBe('Please keep the door closed\nNo smoking')
  })
  it('rejoins words hyphenated across lines', () => {
    expect(cleanOcrText('emer-\ngency exit')).toBe('emergency exit')
  })
  it('drops lines with no letters or digits (OCR noise)', () => {
    expect(cleanOcrText('—\nOpen daily\n~ ~\n9 to 5')).toBe('Open daily 9 to 5')
  })
  it('returns empty for a photo with no text', () => {
    expect(cleanOcrText('  \n | \n')).toBe('')
  })
})
