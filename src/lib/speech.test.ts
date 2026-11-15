import { describe, expect, it } from 'vitest'
import { pickVoice } from './speech'

const voice = (name: string, lang: string, localService = true, isDefault = false) =>
  ({ name, lang, localService, default: isDefault, voiceURI: name }) as SpeechSynthesisVoice

describe('pickVoice', () => {
  it('prefers fr-FR over other French voices', () => {
    const v = pickVoice([voice('Samantha', 'en-US'), voice('Amélie', 'fr-CA'), voice('Thomas', 'fr-FR')], 'fr')
    expect(v?.name).toBe('Thomas')
  })
  it('accepts underscore locales (Android) and any French as a fallback', () => {
    expect(pickVoice([voice('x', 'en_US'), voice('y', 'fr_BE')], 'fr')?.name).toBe('y')
    expect(pickVoice([voice('z', 'fr_FR')], 'fr')?.name).toBe('z')
  })
  it('prefers on-device voices', () => {
    expect(pickVoice([voice('net', 'fr-FR', false), voice('local', 'fr-FR', true)], 'fr')?.name).toBe('local')
  })
  it('picks English voices for English, preferring en-US', () => {
    expect(pickVoice([voice('Thomas', 'fr-FR'), voice('Daniel', 'en-GB'), voice('Samantha', 'en-US')], 'en')?.name).toBe('Samantha')
  })
  it('returns undefined when there is no French voice', () => {
    expect(pickVoice([voice('Samantha', 'en-US')], 'fr')).toBeUndefined()
  })
})
