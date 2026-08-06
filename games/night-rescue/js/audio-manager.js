export class AudioManager {
  constructor(getSettings) { this.getSettings = getSettings; this.context = null; this.musicTimer = null; }
  unlock() { if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)(); this.context.resume?.(); }
  tone(freq, duration = .12, type = "sine", gain = .06, delay = 0) {
    if (!this.getSettings().sound) return;
    this.unlock(); const now = this.context.currentTime + delay;
    const osc = this.context.createOscillator(); const volume = this.context.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, now); volume.gain.setValueAtTime(gain, now);
    volume.gain.exponentialRampToValueAtTime(.001, now + duration);
    osc.connect(volume).connect(this.context.destination); osc.start(now); osc.stop(now + duration);
  }
  play(name) {
    const notes = { click: [420], correct: [523, 659, 784], wrong: [300, 230], charge: [700, 950], level: [392, 523, 659, 784], final: [523, 659, 784, 1047] }[name] || [440];
    notes.forEach((note, index) => this.tone(note, .18, name === "wrong" ? "triangle" : "sine", .055, index * .09));
  }
  syncMusic() {
    clearInterval(this.musicTimer); this.musicTimer = null;
    if (!this.getSettings().music || document.hidden) return;
    let index = 0; const notes = [196, 247, 294, 247];
    this.musicTimer = setInterval(() => { if (this.context && this.getSettings().music) { const sound = this.getSettings().sound; this.getSettings().sound = true; this.tone(notes[index++ % notes.length], .5, "sine", .012); this.getSettings().sound = sound; } }, 1100);
  }
}
