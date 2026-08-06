import { STORAGE_KEY, LEVELS, TASK_COUNTS, applyWrong, freshState, selectRun, shuffle, validateContent } from "./game.js";
import { AudioManager } from "./audio.js";
import { cueArt } from "./cue-art.js";
import { sceneArt } from "./scene-art.js";

const app = document.querySelector("#app"), live = document.querySelector("#live");
let content, cues, state, processing = false, selected = [], modalReturn = "start", hadSave = false;
const audio = new AudioManager(() => state?.sound !== false);
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const announce = message => { live.textContent = ""; requestAnimationFrame(() => live.textContent = message); };
const taskById = (level, id) => content[level].tasks.find(task => task.id === id);
const currentIndex = level => state.run[level].findIndex(id => !state.completed[level].includes(id));
const currentTask = () => taskById(state.level, state.run[state.level][currentIndex(state.level)]);
const runStarted = () => state.completed.easy.length + state.completed.medium.length + state.completed.hard.length > 0 || state.screen !== "start";

function sanitize(raw) {
  const sound = raw?.sound !== false;
  if (!raw || typeof raw !== "object" || !raw.run || LEVELS.some(level => !Array.isArray(raw.run[level]) || raw.run[level].length !== TASK_COUNTS[level] || raw.run[level].some(id => !taskById(level, id)))) return freshState(sound, selectRun(content));
  const completed = Object.fromEntries(LEVELS.map(level => [level, Array.isArray(raw.completed?.[level]) ? raw.completed[level].filter(id => raw.run[level].includes(id)) : []]));
  const level = LEVELS.includes(raw.level) ? raw.level : "easy";
  const openedRings = Array.isArray(raw.openedRings) ? raw.openedRings.filter(x => LEVELS.includes(x)) : [];
  return { ...freshState(sound, raw.run), ...raw, sound, level, completed, openedRings, charges: Math.max(1, Math.min(3, Number(raw.charges) || 3)), finalComplete: Boolean(raw.finalComplete) };
}

function controls(home = true) {
  return `<div class="corner">${home ? '<button class="icon" data-action="home" aria-label="Return to start">⌂</button>' : ""}<button class="icon" data-action="sound" aria-label="Turn sound ${state.sound ? "off" : "on"}">${state.sound ? "🔊" : "🔇"}</button></div>`;
}
function charges() { return `<div class="charges" aria-label="${state.charges} of 3 energy charges">${[1,2,3].map(i => `<i class="charge ${i <= state.charges ? "on" : ""}">◆</i>`).join("")}</div>`; }
function rings(compact = false) {
  const active = state.level;
  return `<div class="rings ${compact ? "compact" : ""}" aria-label="Vault lock rings">${LEVELS.map((level, i) => {
    const open = state.openedRings.includes(level), future = LEVELS.indexOf(active) < i && !open;
    const done = state.completed[level].length, count = TASK_COUNTS[level];
    return `<div class="ring ${open ? "open" : future ? "locked" : "active"}" style="--progress:${done / count * 360}deg"><span>${open ? "✓" : future ? "◆" : `${done}/${count}`}</span><b>${level[0].toUpperCase()+level.slice(1)}</b></div>`;
  }).join("")}</div>`;
}
function startScreen() {
  const unfinished = hadSave && runStarted() && !state.finalComplete;
  return `<section class="screen start">${controls(false)}<div class="hero-copy"><p class="eyebrow">AN ABCITY READING MISSION</p><h1>Secret <span>Vault</span></h1><p>Deep inside ABCity, three giant reading rings guard a golden detective badge. Can you unlock them?</p><div class="actions"><button class="primary" data-action="${unfinished ? "continue" : "new"}">${unfinished ? "Continue Investigation" : "Enter the Vault"}</button>${unfinished ? '<button class="secondary" data-action="restart">Restart</button>' : ""}<button class="secondary" data-action="how">How to Play</button></div></div><div class="vault-hero"><div class="door"><i></i><i></i><i></i><strong>ABC</strong></div></div></section>`;
}
function howModal() {
  return `<section class="screen center"><article class="panel how" role="dialog" aria-modal="true" aria-labelledby="how-title"><button class="close" data-action="close" aria-label="Close how to play">×</button><p class="eyebrow">DETECTIVE TRAINING</p><h2 id="how-title">How to Play</h2><ul><li><b>1</b><span>Open the Easy, Medium, and Hard rings.</span></li><li><b>2</b><span>You have 3 glowing energy charges.</span></li><li><b>3</b><span>A wrong answer uses 1 charge. Finished clues stay finished.</span></li><li><b>↻</b><span>At zero, your energy recharges and you keep going!</span></li></ul><button class="primary" data-action="close">Ready!</button></article></section>`;
}
function overview() {
  const name = state.level[0].toUpperCase()+state.level.slice(1);
  const copy = { easy:"Use picture initials to spell each word.", medium:"Listen, then choose the written word.", hard:"Read and match the sentence to the scene." }[state.level];
  return `<section class="screen overview">${controls()}<header class="mission-head"><div><p class="eyebrow">SECRET VAULT</p><h2>Unlock the reading rings</h2></div>${charges()}</header><div class="overview-grid"><div class="vault-panel">${rings()}</div><article class="panel briefing"><span class="level-chip">Current ring</span><h2>${name}</h2><p>${copy}</p><button class="primary" data-action="play">Begin ${name} Ring</button></article></div></section>`;
}
function gameHeader() {
  const done = state.completed[state.level].length, count = TASK_COUNTS[state.level];
  return `<header class="game-head"><button class="icon" data-action="home" aria-label="Return to start">⌂</button><div class="level-title"><small>${state.level.toUpperCase()} RING</small><b>${done}/${count} clues</b><div class="progress"><i style="width:${done/count*100}%"></i></div></div>${charges()}<button class="icon" data-action="sound" aria-label="Turn sound ${state.sound ? "off" : "on"}">${state.sound ? "🔊" : "🔇"}</button></header>`;
}
function easyScreen(task) {
  const cueMap = new Map(cues.map(c => [c.letter, c]));
  const order = state.cardOrder?.task === task.id ? state.cardOrder.values : shuffle(task.pictureCueLetters.map((letter, index) => `${index}:${letter}`));
  if (state.cardOrder?.task !== task.id) { state.cardOrder = { task: task.id, values: order }; save(); }
  const slots = [0,1,2].map(i => `<span class="letter-slot">${selected[i] ? selected[i].split(":")[1].toUpperCase() : ""}</span>`).join("");
  return `<section class="screen gameplay">${gameHeader()}<div class="play-card"><p class="eyebrow">PICTURE CODE</p><h2>Spell <strong>${escapeHtml(task.displayTarget)}</strong></h2><p>Tap the pictures in the right order.</p><div class="slots" aria-label="Selected initials">${slots}</div><div class="picture-row">${order.map(token => { const [index, letter] = token.split(":"), cue = cueMap.get(letter); return `<button class="picture-card ${selected.includes(token) ? "chosen" : ""}" data-cue-token="${token}" aria-label="Picture of ${escapeHtml(cue.cueWord)}" ${selected.includes(token) ? "disabled" : ""}>${cueArt(letter, cue.cueWord)}</button>`; }).join("")}</div><button class="text-button" data-action="clear" ${selected.length ? "" : "disabled"}>Clear choices</button><p class="feedback">Find the first sounds.</p></div>${rings(true)}</section>`;
}
function mediumScreen(task) {
  const order = state.cardOrder?.task === task.id ? state.cardOrder.values : shuffle(task.options);
  if (state.cardOrder?.task !== task.id) { state.cardOrder = { task: task.id, values: order }; save(); }
  return `<section class="screen gameplay">${gameHeader()}<div class="play-card"><p class="eyebrow">SOUND CODE</p><h2>Which word do you hear?</h2><button class="replay" data-action="replay" aria-label="Play the word again"><span>▶</span> Play word</button><div class="word-row">${order.map(word => `<button class="word-card" data-answer="${escapeHtml(word)}">${escapeHtml(word)}</button>`).join("")}</div><p class="feedback">Press Play word, then choose.</p><p class="speech-fallback" hidden>Your browser cannot speak this word. Please ask a grown-up to read the approved word aloud.</p></div>${rings(true)}</section>`;
}
function hardScreen(task) {
  const order = state.cardOrder?.task === task.id ? state.cardOrder.values : shuffle(task.options);
  if (state.cardOrder?.task !== task.id) { state.cardOrder = { task: task.id, values: order }; save(); }
  return `<section class="screen gameplay">${gameHeader()}<div class="play-card hard-card"><p class="eyebrow">FINAL SCENE CODE</p><h2>Which sentence matches?</h2><div class="hard-layout">${sceneArt(task.id)}<div class="sentence-list">${order.map(sentence => `<button class="sentence-card" data-answer="${escapeHtml(sentence)}">${escapeHtml(sentence)}</button>`).join("")}</div></div><p class="feedback">Read carefully, Detective.</p></div>${rings(true)}</section>`;
}
function rechargeScreen() { return `<section class="screen center recharge"><article class="panel"><div class="battery">⚡</div><p class="eyebrow">ENERGY BOOST</p><h2>Detective energy recharged!</h2><p>Your finished clues are safe. You have 3 fresh charges.</p><div class="charges big"><i class="charge on">◆</i><i class="charge on">◆</i><i class="charge on">◆</i></div><button class="primary" data-action="resume">Keep Going</button></article></section>`; }
function finalScreen() { return `<section class="screen final">${controls(false)}<div class="open-vault"><div class="door-half left"></div><div class="reward"><div class="badge"><span>★</span><b>READING<br>DETECTIVE</b></div><p class="eyebrow">ALL RINGS OPEN!</p><h1>Vault Unlocked!</h1><p>Brilliant reading, Detective. ABCity is shining bright!</p><div class="actions"><button class="primary" data-action="new">Play Again</button><button class="secondary" data-action="to-start">Return to Start</button></div></div><div class="door-half right"></div></div>${rings()}</section>`; }

function render() {
  selected = state.cardOrder?.task === currentTask()?.id ? selected : [];
  if (state.screen === "start") app.innerHTML = startScreen();
  else if (state.screen === "how") app.innerHTML = howModal();
  else if (state.screen === "overview") app.innerHTML = overview();
  else if (state.screen === "recharge") app.innerHTML = rechargeScreen();
  else if (state.screen === "final") app.innerHTML = finalScreen();
  else { const task = currentTask(); app.innerHTML = state.level === "easy" ? easyScreen(task) : state.level === "medium" ? mediumScreen(task) : hardScreen(task); }
  setTimeout(() => app.querySelector(".close,.primary,.replay,.picture-card,.word-card,.sentence-card")?.focus(), 0);
}

function completeTask(task) {
  state.completed[state.level].push(task.id); selected = []; delete state.cardOrder; audio.tone("correct"); announce("Correct! Lock segment unlocked.");
  if (state.completed[state.level].length === TASK_COUNTS[state.level]) {
    state.openedRings = [...new Set([...state.openedRings, state.level])]; audio.tone("unlock");
    if (state.level === "hard") { state.finalComplete = true; state.screen = "final"; audio.tone("vault"); setTimeout(() => audio.tone("final"), 250); }
    else { state.level = LEVELS[LEVELS.indexOf(state.level) + 1]; state.screen = "overview"; state.charges = 3; }
  }
  save(); setTimeout(() => { processing = false; render(); }, 650);
}
function wrong(button) {
  state = { ...applyWrong(state) }; audio.tone("wrong"); button?.classList.add("wrong"); announce("Almost. Try again."); save();
  if (state.recharged) { state.screen = "recharge"; delete state.recharged; audio.tone("recharge"); setTimeout(() => { processing = false; render(); }, 500); }
  else setTimeout(() => { processing = false; render(); }, 500);
}
function answer(value, button) {
  if (processing) return; processing = true; audio.tone("click"); const task = currentTask();
  if (value === task.correctAnswer) { button.classList.add("correct"); completeTask(task); } else wrong(button);
}
function chooseCue(button) {
  if (processing || selected.includes(button.dataset.cueToken)) return;
  audio.tone("click"); selected.push(button.dataset.cueToken); render();
  if (selected.length === 3) { processing = true; const answer = selected.map(x => x.split(":")[1]).join(""); if (answer === currentTask().targetWord) completeTask(currentTask()); else { selected = []; wrong(); } }
}
function newRun() { const sound = state?.sound !== false; state = freshState(sound, selectRun(content)); state.screen = "overview"; hadSave = true; selected = []; save(); render(); }

app.addEventListener("click", event => {
  const cue = event.target.closest("[data-cue-token]"); if (cue) return chooseCue(cue);
  const answerButton = event.target.closest("[data-answer]"); if (answerButton) return answer(answerButton.dataset.answer, answerButton);
  const action = event.target.closest("[data-action]")?.dataset.action; if (!action || processing) return; audio.tone("click");
  if (action === "sound") { state.sound = !state.sound; save(); render(); }
  else if (action === "new") newRun();
  else if (action === "continue") { state.screen = state.finalComplete ? "final" : (state.screen === "start" ? "overview" : state.screen); if (state.completed[state.level].length < TASK_COUNTS[state.level] && state.screen !== "overview") state.screen = "play"; save(); render(); }
  else if (action === "restart") { if (confirm("Restart the investigation? Completed clues will be cleared.")) newRun(); }
  else if (action === "how") { modalReturn = state.screen; state.screen = "how"; render(); }
  else if (action === "close") { state.screen = modalReturn || "start"; render(); }
  else if (action === "play" || action === "resume") { state.screen = "play"; save(); render(); }
  else if (action === "clear") { selected = []; render(); }
  else if (action === "replay") { if (!audio.speak(currentTask().audioWord)) app.querySelector(".speech-fallback").hidden = false; }
  else if (action === "home") { if (!state.finalComplete && runStarted() && !confirm("Return to start? Your investigation will stay saved.")) return; state.screen = "start"; save(); render(); }
  else if (action === "to-start") { state.screen = "start"; save(); render(); }
});
document.addEventListener("keydown", event => { if (event.key === "Escape" && state?.screen === "how") { state.screen = modalReturn || "start"; render(); } });

async function boot() {
  try {
    const paths = ["picture-cues", "easy-tasks", "medium-tasks", "hard-tasks"];
    const responses = await Promise.all(paths.map(name => fetch(`../../docs/content/${name}.json`)));
    if (responses.some(response => !response.ok)) throw new Error("One or more approved JSON files could not be requested.");
    const [cueData, easy, medium, hard] = await Promise.all(responses.map(response => response.json()));
    cues = cueData.items; content = { easy, medium, hard }; const cueMap = new Map(cues.map(cue => [cue.letter, cue])); validateContent(content, cueMap);
    for (const cue of cues) cueArt(cue.letter, cue.cueWord);
    for (const task of hard.tasks) sceneArt(task.id);
    const raw = localStorage.getItem(STORAGE_KEY); hadSave = Boolean(raw); state = sanitize(raw ? JSON.parse(raw) : null);
    if (hadSave && !state.finalComplete) state.screen = "start";
    render();
  } catch (error) {
    app.innerHTML = `<section class="screen center"><article class="panel error"><h1>Vault content could not be loaded</h1><p>Secret Vault needs the approved files in <code>docs/content/</code>. Open it through the repository’s local server.</p><pre>${escapeHtml(error.message)}</pre></article></section>`;
  }
}
boot();
