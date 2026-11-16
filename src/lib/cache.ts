import { localStorageCache } from './translate'

/** One translation cache for the whole app, so the live camera and the main screen share results. */
export const translationCache = localStorageCache('oui-speak-french.cache.v1')
