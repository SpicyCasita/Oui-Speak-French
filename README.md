# Oui Speak French

English ⇄ French translator for your phone. Type or scan a photo in either language and it works out which one it is, then translates into the other. To speak, tap 🎤 English or 🎤 Français: speech recognition has to know the language before you start. Hear the result read aloud.

The camera button opens a **live view**: point the box at a sign or menu and the translation appears on screen, with no photo to take. It reads on the phone about once a second, but only calls the translation service once the text holds steady and has changed. That way it doesn't burn the daily quota. Pause freezes it, and Save keeps it in your history.

The **Menu** tab reads a photo of a French menu and explains it. Dishes it knows (about 130, from soupe à l'oignon to andouillette) come with a photo from Wikipedia and a plain-English description that warns you when something is raw or offal. About 70 menu words (magret, à point, fait maison, formule…) appear as a glossary, and any other line can be tapped to translate it. You can also type a dish name to look it up.

The **Phrases** tab is a built-in travel phrasebook (basics, getting around, food, shopping, hotel, emergencies, small talk). Each phrase has the French, a pronunciation guide and the English, and you tap it to hear it, with a 🐢 slow option. It's built in, so it works offline and doesn't use the translation quota. Open it on your phone and tap **Share → Add to Home Screen** to install it.

Everything runs in the browser: there's no backend and no API key.

| Feature | How |
| --- | --- |
| Speech in | Web Speech API (`SpeechRecognition`, `en-US` or `fr-FR`) |
| Translation | [MyMemory](https://mymemory.translated.net) free API, cached on the device |
| Live camera | `getUserMedia` video; the framed part of each frame is read on the device |
| Menu guide | Built-in dish and menu-word guide (`src/data/menu.ts`), photos from the Wikipedia API (`origin=*`, no key) |
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
Code: `src/lib/translate.ts` (chunking, API, cache), `src/lib/lang.ts` (language detection), `src/lib/speech.ts`, `src/lib/ocr.ts`, `src/lib/history.ts`, `src/lib/live.ts` (frame cropping, when to translate), phrases in `src/data/phrases.ts`, UI in `src/App.tsx`, `src/LiveCamera.tsx`, `src/MenuScan.tsx` and `src/Phrasebook.tsx`.
