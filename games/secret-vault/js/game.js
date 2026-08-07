export const STORAGE_KEY = "abcity.secretVault.v1";
export const LEVELS = Object.freeze(["easy", "medium", "hard"]);
export const TASK_COUNTS = Object.freeze({ easy: 3, medium: 3, hard: 1 });
export const APPROVED_HARD = Object.freeze([
  "A cat sat at a cot.", "Ted has a red shed.", "A fish has a thin fin.",
  "Mum, give me a gum!", "Nick has a chick.", "Jack has a jet.",
  "A fox hops into the box."
]);

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function shuffleEasyLetters(answerLetters, random = Math.random) {
  const tokens = answerLetters.map((letter, index) => `${index}:${letter}`);
  const shuffled = shuffle(tokens, random);
  if (shuffled.map(token => token.split(":")[1]).join("") === answerLetters.join("")) shuffled.push(shuffled.shift());
  return shuffled;
}

export function selectRun(content, random = Math.random) {
  const enabled = key => content[key].tasks.filter(task => task.enabled !== false);
  return {
    easy: shuffle(enabled("easy"), random).slice(0, TASK_COUNTS.easy).map(task => task.id),
    medium: shuffle(enabled("medium"), random).slice(0, TASK_COUNTS.medium).map(task => task.id),
    hard: shuffle(enabled("hard"), random).slice(0, TASK_COUNTS.hard).map(task => task.id)
  };
}

export function freshState(sound = true, run = { easy: [], medium: [], hard: [] }) {
  return { version: 1, sound, screen: "start", level: "easy", run, completed: { easy: [], medium: [], hard: [] }, charges: 3, openedRings: [], finalComplete: false, runComplete: false };
}

export function freshReplayState(sound, run, finalComplete) {
  return { ...freshState(sound, run), finalComplete: Boolean(finalComplete), runComplete: false, screen: "play" };
}

export const restoredScreen = state => state.runComplete ? "final" : state.screen;

export function applyWrong(state) {
  const next = { ...state, charges: Math.max(0, state.charges - 1) };
  return next.charges === 0 ? { ...next, charges: 3, recharged: true } : { ...next, recharged: false };
}

export function validateContent(content, cueMap) {
  for (const key of LEVELS) if (!content[key]?.tasks || content[key].tasks.filter(t => t.enabled !== false).length < TASK_COUNTS[key]) throw new Error(`Недостаточно включённых заданий уровня «${key}».`);
  for (const task of content.easy.tasks.filter(t => t.enabled !== false)) {
    if (task.answerLetters.join("") !== task.targetWord || task.pictureCueLetters.join("") !== task.targetWord) throw new Error(`Первые буквы уровня «Легко» не образуют ${task.id}.`);
    for (const letter of task.pictureCueLetters) if (!cueMap.has(letter)) throw new Error(`Нет утверждённой картинки-подсказки для буквы «${letter}».`);
  }
  for (const task of content.medium.tasks.filter(t => t.enabled !== false)) {
    if (task.options.length !== 3 || task.options.filter(x => x === task.correctAnswer).length !== 1) throw new Error(`В задании ${task.id} уровня «Средне» должно быть три варианта и один ответ.`);
    for (const option of task.options.filter(x => x !== task.correctAnswer)) {
      const distance = [...task.correctAnswer].filter((c, i) => c !== option[i]).length;
      if (distance < 1 || distance > 2) throw new Error(`Неверный вариант в задании ${task.id} уровня «Средне» отличается больше чем на 1–2 буквы.`);
    }
    const alternative = task.correctAnswer.startsWith("c") ? `k${task.correctAnswer.slice(1)}` : task.correctAnswer.startsWith("k") ? `c${task.correctAnswer.slice(1)}` : null;
    if (alternative && task.options.includes(alternative)) throw new Error(`В задании ${task.id} смешаны варианты с C и K.`);
  }
  for (const task of content.hard.tasks.filter(t => t.enabled !== false)) {
    if (task.options.length !== 3 || task.options.filter(x => x === task.correctAnswer).length !== 1 || !APPROVED_HARD.includes(task.correctAnswer)) throw new Error(`Задание ${task.id} уровня «Сложно» не утверждено.`);
  }
  return true;
}
