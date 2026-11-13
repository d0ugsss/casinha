// Desafio do pai do Dodô: revisão relâmpago. Toque nos parafusos na ordem certa e troque 3 pneus.
import { MiniGame, C, text, rr, shuffle, face, circleImg } from './base.js';

export class Pitstop extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, opts, hooks);
    this.limit = opts.time || 42; this.left = this.limit; this.tire = 0; this.shake = 0; this.slide = 0;
    this.pf = face('pai_mecanico');
    this.phase('solta');
  }
  phase(p) {
    this.ph = p; this.nextN = 1;
    this.nums = shuffle([1, 2, 3, 4, 5]);
    this.done = [false, false, false, false, false];
    this.upd();
  }
  upd() { this.status({ progress: [this.tire, 3], text: `Pneu ${Math.min(3, this.tire + 1)} de 3 · ${this.ph === 'aperta' ? 'aperte' : 'solte'} os parafusos`, time: Math.max(0, Math.ceil(this.left)) }); }
  geo() { const R = Math.min(this.w, this.h) * 0.3; return { cx: this.w / 2, cy: this.h * 0.56, R, br: R * 0.13, bd: R * 0.46 }; }
  boltPos(i) { const { cx, cy, bd } = this.geo(), a = -Math.PI / 2 + i * Math.PI * 2 / 5; return [cx + Math.cos(a) * bd, cy + Math.sin(a) * bd]; }
  down(x, y) {
    if (this.ph === 'troca') return;
    const { br } = this.geo();
    for (let i = 0; i < 5; i++) {
      const [bx, by] = this.boltPos(i);
      if (Math.hypot(x - bx, y - by) > br * 1.7 || this.done[i]) continue;
      if (this.nums[i] === this.nextN) {
        this.done[i] = true; this.nextN++; this.sfx('pop', this.nextN);
        if (this.nextN > 5) {
          if (this.ph === 'solta') { this.ph = 'troca'; this.slide = 0; this.sfx('swap'); this.upd(); }
          else { this.tire++; this.sfx('star'); this.pop('Apertado!', this.w / 2, this.h * 0.2, C.green, 28); if (this.tire >= 3) { this.ph = 'fim'; this.later(() => this.win(), 600); } else { this.ph = 'troca'; this.slide = 0; this.next = true; } this.upd(); }
        }
      } else { this.left -= 2; this.shake = 0.35; this.sfx('bad'); this.pop('-2s', bx, by - 30, C.red, 22); this.upd(); }
      return;
    }
  }
  update(dt) {
    this.shake = Math.max(0, this.shake - dt);
    if (this.ph === 'troca') {
      this.slide += dt / 0.9;
      if (this.slide >= 1) { const wasNext = this.next; this.next = false; this.phase(wasNext ? 'solta' : 'aperta'); }
    }
    if (this.ph === 'fim') return;
    const before = Math.ceil(this.left);
    this.left -= dt;
    if (Math.ceil(this.left) !== before) this.upd();
    if (this.left <= 0) this.lose('O relógio acabou antes dos 3 pneus.');
  }
  draw(g) {
    const { w, h } = this, { cx, cy, R, br } = this.geo();
    g.fillStyle = '#E9E4DC'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3B3B3E'; g.fillRect(0, h * 0.82, w, h);
    g.fillStyle = '#F2C230'; for (let x = 0; x < w; x += 60) g.fillRect(x, h * 0.86, 30, 6);
    // carro
    g.fillStyle = '#C0392B'; rr(g, -20, cy - R * 1.55, w + 40, R * 1.2, 40); g.fill();
    g.fillStyle = '#BFE3F0'; rr(g, w * 0.12, cy - R * 1.45, w * 0.3, R * 0.5, 14); g.fill(); rr(g, w * 0.58, cy - R * 1.45, w * 0.3, R * 0.5, 14); g.fill();
    g.fillStyle = '#2B1F1F'; g.beginPath(); g.arc(cx, cy, R * 1.12, Math.PI, 0); g.fill();
    // pneu (desliza na troca)
    let off = 0;
    if (this.ph === 'troca') off = this.slide < 0.5 ? this.slide * 2 * h * 0.6 : (1 - this.slide) * 2 * h * 0.6;
    const sx = this.shake > 0 ? Math.sin(this.t * 80) * 6 : 0;
    g.save(); g.translate(sx, off);
    g.fillStyle = '#1F1F22'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    g.strokeStyle = '#2E2E33'; g.lineWidth = R * 0.08; for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86); g.lineTo(cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98); g.stroke(); }
    g.fillStyle = '#B9BEC4'; g.beginPath(); g.arc(cx, cy, R * 0.68, 0, 7); g.fill();
    g.fillStyle = '#9AA0A7'; g.beginPath(); g.arc(cx, cy, R * 0.22, 0, 7); g.fill();
    if (this.ph !== 'troca') for (let i = 0; i < 5; i++) {
      const [bx, by] = this.boltPos(i), on = this.ph === 'solta' ? !this.done[i] : this.done[i];
      g.fillStyle = on ? '#E1E5E9' : 'rgba(40,40,45,.55)'; g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill();
      g.strokeStyle = on ? '#7D848C' : 'rgba(255,255,255,.4)'; g.lineWidth = 3; g.stroke();
      const show = this.ph === 'solta' ? on : !on;
      if (show) text(g, String(this.nums[i]), bx, by + 1, { size: br * 1.15, color: C.ink });
    }
    g.restore();
    circleImg(g, this.pf, 40, h * 0.9, 26);
    text(g, this.ph === 'troca' ? 'Troca o pneu!' : this.ph === 'solta' ? 'Solte na ordem: 1, 2, 3, 4, 5' : 'Aperte na ordem: 1, 2, 3, 4, 5', w / 2 + 16, h * 0.9, { size: 16, color: '#FFFFFF', font: 'Nunito, sans-serif' });
  }
}
