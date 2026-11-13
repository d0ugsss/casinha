// Desafio da Vitória: frescobol na praia. Toque quando a bolinha chegar na raquete.
import { MiniGame, C, img, text, drawImgFit, clamp } from './base.js';

export class Frescobol extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, opts, hooks);
    this.goal = opts.hits || 20; this.lives = 3; this.hits = 0;
    this.vi = img('assets/chars/vitoria.webp');
    this.swing = 0; this.vSwing = 0;
    this.serve(0.6);
    this.status({ progress: [0, this.goal], lives: [3, 3] });
  }
  layout() { this.hy = this.h * 0.24; }
  dur() { return Math.max(0.7, 1.3 - this.hits * 0.03); }
  serve(delay = 0) {
    this.ball = { dir: 'down', p: -delay / this.dur(), tx: this.w * (0.3 + Math.random() * 0.4), sx: this.w * 0.5 + 18, hit: false };
    this.vSwing = 1;
  }
  pos(b) {
    const top = { x: b.sx, y: this.h * 0.31 }, bot = { x: b.tx, y: this.h * 0.84 };
    const p = clamp(b.p, 0, 1.2);
    const [a, z] = b.dir === 'down' ? [top, bot] : [bot, top];
    const k = b.dir === 'down' ? p : p;
    const x = a.x + (z.x - a.x) * k, y = a.y + (z.y - a.y) * k - Math.sin(Math.min(1, k) * Math.PI) * this.h * 0.16;
    const sy = a.y + (z.y - a.y) * k;
    const sc = b.dir === 'down' ? 0.55 + 0.6 * k : 1.15 - 0.6 * k;
    return { x, y, sy, sc };
  }
  down() {
    const b = this.ball;
    this.swing = 1;
    if (b.dir !== 'down' || b.hit || b.p < 0.62) return;
    if (b.p >= 0.76 && b.p <= 1.06) {
      b.hit = true; this.hits++;
      const perfect = b.p >= 0.9 && b.p <= 1.0;
      this.pop(perfect ? 'Perfeito!' : 'Boa!', b.tx, this.h * 0.74, perfect ? C.green : C.ink);
      this.sfx('pop', this.hits);
      this.status({ progress: [this.hits, this.goal], lives: [this.lives, 3] });
      if (this.hits >= this.goal) { this.later(() => this.win(), 500); this.ball = { ...b, dir: 'up', p: 0, done: true }; return; }
      this.ball = { dir: 'up', p: 0, tx: b.tx, sx: this.w * 0.5 + 18 };
    } else { b.miss = true; this.pop('Cedo!', b.tx, this.h * 0.74, C.red, 22); }
  }
  update(dt) {
    const b = this.ball;
    this.swing = Math.max(0, this.swing - dt * 4); this.vSwing = Math.max(0, this.vSwing - dt * 3);
    if (b.drop) { b.dropT += dt; if (b.dropT > 0.9) { if (this.lives <= 0) this.lose('A bolinha caiu 3 vezes.'); else this.serve(0.3); } return; }
    const d = b.dir === 'down' ? this.dur() : this.dur() * 0.85;
    b.p += dt / d;
    if (b.dir === 'down' && !b.hit && (b.p > 1.08 || (b.miss && b.p > 1.0))) {
      b.drop = true; b.dropT = 0; this.lives--;
      this.sfx('bad');
      this.pop('Caiu!', b.tx, this.h * 0.8, C.red);
      this.status({ progress: [this.hits, this.goal], lives: [this.lives, 3] });
    }
    if (b.dir === 'up' && b.p >= 1 && !b.done) this.serve(0.15);
  }
  draw(g) {
    const { w, h } = this;
    const sky = g.createLinearGradient(0, 0, 0, this.hy); sky.addColorStop(0, '#8FD0F2'); sky.addColorStop(1, '#D8F0FA');
    g.fillStyle = sky; g.fillRect(0, 0, w, this.hy);
    g.fillStyle = '#FFE38A'; g.beginPath(); g.arc(w * 0.82, h * 0.08, 24, 0, 7); g.fill();
    g.fillStyle = '#3E8FC9'; g.fillRect(0, this.hy, w, h * 0.06);
    g.fillStyle = 'rgba(255,255,255,.6)';
    for (let i = 0; i < 7; i++) { const x = ((i * 70 + this.t * 18) % (w + 60)) - 30; g.fillRect(x, this.hy + h * 0.06 - 4, 40, 4); }
    const sand = g.createLinearGradient(0, this.hy + h * 0.06, 0, h); sand.addColorStop(0, '#F6E2B4'); sand.addColorStop(1, '#EED29A');
    g.fillStyle = sand; g.fillRect(0, this.hy + h * 0.06, w, h);
    // Vitória lá no fundo
    drawImgFit(g, this.vi, w * 0.5, h * 0.4, h * 0.2);
    this.paddle(g, w * 0.5 + 22, h * 0.31, 0.55, -0.6 + this.vSwing * 0.9);
    const b = this.ball;
    if (b.dir === 'down' && !b.drop) {
      const k = clamp((b.p - 0.35) / 0.6, 0, 1);
      const r = 62 - 44 * k, ok = b.p >= 0.76 && b.p <= 1.06;
      g.lineWidth = 4; g.strokeStyle = ok ? C.green : 'rgba(59,42,63,.35)';
      g.beginPath(); g.ellipse(b.tx, h * 0.84, r, r * 0.45, 0, 0, 7); g.stroke();
      g.strokeStyle = 'rgba(63,164,102,.35)'; g.beginPath(); g.ellipse(b.tx, h * 0.84, 18, 8, 0, 0, 7); g.stroke();
    }
    const p = this.pos(b);
    const by = b.drop ? h * 0.84 + Math.min(1, b.dropT * 3) * 4 : p.y;
    g.fillStyle = 'rgba(80,60,40,.22)'; g.beginPath(); g.ellipse(p.x, b.drop ? h * 0.85 : p.sy + 6, 10 * p.sc, 4 * p.sc, 0, 0, 7); g.fill();
    g.fillStyle = '#FFFFFF'; g.strokeStyle = '#E9C46A'; g.lineWidth = 2;
    g.beginPath(); g.arc(p.x, by, 9 * p.sc, 0, 7); g.fill(); g.stroke();
    // raquete da Tata
    const rx = b.dir === 'down' ? b.tx : this.ball.tx;
    this.paddle(g, rx + 28, h * 0.86, 1.25, -0.9 + this.swing * 1.3);
    text(g, `${this.hits} de ${this.goal}`, w / 2, h * 0.95, { size: 18, color: 'rgba(59,42,63,.55)' });
  }
  paddle(g, x, y, s, a) {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
    g.fillStyle = '#6B4A2E'; g.fillRect(-4, 10, 8, 26);
    g.fillStyle = '#B9844D'; g.beginPath(); g.ellipse(0, -8, 17, 22, 0, 0, 7); g.fill();
    g.strokeStyle = '#8B5E3C'; g.lineWidth = 2; g.stroke();
    g.restore();
  }
}
