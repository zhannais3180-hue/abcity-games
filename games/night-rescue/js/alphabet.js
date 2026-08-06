import { GAME_CONFIG } from "./config.js";

export function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function createTask(count, previousTargets = []) {
  let pool = GAME_CONFIG.alphabet.filter(letter => !previousTargets.slice(-3).includes(letter));
  if (!pool.length) pool = GAME_CONFIG.alphabet;
  const target = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffle(GAME_CONFIG.alphabet.filter(letter => letter !== target)).slice(0, count - 1);
  return { target, choices: shuffle([target, ...distractors]).map(letter => letter.toLowerCase()) };
}
