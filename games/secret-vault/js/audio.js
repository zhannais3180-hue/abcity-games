export class AudioManager {
  constructor(enabled) { this.enabled = enabled; this.context = null; }
  tone(kind) {
    if (!this.enabled()) return;
    this.context ||= new (window.AudioContext || window.webkitAudioContext)();
    const notes = { click: [420,.04], correct: [740,.13], wrong: [190,.12], unlock: [520,.28], recharge: [330,.35], vault: [180,.5], final: [880,.55] };
    const [frequency, duration] = notes[kind] || notes.click;
    const oscillator = this.context.createOscillator(), gain = this.context.createGain();
    oscillator.type = kind === "wrong" ? "sine" : "triangle"; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, this.context.currentTime); gain.gain.exponentialRampToValueAtTime(.12, this.context.currentTime + .01); gain.gain.exponentialRampToValueAtTime(.0001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.context.destination); oscillator.start(); oscillator.stop(this.context.currentTime + duration);
  }
  speak(word) {
    if (!this.enabled() || !("speechSynthesis" in window)) return false;
    speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(word); utterance.lang = "en-US"; utterance.rate = .72; speechSynthesis.speak(utterance); return true;
  }
}
