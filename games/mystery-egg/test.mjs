import assert from "node:assert/strict";
import fs from "node:fs";
import { LEVELS, STORAGE_KEY, createRound, createTargetPool, normalizeLetter } from "./js/game.js";
import { CUE_ART_IDS, cueArt, cueArtIdentifier } from "./js/cue-art.js";
const content=JSON.parse(fs.readFileSync(new URL("../../docs/content/picture-cues.json",import.meta.url),"utf8"));
const cues=content.items;
assert.equal(cues.length,26); assert.equal(new Set(cues.map(c=>c.letter)).size,26);
for(const level of LEVELS){assert.equal(level.required,5);const round=createRound(cues,"a",level.cards,()=>.42);assert.equal(round.length,level.cards);assert.equal(round.filter(c=>c.letter==="a").length,1);assert.equal(new Set(round.map(c=>c.letter)).size,level.cards);}
const targets=createTargetPool(cues,()=>.42);assert.equal(targets.length,15);assert.equal(new Set(targets).size,15);
assert.equal(STORAGE_KEY,"abcity.mysteryEgg.v1");
const approved={a:"ant",b:"bus",c:"cat",d:"dog",e:"egg",f:"frog",g:"goat",h:"hat",i:"igloo",j:"jam",k:"king",l:"lion",m:"mouse",n:"nest",o:"octopus",p:"pen",q:"queen",r:"rabbit",s:"sun",t:"tiger",u:"umbrella",v:"van",w:"wagon",x:"xylophone",y:"yo-yo",z:"zebra"};
assert.deepEqual(CUE_ART_IDS,approved);
for(const [letter,id] of Object.entries(approved)){assert.equal(cueArtIdentifier(letter),id);assert.match(cueArt(letter,id),new RegExp(`data-cue-art="${id}"`));}
for(const [letter,id] of Object.entries(approved)){for(const form of [letter,letter.toUpperCase()]){assert.equal(normalizeLetter(form),letter);assert.equal(cueArtIdentifier(form),id);const round=createRound(cues,form,7,()=>.42);assert.equal(round.find(c=>normalizeLetter(c.letter)===letter)?.cueWord,id);}}
assert.equal(cueArtIdentifier("X"),"xylophone");assert.equal(cueArtIdentifier("x"),"xylophone");
assert.equal(cueArtIdentifier("Z"),"zebra");assert.equal(cueArtIdentifier("z"),"zebra");
const source=fs.readFileSync(new URL("./js/main.js",import.meta.url),"utf8");assert.doesNotMatch(source,/\b(timer|lives|life)\b/i);
console.log("Mystery Egg checks passed.");
