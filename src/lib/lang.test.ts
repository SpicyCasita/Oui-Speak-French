import { describe, expect, it } from 'vitest'
import { detectLanguage, other } from './lang'

describe('detectLanguage', () => {
  it('recognizes French signs', () => {
    expect(detectLanguage('Et rangez votre petit sac sous le siège devant vous. VOS BAGAGES EN CABINE YOUR CARRY-ON BA')).toBe('fr')
    expect(detectLanguage('Défense de fumer')).toBe('fr')
    expect(detectLanguage("Sortie de secours. Ne pas bloquer l'accès")).toBe('fr')
  })
  it('recognizes English', () => {
    expect(detectLanguage('Please keep the door closed')).toBe('en')
    expect(detectLanguage('Where is the train station?')).toBe('en')
  })
  it('returns null when there is nothing to go on', () => {
    expect(detectLanguage('OK')).toBeNull()
    expect(detectLanguage('')).toBeNull()
  })
})

describe('other', () => {
  it('flips the language', () => {
    expect(other('en')).toBe('fr')
    expect(other('fr')).toBe('en')
  })
})
