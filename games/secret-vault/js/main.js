import { STORAGE_KEY, LEVELS, TASK_COUNTS, applyWrong, freshState, selectRun, shuffle, shuffleEasyLetters, validateContent } from "./game.js";
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
const levelName = level => ({ easy: "Легко", medium: "Средне", hard: "Сложно" })[level];
const plural = (number, one, few, many) => { const mod100 = number % 100, mod10 = number % 10; return mod100 >= 11 && mod100 <= 14 ? many : mod10 === 1 ? one : mod10 >= 2 && mod10 <= 4 ? few : many; };

function sanitize(raw) {
  const sound = raw?.sound !== false;
  if (!raw || typeof raw !== "object" || !raw.run || LEVELS.some(level => !Array.isArray(raw.run[level]) || raw.run[level].length !== TASK_COUNTS[level] || raw.run[level].some(id => !taskById(level, id)))) return freshState(sound, selectRun(content));
  const completed = Object.fromEntries(LEVELS.map(level => [level, Array.isArray(raw.completed?.[level]) ? raw.completed[level].filter(id => raw.run[level].includes(id)) : []]));
  const level = LEVELS.includes(raw.level) ? raw.level : "easy";
  const openedRings = Array.isArray(raw.openedRings) ? raw.openedRings.filter(x => LEVELS.includes(x)) : [];
  return { ...freshState(sound, raw.run), ...raw, sound, level, completed, openedRings, charges: Math.max(1, Math.min(3, Number(raw.charges) || 3)), finalComplete: Boolean(raw.finalComplete) };
}

function controls(home = true) {
  return `<div class="corner">${home ? '<button class="icon" data-action="home" aria-label="На главный экран">⌂</button>' : ""}<button class="icon" data-action="sound" aria-label="${state.sound ? "Выключить" : "Включить"} звук">${state.sound ? "🔊" : "🔇"}</button></div>`;
}
function charges() { return `<div class="charges" aria-label="Заряд энергии: ${state.charges} из 3">${[1,2,3].map(i => `<i class="charge ${i <= state.charges ? "on" : ""}">◆</i>`).join("")}</div>`; }
function rings(compact = false) {
  const active = state.level;
  return `<div class="rings ${compact ? "compact" : ""}" aria-label="Кольца замка хранилища">${LEVELS.map((level, i) => {
    const open = state.openedRings.includes(level), future = LEVELS.indexOf(active) < i && !open;
    const done = state.completed[level].length, count = TASK_COUNTS[level];
    return `<div class="ring ${open ? "open" : future ? "locked" : "active"}" style="--progress:${done / count * 360}deg"><span>${open ? "✓" : future ? "◆" : `${done}/${count}`}</span><b>${levelName(level)}</b></div>`;
  }).join("")}</div>`;
}
function startScreen() {
  const unfinished = hadSave && runStarted() && !state.finalComplete;
  return `<section class="screen start">${controls(false)}<div class="hero-copy"><p class="eyebrow">ЧИТАТЕЛЬСКАЯ МИССИЯ ABCITY</p><h1>Секретное <span>хранилище</span></h1><p>В глубине ABCity три огромных кольца охраняют золотой значок детектива. Сможешь открыть их?</p><div class="actions"><button class="primary" data-action="${unfinished ? "continue" : "new"}">${unfinished ? "Продолжить расследование" : "Войти в хранилище"}</button>${unfinished ? '<button class="secondary" data-action="restart">Начать заново</button>' : ""}<button class="secondary" data-action="how">Как играть</button></div></div><div class="vault-hero"><div class="door"><i></i><i></i><i></i><strong>ABC</strong></div></div></section>`;
}
function howModal() {
  return `<section class="screen center"><article class="panel how" role="dialog" aria-modal="true" aria-labelledby="how-title"><button class="close" data-action="close" aria-label="Закрыть правила">×</button><p class="eyebrow">ОБУЧЕНИЕ ДЕТЕКТИВА</p><h2 id="how-title">Как играть</h2><ul><li><b>1</b><span>Открой кольца «Легко», «Средне» и «Сложно».</span></li><li><b>2</b><span>У тебя есть 3 светящихся заряда энергии.</span></li><li><b>3</b><span>Ошибка отнимает 1 заряд. Выполненные задания сохраняются.</span></li><li><b>↻</b><span>Когда заряды закончатся, энергия восстановится и можно будет продолжить!</span></li></ul><button class="primary" data-action="close">Готово!</button></article></section>`;
}
function overview() {
  const name = levelName(state.level);
  const copy = { easy:"Собери слово по первым буквам картинок.", medium:"Послушай слово и выбери, как оно пишется.", hard:"Прочитай и выбери предложение, которое подходит к картинке." }[state.level];
  return `<section class="screen overview">${controls()}<header class="mission-head"><div><p class="eyebrow">СЕКРЕТНОЕ ХРАНИЛИЩЕ</p><h2>Открой кольца чтения</h2></div>${charges()}</header><div class="overview-grid"><div class="vault-panel">${rings()}</div><article class="panel briefing"><span class="level-chip">Текущее кольцо</span><h2>${name}</h2><p>${copy}</p><button class="primary" data-action="play">Начать уровень «${name}»</button></article></div></section>`;
}
function gameHeader() {
  const done = state.completed[state.level].length, count = TASK_COUNTS[state.level];
  return `<header class="game-head"><button class="icon" data-action="home" aria-label="На главный экран">⌂</button><div class="level-title"><small>УРОВЕНЬ «${levelName(state.level).toUpperCase()}»</small><b>${done}/${count} ${plural(count, "задание", "задания", "заданий")}</b><div class="progress" aria-label="Прогресс: ${done} из ${count} ${plural(count, "задания", "заданий", "заданий")}"><i style="width:${done/count*100}%"></i></div></div>${charges()}<button class="icon" data-action="sound" aria-label="${state.sound ? "Выключить" : "Включить"} звук">${state.sound ? "🔊" : "🔇"}</button></header>`;
}
function easyScreen(task) {
  const cueMap = new Map(cues.map(c => [c.letter, c]));
  const order = state.cardOrder?.task === task.id ? state.cardOrder.values : shuffleEasyLetters(task.answerLetters);
  if (state.cardOrder?.task !== task.id) { state.cardOrder = { task: task.id, values: order }; save(); }
  const pictures = task.pictureCueLetters.map(letter => { const cue = cueMap.get(letter); return `<div class="picture-card" aria-label="Картинка-подсказка">${cueArt(letter, cue.cueWord)}</div>`; }).join("");
  const slots = [0,1,2].map(i => `<button class="letter-slot" data-slot-index="${i}" aria-label="${selected[i] ? "Убрать выбранную букву" : "Пустое место " + (i + 1)}" ${selected[i] ? "" : "disabled"}>${selected[i] ? selected[i].split(":")[1].toUpperCase() : ""}</button>`).join("");
  const letters = order.map(token => `<button class="letter-tile" data-letter-token="${token}" ${selected.includes(token) ? "disabled" : ""}>${escapeHtml(token.split(":")[1].toUpperCase())}</button>`).join("");
  return `<section class="screen gameplay">${gameHeader()}<div class="play-card easy-card"><p class="eyebrow">КОД ИЗ КАРТИНОК</p><h2>Собери слово по первым буквам картинок</h2><p>Рассмотри картинки и поставь буквы в правильном порядке.</p><div class="picture-row">${pictures}</div><div class="slots" aria-label="Ответ">${slots}</div><div class="letter-row" aria-label="Буквы для ответа">${letters}</div><button class="primary check-button" data-action="check-easy" ${selected.length === 3 ? "" : "disabled"}>Проверить</button><p class="feedback">Выбранную букву можно убрать, нажав на неё в ответе.</p></div>${rings(true)}</section>`;
}
function mediumScreen(task) {
  const order = state.cardOrder?.task === task.id ? state.cardOrder.values : shuffle(task.options);
  if (state.cardOrder?.task !== task.id) { state.cardOrder = { task: task.id, values: order }; save(); }
  return `<section class="screen gameplay">${gameHeader()}<div class="play-card"><p class="eyebrow">ЗВУКОВОЙ КОД</p><h2>Какое слово ты слышишь?</h2><button class="replay" data-action="replay" aria-label="Прослушать слово ещё раз"><span>▶</span> Прослушать слово</button><div class="word-row">${order.map(word => `<button class="word-card" data-answer="${escapeHtml(word)}">${escapeHtml(word)}</button>`).join("")}</div><p class="feedback">Нажми «Прослушать слово», затем выбери ответ.</p><p class="speech-fallback" hidden>Браузер не может произнести это слово. Попроси взрослого прочитать утверждённое английское слово вслух.</p></div>${rings(true)}</section>`;
}
function hardScreen(task) {
  const order = state.cardOrder?.task === task.id ? state.cardOrder.values : shuffle(task.options);
  if (state.cardOrder?.task !== task.id) { state.cardOrder = { task: task.id, values: order }; save(); }
  return `<section class="screen gameplay">${gameHeader()}<div class="play-card hard-card"><p class="eyebrow">ПОСЛЕДНИЙ КОД-КАРТИНКА</p><h2>Какое предложение подходит?</h2><div class="hard-layout">${sceneArt(task.id)}<div class="sentence-list">${order.map(sentence => `<button class="sentence-card" data-answer="${escapeHtml(sentence)}">${escapeHtml(sentence)}</button>`).join("")}</div></div><p class="feedback">Читай внимательно, детектив.</p></div>${rings(true)}</section>`;
}
function rechargeScreen() { return `<section class="screen center recharge"><article class="panel"><div class="battery">⚡</div><p class="eyebrow">ЗАРЯД ЭНЕРГИИ</p><h2>Энергия детектива восстановлена!</h2><p>Выполненные задания сохранены. У тебя снова 3 заряда.</p><div class="charges big"><i class="charge on">◆</i><i class="charge on">◆</i><i class="charge on">◆</i></div><button class="primary" data-action="resume">Продолжить</button></article></section>`; }
function finalScreen() { return `<section class="screen final">${controls(false)}<div class="open-vault"><div class="door-half left"></div><div class="reward"><div class="badge"><span>★</span><b>ДЕТЕКТИВ<br>ЧТЕНИЯ</b></div><p class="eyebrow">ВСЕ КОЛЬЦА ОТКРЫТЫ!</p><h1>Хранилище открыто!</h1><p>Ты отлично читаешь, детектив! ABCity сияет!</p><div class="actions"><button class="primary" data-action="new">Сыграть ещё раз</button><button class="secondary" data-action="to-start">На главный экран</button></div></div><div class="door-half right"></div></div>${rings()}</section>`; }

function render() {
  selected = state.cardOrder?.task === currentTask()?.id ? selected : [];
  if (state.screen === "start") app.innerHTML = startScreen();
  else if (state.screen === "how") app.innerHTML = howModal();
  else if (state.screen === "overview") app.innerHTML = overview();
  else if (state.screen === "recharge") app.innerHTML = rechargeScreen();
  else if (state.screen === "final") app.innerHTML = finalScreen();
  else { const task = currentTask(); app.innerHTML = state.level === "easy" ? easyScreen(task) : state.level === "medium" ? mediumScreen(task) : hardScreen(task); }
  setTimeout(() => app.querySelector(".close,.primary,.replay,.letter-tile,.word-card,.sentence-card")?.focus(), 0);
}

function completeTask(task) {
  state.completed[state.level].push(task.id); selected = []; delete state.cardOrder; audio.tone("correct"); announce("Верно! Часть замка открыта.");
  if (state.completed[state.level].length === TASK_COUNTS[state.level]) {
    state.openedRings = [...new Set([...state.openedRings, state.level])]; audio.tone("unlock");
    if (state.level === "hard") { state.finalComplete = true; state.screen = "final"; audio.tone("vault"); setTimeout(() => audio.tone("final"), 250); }
    else { state.level = LEVELS[LEVELS.indexOf(state.level) + 1]; state.screen = "overview"; state.charges = 3; }
  }
  save(); setTimeout(() => { processing = false; render(); }, 650);
}
function wrong(button) {
  state = { ...applyWrong(state) }; audio.tone("wrong"); button?.classList.add("wrong"); announce("Попробуй ещё раз."); save();
  if (state.recharged) { state.screen = "recharge"; delete state.recharged; audio.tone("recharge"); setTimeout(() => { processing = false; render(); }, 500); }
  else setTimeout(() => { processing = false; render(); }, 500);
}
function answer(value, button) {
  if (processing) return; processing = true; audio.tone("click"); const task = currentTask();
  if (value === task.correctAnswer) { button.classList.add("correct"); completeTask(task); } else wrong(button);
}
function chooseLetter(button) {
  if (processing || selected.includes(button.dataset.letterToken) || selected.length === 3) return;
  audio.tone("click"); selected.push(button.dataset.letterToken); render();
}
function newRun() { const sound = state?.sound !== false; state = freshState(sound, selectRun(content)); state.screen = "overview"; hadSave = true; selected = []; save(); render(); }

app.addEventListener("click", event => {
  const letter = event.target.closest("[data-letter-token]"); if (letter) return chooseLetter(letter);
  const slot = event.target.closest("[data-slot-index]"); if (slot && !processing) { selected.splice(Number(slot.dataset.slotIndex), 1); audio.tone("click"); return render(); }
  const answerButton = event.target.closest("[data-answer]"); if (answerButton) return answer(answerButton.dataset.answer, answerButton);
  const action = event.target.closest("[data-action]")?.dataset.action; if (!action || processing) return; audio.tone("click");
  if (action === "sound") { state.sound = !state.sound; save(); render(); }
  else if (action === "new") newRun();
  else if (action === "continue") { state.screen = state.finalComplete ? "final" : (state.screen === "start" ? "overview" : state.screen); if (state.completed[state.level].length < TASK_COUNTS[state.level] && state.screen !== "overview") state.screen = "play"; save(); render(); }
  else if (action === "restart") { if (confirm("Начать расследование заново? Выполненные задания будут удалены.")) newRun(); }
  else if (action === "how") { modalReturn = state.screen; state.screen = "how"; render(); }
  else if (action === "close") { state.screen = modalReturn || "start"; render(); }
  else if (action === "play" || action === "resume") { state.screen = "play"; save(); render(); }
  else if (action === "check-easy") { processing = true; const task = currentTask(); const value = selected.map(token => token.split(":")[1]).join(""); if (value === task.targetWord) completeTask(task); else wrong(); }
  else if (action === "clear") { selected = []; render(); }
  else if (action === "replay") { if (!audio.speak(currentTask().audioWord)) app.querySelector(".speech-fallback").hidden = false; }
  else if (action === "home") { if (!state.finalComplete && runStarted() && !confirm("Вернуться на главный экран? Расследование сохранится.")) return; state.screen = "start"; save(); render(); }
  else if (action === "to-start") { state.screen = "start"; save(); render(); }
});
document.addEventListener("keydown", event => { if (event.key === "Escape" && state?.screen === "how") { state.screen = modalReturn || "start"; render(); } });

async function boot() {
  // Approved content validation still requires exactly three choices where specified.
  try {
    const paths = ["picture-cues", "easy-tasks", "medium-tasks", "hard-tasks"];
    const responses = await Promise.all(paths.map(name => fetch(`../../docs/content/${name}.json`)));
    if (responses.some(response => !response.ok)) throw new Error("Не удалось запросить один или несколько утверждённых файлов JSON.");
    const [cueData, easy, medium, hard] = await Promise.all(responses.map(response => response.json()));
    cues = cueData.items; content = { easy, medium, hard }; const cueMap = new Map(cues.map(cue => [cue.letter, cue])); validateContent(content, cueMap);
    for (const cue of cues) cueArt(cue.letter, cue.cueWord);
    for (const task of hard.tasks) sceneArt(task.id);
    const raw = localStorage.getItem(STORAGE_KEY); hadSave = Boolean(raw); state = sanitize(raw ? JSON.parse(raw) : null);
    if (hadSave && !state.finalComplete) state.screen = "start";
    render();
  } catch (error) {
    app.innerHTML = `<section class="screen center"><article class="panel error"><h1>Не удалось загрузить содержимое хранилища</h1><p>Игре нужны утверждённые файлы из <code>docs/content/</code>. Открой игру через локальный сервер репозитория.</p><pre>${escapeHtml(error.message)}</pre></article></section>`;
  }
}
boot();
