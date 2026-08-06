export class AudioManager {
  constructor(enabled) { this.enabled = enabled; this.context = null; }
  unlock() { this.context ||= new (window.AudioContext || window.webkitAudioContext)(); this.context.resume(); }
  play(kind) {
    if (!this.enabled()) return;
    this.unlock();
    const patterns = { click:[[330,.04]], wrong:[[190,.11],[155,.13]], correct:[[523,.1],[659,.12],[784,.18]], crack:[[120,.05],[90,.08],[240,.08]], level:[[392,.1],[523,.1],[659,.12],[784,.25]], final:[[523,.1],[659,.1],[784,.1],[1047,.35]] };
    let at = this.context.currentTime;
    for (const [frequency, duration] of patterns[kind] || patterns.click) {
      const oscillator = this.context.createOscillator(), gain = this.context.createGain();
      oscillator.type = kind === "wrong" ? "triangle" : "sine"; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(.16, at + .015); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
      oscillator.connect(gain).connect(this.context.destination); oscillator.start(at); oscillator.stop(at + duration); at += duration * .8;
    }
  }
}
