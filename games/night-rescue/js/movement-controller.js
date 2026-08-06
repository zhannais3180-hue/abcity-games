import { GAME_CONFIG } from "./config.js";

export class MovementController {
  constructor(area) { this.area = area; this.items = []; this.running = false; this.last = 0; this.frame = 0; }
  mount(buttons, reduced) {
    this.stop(); this.items = []; const rect = this.area.getBoundingClientRect();
    buttons.forEach((element, index) => {
      const cols = Math.ceil(Math.sqrt(buttons.length)); const row = Math.floor(index / cols); const col = index % cols;
      const x = 18 + col * Math.max(72, (rect.width - 100) / cols); const y = 20 + row * Math.max(76, (rect.height - 100) / Math.ceil(buttons.length / cols));
      const angle = (index * 2.1 + .6); const item = { element, x, y, vx: Math.cos(angle) * GAME_CONFIG.movement.speed, vy: Math.sin(angle) * GAME_CONFIG.movement.speed };
      this.items.push(item); this.paint(item);
    });
    if (!reduced) this.start();
  }
  paint(item) { item.element.style.transform = `translate(${item.x}px, ${item.y}px)`; }
  start() { if (this.running) return; this.running = true; this.last = performance.now(); this.frame = requestAnimationFrame(time => this.tick(time)); }
  stop() { this.running = false; cancelAnimationFrame(this.frame); }
  tick(time) {
    if (!this.running) return; const dt = Math.min((time - this.last) / 1000, .04); this.last = time;
    const bounds = this.area.getBoundingClientRect();
    this.items.forEach(item => {
      if (item.element.matches(":focus-visible")) return;
      const width = item.element.offsetWidth || 72, height = item.element.offsetHeight || 72;
      item.x += item.vx * dt; item.y += item.vy * dt;
      if (item.x < 6 || item.x + width > bounds.width - 6) { item.vx *= -1; item.x = Math.max(6, Math.min(item.x, bounds.width - width - 6)); }
      if (item.y < 6 || item.y + height > bounds.height - 6) { item.vy *= -1; item.y = Math.max(6, Math.min(item.y, bounds.height - height - 6)); }
      this.paint(item);
    });
    this.frame = requestAnimationFrame(next => this.tick(next));
  }
  resize() { this.items.forEach(item => { item.x = Math.min(item.x, Math.max(6, this.area.clientWidth - 86)); item.y = Math.min(item.y, Math.max(6, this.area.clientHeight - 86)); this.paint(item); }); }
}
