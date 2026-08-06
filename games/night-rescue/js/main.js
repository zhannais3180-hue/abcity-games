import { GAME_CONFIG } from "./config.js";
import { createTask } from "./alphabet.js";
import { freshState, sanitizeState } from "./game-state.js";
import { loadSave, saveGame, clearSave } from "./storage-manager.js";
import { levelConfig, updateIllumination, enterNextLevel, retryLives } from "./level-manager.js";
import { MovementController } from "./movement-controller.js";
import { AudioManager } from "./audio-manager.js";
import * as view from "./ui.js";

const app = document.querySelector("#app"), live = document.querySelector("#live");
let stored = loadSave(); let state = sanitizeState(stored); let processing = false; let movement;
const audio = new AudioManager(() => state.settings);

function persist() { saveGame(state); stored = state; }
function announce(text) { live.textContent = ""; requestAnimationFrame(() => live.textContent = text); }
function ensureTask() {
  if (!state.currentTask) { state.currentTask = createTask(levelConfig(state).movingLetterCount, state.targetHistory); state.targetHistory.push(state.currentTask.target); state.targetHistory = state.targetHistory.slice(-6); persist(); }
}
function render() {
  movement?.stop();
  if (state.screen === "HOME") app.innerHTML = view.home(state, Boolean(stored && (state.finalComplete || Object.values(state.progress).some(Boolean))));
  else if (state.screen === "HOW_TO_PLAY") app.innerHTML = view.how(state);
  else if (state.screen === "LEVEL_INTRO") app.innerHTML = view.levelIntro(state);
  else if (["PLAYING","PAUSED"].includes(state.screen)) { ensureTask(); app.innerHTML = view.game(state, state.screen === "PAUSED"); mountMovement(); }
  else if (state.screen === "LEVEL_COMPLETE") app.innerHTML = view.milestone(state);
  else if (state.screen === "LEVEL_RETRY") app.innerHTML = view.milestone(state, false, true);
  else if (state.screen === "FINAL_CELEBRATION") app.innerHTML = view.milestone(state, true);
}
function mountMovement() {
  const area = document.querySelector("#letter-area"); if (!area) return;
  movement = new MovementController(area); movement.mount([...area.querySelectorAll(".letter-bubble")], state.settings.reducedMotion || state.screen !== "PLAYING");
}
function beginFresh() { const settings = state.settings; state = freshState(settings); state.screen = "LEVEL_INTRO"; stored = state; persist(); audio.unlock(); audio.syncMusic(); render(); }
function setScreen(screen) { state.screen = screen; persist(); render(); }
async function choose(button) {
  if (processing || state.screen !== "PLAYING" || button.disabled) return;
  processing = true; movement.stop(); const chosen = button.dataset.letter; const correct = state.currentTask.target.toLowerCase();
  if (chosen === correct) {
    button.classList.add("is-correct"); document.querySelector("#target").classList.add("is-correct");
    document.querySelector("#feedback").textContent = "Пара найдена! Свет возвращается!"; announce("Верно! Пара найдена."); audio.play("correct");
    const charge = document.createElement("i"); charge.className = "light-charge"; charge.textContent = "✦"; button.append(charge);
    await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.animationMs.correct));
    state.progress[state.currentLevel] += 1; updateIllumination(state); state.currentTask = null;
    if (state.progress[state.currentLevel] >= levelConfig(state).requiredMatches) {
      state.completedLevels = [...new Set([...state.completedLevels, state.currentLevel])];
      if (state.currentLevel === "hard") { state.finalComplete = true; state.screen = "FINAL_CELEBRATION"; audio.play("final"); }
      else { state.screen = "LEVEL_COMPLETE"; audio.play("level"); }
    }
  } else {
    button.classList.add("is-wrong"); button.disabled = true; button.setAttribute("aria-label", `Буква ${chosen} улетает как светлячок`);
    document.querySelector("#feedback").textContent = "Почти! Буква превратилась в светлячка."; announce("Почти! Попробуй ещё."); audio.play("wrong"); state.lives -= 1;
    await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.animationMs.wrong));
    if (state.lives <= 0) state.screen = "LEVEL_RETRY";
  }
  persist(); processing = false; render();
}
app.addEventListener("click", event => {
  const setting = event.target.closest("[data-setting]"); if (setting) { const key = setting.dataset.setting; state.settings[key] = !state.settings[key]; persist(); audio.unlock(); audio.play("click"); audio.syncMusic(); render(); return; }
  const letter = event.target.closest("[data-letter]"); if (letter) { choose(letter); return; }
  const action = event.target.closest("[data-action]")?.dataset.action; if (!action) return; audio.unlock(); audio.play("click");
  if (action === "start" || action === "replay") beginFresh();
  else if (action === "continue") { state.screen = state.finalComplete ? "FINAL_CELEBRATION" : "LEVEL_INTRO"; render(); audio.syncMusic(); }
  else if (action === "how") setScreen("HOW_TO_PLAY");
  else if (action === "home") setScreen("HOME");
  else if (action === "play-level" || action === "resume") setScreen("PLAYING");
  else if (action === "pause") setScreen("PAUSED");
  else if (action === "next-level") { enterNextLevel(state); setScreen("LEVEL_INTRO"); }
  else if (action === "retry") { retryLives(state); state.currentTask = null; setScreen("LEVEL_INTRO"); }
  else if (action === "reset" && confirm("Начать миссию заново? Сохранённый прогресс будет удалён.")) { clearSave(); stored = null; state = freshState(state.settings); render(); }
});
document.addEventListener("keydown", event => { if (event.key === "Escape") { if (state.screen === "PAUSED") setScreen("PLAYING"); else if (state.screen === "PLAYING") setScreen("PAUSED"); else if (state.screen !== "HOME") setScreen("HOME"); } });
document.addEventListener("visibilitychange", () => { if (document.hidden) { movement?.stop(); audio.syncMusic(); } else { if (state.screen === "PLAYING" && !state.settings.reducedMotion) movement?.start(); audio.syncMusic(); } });
window.addEventListener("resize", () => movement?.resize());
render();
