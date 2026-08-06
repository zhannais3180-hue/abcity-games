import { GAME_CONFIG } from "./config.js";

export function levelConfig(state) { return GAME_CONFIG.levels[state.currentLevel]; }
export function totalRequired() { return Object.values(GAME_CONFIG.levels).reduce((sum, level) => sum + level.requiredMatches, 0); }
export function completedMatches(state) { return Object.values(state.progress).reduce((sum, value) => sum + value, 0); }
export function updateIllumination(state) { state.illumination = completedMatches(state) / totalRequired(); }
export function enterNextLevel(state) {
  const index = GAME_CONFIG.levelOrder.indexOf(state.currentLevel);
  if (index === GAME_CONFIG.levelOrder.length - 1) return false;
  state.currentLevel = GAME_CONFIG.levelOrder[index + 1];
  state.lives = Math.min((index + 2) * 3, state.lives + 3);
  state.currentTask = null;
  return true;
}
export function retryLives(state) {
  const index = GAME_CONFIG.levelOrder.indexOf(state.currentLevel);
  state.lives = (index + 1) * 3;
}
