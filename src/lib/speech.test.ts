import { describe, expect, it } from 'vitest'
import { pickFrenchVoice } from './speech'

const voice = (name: string, lang: string, localService = true, isDefault = false) =>
  ({ name, lang, localService, default: isDefault, voiceURI: name }) as SpeechSynthesisVoice

describe('pickFrenchVoice', () => {
  it('prefers fr-FR over other French voices', () => {
    const v = pickFrenchVoice([voice('Samantha', 'en-US'), voice('Amélie', 'fr-CA'), voice('Thomas', 'fr-FR')])
    expect(v?.name).toBe('Thomas')
  })
  it('accepts underscore locales (Android) and any French as a fallback', () => {
    expect(pickFrenchVoice([voice('x', 'en_US'), voice('y', 'fr_BE')])?.name).toBe('y')
    expect(pickFrenchVoice([voice('z', 'fr_FR')])?.name).toBe('z')
  })
  it('prefers on-device voices', () => {
    expect(pickFrenchVoice([voice('net', 'fr-FR', false), voice('local', 'fr-FR', true)])?.name).toBe('local')
  })
  it('returns undefined when there is no French voice', () => {
    expect(pickFrenchVoice([voice('Samantha', 'en-US')])).toBeUndefined()
  })
})
