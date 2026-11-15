import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, searchPhrases, spoken, type Phrase } from './data/phrases'
import { SpeakerIcon, StopIcon, XIcon } from './Icons'
import { canSpeak, speak, stopSpeaking } from './lib/speech'

const SLOW_KEY = 'oui-speak-french.slow'

/** Travel phrasebook: built in, so it works offline and doesn't use the translation quota. */
export default function Phrasebook() {
  const [query, setQuery] = useState('')
  const [playing, setPlaying] = useState<string | null>(null)
  const [slow, setSlow] = useState(() => {
    try { return localStorage.getItem(SLOW_KEY) === '1' } catch { return false }
  })
  const ttsSupported = canSpeak()

  const shown = useMemo(() => searchPhrases(query), [query])

  // Stop talking when leaving the tab.
  useEffect(() => () => stopSpeaking(), [])

  const toggleSlow = () => {
    setSlow(s => {
      try { localStorage.setItem(SLOW_KEY, s ? '0' : '1') } catch { /* not persisted */ }
      return !s
    })
  }

  const play = (p: Phrase) => {
    if (!ttsSupported) return
    if (playing === p.id) {
      stopSpeaking()
      setPlaying(null)
      return
    }
    setPlaying(p.id)
    speak(spoken(p), 'fr', () => setPlaying(cur => (cur === p.id ? null : cur)), slow ? 0.65 : 0.9)
  }

  const jump = (id: string) => {
    setQuery('')
    // Wait for the full list to render, then scroll the section to just below the sticky search bar.
    requestAnimationFrame(() => {
      const section = document.getElementById(`cat-${id}`)
      const stage = section?.closest('.stage')
      const tools = stage?.querySelector('.pb-tools')
      if (!section || !stage || !tools) return
      const top = section.getBoundingClientRect().top - stage.getBoundingClientRect().top + stage.scrollTop
      stage.scrollTo({ top: top - tools.getBoundingClientRect().height - 8, behavior: 'smooth' })
    })
  }

  return (
    <div className="phrasebook">
      <div className="pb-tools">
        <div className="search">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search phrases in English or French"
            aria-label="Search phrases"
            enterKeyHint="search"
          />
          {query && (
            <button className="icon-btn" onClick={() => setQuery('')} aria-label="Clear search"><XIcon /></button>
          )}
        </div>
        <div className="chips">
          {ttsSupported && (
            <button className={`chip ${slow ? 'on' : ''}`} onClick={toggleSlow} aria-pressed={slow}>
              🐢 Slow
            </button>
          )}
          {CATEGORIES.map(c => (
            <button key={c.id} className="chip" onClick={() => jump(c.id)}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      {!ttsSupported && <p className="hint">This browser can't speak aloud, so the phrases are shown without audio.</p>}

      {shown.length === 0 && <p className="empty-search">No phrases match “{query}”. Try the Translate tab.</p>}

      {shown.map(c => (
        <section key={c.id} id={`cat-${c.id}`} className="pb-section" aria-labelledby={`h-${c.id}`}>
          <h2 id={`h-${c.id}`}>{c.emoji} {c.name}</h2>
          <ul>
            {c.phrases.map(p => {
              const on = playing === p.id
              return (
                <li key={p.id}>
                  <button className={`phrase ${on ? 'playing' : ''}`} onClick={() => play(p)} aria-pressed={ttsSupported ? on : undefined}>
                    <span className="p-text">
                      <span className="p-fr" lang="fr">{p.fr}</span>
                      <span className="p-say">{p.say}</span>
                      <span className="p-en">{p.en}</span>
                      {p.note && <span className="p-note">{p.note}</span>}
                    </span>
                    {ttsSupported && (
                      <span className="p-play" aria-hidden="true">{on ? <StopIcon /> : <SpeakerIcon />}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
