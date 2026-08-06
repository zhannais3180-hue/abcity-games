export const CUE_ART_IDS = Object.freeze({
  a:"ant", b:"bus", c:"cat", d:"dog", e:"egg", f:"frog", g:"goat", h:"hat", i:"igloo", j:"jam", k:"king", l:"lion", m:"mouse",
  n:"nest", o:"octopus", p:"pen", q:"queen", r:"rabbit", s:"sun", t:"tiger", u:"umbrella", v:"van", w:"wagon", x:"xylophone", y:"yo-yo", z:"zebra"
});

const face = (fill, ears = "") => `${ears}<circle cx="60" cy="48" r="25" fill="${fill}" stroke="#271750" stroke-width="3"/><circle cx="51" cy="45" r="3"/><circle cx="69" cy="45" r="3"/><path d="M52 58q8 7 16 0" fill="none" stroke="#271750" stroke-width="3" stroke-linecap="round"/>`;
const wheel = x => `<circle cx="${x}" cy="75" r="9" fill="#27234c"/><circle cx="${x}" cy="75" r="4" fill="#b9eaff"/>`;
const ART = Object.freeze({
  ant:`<g fill="#38234d" stroke="#38234d" stroke-width="3" stroke-linecap="round"><circle cx="39" cy="55" r="9"/><circle cx="58" cy="55" r="11"/><ellipse cx="84" cy="55" rx="17" ry="13"/><path d="M34 45l-8-10m16 10 4-12M52 46L43 34m9 31L40 75m24-29 8-13m-8 33 10 12m15-34 10-9m-10 30 11 10" fill="none"/></g>`,
  bus:`<rect x="16" y="27" width="88" height="48" rx="10" fill="#ffd83d" stroke="#271750" stroke-width="4"/><path d="M25 36h56v21H25zm63 0h9v21h-9z" fill="#8deaff" stroke="#271750" stroke-width="3"/>${wheel(34)}${wheel(86)}`,
  cat:`<path d="M37 31L31 13l20 12m32 6 6-18-21 12" fill="#ff9e45" stroke="#271750" stroke-width="4"/>${face("#ff9e45")}<path d="M42 53l-21-4m22 11-21 5m56-12 21-4M77 60l21 5" stroke="#271750" stroke-width="2"/>`,
  dog:`<path d="M39 31Q20 17 23 48l17 7m41-24q20-14 17 17l-18 7" fill="#9a633d" stroke="#271750" stroke-width="4"/>${face("#d99a57")}<ellipse cx="60" cy="54" rx="7" ry="5" fill="#271750"/>`,
  egg:`<path d="M60 14C42 14 27 44 29 65c2 20 16 27 31 27s29-7 31-27C93 44 78 14 60 14z" fill="#fff7dc" stroke="#7258b5" stroke-width="4"/><ellipse cx="51" cy="38" rx="8" ry="13" fill="#fff" opacity=".8"/>`,
  frog:`<circle cx="39" cy="30" r="13" fill="#7ce35f" stroke="#22552c" stroke-width="3"/><circle cx="81" cy="30" r="13" fill="#7ce35f" stroke="#22552c" stroke-width="3"/><ellipse cx="60" cy="57" rx="37" ry="31" fill="#65cf55" stroke="#22552c" stroke-width="3"/><circle cx="39" cy="29" r="4"/><circle cx="81" cy="29" r="4"/><path d="M45 61q15 15 30 0" fill="none" stroke="#22552c" stroke-width="4"/>`,
  goat:`<path d="M37 31Q20 17 25 8q15 7 18 20m40 3Q100 17 95 8q-15 7-18 20" fill="#e8d8bd" stroke="#574530" stroke-width="4"/>${face("#f1dfc0","<path d=\"M39 28L28 19m53 9 11-9\" stroke=\"#574530\" stroke-width=\"8\"/>")}<path d="M53 70l7 20 7-20" fill="#b8a27e"/>`,
  hat:`<ellipse cx="60" cy="77" rx="47" ry="11" fill="#4b2c80"/><path d="M34 68l7-47h38l7 47z" fill="#633e9f" stroke="#271750" stroke-width="4"/><path d="M36 57h48" stroke="#ffd83d" stroke-width="8"/>`,
  igloo:`<path d="M18 79c0-37 18-61 48-61s43 26 43 61z" fill="#dffaff" stroke="#467eaa" stroke-width="4"/><path d="M72 79V58q0-17 17-17t17 17v21M20 60h53M29 38h62M49 20v19M72 39v19M42 60v19" fill="none" stroke="#84bad6" stroke-width="3"/>`,
  jam:`<path d="M33 28h54l-5 58H38z" fill="#d93286" stroke="#271750" stroke-width="4"/><rect x="30" y="18" width="60" height="14" rx="5" fill="#ffd83d" stroke="#271750" stroke-width="3"/><path d="M45 48q15-13 30 0v22H45z" fill="#ff80bb"/>`,
  king:`<path d="M34 30L28 9l20 12L60 5l12 16 20-12-6 21z" fill="#ffd83d" stroke="#7b5010" stroke-width="3"/>${face("#c9824d")}<path d="M45 64q15 25 30 0" fill="#61391f"/>`,
  lion:`<circle cx="60" cy="50" r="39" fill="#d67b24" stroke="#713914" stroke-width="4"/>${face("#ffbd52","<circle cx=\"37\" cy=\"28\" r=\"9\" fill=\"#ffbd52\"/><circle cx=\"83\" cy=\"28\" r=\"9\" fill=\"#ffbd52\"/>")}<path d="M52 54h16l-8 7z" fill="#713914"/>`,
  mouse:`<circle cx="36" cy="29" r="16" fill="#d2c9df" stroke="#51455e" stroke-width="3"/><circle cx="84" cy="29" r="16" fill="#d2c9df" stroke="#51455e" stroke-width="3"/>${face("#b9afc8")}<circle cx="60" cy="55" r="5" fill="#ef6d9d"/><path d="M40 56H19m21 8H22m58-8h21m-21 8h18" stroke="#51455e" stroke-width="2"/>`,
  nest:`<path d="M20 48q40 18 80 0L88 82H32z" fill="#b86e2c" stroke="#653a18" stroke-width="4"/><path d="M27 58h66M31 69h58M39 48l-8 29m28-24-5 31m28-34 5 26" stroke="#f0b45d" stroke-width="4"/><ellipse cx="48" cy="42" rx="11" ry="16" fill="#d9f6ff"/><ellipse cx="70" cy="42" rx="11" ry="16" fill="#fff1c9"/>`,
  octopus:`<circle cx="60" cy="42" r="28" fill="#c45be8" stroke="#59206e" stroke-width="4"/><path d="M39 61q-23 27 4 24m8-20q-12 31 7 26m12-26q12 31-7 26m19-30q23 27-4 24" fill="none" stroke="#c45be8" stroke-width="12" stroke-linecap="round"/><circle cx="50" cy="39" r="3"/><circle cx="70" cy="39" r="3"/>`,
  pen:`<path d="M27 76L76 27l17 17-49 49-21 5z" fill="#42bde8" stroke="#271750" stroke-width="4"/><path d="M76 27l8-8q5-5 10 0l7 7q5 5 0 10l-8 8M27 76l17 17-21 5z" fill="#ffd83d" stroke="#271750" stroke-width="4"/>`,
  queen:`<path d="M34 30L28 9l20 12L60 5l12 16 20-12-6 21z" fill="#ffd83d" stroke="#7b5010" stroke-width="3"/>${face("#9a5c38")}<path d="M34 84q26-25 52 0" fill="#ee4fa5"/>`,
  rabbit:`<ellipse cx="43" cy="22" rx="12" ry="25" fill="#eee9f5" stroke="#574d60" stroke-width="3"/><ellipse cx="77" cy="22" rx="12" ry="25" fill="#eee9f5" stroke="#574d60" stroke-width="3"/>${face("#eee9f5")}<circle cx="60" cy="54" r="5" fill="#ee8fb3"/>`,
  sun:`<g stroke="#ee941f" stroke-width="7" stroke-linecap="round"><path d="M60 5v14m0 62v14M8 50h14m76 0h14M23 13l10 11m54 52 10 11m0-74L87 24M33 76 23 87"/></g><circle cx="60" cy="50" r="27" fill="#ffd83d" stroke="#ee941f" stroke-width="4"/>`,
  tiger:`<path d="M37 31L31 13l20 12m32 6 6-18-21 12" fill="#ff9b2f" stroke="#4b2918" stroke-width="4"/>${face("#ff9b2f")}<path d="M47 26l6 14m20-14-6 14M39 49l12 4m30-4-12 4" stroke="#4b2918" stroke-width="5"/><path d="M52 57h16l-8 7z" fill="#4b2918"/>`,
  umbrella:`<path d="M14 48Q25 12 60 12t46 36q-12-8-23 0-12-8-23 0-12-8-23 0-12-8-23 0z" fill="#f254a5" stroke="#54205f" stroke-width="4"/><path d="M60 47v34q0 13 12 13 10 0 10-10" fill="none" stroke="#54205f" stroke-width="5" stroke-linecap="round"/>`,
  van:`<path d="M14 39h60l25 22v17H14z" fill="#43c9e8" stroke="#271750" stroke-width="4"/><path d="M74 39v22h25L82 43" fill="#b8f5ff" stroke="#271750" stroke-width="3"/>${wheel(34)}${wheel(82)}`,
  wagon:`<path d="M18 37h72l-8 38H28z" fill="#e3483d" stroke="#57221d" stroke-width="4"/><path d="M90 42l17-18" stroke="#57221d" stroke-width="6" stroke-linecap="round"/>${wheel(37)}${wheel(74)}`,
  xylophone:`<g stroke="#271750" stroke-width="3"><path d="M27 77l66-51M28 27l66 51" stroke-width="5"/><rect x="19" y="22" width="18" height="62" rx="5" fill="#ef526b" transform="rotate(18 28 53)"/><rect x="39" y="21" width="17" height="58" rx="5" fill="#ffb62d" transform="rotate(18 47 50)"/><rect x="58" y="22" width="16" height="53" rx="5" fill="#65d466" transform="rotate(18 66 48)"/><rect x="76" y="24" width="15" height="47" rx="5" fill="#52baf0" transform="rotate(18 83 48)"/></g>`,
  "yo-yo":`<circle cx="49" cy="59" r="27" fill="#ee4fa5" stroke="#5c2050" stroke-width="4"/><circle cx="49" cy="59" r="8" fill="#ffd83d"/><path d="M49 32q5-25 27-14 20 10 5 28-13 15 2 34" fill="none" stroke="#f4edff" stroke-width="4"/>`,
  zebra:`<path d="M24 55q4-27 27-27h25l18 17v34H53q-25 0-29-24z" fill="#fff" stroke="#252138" stroke-width="4"/><path d="M76 29l11-16 8 4-4 20m-14 10 18-2 7 12-11 8" fill="#fff" stroke="#252138" stroke-width="4"/><path d="M38 31l10 48m3-51 10 51m3-50 9 50m8-40 10 9m-8 5 12 8M39 78v15m38-14v14" stroke="#252138" stroke-width="7"/><circle cx="91" cy="38" r="3" fill="#252138"/>`
});

export function cueArtIdentifier(letter) { return CUE_ART_IDS[String(letter).toLowerCase()] || null; }

export function cueArt(letter, expectedCueWord = null) {
  const id = cueArtIdentifier(letter), drawing = ART[id];
  if (!id || !drawing) throw new Error(`No local illustration for ${letter}`);
  if (expectedCueWord !== null && expectedCueWord !== id) throw new Error(`Cue-art mismatch: ${letter} must render ${expectedCueWord}, not ${id}`);
  return `<svg class="cue-art" data-cue-art="${id}" viewBox="0 0 120 100" aria-hidden="true" focusable="false"><rect x="3" y="3" width="114" height="94" rx="18" fill="#eefcff"/>${drawing}</svg>`;
}
