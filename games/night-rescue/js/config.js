export const GAME_CONFIG = {
  gameId: "night-rescue",
  storageKey: "abcity.nightRescue.v1",
  levels: {
    easy: { label: "Легко", movingLetterCount: 3, requiredMatches: 5, addedLives: 3 },
    medium: { label: "Средне", movingLetterCount: 5, requiredMatches: 7, addedLives: 3 },
    hard: { label: "Сложно", movingLetterCount: 8, requiredMatches: 10, addedLives: 3 }
  },
  levelOrder: ["easy", "medium", "hard"],
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  movement: { speed: 28, sameSpeedForAllLevels: true },
  animationMs: { correct: 1250, wrong: 800 }
};
