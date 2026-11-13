// Desafio do Dodô: liga os fios do varal de luzes. Gire os fios até acender todas as lâmpadas.
import { MiniGame, C, rr, text } from './base.js';

const N = 1, E = 2, S = 4, W = 8;
const DIRS = [[N, -1, 0, S], [E, 0, 1, W], [S, 1, 0, N], [W, 0, -1, E]];
const rot = m => ((m << 1) | (m >> 3)) & 15;
const ROUNDS = [[4, 4, 45], [5, 5, 60], [5, 6, 75]];

export class Fios extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, opts, hooks);
    this.round = 0; this.build();
  }
  build() {
    const [R, Cc, time] = ROUNDS[this.round];
    this.R = R; this.Cc = Cc; this.left = time; this.limit = time;
    const cells = Array.from({ length: R }, () => Array.from({ length: Cc }, () => ({ base: 0, r: 0, ang: 0 })));
    const sr = Math.floor(R / 2);
    const seen = new Set([sr + ',0']), stack = [[sr, 0]];
    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const opts = DIRS.filter(([, dr, dc]) => { const nr = r + dr, nc = c + dc; return nr >= 0 && nr < R && nc >= 0 && nc < Cc && !seen.has(nr + ',' + nc); });
      if (!opts.length) { stack.pop(); continue; }
      const [bit, dr, dc, back] = opts[Math.floor(Math.random() * opts.length)];
      cells[r][c].base |= bit; cells[r + dr][c + dc].base |= back;
      seen.add((r + dr) + ',' + (c + dc)); stack.push([r + dr, c + dc]);
    }
    cells[sr][0].base |= W; cells[sr][0].src = true;
    for (const row of cells) for (const cl of row) {
      cl.lamp = !cl.src && [N, E, S, W].filter(b => cl.base & b).length === 1;
      if (!cl.src) { cl.r = Math.floor(Math.random() * 4); cl.ang = cl.r; }
    }
    this.cells = cells; this.sr = sr;
    this.power();
    if (this.solved()) { const c = cells[0][Cc - 1]; c.r = (c.r + 1) % 4; c.ang = c.r; this.power(); }
    this.layout();
    this.upd();
  }
  mask(cl) { let m = cl.base; for (let i = 0; i < cl.r % 4; i++) m = rot(m); return m; }
  power() {
    for (const row of this.cells) for (const cl of row) cl.on = false;
    const q = [[this.sr, 0]]; this.cells[this.sr][0].on = true;
    while (q.length) {
      const [r, c] = q.shift(); const m = this.mask(this.cells[r][c]);
      for (const [bit, dr, dc, back] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (!(m & bit) || nr < 0 || nr >= this.R || nc < 0 || nc >= this.Cc) continue;
        const n = this.cells[nr][nc];
        if (!n.on && (this.mask(n) & back)) { n.on = true; q.push([nr, nc]); }
      }
    }
  }
  solved() { return this.cells.every(row => row.every(cl => cl.on)); }
  lamps() { let a = 0, b = 0; for (const row of this.cells) for (const cl of row) if (cl.lamp) { a++; if (cl.on) b++; } return [b, a]; }
  upd() { const [b, a] = this.lamps(); this.status({ progress: [this.round, ROUNDS.length], text: `Varal ${this.round + 1} de 3 · ${b}/${a} lâmpadas`, time: Math.ceil(this.left) }); }
  layout() {
    if (!this.cells) return;
    this.ts = Math.floor(Math.min((this.w - 60) / this.Cc, (this.h * 0.82) / this.R, 84));
    this.ox = (this.w - this.ts * this.Cc) / 2 + 14; this.oy = (this.h - this.ts * this.R) / 2;
  }
  down(x, y) {
    if (this.wait) return;
    const c = Math.floor((x - this.ox) / this.ts), r = Math.floor((y - this.oy) / this.ts);
    if (r < 0 || r >= this.R || c < 0 || c >= this.Cc) return;
    const cl = this.cells[r][c];
    if (cl.src) return;
    cl.r++; this.sfx('tap'); this.power(); this.upd();
    if (this.solved()) {
      this.wait = true; this.sfx('win'); this.pop('Acendeu!', this.w / 2, this.oy - 10, C.green, 30);
      this.later(() => { this.round++; this.wait = false; if (this.round >= ROUNDS.length) this.win(); else this.build(); }, 1300);
    }
  }
  update(dt) {
    for (const row of this.cells) for (const cl of row) cl.ang += (cl.r - cl.ang) * Math.min(1, dt * 16);
    if (this.wait) return;
    const before = Math.ceil(this.left);
    this.left -= dt;
    if (Math.ceil(this.left) !== before) this.upd();
    if (this.left <= 0) this.lose('O tempo acabou antes de acender tudo.');
  }
  draw(g) {
    const { w, h, ts } = this;
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#2E2A4F'); bg.addColorStop(1, '#4A3E6B');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 30; i++) { const x = (i * 97) % w, y = (i * 53) % (h * 0.9); g.fillRect(x, y, 2, 2); }
    // tomada
    const sy = this.oy + this.sr * ts + ts / 2;
    g.fillStyle = '#F4F2EE'; rr(g, this.ox - 40, sy - 20, 30, 40, 8); g.fill();
    g.fillStyle = '#3B2A3F'; g.fillRect(this.ox - 30, sy - 8, 3, 9); g.fillRect(this.ox - 22, sy - 8, 3, 9);
    for (let r = 0; r < this.R; r++) for (let c = 0; c < this.Cc; c++) {
      const cl = this.cells[r][c], x = this.ox + c * ts, y = this.oy + r * ts;
      g.fillStyle = 'rgba(255,255,255,.08)'; rr(g, x + 3, y + 3, ts - 6, ts - 6, 12); g.fill();
      g.save(); g.translate(x + ts / 2, y + ts / 2); g.rotate(cl.ang * Math.PI / 2);
      g.lineCap = 'round';
      const col = cl.on ? '#FFC23D' : '#9D93B3';
      if (cl.on) { g.shadowColor = '#FFC23D'; g.shadowBlur = 10; }
      g.strokeStyle = col; g.lineWidth = Math.max(5, ts * 0.12);
      [[N, 0, -1], [E, 1, 0], [S, 0, 1], [W, -1, 0]].forEach(([b, dx, dy]) => { if (cl.base & b) { g.beginPath(); g.moveTo(0, 0); g.lineTo(dx * ts / 2, dy * ts / 2); g.stroke(); } });
      g.shadowBlur = 0;
      g.fillStyle = col; g.beginPath(); g.arc(0, 0, ts * 0.08, 0, 7); g.fill();
      g.restore();
      if (cl.lamp) {
        const lx = x + ts / 2, ly = y + ts / 2;
        if (cl.on) { const gl = g.createRadialGradient(lx, ly, 2, lx, ly, ts * 0.5); gl.addColorStop(0, 'rgba(255,230,140,.9)'); gl.addColorStop(1, 'rgba(255,230,140,0)'); g.fillStyle = gl; g.beginPath(); g.arc(lx, ly, ts * 0.5, 0, 7); g.fill(); }
        g.fillStyle = cl.on ? '#FFE9A0' : '#6E6488'; g.beginPath(); g.arc(lx, ly, ts * 0.2, 0, 7); g.fill();
        g.strokeStyle = cl.on ? '#FFFFFF' : '#8E84A8'; g.lineWidth = 2; g.stroke();
      }
      if (cl.src) { g.fillStyle = '#3FA466'; g.beginPath(); g.arc(x + ts / 2, y + ts / 2, ts * 0.16, 0, 7); g.fill(); text(g, '⚡', x + ts / 2, y + ts / 2 + 1, { size: ts * 0.22, color: '#FFF' }); }
    }
  }
}
