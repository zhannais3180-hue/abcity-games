export function renderCity(progress = 0, complete = false) {
  const lit = Math.round(progress * 16);
  return `<div class="city ${complete ? "city--complete" : ""}" style="--light:${progress}">
    <div class="sky-stars">${Array.from({length: 12}, (_, i) => `<i style="--i:${i};opacity:${i < lit ? 1 : .16}">✦</i>`).join("")}</div>
    <div class="moon">☾</div><div class="city-name">ABC<span>ity</span></div>
    <div class="buildings">${[4,6,3,7,5,8].map((windows, b) => `<div class="building b${b}"><div class="roof"></div>${Array.from({length: windows}, (_, w) => `<i class="window ${b * 2 + w < lit ? "lit" : ""}"></i>`).join("")}</div>`).join("")}</div>
    <div class="road"><i></i><i></i><i></i><i></i></div></div>`;
}
