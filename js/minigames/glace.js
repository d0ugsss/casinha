// Desafio da Marci: biscoitos de Natal. Passe o dedo no contorno sem sair da linha.
import { MiniGame, C, text, rr } from './base.js';

const POLY = {
  estrela: Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.45 : 1; return [Math.cos(a) * r, Math.sin(a) * r]; }),
  coracao: Array.from({ length: 40 }, (_, i) => { const t = i / 40 * Math.PI * 2; return [16 * Math.sin(t) ** 3 / 17, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17]; }),
  arvore: [[0, -1], [0.45, -0.45], [0.25, -0.45], [0.65, 0.1], [0.35, 0.1], [0.8, 0.6], [0.15, 0.6], [0.15, 0.95], [-0.15, 0.95], [-0.15, 0.6], [-0.8, 0.6], [-0.35, 0.1], [-0.65, 0.1], [-0.25, -0.45], [-0.45, -0.45]],
  bola: Array.from({ length: 36 }, (_, i) => { const a = i / 36 * Math.PI * 2; return [Math.cos(a) * 0.8, 0.12 + Math.sin(a) * 0.8]; }),
  sino: [[-0.15, -0.95], [0.15, -0.95], [0.2, -0.8], [0.45, -0.55], [0.55, 0.1], [0.85, 0.6], [0.85, 0.75], [-0.85, 0.75], [-0.85, 0.6], [-0.55, 0.1], [-0.45, -0.55], [-0.2, -0.8]],
  boneco: [[-0.25, -0.95], [0.25, -0.95], [0.35, -0.7], [0.2, -0.5], [0.75, -0.4], [0.8, -0.2], [0.3, -0.15], [0.4, 0.4], [0.55, 0.95], [0.25, 0.95], [0, 0.5], [-0.25, 0.95], [-0.55, 0.95], [-0.4, 0.4], [-0.3, -0.15], [-0.8, -0.2], [-0.75, -0.4], [-0.2, -0.5], [-0.35, -0.7]]
};
const ORDEM = ['estrela', 'bola', 'coracao', 'sino', 'arvore', 'boneco'];
const GLACE = ['#FFFFFF', '#F7B6C8', '#FFFFFF', '#FFE08A', '#B8E0B0', '#FFFFFF'];

function resample(poly, n) {
  const pts = [...poly, poly[0]], seg = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) { const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(d); total += d; }
  const out = [];
  for (let k = 0; k < n; k++) {
    let t = k / n * total, i = 0;
    while (t > seg[i]) { t -= seg[i]; i++; }
    const f = t / seg[i];
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]);
  }
  return out;
}

export class Glace extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, opts, hooks);
    this.k = 0; this.lives = 3; this.trail = [];
    this.setCookie();
  }
  setCookie() {
    this.unit = resample(POLY[ORDEM[this.k]], 160);
    this.cov = new Array(this.unit.length).fill(false);
    this.tol = [28, 26, 24, 22, 20, 19][this.k];
    this.trail = []; this.smudge = 0;
    this.layout();
    this.upd();
  }
  upd() { this.status({ progress: [this.k, ORDEM.length], lives: [this.lives, 3], text: `Biscoito ${Math.min(this.k + 1, 6)} de 6` }); }
  layout() {
    if (!this.unit) return;
    const s = Math.min(this.w, this.h * 0.75) * 0.4, cx = this.w / 2, cy = this.h * 0.52;
    this.pts = this.unit.map(([x, y]) => [cx + x * s, cy + y * s]);
    this.big = this.unit.map(([x, y]) => [cx + x * s * 1.13, cy + y * s * 1.13]);
  }
  near(x, y) {
    let best = 1e9;
    this.pts.forEach(([px, py], i) => { const d = Math.hypot(px - x, py - y); if (d < best) best = d; if (d < this.tol) this.cov[i] = true; });
    return best;
  }
  down(x, y) {
    if (this.wait) return;
    const d = this.near(x, y);
    if (d > this.tol * 1.6) { this.pop('Comece na linha', x, y - 20, C.soft, 18); return; }
    this.drawing = true; this.trail.push([x, y]); this.check();
  }
  move(x, y) {
    if (!this.drawing || this.wait) return;
    const [lx, ly] = this.trail[this.trail.length - 1] || [x, y];
    const n = Math.max(1, Math.ceil(Math.hypot(x - lx, y - ly) / 5));
    for (let i = 1; i <= n; i++) {
      const px = lx + (x - lx) * i / n, py = ly + (y - ly) * i / n;
      if (this.near(px, py) > this.tol * 2) { this.fail(px, py); return; }
    }
    this.trail.push([x, y]); this.check();
  }
  up() { this.drawing = false; }
  check() {
    const c = this.cov.filter(Boolean).length / this.cov.length;
    if (c >= 0.92) {
      this.wait = true; this.drawing = false; this.cov.fill(true); this.sfx('star');
      this.pop(['Lindo!', 'Capricho!', 'Perfeito!'][this.k % 3], this.w / 2, this.h * 0.18, C.green, 30);
      this.later(() => { this.wait = false; this.k++; this.upd(); if (this.k >= ORDEM.length) this.win(); else this.setCookie(); }, 1100);
    }
  }
  fail(x, y) {
    this.drawing = false; this.lives--; this.smudge = 1; this.sfx('bad');
    this.pop('Borrou!', x, y - 20, C.red, 24);
    this.upd();
    this.wait = true;
    this.later(() => { this.wait = false; if (this.lives <= 0) this.lose('Borrou 3 biscoitos.'); else this.setCookie(); }, 900);
  }
  update(dt) { this.smudge = Math.max(0, this.smudge - dt); }
  path(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
  draw(g) {
    const { w, h } = this;
    g.fillStyle = '#F4E7D7'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#E9D7C2'; for (let i = 0; i < 9; i++) g.fillRect(0, i * h / 9, w, 2);
    g.fillStyle = 'rgba(255,255,255,.75)'; rr(g, w * 0.08, h * 0.1, w * 0.84, h * 0.84, 40); g.fill();
    // biscoito
    g.lineJoin = 'round'; g.lineCap = 'round';
    this.path(g, this.big); g.fillStyle = '#D8A15E'; g.fill(); g.strokeStyle = '#B07A3C'; g.lineWidth = 4; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.12)'; this.path(g, this.big); g.fill();
    // guia
    g.setLineDash([6, 8]); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3; this.path(g, this.pts); g.stroke(); g.setLineDash([]);
    // glacê
    g.strokeStyle = GLACE[this.k % 6]; g.lineWidth = 9;
    g.shadowColor = 'rgba(0,0,0,.15)'; g.shadowBlur = 3;
    for (let i = 0; i < this.pts.length; i++) {
      const j = (i + 1) % this.pts.length;
      if (this.cov[i] && this.cov[j]) { g.beginPath(); g.moveTo(...this.pts[i]); g.lineTo(...this.pts[j]); g.stroke(); }
    }
    g.shadowBlur = 0;
    if (this.smudge > 0 && this.trail.length > 1) { g.globalAlpha = this.smudge; g.strokeStyle = '#F7B6C8'; g.lineWidth = 12; g.beginPath(); this.trail.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.globalAlpha = 1; }
    const c = Math.round(this.cov.filter(Boolean).length / this.cov.length * 100);
    text(g, `${c}%`, w / 2, h * 0.92, { size: 18, color: C.soft });
  }
}
