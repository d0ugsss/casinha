// Desafio da Marci: strogonoff. Pegue os ingredientes com a panela na ordem da receita.
import { MiniGame, C, text, emoji, rr, clamp } from './base.js';

const RECEITA = [['🧅', 'cebola'], ['🧄', 'alho'], ['🥩', 'carne'], ['🍄', 'champignon'], ['🍅', 'ketchup'], ['🥛', 'creme de leite'], ['🥔', 'batata palha']];
const FORA = ['🧦', '🍌', '🐟', '🍫', '🍓', '👟', '🍍', '🧸'];

export class Ingredientes extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, opts, hooks);
    this.step = 0; this.lives = 3; this.items = []; this.spawnT = 0.4;
    this.panX = this.w / 2; this.target = this.panX;
    this.status({ progress: [0, RECEITA.length], lives: [3, 3] });
  }
  down(x) { this.target = x; }
  move(x) { this.target = x; }
  spawn() {
    const r = Math.random();
    let ch, kind;
    if (r < 0.38) { ch = RECEITA[this.step][0]; kind = 'ok'; }
    else if (r < 0.6) { const o = RECEITA.filter((_, i) => i !== this.step); ch = o[Math.floor(Math.random() * o.length)][0]; kind = 'order'; }
    else { ch = FORA[Math.floor(Math.random() * FORA.length)]; kind = 'junk'; }
    const speed = this.h * (0.22 + this.step * 0.035 + Math.random() * 0.06);
    this.items.push({ ch, x: 30 + Math.random() * (this.w - 60), y: this.h * 0.2, v: speed, rot: (Math.random() - 0.5) * 2, a: 0 });
  }
  update(dt) {
    this.panX += (clamp(this.target, 40, this.w - 40) - this.panX) * Math.min(1, dt * 14);
    this.spawnT -= dt;
    if (this.spawnT <= 0) { this.spawn(); this.spawnT = Math.max(0.42, 0.85 - this.step * 0.06) * (0.8 + Math.random() * 0.4); }
    const py = this.h * 0.86;
    this.items = this.items.filter(it => {
      it.y += it.v * dt; it.a += it.rot * dt;
      if (it.y > py - 18 && it.y < py + 14 && Math.abs(it.x - this.panX) < 46) { this.catch(it); return false; }
      return it.y < this.h + 30;
    });
  }
  catch(it) {
    const need = RECEITA[this.step][0];
    if (it.ch === need) {
      this.step++; this.sfx('pop', this.step);
      this.pop('+ ' + RECEITA[this.step - 1][1], this.panX, this.h * 0.78, C.green, 20);
      this.status({ progress: [this.step, RECEITA.length], lives: [this.lives, 3] });
      if (this.step >= RECEITA.length) this.later(() => this.win(), 400);
    } else {
      this.lives--; this.sfx('bad');
      const isRec = RECEITA.some(r => r[0] === it.ch);
      this.pop(isRec ? 'Ainda não!' : 'Isso não vai!', this.panX, this.h * 0.78, C.red, 20);
      this.status({ progress: [this.step, RECEITA.length], lives: [this.lives, 3] });
      if (this.lives <= 0) this.later(() => this.lose('A receita desandou.'), 300);
    }
  }
  draw(g) {
    const { w, h } = this;
    g.fillStyle = '#FBF3E8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#E9DCCB'; for (let y = 0; y < h; y += 34) for (let x = (y / 34) % 2 * 17; x < w; x += 34) g.fillRect(x, y, 16, 16);
    // receita
    g.fillStyle = 'rgba(255,255,255,.92)'; rr(g, 10, 8, w - 20, h * 0.13, 14); g.fill();
    const n = RECEITA.length, cw = (w - 40) / n;
    RECEITA.forEach(([ch], i) => {
      const x = 20 + cw * i + cw / 2, y = 8 + h * 0.065;
      if (i === this.step) { g.fillStyle = '#FFF0C7'; g.beginPath(); g.arc(x, y, cw * 0.46, 0, 7); g.fill(); g.strokeStyle = C.gold; g.lineWidth = 3; g.stroke(); }
      g.globalAlpha = i < this.step ? 0.35 : 1; emoji(g, ch, x, y, Math.min(30, cw * 0.62)); g.globalAlpha = 1;
      if (i < this.step) text(g, '✓', x + cw * 0.28, y + cw * 0.22, { size: 18, color: C.green });
    });
    if (this.step < n) text(g, `agora: ${RECEITA[this.step][1]}`, w / 2, 8 + h * 0.13 + 16, { size: 17, color: C.ink, weight: 700, font: 'Nunito, sans-serif' });
    this.items.forEach(it => { g.save(); g.translate(it.x, it.y); g.rotate(it.a); emoji(g, it.ch, 0, 0, 38); g.restore(); });
    // panela
    const py = h * 0.86, x = this.panX;
    g.fillStyle = '#2B2B2E'; g.fillRect(x + 44, py - 4, 46, 9);
    g.fillStyle = '#C0392B'; rr(g, x - 48, py - 14, 96, 42, 14); g.fill();
    g.fillStyle = '#A83226'; g.fillRect(x - 52, py - 18, 104, 10);
    g.fillStyle = '#E7C08A'; g.beginPath(); g.ellipse(x, py - 14, 44, 8, 0, 0, 7); g.fill();
  }
}
