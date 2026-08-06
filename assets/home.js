export const GAMES = Object.freeze({
  nightRescue: { key: "abcity.nightRescue.v1", path: "games/night-rescue/" },
  mysteryEgg: { key: "abcity.mysteryEgg.v1", path: "games/mystery-egg/" },
  secretVault: { key: "abcity.secretVault.v1", path: "games/secret-vault/" }
});

const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);

export function parseSavedState(raw) {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try { const value = JSON.parse(raw); return isObject(value) ? value : null; } catch { return null; }
}

export function detectGameState(game, raw) {
  const value = parseSavedState(raw);
  if (!value) return "not-started";
  if (game === "nightRescue") {
    if (value.finalComplete === true || (Array.isArray(value.completedLevels) && value.completedLevels.includes("hard"))) return "completed";
    return value.version === 1 && ["easy", "medium", "hard"].includes(value.currentLevel) && isObject(value.progress) ? "in-progress" : "not-started";
  }
  if (game === "mysteryEgg") {
    if (value.completedGame === true) return "completed";
    return Number.isInteger(value.level) && value.level >= 0 && value.level <= 2 && Number.isFinite(value.completed) ? "in-progress" : "not-started";
  }
  if (game === "secretVault") {
    if (value.finalComplete === true || (Array.isArray(value.openedRings) && ["easy", "medium", "hard"].every(level => value.openedRings.includes(level)))) return "completed";
    return value.version === 1 && isObject(value.run) && isObject(value.completed) ? "in-progress" : "not-started";
  }
  return "not-started";
}

export function getProgress(storage) {
  return Object.fromEntries(Object.entries(GAMES).map(([game, config]) => {
    try { return [game, detectGameState(game, storage.getItem(config.key))]; }
    catch { return [game, "not-started"]; }
  }));
}

const labels = { "not-started": "Не начато", "in-progress": "В процессе", completed: "Выполнено" };

function renderProgress() {
  const progress = getProgress(localStorage);
  const completed = Object.values(progress).filter(state => state === "completed").length;
  const started = Object.entries(progress).find(([, state]) => state === "in-progress") || Object.entries(progress).find(([, state]) => state === "not-started");
  document.querySelectorAll("[data-game]").forEach(card => {
    const state = progress[card.dataset.game];
    card.dataset.state = state;
    card.querySelector(".status").textContent = labels[state];
  });
  const summary = document.querySelector("#summary");
  summary.textContent = `Выполнено ${completed} из 3 миссий`;
  const city = document.querySelector("#city");
  city.style.setProperty("--light", String(completed));
  city.setAttribute("aria-label", completed === 3 ? "ABCity полностью освещён" : `ABCity освещён на ${completed} из 3 частей`);
  document.body.dataset.completed = String(completed);
  const start = document.querySelector("#start-link");
  if (completed < 3 && started) { start.href = GAMES[started[0]].path; start.firstChild.textContent = started[1] === "in-progress" ? "Продолжить приключение " : "Начать приключение "; }
  document.querySelector("#victory").hidden = completed !== 3;
}

function init() {
  const dialog = document.querySelector("#how-dialog");
  document.querySelector("#how-open").addEventListener("click", () => dialog.showModal());
  document.querySelector("#how-close").addEventListener("click", () => dialog.close());
  document.querySelector("#how-ready").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  document.querySelector("#replay").addEventListener("click", () => document.querySelector("#missions").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
  renderProgress();
  addEventListener("pageshow", renderProgress);
  addEventListener("storage", renderProgress);
}

if (typeof document !== "undefined") init();
