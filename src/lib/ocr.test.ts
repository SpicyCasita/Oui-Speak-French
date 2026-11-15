import { describe, expect, it } from 'vitest'
import { cleanOcrText, fitWithin, keepConfidentText } from './ocr'

// Lines as Tesseract (fra+eng) read them from a real airline sign photo: seat graphics above French text.
const line = (confidence: number, words: [string, number][]) =>
  ({ confidence, words: words.map(([text, c]) => ({ text, confidence: c })) })
const SIGN = [{
  lines: [
    line(58, [['{', 45], ['P', 68], ['u', 60]]),
    line(69, [['|', 90], ['(', 48]]),
    line(34, [['a', 29], ['>', 39]]),
    line(57, [['ih', 57]]),
    line(43, [['=', 43]]),
    line(93, [['Et', 92], ['rangez', 92], ['votre', 95], ['petit', 96], ['sac', 96], ['>', 87]]),
    line(94, [['sous', 96], ['le', 96], ['siège', 95], ['devant', 93], ['vous.', 90]]),
    line(89, [['*', 62], ['VOS', 81], ['BAGAGES', 96], ['EN', 96], ['CABINE', 93], ['/', 92], ['YOUR', 96], ['CARRY-ON', 92], ['BA', 96]]),
  ],
}]

describe('keepConfidentText', () => {
  it('drops scraps read from pictures and keeps the real text', () => {
    expect(keepConfidentText(SIGN)).toBe(
      'Et rangez votre petit sac\nsous le siège devant vous.\nVOS BAGAGES EN CABINE YOUR CARRY-ON BA')
  })
  it('keeps a short line only when it was read confidently', () => {
    expect(keepConfidentText([{ lines: [line(95, [['OK', 95]])] }])).toBe('OK')
    expect(keepConfidentText([{ lines: [line(60, [['ih', 60]])] }])).toBe('')
  })
  it('separates paragraphs with a blank line', () => {
    const p = (t: string) => ({ lines: [line(90, [[t, 90]])] })
    expect(keepConfidentText([p('Entrée'), p('Sortie')])).toBe('Entrée\n\nSortie')
  })
})

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
