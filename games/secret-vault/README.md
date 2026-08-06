# Secret Vault

Интерфейс игры полностью переведён на русский язык, а изучаемые английские буквы, слова, варианты ответов и предложения остаются на английском без изменений.

Secret Vault is the third standalone ABCity browser game. It uses only plain HTML, CSS, JavaScript, local vector art, Web Audio, and browser speech synthesis.

## Run locally

From the repository root, start any static server, for example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/games/secret-vault/`. Opening `index.html` directly is not supported because browsers block the approved JSON fetches on `file://` URLs.

## Mechanics

- Easy selects 3 approved tasks. The child taps three picture cues in the order of the target word's initials.
- Medium selects 3 approved tasks. The child plays a spoken word and chooses among exactly three text-only cards.
- Hard selects 1 approved task. The child matches one illustrated scene to one of three approved sentences.
- Each level starts with 3 energy charges. A mistake removes exactly one charge. At zero, energy immediately returns to 3; completed tasks and opened rings are never cleared.
- There is no timer and no permanent failure state.

## Files

- `index.html` — browser entry point
- `styles.css` — responsive vault interface and animations
- `js/game.js` — deterministic state, selection, and validation helpers
- `js/main.js` — rendering, input, persistence, and game flow
- `js/audio.js` — local synthesized sound and speech
- `js/cue-art.js` — approved cue-to-local-SVG mapping
- `js/scene-art.js` — seven local Hard scene illustrations
- `test.mjs` — lightweight content and mechanics checks

The game loads `docs/content/picture-cues.json`, `easy-tasks.json`, `medium-tasks.json`, and `hard-tasks.json`. It stops with a technical error if approved content or matching local artwork cannot be validated.

Progress and sound preference use only the localStorage key `abcity.secretVault.v1`.

## Tests

From the repository root:

```powershell
node games/secret-vault/test.mjs
python docs/content/validate_content.py
```
