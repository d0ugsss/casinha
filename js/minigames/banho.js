// Desafio da Zozo: banho. Esfregue a lama antes que ela se sacuda e suje tudo de novo.
import { MiniGame, C, img, text, rr } from './base.js';

export class Banho extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, opts, hooks);
    this.zo = img('assets/chars/zozo.webp');
    this.limit = opts.time || 45; this.left = this.limit;
    this.shakeEvery = opts.shake || 7; this.shakeT = 0; this.wiggle = 0;
    this.clean = 0; this.bubbles = []; this.drops = [];
    this.status({ progress: [0, 100], text: 'Limpinha 0%', time: this.limit });
  }
  rect() {
    const im = this.zo, h = Math.min(this.h * 0.6, this.w * 0.95 * im.naturalHeight / im.naturalWidth);
    const w = h * im.naturalWidth / im.naturalHeight;
    return { x: this.w / 2 - w / 2, y: this.h * 0.86 - h, w, h };
  }
  initMud() {
    const r = this.rect();
    this.r = r;
    this.mud = document.createElement('canvas');
    this.mud.width = Math.round(r.w); this.mud.height = Math.round(r.h);
    this.mg = this.mud.getContext('2d');
    this.blobs(26, 1);
    this.probe = document.createElement('canvas'); this.probe.width = this.probe.height = 40;
    this.pg = this.probe.getContext('2d', { willReadFrequently: true });
    this.base = this.count();
  }
  blobs(n, big) {
    const g = this.mg, W = this.mud.width, H = this.mud.height;
    g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < n; i++) {
      const x = Math.random() * W, y = H * 0.15 + Math.random() * H * 0.85, rad = (big ? 0.12 : 0.07) * W * (0.7 + Math.random() * 0.8);
      g.fillStyle = ['#7A5230', '#6B4526', '#8A6038'][i % 3];
      g.beginPath(); g.ellipse(x, y, rad, rad * (0.6 + Math.random() * 0.5), Math.random() * 3, 0, 7); g.fill();
    }
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(this.zo, 0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
  }
  count() {
    this.pg.clearRect(0, 0, 40, 40); this.pg.drawImage(this.mud, 0, 0, 40, 40);
    const d = this.pg.getImageData(0, 0, 40, 40).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 60) n++;
    return n;
  }
  rub(x, y) {
    if (!this.mud) return;
    const lx = (x - this.r.x) * this.mud.width / this.r.w, ly = (y - this.r.y) * this.mud.height / this.r.h;
    const g = this.mg;
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(lx, ly, this.mud.width * 0.1, 0, 7); g.fill();
    g.globalCompositeOperation = 'source-over';
    if (Math.random() < 0.5) this.bubbles.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 30, r: 4 + Math.random() * 8, t: 0 });
  }
  down(x, y) { if (this.done) return; this.rub(x, y); this.last = [x, y]; }
  move(x, y) {
    if (!this.last) return;
    const [lx, ly] = this.last, d = Math.hypot(x - lx, y - ly), n = Math.max(1, Math.ceil(d / 8));
    for (let i = 1; i <= n; i++) this.rub(lx + (x - lx) * i / n, ly + (y - ly) * i / n);
    this.last = [x, y];
    if (Math.random() < 0.08) this.sfx('swap');
  }
  up() { this.last = null; }
  update(dt) {
    if (this.done) return;
    if (!this.mud) { if (this.zo.complete && this.zo.naturalWidth) this.initMud(); return; }
    this.left -= dt; this.shakeT += dt; this.wiggle = Math.max(0, this.wiggle - dt);
    this.ct = (this.ct || 0) + dt;
    if (this.ct > 0.25) {
      this.ct = 0;
      this.clean = Math.max(0, 1 - this.count() / this.base);
      this.status({ progress: [Math.round(this.clean * 100), 100], text: `Limpinha ${Math.round(this.clean * 100)}%`, time: Math.max(0, Math.ceil(this.left)) });
      if (this.clean >= 0.9) { this.done = true; this.pop('Cheirosa!', this.w / 2, this.h * 0.2, C.green, 30); this.later(() => this.win(), 700); return; }
    }
    if (this.shakeT >= this.shakeEvery) {
      this.shakeT = 0; this.wiggle = 0.7; this.blobs(5, 0); this.sfx('bad');
      this.pop('Sacudiu!', this.w / 2, this.h * 0.22, C.red, 26);
      for (let i = 0; i < 24; i++) this.drops.push({ x: this.w / 2, y: this.h * 0.6, vx: (Math.random() - 0.5) * 420, vy: -150 - Math.random() * 250, t: 0 });
    }
    if (this.left <= 0) this.lose('O tempo acabou e a Zozo ainda tá suja.');
  }
  draw(g, dt) {
    const { w, h } = this;
    g.fillStyle = '#E6F3F7'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#D3E9F0'; for (let y = 0; y < h * 0.7; y += 30) for (let x = (y / 30 % 2) * 15; x < w; x += 30) g.fillRect(x, y, 28, 28);
    g.fillStyle = '#FFFFFF'; rr(g, w * 0.05, h * 0.72, w * 0.9, h * 0.24, 30); g.fill();
    g.fillStyle = '#BFE3F0'; rr(g, w * 0.08, h * 0.75, w * 0.84, h * 0.08, 20); g.fill();
    // aviso da sacudida
    const k = this.shakeT / this.shakeEvery;
    g.fillStyle = 'rgba(59,42,63,.12)'; rr(g, w * 0.2, 12, w * 0.6, 12, 6); g.fill();
    g.fillStyle = k > 0.75 ? C.red : C.gold; rr(g, w * 0.2, 12, w * 0.6 * k, 12, 6); g.fill();
    text(g, 'ela vai se sacudir!', w / 2, 38, { size: 15, color: C.soft, weight: 700, font: 'Nunito, sans-serif' });
    if (!this.mud) return;
    const r = this.r, wig = this.wiggle > 0 ? Math.sin(this.t * 60) * 7 * this.wiggle : 0;
    g.save(); g.translate(wig, 0);
    g.drawImage(this.zo, r.x, r.y, r.w, r.h);
    g.drawImage(this.mud, r.x, r.y, r.w, r.h);
    g.restore();
    this.bubbles = this.bubbles.filter(b => { b.t += dt; b.y -= 20 * dt; g.globalAlpha = Math.max(0, 1 - b.t / 1.2); g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.fill(); g.stroke(); g.globalAlpha = 1; return b.t < 1.2; });
    this.drops = this.drops.filter(d => { d.t += dt; d.vy += 700 * dt; d.x += d.vx * dt; d.y += d.vy * dt; g.fillStyle = '#7A5230'; g.beginPath(); g.arc(d.x, d.y, 4, 0, 7); g.fill(); return d.t < 1; });
  }
}
