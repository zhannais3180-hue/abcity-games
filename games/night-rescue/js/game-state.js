import { GAME_CONFIG } from "./config.js";

export function freshState(settings = {}) {
  return {
    version: 1, screen: "HOME", currentLevel: "easy", completedLevels: [],
    progress: { easy: 0, medium: 0, hard: 0 }, lives: 3, illumination: 0,
    finalComplete: false, everCompleted: false, targetHistory: [], currentTask: null,
    settings: { music: true, sound: true, reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches, ...settings }
  };
}

export function sanitizeState(value) {
  const base = freshState(value?.settings);
  if (!value || value.version !== 1 || !GAME_CONFIG.levelOrder.includes(value.currentLevel)) return base;
  return { ...base, ...value, settings: { ...base.settings, ...value.settings }, screen: "HOME" };
}
