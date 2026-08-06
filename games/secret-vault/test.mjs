import assert from "node:assert/strict";
import fs from "node:fs";
import { APPROVED_HARD, STORAGE_KEY, TASK_COUNTS, applyWrong, freshState, selectRun, validateContent } from "./js/game.js";
import { CUE_ART_IDS, cueArt } from "./js/cue-art.js";
import { sceneArt } from "./js/scene-art.js";

const read = name => JSON.parse(fs.readFileSync(new URL(`../../docs/content/${name}.json`, import.meta.url), "utf8"));
const cueData = read("picture-cues"), content = { easy: read("easy-tasks"), medium: read("medium-tasks"), hard: read("hard-tasks") };
const cueMap = new Map(cueData.items.map(cue => [cue.letter, cue]));
assert.equal(validateContent(content, cueMap), true);
assert.deepEqual(TASK_COUNTS, { easy: 3, medium: 3, hard: 1 });

const run = selectRun(content, () => .42);
assert.equal(run.easy.length, 3); assert.equal(new Set(run.easy).size, 3);
assert.equal(run.medium.length, 3); assert.equal(new Set(run.medium).size, 3);
assert.equal(run.hard.length, 1);
for (const [level, ids] of Object.entries(run)) for (const id of ids) assert.ok(content[level].tasks.some(task => task.id === id));

for (const task of content.easy.tasks.filter(t => t.enabled !== false)) {
  assert.equal(task.pictureCueLetters.join(""), task.targetWord);
  task.pictureCueLetters.forEach(letter => assert.match(cueArt(letter, cueMap.get(letter).cueWord), new RegExp(`data-cue-art="${CUE_ART_IDS[letter]}"`)));
}
for (const task of content.medium.tasks.filter(t => t.enabled !== false)) {
  assert.equal(task.options.length, 3); assert.equal(task.options.filter(x => x === task.correctAnswer).length, 1);
  task.options.filter(x => x !== task.correctAnswer).forEach(option => { const distance = [...option].filter((c,i) => c !== task.correctAnswer[i]).length; assert.ok(distance >= 1 && distance <= 2); });
  const alternative = task.correctAnswer.startsWith("c") ? `k${task.correctAnswer.slice(1)}` : task.correctAnswer.startsWith("k") ? `c${task.correctAnswer.slice(1)}` : null;
  if (alternative) assert.ok(!task.options.includes(alternative));
}
for (const task of content.hard.tasks) { assert.equal(task.options.length, 3); assert.equal(task.options.filter(x => x === task.correctAnswer).length, 1); assert.ok(APPROVED_HARD.includes(task.correctAnswer)); assert.match(sceneArt(task.id), new RegExp(`data-scene-art="${task.id}"`)); }
assert.deepEqual(content.hard.tasks.map(task => task.correctAnswer), APPROVED_HARD);

let state = freshState(true, run); state.completed.easy.push(run.easy[0]);
state = applyWrong(state); assert.equal(state.charges, 2); assert.deepEqual(state.completed.easy, [run.easy[0]]);
state = applyWrong(state); state = applyWrong(state); assert.equal(state.charges, 3); assert.equal(state.recharged, true); assert.deepEqual(state.completed.easy, [run.easy[0]]);
state.openedRings.push("easy"); state = applyWrong(state); assert.deepEqual(state.openedRings, ["easy"]);
assert.equal(STORAGE_KEY, "abcity.secretVault.v1");
const source = fs.readFileSync(new URL("./js/main.js", import.meta.url), "utf8");
assert.doesNotMatch(source, /setInterval|countdown/i); assert.match(source, /exactly|three choices|approved/i);
console.log("Secret Vault checks passed.");
