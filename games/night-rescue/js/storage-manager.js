import { GAME_CONFIG } from "./config.js";

export function loadSave() {
  try { return JSON.parse(localStorage.getItem(GAME_CONFIG.storageKey)); } catch { return null; }
}
export function saveGame(state) {
  try { localStorage.setItem(GAME_CONFIG.storageKey, JSON.stringify(state)); } catch { /* Game remains playable. */ }
}
export function clearSave() {
  try { localStorage.removeItem(GAME_CONFIG.storageKey); } catch { /* Nothing else to do. */ }
}
