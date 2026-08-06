# Mystery Egg

A standalone, client-side ABCity letter-to-picture matching game. Each of the three levels requires five correct clues; difficulty changes only through the 7, 10, and 13-card grids.

## Run

From the repository root, run `python -m http.server 8000`, then open `http://localhost:8000/games/mystery-egg/`. A server is required because the game fetches the approved content JSON.

## Content and files

- `index.html` and `styles.css` provide the screen structure, responsive design, egg, and animations.
- `js/main.js` manages screens, input, persistence, and validates the content bank.
- `js/game.js` contains deterministic round and target-pool helpers.
- `js/audio.js` creates interaction sounds with Web Audio.
- `js/cue-art.js` provides local, scalable picture pictograms without printed answer labels.

The exact mappings are loaded from `docs/content/picture-cues.json`; the game stops visibly if all 26 approved mappings cannot be validated. It never generates new cue words. Progress and sound preference use only `abcity.mysteryEgg.v1`.

## Tests

Run `node games/mystery-egg/test.mjs` and `python docs/content/validate_content.py` from the repository root.
