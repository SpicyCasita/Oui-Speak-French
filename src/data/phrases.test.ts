import { describe, expect, it } from 'vitest'
import { CATEGORIES, searchPhrases, spoken } from './phrases'

const all = CATEGORIES.flatMap(c => c.phrases)

describe('phrasebook data', () => {
  it('has unique ids and every field filled in', () => {
    expect(new Set(all.map(p => p.id)).size).toBe(all.length)
    expect(new Set(CATEGORIES.map(c => c.id)).size).toBe(CATEGORIES.length)
    for (const p of all) {
      expect(p.en.trim(), p.id).not.toBe('')
      expect(p.fr.trim(), p.id).not.toBe('')
      expect(p.say.trim(), p.id).not.toBe('')
    }
  })

  it('uses French typography: a space before ? and !', () => {
    for (const p of all) expect(p.fr, p.id).not.toMatch(/[^\s…][?!]/)
  })

  it('uses straight apostrophes so search and speech behave the same everywhere', () => {
    for (const p of all) expect(p.fr, p.id).not.toMatch(/’/)
  })
})

describe('searchPhrases', () => {
  it('returns everything for an empty query', () => {
    expect(searchPhrases('  ')).toBe(CATEGORIES)
  })
  it('matches English or French, ignoring case and accents', () => {
    const ids = (q: string) => searchPhrases(q).flatMap(c => c.phrases.map(p => p.id))
    expect(ids('TRAIN')).toEqual(expect.arrayContaining(['station', 'train-time']))
    expect(ids('medecin')).toEqual(['doctor'])
    expect(ids("s'il vous")).toContain('please')
  })
  it('drops categories with no matches', () => {
    expect(searchPhrases('passeport').map(c => c.id)).toEqual(['emergency'])
    expect(searchPhrases('zzzz')).toEqual([])
  })
})

describe('spoken', () => {
  it('drops the … placeholder', () => {
    expect(spoken({ id: 'x', en: '', say: '', fr: 'Où est… ?' })).toBe('Où est ?')
    expect(spoken({ id: 'y', en: '', say: '', fr: 'Je voudrais…' })).toBe('Je voudrais')
  })
})
