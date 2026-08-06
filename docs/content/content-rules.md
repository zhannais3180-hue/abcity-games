# ABCity Secret Vault — content rules

## Easy

- The child sees a simple three-letter CVC target word.
- The child selects picture cues whose initial letters spell that word.
- Example: `CAT` → cat picture + ant picture + tiger picture.
- Picture cards must not display printed letters or words.
- Picture cues come only from `picture-cues.json`.
- Three Easy tasks are selected per play.

## Medium

- The child hears one CVC word.
- The child sees exactly three text-only word cards.
- One card is correct.
- Distractors differ from the correct word by one or two letters.
- Do not place C-spelling and K-spelling alternatives in the same row.
- Do not show pictures.
- Three Medium tasks are selected per play.

## Hard

- The child sees one scene image.
- The child sees exactly three text-only sentences.
- Only one sentence precisely describes the image.
- Options deliberately resemble one another and differ by one or two words.
- Do not play sentence audio before the child answers.
- One Hard task is selected per play.

## Runtime restrictions

- Randomize only approved task order and option order.
- Never generate new options at runtime.
- Never use an external API to create distractors.
- If an image or audio asset is missing, show a technical fallback; do not replace the educational item.
