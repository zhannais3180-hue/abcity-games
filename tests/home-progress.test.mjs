import assert from "node:assert/strict";
import { detectGameState, getProgress, GAMES } from "../assets/home.js";

for (const game of Object.keys(GAMES)) {
  assert.equal(detectGameState(game, null), "not-started");
  assert.equal(detectGameState(game, "{bad"), "not-started");
  assert.equal(detectGameState(game, "[]"), "not-started");
  assert.equal(detectGameState(game, "{}"), "not-started");
}
assert.equal(detectGameState("nightRescue", '{"version":1,"currentLevel":"easy","progress":{"easy":0,"medium":0,"hard":0}}'), "in-progress");
assert.equal(detectGameState("mysteryEgg", '{"level":0,"completed":0}'), "in-progress");
assert.equal(detectGameState("secretVault", '{"version":1,"run":{},"completed":{}}'), "in-progress");
assert.equal(detectGameState("nightRescue", '{"finalComplete":true}'), "completed");
assert.equal(detectGameState("mysteryEgg", '{"completedGame":true}'), "completed");
assert.equal(detectGameState("secretVault", '{"finalComplete":true}'), "completed");
assert.deepEqual(getProgress({ getItem: key => key.includes("mysteryEgg") ? "broken" : null }), { nightRescue: "not-started", mysteryEgg: "not-started", secretVault: "not-started" });
console.log("Home progress helpers: all tests passed.");
