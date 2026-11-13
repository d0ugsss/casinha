// Desafio do Milton: mutirão da churrasqueira. Solte o tijolo alinhado; o que sobra pra fora cai.
import { MiniGame, C, text, rr, face, circleImg } from './base.js';

export class Tijolos extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, opts, hooks);
    this.goal = opts.rows || 15; this.cam = 0; this.debris = [];
    this.mi = face('milton');
    this.layout();
    this.rows = [{ x: this.ox + this.pw * 0.2, w: this.pw * 0.6 }];
    this.next();
    this.status({ progress: [0, this.goal] });
  }
  layout() {
    this.pw = Math.min(this.w * 0.88, 380); this.ox = (this.w - this.pw) / 2;
    this.bh = Math.max(18, Math.min(28, this.h * 0.045)); this.gy = this.h * 0.9;
  }
  next() {
    const last = this.rows[this.rows.length - 1];
    this.cur = { x: Math.random() < 0.5 ? this.ox - last.w * 0.3 : this.ox + this.pw - last.w * 0.7, w: last.w, dir: Math.random() < 0.5 ? 1 : -1 };
    this.speed = 140 + (this.rows.length - 1) * 15;
  }
  down() {
    if (this.wait) return;
    const c = this.cur, last = this.rows[this.rows.length - 1];
    let x = c.x;
    if (Math.abs(x - last.x) < 5) { x = last.x; this.pop('Perfeito!', this.w / 2, this.rowY(this.rows.length) - 30 + this.cam, C.green, 24); }
    const a = Math.max(x, last.x), b = Math.min(x + c.w, last.x + last.w);
    const y = this.rowY(this.rows.length);
    if (b - a <= 2) {
      this.debris.push({ x, y, w: c.w, vy: 0, vx: 0, r: 0 });
      this.wait = true; this.sfx('bad');
      this.later(() => this.lose('O tijolo caiu inteiro.'), 900);
      return;
    }
    if (x < a) this.debris.push({ x, y, w: a - x, vy: 0, vx: -40, r: 0 });
    if (x + c.w > b) this.debris.push({ x: b, y, w: x + c.w - b, vy: 0, vx: 40, r: 0 });
    this.rows.push({ x: a, w: b - a });
    this.sfx('box');
    const n = this.rows.length - 1;
    this.status({ progress: [n, this.goal] });
    if (n >= this.goal) { this.wait = true; this.later(() => this.win(), 700); return; }
    this.next();
  }
  rowY(i) { return this.gy - (i + 1) * this.bh; }
  update(dt) {
    const want = Math.max(0, (this.rows.length + 2) * this.bh - this.h * 0.55);
    this.cam += (want - this.cam) * Math.min(1, dt * 4);
    this.debris.forEach(d => { d.vy += 900 * dt; d.y += d.vy * dt; d.x += d.vx * dt; d.r += d.vx * 0.0006; });
    this.debris = this.debris.filter(d => d.y < this.h + this.cam + 200);
    if (this.wait) return;
    const c = this.cur;
    c.x += c.dir * this.speed * dt;
    const minX = this.ox - c.w * 0.35, maxX = this.ox + this.pw - c.w * 0.65;
    if (c.x < minX) { c.x = minX; c.dir = 1; } if (c.x > maxX) { c.x = maxX; c.dir = -1; }
  }
  brick(g, x, y, w) {
    g.fillStyle = '#C1603E'; rr(g, x, y, w, this.bh - 2, 3); g.fill();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 2, y + 2, Math.max(0, w - 4), 4);
    g.fillStyle = 'rgba(80,30,20,.25)'; for (let k = x + 34; k < x + w - 4; k += 36) g.fillRect(k, y + 2, 2, this.bh - 6);
  }
  draw(g) {
    const { w, h } = this;
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#BFE6F7'); sky.addColorStop(1, '#F7EEDC');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.save(); g.translate(0, this.cam);
    g.fillStyle = '#C9B79C'; g.fillRect(0, this.gy, w, h);
    g.fillStyle = '#6DBA5A'; g.fillRect(0, this.gy, w, 8);
    // marca da altura que falta
    const topY = this.rowY(this.goal);
    g.setLineDash([8, 8]); g.strokeStyle = C.green; g.lineWidth = 2; g.beginPath(); g.moveTo(this.ox - 10, topY); g.lineTo(this.ox + this.pw + 10, topY); g.stroke(); g.setLineDash([]);
    text(g, 'até aqui!', this.ox + this.pw - 34, topY - 12, { size: 15, color: C.green });
    this.rows.forEach((r, i) => i === 0 ? (g.fillStyle = '#8C8478', g.fillRect(r.x - 8, this.rowY(0), r.w + 16, this.bh)) : this.brick(g, r.x, this.rowY(i), r.w));
    if (!this.wait || this.over) { const c = this.cur; if (c) this.brick(g, c.x, this.rowY(this.rows.length), c.w); }
    this.debris.forEach(d => { g.save(); g.translate(d.x + d.w / 2, d.y + this.bh / 2); g.rotate(d.r); this.brick(g, -d.w / 2, -this.bh / 2, d.w); g.restore(); });
    g.restore();
    circleImg(g, this.mi, 36, 40, 24);
    text(g, `${this.rows.length - 1} de ${this.goal} fileiras`, 70, 40, { size: 17, align: 'left' });
  }
}
