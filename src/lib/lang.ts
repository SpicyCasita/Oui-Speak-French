export type Lang = 'en' | 'fr'

export const LANGS: Record<Lang, { name: string; speech: string }> = {
  en: { name: 'English', speech: 'en-US' },
  fr: { name: 'Français', speech: 'fr-FR' },
}

export const other = (l: Lang): Lang => (l === 'en' ? 'fr' : 'en')

const FR_WORDS = new Set([
  'le', 'la', 'les', 'des', 'du', 'de', 'un', 'une', 'et', 'est', 'sont', 'vous', 'votre', 'vos', 'nous', 'notre',
  'pour', 'sur', 'sous', 'dans', 'avec', 'sans', 'pas', 'ne', 'au', 'aux', 'en', 'ce', 'cette', 'ces', 'qui', 'que',
  'il', 'elle', 'ils', 'je', 'tu', 'mais', 'ou', 'où', 'à', 'merci', 'bonjour', 'svp', 'entrée', 'sortie', 'défense',
  'interdit', 'fermé', 'ouvert', 'devant', 'chez', 'très', 'plus', 'tout', 'tous', 'son', 'sa', 'ses', 'leur',
])
const EN_WORDS = new Set([
  'the', 'and', 'is', 'are', 'you', 'your', 'we', 'our', 'of', 'to', 'in', 'for', 'on', 'with', 'without', 'not',
  'this', 'that', 'these', 'it', 'be', 'at', 'by', 'from', 'please', 'do', 'does', 'what', 'where', 'how', 'can',
  'i', 'my', 'me', 'he', 'she', 'they', 'but', 'or', 'thank', 'thanks', 'hello', 'entrance', 'exit', 'no', 'open',
  'closed', 'have', 'has', 'was', 'will', 'would', 'here', 'there', 'all', 'only', 'keep',
])

/**
 * Guess whether text is English or French from common words and accents.
 * Returns null when there's too little to go on (e.g. a single unknown word).
 */
export function detectLanguage(text: string): Lang | null {
  const words = text.toLowerCase().match(/[a-zà-ÿœæ']+/g) ?? []
  let fr = 0
  let en = 0
  for (const raw of words) {
    // Elided articles and pronouns are French: l'heure, d'eau, n'est, qu'il.
    const elided = /^(l|d|n|qu|j|c|s|m|t)'(?=\w)/.exec(raw)
    if (elided) fr += 1
    const w = elided ? raw.slice(elided[0].length) : raw
    if (FR_WORDS.has(w)) fr += 1
    if (EN_WORDS.has(w)) en += 1
  }
  fr += 0.5 * (text.match(/[àâçéèêëîïôûùüÿœ]/gi)?.length ?? 0)
  if (fr === en) return null
  return fr > en ? 'fr' : 'en'
}
