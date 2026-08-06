# ABCity Content Bank for the Secret Vault game

This folder is ready to copy into a GitHub repository.

## Recommended repository structure

```text
your-repository/
├── AGENTS.md
├── docs/
│   ├── ABCity-reading-workbook.pdf
│   └── content/
│       ├── AUTHOR_OVERRIDES.md
│       ├── content-rules.md
│       ├── picture-cues.json
│       ├── easy-tasks.json
│       ├── medium-tasks.json
│       ├── hard-tasks.json
│       ├── source-inventory.json
│       └── validate_content.py
└── ...
```

## Installation

1. Copy `AGENTS.md` to the repository root.
2. Copy the whole `docs/content/` folder.
3. Put the original workbook PDF at `docs/ABCity-reading-workbook.pdf`.
4. Tell Codex to read `AGENTS.md` before writing code.
5. Run:

```bash
python docs/content/validate_content.py
```

## Included

- 26 approved letter-picture cues.
- 33 Easy tasks.
- 32 Medium tasks.
- 7 Hard tasks.
- Strict author overrides.
- A validation script.

## Expected asset paths

```text
assets/images/cues/c-cat.svg
assets/audio/words/cat.mp3
assets/images/hard/cat-on-cot.svg
```

The package contains content paths, not final image/audio assets.

Codex may randomize approved tasks and option order, but must not create new educational content.
