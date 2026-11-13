// URGENTE 3 da Margarida: corredor lotado. Leve a maca até a sala vermelha desviando de tudo.
import { MiniGame, C, text, emoji, rr } from './base.js';

const COISAS = ['🛒', '🦽', '⚠️', '🪣', 'pessoa', 'pessoa'];
const ROUPAS = ['#5D8FD8', '#F28DB2', '#6DBA5A', '#9A73E0', '#E8B06A'];

export class Corredor extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, opts, hooks);
    this.lane = 1; this.px = 0.5; this.lives = 3; this.dist = 0; this.obs = []; this.gap = 0.6; this.inv = 0;
    this.goalD = opts.dist || 26;
    this.upd();
  }
  lx(l) { return this.w * (0.27 + l * 0.23); }
  upd() { const k = Math.min(1, this.dist / this.goalD); this.status({ progress: [Math.round(k * 100), 100], lives: [this.lives, 3], text: `Sala vermelha: ${Math.round(k * 100)}%` }); }
  down(x) { this.sx = x; this.moved = false; }
  move(x) { if (this.sx === undefined || this.moved) return; if (Math.abs(x - this.sx) > 28) { this.shift(x > this.sx ? 1 : -1); this.moved = true; } }
  up(x) { if (!this.moved && this.sx !== undefined) this.shift(x > this.w / 2 ? 1 : -1); this.sx = undefined; }
  shift(d) { const n = Math.max(0, Math.min(2, this.lane + d)); if (n !== this.lane) { this.lane = n; this.sfx('swap'); } }
  speed() { return 0.5 + Math.min(1, this.dist / this.goalD) * 0.75; } // telas por segundo
  update(dt) {
    if (this.arrived) return;
    const v = this.speed();
    this.dist += v * dt; this.inv = Math.max(0, this.inv - dt);
    this.px += (this.lx(this.lane) / this.w - this.px) * Math.min(1, dt * 14);
    this.gap -= v * dt;
    if (this.gap <= 0 && this.dist < this.goalD - 1.2) {
      const free = Math.floor(Math.random() * 3);
      const lanes = [0, 1, 2].filter(l => l !== free && Math.random() < 0.55 + Math.min(0.3, this.dist / this.goalD * 0.3));
      if (!lanes.length) lanes.push((free + 1 + Math.floor(Math.random() * 2)) % 3);
      lanes.forEach(l => this.obs.push({ l, y: -0.1, k: COISAS[Math.floor(Math.random() * COISAS.length)], c: ROUPAS[Math.floor(Math.random() * ROUPAS.length)] }));
      this.gap = 0.42 + Math.random() * 0.25 - Math.min(0.12, this.dist / this.goalD * 0.12);
    }
    const py = 0.8;
    this.obs = this.obs.filter(o => {
      o.y += v * dt;
      if (!o.hit && this.inv <= 0 && o.l === this.lane && Math.abs(o.y - py) < 0.07) {
        o.hit = true; this.lives--; this.inv = 1.0; this.sfx('bad');
        this.pop('Ai!', this.lx(this.lane), this.h * 0.7, C.red, 26); this.upd();
        if (this.lives <= 0) this.lose('Bateu 3 vezes no corredor.');
      }
      return o.y < 1.2;
    });
    this.tk = (this.tk || 0) + dt; if (this.tk > 0.3) { this.tk = 0; this.upd(); }
    if (this.dist >= this.goalD) { this.arrived = true; this.upd(); this.sfx('star'); this.pop('Chegou!', this.w / 2, this.h * 0.4, C.green, 34); this.later(() => this.win(), 900); }
  }
  person(g, x, y, c) {
    g.fillStyle = c; rr(g, x - 14, y - 6, 28, 30, 10); g.fill();
    g.fillStyle = '#E2B48C'; g.beginPath(); g.arc(x, y - 16, 11, 0, 7); g.fill();
  }
  draw(g) {
    const { w, h } = this;
    g.fillStyle = '#DCE6EA'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#C7D6DC'; g.fillRect(0, 0, w * 0.12, h); g.fillRect(w * 0.88, 0, w * 0.12, h);
    const off = (this.dist * h) % 80;
    g.fillStyle = 'rgba(255,255,255,.55)'; for (let y = -80 + off; y < h; y += 80) g.fillRect(w * 0.12, y, w * 0.76, 3);
    g.fillStyle = 'rgba(93,143,216,.35)'; for (let y = -240 + (this.dist * h) % 240; y < h; y += 240) { g.fillRect(0, y, w * 0.1, 70); g.fillRect(w * 0.9, y + 120, w * 0.1, 70); }
    g.fillStyle = 'rgba(59,42,63,.08)'; g.fillRect(w * 0.385, 0, 3, h); g.fillRect(w * 0.615, 0, 3, h);
    // porta da sala vermelha chegando
    const rem = this.goalD - this.dist;
    if (rem < 1.3) {
      const y = h * (0.8 - rem * 0.9) - 70;
      g.fillStyle = '#D93A3A'; rr(g, w * 0.2, y, w * 0.6, 64, 12); g.fill();
      text(g, 'SALA VERMELHA', w / 2, y + 33, { size: 22, color: '#FFFFFF' });
    }
    this.obs.forEach(o => {
      const x = this.lx(o.l), y = o.y * h;
      g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(x, y + 22, 26, 8, 0, 0, 7); g.fill();
      if (o.k === 'pessoa') this.person(g, x, y, o.c); else emoji(g, o.k, x, y, 46);
    });
    // maca
    const x = this.px * w, y = h * 0.8;
    if (this.inv > 0 && Math.floor(this.t * 12) % 2) g.globalAlpha = 0.4;
    g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(x, y + 46, 34, 9, 0, 0, 7); g.fill();
    g.fillStyle = '#9AA3A8'; rr(g, x - 30, y - 50, 60, 100, 12); g.fill();
    g.fillStyle = '#FFFFFF'; rr(g, x - 25, y - 44, 50, 88, 10); g.fill();
    g.fillStyle = '#BFE3F0'; rr(g, x - 23, y - 8, 46, 48, 8); g.fill();
    g.fillStyle = '#E2B48C'; g.beginPath(); g.arc(x, y - 26, 12, 0, 7); g.fill();
    g.fillStyle = '#D93A3A'; g.fillRect(x - 4, y + 6, 8, 20); g.fillRect(x - 10, y + 12, 20, 8);
    g.globalAlpha = 1;
  }
}
