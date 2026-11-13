// Desafio do Milton: Encaixe (tipo Tetris). Cada linha completa assenta uma pedra do caminho.
import { sfx } from '../audio.js';

const COLS = 10, ROWS = 16;
const SHAPES = {
  I: [[0, 1], [1, 1], [2, 1], [3, 1]], O: [[1, 0], [2, 0], [1, 1], [2, 1]], T: [[1, 0], [0, 1], [1, 1], [2, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]]
};
const COLORS = { I: '#B9B4AA', O: '#C9A57A', T: '#A39E94', S: '#9FB08A', Z: '#C49A8A', J: '#8F9AA8', L: '#D4C3A3' };

export class Encaixe {
  constructor(host, opts, hooks) {
    this.host = host;
    this.goal = opts.lines || 6;
    this.speed = opts.speed || 720;
    this.hooks = hooks;
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.lines = 0;
    this.bag = [];
    this.over = false;
    this.flash = null;
    this.cv = document.createElement('canvas');
    host.append(this.cv);
    this.g = this.cv.getContext('2d');
    this.resize();
    this.spawn();
    this.bindTouch();
    this.loop = this.loop.bind(this);
  }

  resize() {
    const r = this.host.getBoundingClientRect();
    const cs = Math.floor(Math.min((r.width - 24) / COLS, (r.height - 8) / ROWS, 30));
    this.cs = Math.max(14, cs);
    const d = Math.min(window.devicePixelRatio || 1, 3);
    this.cv.width = COLS * this.cs * d; this.cv.height = ROWS * this.cs * d;
    this.cv.style.width = COLS * this.cs + 'px'; this.cv.style.height = ROWS * this.cs + 'px';
    this.d = d;
  }

  next() {
    if (!this.bag.length) { this.bag = Object.keys(SHAPES); for (let i = this.bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]; } }
    return this.bag.pop();
  }

  spawn() {
    const k = this.next();
    this.cur = { k, cells: SHAPES[k].map(c => c.slice()), x: 3, y: 0 };
    if (this.collides(this.cur.cells, this.cur.x, this.cur.y)) { this.over = true; sfx.lose(); this.hooks.onLose && this.hooks.onLose(); }
  }

  collides(cells, x, y) {
    return cells.some(([cx, cy]) => { const gx = cx + x, gy = cy + y; return gx < 0 || gx >= COLS || gy >= ROWS || (gy >= 0 && this.grid[gy][gx]); });
  }

  move(dx) { if (this.over || this.flash) return; if (!this.collides(this.cur.cells, this.cur.x + dx, this.cur.y)) { this.cur.x += dx; sfx.tap(); } }
  rotate() {
    if (this.over || this.flash || this.cur.k === 'O') return;
    const size = this.cur.k === 'I' ? 4 : 3;
    const rot = this.cur.cells.map(([x, y]) => [size - 1 - y, x]);
    for (const kick of [0, -1, 1, -2, 2]) {
      if (!this.collides(rot, this.cur.x + kick, this.cur.y)) { this.cur.cells = rot; this.cur.x += kick; sfx.swap(); return; }
    }
  }
  drop() {
    if (this.over || this.flash) return;
    while (!this.collides(this.cur.cells, this.cur.x, this.cur.y + 1)) this.cur.y++;
    this.lock();
  }
  soft() { if (this.over || this.flash) return; if (!this.collides(this.cur.cells, this.cur.x, this.cur.y + 1)) this.cur.y++; else this.lock(); }

  lock() {
    this.cur.cells.forEach(([cx, cy]) => { const gy = cy + this.cur.y; if (gy >= 0) this.grid[gy][cx + this.cur.x] = this.cur.k; });
    sfx.box();
    const full = [];
    for (let y = 0; y < ROWS; y++) if (this.grid[y].every(Boolean)) full.push(y);
    if (full.length) {
      this.flash = { rows: full, t: 0 };
      sfx.pop(full.length);
    } else this.spawn();
  }

  clearRows(rows) {
    rows.sort((a, b) => a - b).forEach(y => { this.grid.splice(y, 1); this.grid.unshift(Array(COLS).fill(null)); });
    this.lines += rows.length;
    this.speed = Math.max(380, this.speed - 35 * rows.length);
    this.hooks.onLines && this.hooks.onLines(this.lines, this.goal);
    if (this.lines >= this.goal) { this.over = true; sfx.win(); this.hooks.onWin && this.hooks.onWin(); return; }
    this.spawn();
  }

  start() { this.running = true; this.last = performance.now(); this.acc = 0; requestAnimationFrame(this.loop); }
  stop() { this.running = false; }

  loop(now) {
    if (!this.running) return;
    const dt = this.paused ? 0 : now - this.last; this.last = now;
    if (this.flash) {
      this.flash.t += dt;
      if (this.flash.t > 260) { const rows = this.flash.rows; this.flash = null; this.clearRows(rows); }
    } else if (!this.over) {
      this.acc += dt;
      if (this.acc >= this.speed) { this.acc = 0; if (!this.collides(this.cur.cells, this.cur.x, this.cur.y + 1)) this.cur.y++; else this.lock(); }
    }
    this.draw();
    requestAnimationFrame(this.loop);
  }

  stone(x, y, color, alpha = 1) {
    const g = this.g, cs = this.cs;
    g.globalAlpha = alpha;
    g.fillStyle = color;
    rr(g, x * cs + 1, y * cs + 1, cs - 2, cs - 2, cs * 0.22); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)';
    rr(g, x * cs + 3, y * cs + 3, cs - 8, cs * 0.3, cs * 0.15); g.fill();
    g.fillStyle = 'rgba(0,0,0,.12)';
    rr(g, x * cs + 3, y * cs + cs * 0.68, cs - 6, cs * 0.25, cs * 0.12); g.fill();
    g.globalAlpha = 1;
  }

  draw() {
    const g = this.g, cs = this.cs;
    g.setTransform(this.d, 0, 0, this.d, 0, 0);
    g.fillStyle = '#7DBF6A'; g.fillRect(0, 0, COLS * cs, ROWS * cs);
    g.fillStyle = 'rgba(255,255,255,.08)';
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if ((x + y) % 2) g.fillRect(x * cs, y * cs, cs, cs);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const k = this.grid[y][x];
      if (k) this.stone(x, y, COLORS[k], this.flash && this.flash.rows.includes(y) ? 0.4 + Math.sin(this.flash.t / 30) * 0.4 : 1);
    }
    if (!this.over && !this.flash) this.cur.cells.forEach(([cx, cy]) => { if (cy + this.cur.y >= 0) this.stone(cx + this.cur.x, cy + this.cur.y, COLORS[this.cur.k]); });
  }

  bindTouch() {
    let s = null;
    this.cv.addEventListener('pointerdown', e => { e.preventDefault(); s = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 }; });
    this.onMove = e => {
      if (!s) return;
      const dx = e.clientX - s.x;
      const step = this.cs * 0.9;
      while (dx - s.moved * step > step) { this.move(1); s.moved++; }
      while (dx - s.moved * step < -step) { this.move(-1); s.moved--; }
    };
    this.onUp = e => {
      if (!s) return;
      const dy = e.clientY - s.y, dx = e.clientX - s.x;
      if (dy > this.cs * 2.5 && Math.abs(dy) > Math.abs(dx)) this.drop();
      else if (!s.moved && Math.abs(dx) < 8 && Math.abs(dy) < 8) this.rotate();
      s = null;
    };
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
  }

  devWin() { this.lines = this.goal - 1; this.clearRows([ROWS - 1]); }

  destroy() {
    this.stop();
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    this.cv.remove();
  }
}

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
