import { STORAGE_KEY, LEVELS, createRound, createTargetPool, freshState, normalizeLetter } from "./game.js";
import { AudioManager } from "./audio.js";
import { cueArt } from "./cue-art.js";

const app = document.querySelector("#app"), live = document.querySelector("#live");
const EXPECTED = {a:"ant",b:"bus",c:"cat",d:"dog",e:"egg",f:"frog",g:"goat",h:"hat",i:"igloo",j:"jam",k:"king",l:"lion",m:"mouse",n:"nest",o:"octopus",p:"pen",q:"queen",r:"rabbit",s:"sun",t:"tiger",u:"umbrella",v:"van",w:"wagon",x:"xylophone",y:"yo-yo",z:"zebra"};
let cues = [], processing = false, state, hadSave = false;
const audio = new AudioManager(() => state?.sound !== false);
const escape = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const announce = message => { live.textContent = ""; requestAnimationFrame(() => live.textContent = message); };

function sanitize(raw) {
  const saved = raw && typeof raw === "object" ? raw : {};
  return { ...freshState(saved.sound !== false, []), ...saved, level: Math.max(0, Math.min(2, Number(saved.level)||0)), completed: Math.max(0, Math.min(5, Number(saved.completed)||0)), usedLetters: Array.isArray(saved.usedLetters) ? saved.usedLetters.map(normalizeLetter).filter(x => EXPECTED[x]) : [], targetPool: Array.isArray(saved.targetPool) ? saved.targetPool.map(normalizeLetter).filter(x => EXPECTED[x]) : [] };
}
function egg(stage = state.level, progress = state.completed, hatched = false) {
  const crack = Math.min(5, progress), classes = `egg stage-${stage} crack-${crack}${hatched ? " hatched" : ""}`;
  return `<div class="egg-scene ${hatched ? "is-final" : ""}" aria-label="${hatched ? "A friendly magical creature has hatched" : "The mysterious egg"}"><i class="spark s1">✦</i><i class="spark s2">✧</i><div class="${classes}"><span class="cracks">⌁<br>ϟ</span>${hatched ? '<div class="creature"><b>•ᴗ•</b><i></i></div>' : ""}</div><div class="nest"></div></div>`;
}
function controls() { return `<div class="corner"><button class="icon" data-action="sound" aria-label="Turn sound ${state.sound ? "off" : "on"}">${state.sound ? "🔊" : "🔇"}</button><button class="icon" data-action="reset" aria-label="Restart investigation">↻</button></div>`; }
function home() {
  const unfinished = hadSave && !state.completedGame && (state.level > 0 || state.completed > 0 || state.target);
  return `<section class="screen home">${controls()}<div class="hero"><p class="eyebrow">AN ABCITY MYSTERY</p><h1>Mystery <span>Egg</span></h1><p>A strange glowing egg has appeared in ABCity! Match each letter to its picture clue and fill the egg with energy.</p><div class="actions"><button class="primary" data-action="${unfinished ? "continue" : "start"}">${unfinished ? "Continue Investigation" : "Start Investigation"}</button><button class="secondary" data-action="how">How to Play</button></div></div>${egg(0,0)}</section>`;
}
function how() { return `<section class="screen center"><article class="panel how" role="dialog" aria-modal="true" aria-labelledby="how-title"><button class="close" data-action="close" aria-label="Close">×</button><p class="eyebrow">DETECTIVE TRAINING</p><h2 id="how-title">How to Play</h2><ol><li><b>1</b> Look at the big letter.</li><li><b>2</b> Find its matching picture.</li><li><b>3</b> Avoid the trap pictures.</li><li><b>4</b> Finish all three levels to hatch the egg!</li></ol><button class="primary" data-action="close">Got It!</button></article></section>`; }
function intro() {
  const level = LEVELS[state.level];
  return `<section class="screen center">${controls()}<article class="panel intro"><p class="eyebrow">LEVEL ${state.level+1} OF 3</p><h2>${level.name}</h2>${egg(state.level, state.completed)}<div class="stats"><span><b>${level.cards}</b> picture cards</span><span><b>5</b> clues needed</span></div><p>${state.level===0?"Tiny cracks are ready to appear.":state.level===1?"The egg is starting to wobble!":"The egg is glowing with magic!"}</p><button class="primary" data-action="play">Start Level</button></article></section>`;
}
function card(cue) { return `<button class="picture-card" data-letter="${cue.letter}" aria-label="Picture of ${escape(cue.cueWord)}">${cueArt(cue.letter, cue.cueWord)}</button>`; }
function play() {
  const level = LEVELS[state.level], cards = createRound(cues, normalizeLetter(state.target), level.cards);
  return `<section class="screen game"><header><button class="icon" data-action="home" aria-label="Return to start">⌂</button><div><small>LEVEL ${state.level+1} · ${level.name.toUpperCase()}</small><b>${state.completed}/5 clues</b></div><div class="bar"><i style="width:${state.completed*20}%"></i></div><button class="icon" data-action="sound" aria-label="Turn sound ${state.sound?"off":"on"}">${state.sound?"🔊":"🔇"}</button></header><div class="game-layout"><aside class="target"><span>FIND THE PICTURE FOR</span><strong>${state.target}</strong><p>Which picture starts with this letter?</p>${egg(state.level,state.completed)}</aside><div><div class="card-grid cards-${level.cards}" aria-label="Picture choices">${cards.map(card).join("")}</div><p id="feedback" class="feedback" aria-hidden="true">Choose a picture clue!</p></div></div></section>`;
}
function milestone(final = false) { return `<section class="screen center celebration">${controls()}<article class="panel final">${egg(2,5,final)}<p class="eyebrow">${final?"MYSTERY SOLVED!":`LEVEL ${state.level+1} COMPLETE`}</p><h2>${final?"The Egg Hatched!":"A New Egg Clue!"}</h2><p>${final?"A friendly magical ABCity creature is here. Brilliant detective work!":"The egg has changed. Keep following the picture clues!"}</p><div class="actions">${final?'<button class="primary" data-action="start">Play Again</button><button class="secondary" data-action="to-start">Game Start</button>':'<button class="primary" data-action="next">Next Level</button>'}</div></article></section>`; }
function render() { app.innerHTML = state.screen==="home"?home():state.screen==="how"?how():state.screen==="intro"?intro():state.screen==="play"?play():state.screen==="level-complete"?milestone():milestone(true); setTimeout(()=>app.querySelector(".close,.primary,.picture-card")?.focus(),0); }
function newTarget() {
  if (!state.targetPool.length) state.targetPool = createTargetPool(cues.filter(c=>!state.usedLetters.includes(c.letter)));
  const targetKey = normalizeLetter(state.targetPool.shift()); state.usedLetters.push(targetKey); state.target = Math.random()<.5 ? targetKey.toUpperCase() : targetKey;
}
async function choose(button) {
  if (processing) return; processing = true; const chosen=button.dataset.letter, correct=state.target.toLowerCase(); audio.play("click");
  if (normalizeLetter(chosen) !== correct) { button.classList.add("wrong"); button.disabled=true; document.querySelector("#feedback").textContent="Almost! Try another picture."; announce("Almost. Try another picture."); audio.play("wrong"); setTimeout(()=>{button.classList.remove("wrong");button.disabled=false;processing=false;},650); return; }
  button.classList.add("correct"); document.querySelector("#feedback").textContent="Great clue! Egg energy added!"; announce("Correct! Egg energy added."); audio.play("correct");
  await new Promise(r=>setTimeout(r,700)); state.completed++; state.target=null; audio.play("crack");
  if(state.completed===5){state.screen=state.level===2?"final":"level-complete";if(state.level===2)state.completedGame=true;audio.play(state.level===2?"final":"level");} else {newTarget();}
  save(); processing=false;render();
}
app.addEventListener("click", e=>{
  const picture=e.target.closest("[data-letter]"); if(picture){choose(picture);return;} const action=e.target.closest("[data-action]")?.dataset.action;if(!action)return;audio.play("click");
  if(action==="sound"){state.sound=!state.sound;save();render();return;}
  if(action==="start"){const sound=state.sound;state=freshState(sound,createTargetPool(cues));state.screen="intro";hadSave=true;save();}
  else if(action==="continue") state.screen=state.target?"play":"intro";
  else if(action==="how") state.screen="how"; else if(action==="close") state.screen="home";
  else if(action==="play"){if(!state.target)newTarget();state.screen="play";save();}
  else if(action==="next"){state.level++;state.completed=0;state.screen="intro";save();}
  else if(action==="to-start") state.screen="home";
  else if(action==="home"){if(confirm("Return to the start screen? Your progress will be saved."))state.screen="home";else return;}
  else if(action==="reset"){if(!confirm("Restart the investigation? Saved progress will be cleared."))return;const sound=state.sound;localStorage.removeItem(STORAGE_KEY);state=freshState(sound,createTargetPool(cues));hadSave=false;}
  render();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&state.screen==="how"){state.screen="home";render();}});

async function boot(){try{const response=await fetch("../../docs/content/picture-cues.json");if(!response.ok)throw new Error(`content request returned ${response.status}`);const data=await response.json();cues=data.items;if(!Array.isArray(cues)||cues.length!==26||cues.some(c=>EXPECTED[normalizeLetter(c.letter)]!==c.cueWord)||new Set(cues.map(c=>normalizeLetter(c.letter))).size!==26)throw new Error("the approved 26-letter mapping is incomplete or changed");for(const letter of Object.keys(EXPECTED)){for(const form of [letter,letter.toUpperCase()]){const cue=cues.find(item=>normalizeLetter(item.letter)===normalizeLetter(form));if(!cue||cue.cueWord!==EXPECTED[letter])throw new Error(`Missing approved picture cue for “${form}”.`);cueArt(form,cue.cueWord);}}const raw=localStorage.getItem(STORAGE_KEY);hadSave=Boolean(raw);state=sanitize(raw?JSON.parse(raw):null);render();}catch(error){app.innerHTML=`<section class="screen center"><article class="panel error"><h1>Picture clues could not be loaded</h1><p>The game needs the approved <code>docs/content/picture-cues.json</code> file and must be opened through the local server.</p><pre>${escape(error.message)}</pre></article></section>`;}}
boot();
