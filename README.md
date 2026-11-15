# Oui Speak French

English ⇄ French translator for your phone. Type or scan a photo in either language and it works out which one it is, then translates into the other. To speak, tap 🎤 English or 🎤 Français: speech recognition has to know the language before you start. Hear the result read aloud. Open it on your phone and tap **Share → Add to Home Screen** to install it.

Everything runs in the browser: there's no backend and no API key.

| Feature | How |
| --- | --- |
| Speech in | Web Speech API (`SpeechRecognition`, `en-US` or `fr-FR`) |
| Translation | [MyMemory](https://mymemory.translated.net) free API, cached on the device |
| Photo scan | [Tesseract.js](https://tesseract.projectnaptha.com/) OCR (French + English), run on the device and lazy-loaded. Low-confidence scraps from pictures are dropped. |
| Speech out | `speechSynthesis` with a French or English voice |

## Limits
- MyMemory allows about 5,000 characters a day per network, and its quality is below paid services. Cached phrases don't count toward the quota.
- iPhone: voice input works in a normal Safari tab, but may not work from the home-screen app. If so, use the 🎤 key on the keyboard; the app shows that tip when voice input isn't available.
- The first photo scan downloads a few MB of OCR data, cached after that. Handwriting and decorative fonts read poorly.

## Develop
```bash
npm install
npm run dev
npm test
npm run lint
npm run build      # BASE_PATH=/<repo>/ for GitHub Pages
```
Code: `src/lib/translate.ts` (chunking, API, cache), `src/lib/lang.ts` (language detection), `src/lib/speech.ts`, `src/lib/ocr.ts`, `src/lib/history.ts`, UI in `src/App.tsx`.
