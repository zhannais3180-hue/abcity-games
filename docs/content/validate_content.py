from pathlib import Path
import json, re, sys

ROOT = Path(__file__).resolve().parent

def load(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))

def distance(a, b):
    return sum(x != y for x, y in zip(a, b)) + abs(len(a)-len(b))

def words(s):
    return re.findall(r"[A-Za-z]+(?:-[A-Za-z]+)?", s.lower())

errors = []
cues = load("picture-cues.json")
easy = load("easy-tasks.json")
medium = load("medium-tasks.json")
hard = load("hard-tasks.json")

cue_map = {x["letter"]: x["cueWord"] for x in cues["items"]}
if set(cue_map) != set("abcdefghijklmnopqrstuvwxyz"):
    errors.append("picture-cues.json must contain exactly a-z.")

for t in easy["tasks"]:
    target = t["targetWord"].lower()
    if len(target) != 3 or not target.isalpha():
        errors.append(f'{t["id"]}: Easy target must be a 3-letter word.')
    if t["answerLetters"] != list(target):
        errors.append(f'{t["id"]}: answerLetters mismatch.')
    for letter in t["pictureCueLetters"]:
        if letter not in cue_map:
            errors.append(f'{t["id"]}: no picture cue for {letter}.')

for t in medium["tasks"]:
    options = t["options"]
    correct = t["correctAnswer"]
    if len(options) != 3 or len(set(options)) != 3:
        errors.append(f'{t["id"]}: exactly 3 unique options required.')
    if correct not in options:
        errors.append(f'{t["id"]}: correct answer missing.')
    if any(len(w) != 3 or not w.isalpha() for w in options):
        errors.append(f'{t["id"]}: Medium options must be 3-letter words.')
    for option in options:
        if option != correct and distance(correct, option) not in (1, 2):
            errors.append(f'{t["id"]}: distractor {option} differs by more than 2 letters.')
    joined = " ".join(options).lower()
    if "c" in joined and "k" in joined:
        errors.append(f'{t["id"]}: C and K are mixed.')

for t in hard["tasks"]:
    options = t["options"]
    correct = t["correctAnswer"]
    if len(options) != 3 or len(set(options)) != 3:
        errors.append(f'{t["id"]}: exactly 3 unique options required.')
    if correct not in options:
        errors.append(f'{t["id"]}: correct sentence missing.')
    cw = words(correct)
    for option in options:
        if option == correct:
            continue
        ow = words(option)
        if len(cw) != len(ow):
            errors.append(f'{t["id"]}: distractor word count mismatch.')
            continue
        changed = sum(a != b for a,b in zip(cw,ow))
        if changed not in (1,2):
            errors.append(f'{t["id"]}: distractor differs by {changed} words.')

if errors:
    print("VALIDATION FAILED")
    for e in errors:
        print("-", e)
    sys.exit(1)

print("VALIDATION PASSED")
print("Picture cues:", len(cues["items"]))
print("Easy tasks:", len(easy["tasks"]))
print("Medium tasks:", len(medium["tasks"]))
print("Hard tasks:", len(hard["tasks"]))
