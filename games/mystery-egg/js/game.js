export const STORAGE_KEY = "abcity.mysteryEgg.v1";
export const LEVELS = Object.freeze([
  { id: "easy", name: "Легко", cards: 7, required: 5 },
  { id: "medium", name: "Средне", cards: 10, required: 5 },
  { id: "hard", name: "Сложно", cards: 13, required: 5 }
]);

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function normalizeLetter(letter) {
  return String(letter).toLowerCase();
}

export function createTargetPool(cues, random = Math.random) {
  return shuffle(cues.map(cue => normalizeLetter(cue.letter)), random).slice(0, 15);
}

export function createRound(cues, targetLetter, cardCount, random = Math.random) {
  const targetKey = normalizeLetter(targetLetter);
  const correct = cues.find(cue => normalizeLetter(cue.letter) === targetKey);
  if (!correct) throw new Error(`Нет утверждённой картинки-подсказки для буквы «${targetLetter}».`);
  const distractors = shuffle(cues.filter(cue => normalizeLetter(cue.letter) !== targetKey), random).slice(0, cardCount - 1);
  return shuffle([correct, ...distractors], random);
}

export function freshState(sound = true, pool = []) {
  return { screen: "home", sound, level: 0, completed: 0, usedLetters: [], targetPool: pool, target: null, completedGame: false };
}
