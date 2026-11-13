// Motor de combinar 3 (tabuleiro, regras, animações e desenho no canvas)
import { sprite } from './pieces.js';
import { sfx } from './audio.js';
import { SHAPES } from './data.js';

const R = 8, C = 8;
const ALL_COLORS = ['a', 'x', 'p', 'l', 'b', 'h'];
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const PARTICLE_COLORS = { a: '#FF8DBA', x: '#7DB6FF', p: '#6DCB62', l: '#B48CF2', b: '#FFD84A', h: '#FF5470' };

function makeRng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
export const TEST = { fast: false };
const wait = ms => new Promise(r => setTimeout(r, TEST.fast ? 0 : ms));
let PID = 1;

export class Match3 {
  constructor(canvas, level, hooks = {}) {
    this.cv = canvas;
    this.g2 = canvas.getContext('2d');
    this.level = level;
    this.hooks = hooks;
    this.colors = ALL_COLORS.slice(0, level.colors || 5);
    this.rand = makeRng(level.n * 7919 + 17);
    this.live = makeRng(Date.now() & 0xffff);
    this.moves = level.moves;
    this.busy = false;
    this.over = false;
    this.booster = null;
    this.fx = [];
    this.parts = [];
    this.waiters = [];
    this.shake = 0;
    this.build();
    this.bind();
    this.resize();
    this.running = true;
    this.last = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  // ---------- montagem do tabuleiro ----------
  build() {
    const mask = this.level.shape ? SHAPES[this.level.shape] : null;
    this.cells = [];
    for (let r = 0; r < R; r++) {
      const row = [];
      for (let c = 0; c < C; c++) {
        row.push({ r, c, on: mask ? mask[r][c] === '#' : true, dirt: 0, dirtKind: 0, box: 0, boxHpl: 1, boxKind: null, mud: false, tape: false, piece: null });
      }
      this.cells.push(row);
    }
    const on = [];
    this.forCells(cell => { if (cell.on) on.push(cell); });
    this.onCount = on.length;
    const rnd = this.rand;
    const free = cell => cell.on && !cell.box && !cell.mud;
    const pickSym = (n, score, ok) => {
      const left = on.filter(cl => cl.c < C / 2 && ok(cl)).map(cl => ({ cl, s: score(cl) + rnd() * 2 })).sort((p, q) => p.s - q.s);
      const out = [];
      for (const { cl } of left) {
        if (out.length >= n) break;
        const m = this.cells[cl.r][C - 1 - cl.c];
        out.push(cl);
        if (out.length < n && m.on && ok(m)) out.push(m);
      }
      return out;
    };
    this.goals = [];
    const goalDefs = this.level.g;
    const blockCap = Math.floor(this.onCount * 0.45);
    let blocked = 0;
    for (const g of goalDefs) {
      const [t] = g;
      if (t === 'box' || t === 'box2') {
        const n = g[1];
        const cellsN = Math.min(n, 22, blockCap - blocked);
        const picked = pickSym(cellsN, cl => Math.abs(cl.r - 3.2) * 10 + Math.abs(cl.c - 3.5) * 2, free);
        let rest = n;
        picked.forEach((cl, i) => {
          const layers = Math.max(1, Math.round(rest / (picked.length - i)));
          rest -= layers;
          cl.boxKind = t; cl.boxHpl = t === 'box2' ? 2 : 1; cl.box = layers * cl.boxHpl;
        });
        blocked += picked.length;
        const total = picked.reduce((s, cl) => s + cl.box / cl.boxHpl, 0);
        this.goals.push({ type: t, need: total, got: 0 });
      }
    }
    for (const g of goalDefs) {
      if (g[0] === 'mud') {
        const n = Math.min(g[1], 20, blockCap - blocked);
        const picked = pickSym(n, cl => (R - 1 - cl.r) * 8 + (3.5 - Math.abs(cl.c - 3.5)) * 7, free);
        picked.forEach(cl => { cl.mud = true; });
        blocked += picked.length;
        this.goals.push({ type: 'mud', need: picked.length, got: 0 });
      }
    }
    for (const g of goalDefs) {
      const [t] = g;
      if (t === 'dirt' || t === 'dirt2') {
        const lv = t === 'dirt2' ? 2 : 1;
        const n = Math.min(g[1], Math.floor(this.onCount * 0.85));
        // espalha a sujeira pelo meio/baixo do tabuleiro (não só na última linha, que é a mais difícil de alcançar)
        const picked = pickSym(n, cl => Math.abs(cl.r - 4.6) * 4 + Math.abs(cl.c - 3.5) * 1.5, cl => free(cl) && !cl.dirt);
        picked.forEach(cl => { cl.dirt = lv; cl.dirtKind = lv; });
        this.goals.push({ type: t, need: picked.length, got: 0 });
      }
    }
    const tapeN = goalDefs.filter(g => g[0] === 'tape').reduce((s, g) => s + g[1], 0) || this.level.tapes || 0;
    if (tapeN) {
      const n = Math.min(tapeN, 24);
      const picked = pickSym(n, cl => Math.abs(cl.r - 4) * 4 + Math.abs(cl.c - 3.5) * 3, cl => free(cl) && cl.r > 0);
      picked.forEach(cl => { cl.tape = true; });
      if (goalDefs.some(g => g[0] === 'tape')) this.goals.push({ type: 'tape', need: picked.length, got: 0 });
    }
    for (const g of goalDefs) {
      if (g[0] === 'c') this.goals.push({ type: 'c', key: g[1], need: g[2], got: 0 });
      if (g[0] === 'make') this.goals.push({ type: 'make', key: g[1], need: g[2], got: 0 });
      if (g[0] === 'bone') this.goals.push({ type: 'bone', need: g[1], got: 0 });
    }
    this.fillInitial();
  }

  forCells(fn) { for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) fn(this.cells[r][c]); }
  at(r, c) { return r >= 0 && r < R && c >= 0 && c < C ? this.cells[r][c] : null; }
  fixed(cell) { return !!(cell.box || cell.mud || cell.tape); }
  holds(cell) { return cell.on && !cell.box && !cell.mud; }
  movable(cell) { return cell && cell.on && cell.piece && !cell.tape && !cell.box && !cell.mud; }

  newPiece(k, r, c, extra = {}) {
    return { id: PID++, k, sp: null, bone: false, x: c, y: r, s: 1, a: 1, ...extra };
  }

  fillInitial() {
    for (let tries = 0; tries < 60; tries++) {
      this.forCells(cell => {
        if (!this.holds(cell)) return;
        let k, guard = 0;
        do { k = this.colors[Math.floor(this.rand() * this.colors.length)]; guard++; }
        while (guard < 20 && this.wouldMatch(cell.r, cell.c, k));
        cell.piece = this.newPiece(k, cell.r, cell.c);
      });
      const bone = this.goals.find(g => g.type === 'bone');
      if (bone) {
        const tops = [];
        for (let c = 0; c < C; c++) { const cl = this.topCell(c); if (cl && cl.piece && !cl.tape) tops.push(cl); }
        for (let i = 0; i < Math.min(2, bone.need) && tops.length; i++) {
          const cl = tops.splice(Math.floor(this.rand() * tops.length), 1)[0];
          cl.piece = this.newPiece(null, cl.r, cl.c, { bone: true });
        }
      }
      if (this.hasMoves()) return;
    }
  }

  topCell(c) { for (let r = 0; r < R; r++) { const cl = this.cells[r][c]; if (cl.on) return this.holds(cl) ? cl : null; } return null; }

  wouldMatch(r, c, k) {
    const kAt = (rr, cc) => { const cl = this.at(rr, cc); return cl && cl.piece && !cl.piece.sp && !cl.piece.bone ? cl.piece.k : null; };
    if (kAt(r, c - 1) === k && kAt(r, c - 2) === k) return true;
    if (kAt(r - 1, c) === k && kAt(r - 2, c) === k) return true;
    return false;
  }

  // ---------- regras ----------
  kOf(cell) { return cell && cell.on && cell.piece && !cell.piece.sp && !cell.piece.bone && !cell.box && !cell.mud ? cell.piece.k : null; }

  findGroups() {
    const runs = [];
    for (let r = 0; r < R; r++) {
      let c = 0;
      while (c < C) {
        const k = this.kOf(this.cells[r][c]);
        let e = c + 1;
        if (k) while (e < C && this.kOf(this.cells[r][e]) === k) e++;
        if (k && e - c >= 3) runs.push({ k, dir: 'h', cells: Array.from({ length: e - c }, (_, i) => this.cells[r][c + i]) });
        c = k ? e : c + 1;
      }
    }
    for (let c = 0; c < C; c++) {
      let r = 0;
      while (r < R) {
        const k = this.kOf(this.cells[r][c]);
        let e = r + 1;
        if (k) while (e < R && this.kOf(this.cells[e][c]) === k) e++;
        if (k && e - r >= 3) runs.push({ k, dir: 'v', cells: Array.from({ length: e - r }, (_, i) => this.cells[r + i][c]) });
        r = k ? e : r + 1;
      }
    }
    // junta corridas que se cruzam (L / T)
    const groups = [];
    const used = new Array(runs.length).fill(false);
    for (let i = 0; i < runs.length; i++) {
      if (used[i]) continue;
      const g = { k: runs[i].k, runs: [runs[i]], cells: new Set(runs[i].cells) };
      used[i] = true;
      let grew = true;
      while (grew) {
        grew = false;
        for (let j = 0; j < runs.length; j++) {
          if (used[j] || runs[j].k !== g.k) continue;
          if (runs[j].cells.some(cl => g.cells.has(cl))) { used[j] = true; g.runs.push(runs[j]); runs[j].cells.forEach(cl => g.cells.add(cl)); grew = true; }
        }
      }
      groups.push(g);
    }
    // quadradinhos 2x2 (aviãozinho)
    const inGroup = new Set();
    groups.forEach(g => g.cells.forEach(cl => inGroup.add(cl)));
    for (let r = 0; r < R - 1; r++) for (let c = 0; c < C - 1; c++) {
      const q = [this.cells[r][c], this.cells[r][c + 1], this.cells[r + 1][c], this.cells[r + 1][c + 1]];
      const k = this.kOf(q[0]);
      if (!k || !q.every(cl => this.kOf(cl) === k)) continue;
      const touching = groups.find(g => g.k === k && q.some(cl => g.cells.has(cl)));
      if (touching) { if (!touching.square) { touching.square = true; q.forEach(cl => touching.cells.add(cl)); } continue; }
      if (q.some(cl => inGroup.has(cl))) continue;
      const g = { k, runs: [], cells: new Set(q), square: true };
      q.forEach(cl => inGroup.add(cl));
      groups.push(g);
    }
    return groups;
  }

  specialFor(g) {
    const maxRun = Math.max(0, ...g.runs.map(r => r.cells.length));
    const hasH = g.runs.some(r => r.dir === 'h'), hasV = g.runs.some(r => r.dir === 'v');
    if (maxRun >= 5) return 'rainbow';
    if (hasH && hasV) return 'bomb';
    if (maxRun === 4) return g.runs.find(r => r.cells.length === 4).dir === 'h' ? 'rocketH' : 'rocketV';
    if (g.square) return 'plane';
    return null;
  }

  hasMoves() {
    let any = false;
    this.forCells(cl => { if (this.movable(cl) && cl.piece.sp) any = true; });
    if (any) return true;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const a = this.cells[r][c];
      if (!this.movable(a)) continue;
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const b = this.at(r + dr, c + dc);
        if (!this.movable(b)) continue;
        this.swapPieces(a, b);
        const ok = this.matchAt(a) || this.matchAt(b);
        this.swapPieces(a, b);
        if (ok) return true;
      }
    }
    return false;
  }

  matchAt(cell) {
    const k = this.kOf(cell);
    if (!k) return false;
    const count = (dr, dc) => { let n = 0, r = cell.r + dr, c = cell.c + dc; while (this.kOf(this.at(r, c)) === k) { n++; r += dr; c += dc; } return n; };
    if (count(0, 1) + count(0, -1) >= 2) return true;
    if (count(1, 0) + count(-1, 0) >= 2) return true;
    for (const [dr, dc] of [[0, 0], [0, -1], [-1, 0], [-1, -1]]) {
      const r = cell.r + dr, c = cell.c + dc;
      const q = [this.at(r, c), this.at(r, c + 1), this.at(r + 1, c), this.at(r + 1, c + 1)];
      if (q.every(cl => this.kOf(cl) === k)) return true;
    }
    return false;
  }

  swapPieces(a, b) { const t = a.piece; a.piece = b.piece; b.piece = t; }

  // ---------- jogadas ----------
  async trySwap(a, b) {
    if (this.busy || this.over || !a || !b) return;
    if (!this.movable(a) || !this.movable(b)) { this.nudge(a); sfx.bad(); return; }
    const pa = a.piece, pb = b.piece;
    this.busy = true;
    sfx.swap();
    this.swapPieces(a, b);
    await this.settle();
    if (pa.sp || pb.sp) {
      this.spendMove();
      await this.comboOrActivate(a, b);
      await this.resolve(null);
      return;
    }
    if (!this.matchAt(a) && !this.matchAt(b)) {
      sfx.bad();
      this.swapPieces(a, b);
      await this.settle();
      this.busy = false;
      return;
    }
    this.spendMove();
    await this.resolve([a, b]);
  }

  async tap(cell) {
    if (this.busy || this.over || !cell || !cell.on) return;
    if (this.booster) { await this.useBooster(cell); return; }
    if (this.movable(cell) && cell.piece.sp) {
      this.busy = true;
      this.spendMove();
      await this.activate(cell);
      await this.resolve(null);
    } else if (cell.piece) {
      cell.piece.s = 0.85;
    }
  }

  spendMove() {
    this.moves--;
    this.mudCleared = 0;
    this.hooks.onMoves && this.hooks.onMoves(this.moves);
  }

  async resolve(swapCells) {
    this.busy = true;
    let combo = 0;
    for (let loop = 0; loop < 60; loop++) {
      const groups = this.findGroups();
      if (!groups.length) {
        if (this.collectBones()) { await this.gravity(); continue; }
        // especial ativado sozinho deixa buracos: faz as peças caírem antes de terminar a jogada
        const holes = this.countHoles();
        if (holes) { await this.gravity(); if (this.countHoles() < holes) continue; }
        break;
      }
      combo++;
      sfx.pop(combo);
      const clear = new Set();
      const adj = new Set();
      const creates = [];
      for (const g of groups) {
        const sp = this.specialFor(g);
        g.cells.forEach(cl => clear.add(cl));
        if (sp) {
          let spot = swapCells && swapCells.find(cl => g.cells.has(cl));
          if (!spot) { const arr = [...g.cells]; spot = arr[Math.floor(arr.length / 2)]; }
          creates.push({ cell: spot, sp });
          this.countMake(sp);
        }
        g.cells.forEach(cl => DIRS.forEach(([dr, dc]) => {
          const n = this.at(cl.r + dr, cl.c + dc);
          if (n && n.on && (n.box || n.mud) && !g.cells.has(n)) adj.add(n);
        }));
      }
      for (const cl of clear) this.hitCell(cl, { match: true });
      for (const cl of adj) this.hitCell(cl, { match: true });
      for (const cr of creates) {
        const cl = cr.cell;
        if (!cl.piece && this.holds(cl)) {
          cl.piece = this.newPiece(null, cl.r, cl.c, { sp: cr.sp, s: 0.2 });
          this.burst(cl.c + 0.5, cl.r + 0.5, '#FFD84A', 10);
        }
      }
      await wait(170);
      await this.runChain();
      await this.gravity();
      swapCells = null;
    }
    this.afterMove();
  }

  afterMove() {
    if (this.goals.some(g => g.type === 'mud') && this.mudCleared === 0 && this.moves >= 0) this.spreadMud();
    this.mudCleared = -1;
    this.hooks.onGoals && this.hooks.onGoals(this.goals);
    if (this.goals.every(g => g.got >= g.need)) { this.over = true; this.busy = false; this.hooks.onWin && this.hooks.onWin(); return; }
    if (this.moves <= 0) { this.over = true; this.busy = false; this.hooks.onLose && this.hooks.onLose(); return; }
    if (!this.hasMoves()) { this.shuffle(true); }
    this.busy = false;
  }

  countMake(sp) {
    const key = sp.startsWith('rocket') ? 'rocket' : sp;
    for (const g of this.goals) if (g.type === 'make' && g.key === key && g.got < g.need) { g.got++; this.flyToGoal(g); }
  }

  goal(type, key) { return this.goals.find(g => g.type === type && (key === undefined || g.key === key)); }

  credit(type, key, x, y) {
    const g = this.goal(type, key);
    if (g && g.got < g.need) {
      g.got++;
      this.hooks.onCredit && this.hooks.onCredit(g, x, y);
      this.hooks.onGoals && this.hooks.onGoals(this.goals);
    }
  }
  flyToGoal(g) { this.hooks.onGoals && this.hooks.onGoals(this.goals); }

  // Atinge uma casa (combinação, explosão, martelo)
  hitCell(cell, { match = false } = {}) {
    if (!cell || !cell.on) return;
    this.dirty = true;
    const x = cell.c + 0.5, y = cell.r + 0.5;
    if (cell.box) {
      cell.box--;
      sfx.box();
      this.burst(x, y, '#C9955B', 8);
      if (cell.box % cell.boxHpl === 0) this.credit(cell.boxKind, undefined, x, y);
      if (!cell.box) this.pop('box', x, y);
      return;
    }
    if (cell.mud) {
      cell.mud = false;
      this.mudCleared = (this.mudCleared || 0) + 1;
      this.pop('mud', x, y);
      this.burst(x, y, '#7A5530', 10);
      this.credit('mud', undefined, x, y);
      return;
    }
    const p = cell.piece;
    if (!p) return;
    if (p.bone) return;
    if (cell.tape) {
      cell.tape = false;
      this.pop('tape', x, y);
      this.credit('tape', undefined, x, y);
      if (!match) return;
    }
    if (p.sp) {
      if (!this.chain) this.chain = [];
      if (!p.queued) { p.queued = true; this.chain.push(cell); }
      return;
    }
    cell.piece = null;
    this.pop(p.k, x, y, p);
    this.burst(x, y, PARTICLE_COLORS[p.k] || '#fff', 6);
    this.credit('c', p.k, x, y);
    if (cell.dirt) {
      cell.dirt--;
      if (!cell.dirt) this.credit(cell.dirtKind === 2 ? 'dirt2' : 'dirt', undefined, x, y);
    }
  }

  async runChain() {
    while (this.chain && this.chain.length) {
      const cell = this.chain.shift();
      if (cell.piece && cell.piece.sp) { await this.activate(cell); }
    }
  }

  // Ativa uma peça especial que está na casa
  async activate(cell, forced) {
    const p = cell.piece;
    if (!p || !p.sp) return;
    const sp = forced || p.sp;
    cell.piece = null;
    const { r, c } = cell;
    this.pop(p.sp, c + 0.5, r + 0.5, p);
    if (cell.dirt) { cell.dirt--; if (!cell.dirt) this.credit(cell.dirtKind === 2 ? 'dirt2' : 'dirt', undefined, c + 0.5, r + 0.5); }
    if (sp === 'rocketH' || sp === 'rocketV') {
      sfx.special();
      this.fx.push({ type: 'beam', dir: sp === 'rocketH' ? 'h' : 'v', r, c, t: 0, dur: 0.35 });
      const targets = [];
      if (sp === 'rocketH') for (let cc = 0; cc < C; cc++) targets.push(this.at(r, cc));
      else for (let rr = 0; rr < R; rr++) targets.push(this.at(rr, c));
      await wait(90);
      targets.forEach(t => t !== cell && this.hitCell(t));
    } else if (sp === 'bomb') {
      sfx.boom();
      this.shake = 0.25;
      this.fx.push({ type: 'ring', x: c + 0.5, y: r + 0.5, rad: 1.8, t: 0, dur: 0.4 });
      await wait(80);
      for (let rr = r - 1; rr <= r + 1; rr++) for (let cc = c - 1; cc <= c + 1; cc++) { const t = this.at(rr, cc); if (t && t !== cell) this.hitCell(t); }
    } else if (sp === 'plane') {
      sfx.special();
      DIRS.forEach(([dr, dc]) => this.hitCell(this.at(r + dr, c + dc)));
      const target = this.planeTarget(cell);
      if (target) {
        await this.flyPlane(c + 0.5, r + 0.5, target.c + 0.5, target.r + 0.5);
        this.hitCell(target);
      }
    } else if (sp === 'rainbow') {
      sfx.special();
      const k = this.mostCommonColor();
      await this.clearColor(k, c, r);
    }
    await wait(120);
  }

  mostCommonColor() {
    const cnt = {};
    this.forCells(cl => { const k = this.kOf(cl); if (k) cnt[k] = (cnt[k] || 0) + 1; });
    let best = this.colors[0], n = -1;
    for (const [k, v] of Object.entries(cnt)) if (v > n) { best = k; n = v; }
    return best;
  }

  async clearColor(k, cx, cy) {
    const targets = [];
    this.forCells(cl => { if (this.kOf(cl) === k || (cl.tape && cl.piece && cl.piece.k === k)) targets.push(cl); });
    targets.forEach(t => this.fx.push({ type: 'zap', x0: cx + 0.5, y0: cy + 0.5, x1: t.c + 0.5, y1: t.r + 0.5, t: 0, dur: 0.35 }));
    await wait(220);
    targets.forEach(t => this.hitCell(t, { match: true }));
  }

  planeTarget(from) {
    const pri = [];
    const add = (cl, w) => pri.push({ cl, w: w + this.live() });
    const wantColors = this.goals.filter(g => g.type === 'c' && g.got < g.need).map(g => g.key);
    this.forCells(cl => {
      if (!cl.on || cl === from) return;
      if (cl.box && this.goals.some(g => g.type === cl.boxKind && g.got < g.need)) add(cl, 5);
      else if (cl.mud) add(cl, 5);
      else if (cl.tape) add(cl, 4);
      else if (cl.dirt && cl.piece && !cl.piece.sp && !cl.piece.bone) add(cl, 3 + cl.dirt);
      else if (cl.piece && wantColors.includes(cl.piece.k) && !cl.piece.sp) add(cl, 2);
      else if (cl.piece && !cl.piece.sp && !cl.piece.bone) add(cl, 0);
    });
    pri.sort((a, b) => b.w - a.w);
    return pri.length ? pri[0].cl : null;
  }

  flyPlane(x0, y0, x1, y1) {
    if (TEST.fast) return Promise.resolve();
    return new Promise(res => this.fx.push({ type: 'plane', x0, y0, x1, y1, t: 0, dur: 0.45, done: res }));
  }

  async comboOrActivate(a, b) {
    const pa = a.piece, pb = b.piece;
    const sa = pa && pa.sp, sb = pb && pb.sp;
    if (sa && sb) {
      const kinds = [sa, sb].map(s => s.startsWith('rocket') ? 'rocket' : s).sort().join('+');
      const at = b;
      a.piece = null; b.piece = null;
      this.pop(sa, a.c + 0.5, a.r + 0.5); this.pop(sb, b.c + 0.5, b.r + 0.5);
      this.shake = 0.3;
      if (kinds === 'rainbow+rainbow') {
        sfx.boom();
        const all = []; this.forCells(cl => cl.on && all.push(cl));
        all.forEach(t => this.fx.push({ type: 'zap', x0: at.c + 0.5, y0: at.r + 0.5, x1: t.c + 0.5, y1: t.r + 0.5, t: 0, dur: 0.4 }));
        await wait(260);
        all.forEach(t => this.hitCell(t, { match: true }));
      } else if (kinds.includes('rainbow')) {
        const other = sa === 'rainbow' ? sb : sa;
        const k = this.mostCommonColor();
        const list = []; this.forCells(cl => { if (this.kOf(cl) === k && !cl.tape) list.push(cl); });
        sfx.special();
        list.forEach((cl, i) => {
          const sp = other.startsWith('rocket') ? (i % 2 ? 'rocketH' : 'rocketV') : other;
          cl.piece.sp = sp; cl.piece.k = null; cl.piece.s = 0.3;
          this.fx.push({ type: 'zap', x0: at.c + 0.5, y0: at.r + 0.5, x1: cl.c + 0.5, y1: cl.r + 0.5, t: 0, dur: 0.35 });
        });
        await wait(380);
        for (const cl of list) if (cl.piece && cl.piece.sp) await this.activate(cl);
      } else if (kinds === 'rocket+rocket') {
        sfx.special();
        this.fx.push({ type: 'beam', dir: 'h', r: at.r, c: at.c, t: 0, dur: 0.35 });
        this.fx.push({ type: 'beam', dir: 'v', r: at.r, c: at.c, t: 0, dur: 0.35 });
        await wait(90);
        for (let i = 0; i < C; i++) this.hitCell(this.at(at.r, i));
        for (let i = 0; i < R; i++) this.hitCell(this.at(i, at.c));
      } else if (kinds === 'bomb+rocket') {
        sfx.boom();
        for (let d = -1; d <= 1; d++) {
          this.fx.push({ type: 'beam', dir: 'h', r: at.r + d, c: at.c, t: 0, dur: 0.4 });
          this.fx.push({ type: 'beam', dir: 'v', r: at.r, c: at.c + d, t: 0, dur: 0.4 });
        }
        await wait(100);
        for (let d = -1; d <= 1; d++) {
          for (let i = 0; i < C; i++) this.hitCell(this.at(at.r + d, i));
          for (let i = 0; i < R; i++) this.hitCell(this.at(i, at.c + d));
        }
      } else if (kinds === 'bomb+bomb') {
        sfx.boom();
        this.fx.push({ type: 'ring', x: at.c + 0.5, y: at.r + 0.5, rad: 3.2, t: 0, dur: 0.5 });
        await wait(100);
        for (let rr = at.r - 2; rr <= at.r + 2; rr++) for (let cc = at.c - 2; cc <= at.c + 2; cc++) this.hitCell(this.at(rr, cc));
      } else if (kinds.includes('plane')) {
        const other = sa === 'plane' ? sb : sa;
        sfx.special();
        const n = other === 'plane' ? 3 : 1;
        for (let i = 0; i < n; i++) {
          const target = this.planeTarget(at);
          if (!target) break;
          await this.flyPlane(at.c + 0.5, at.r + 0.5, target.c + 0.5, target.r + 0.5);
          if (other === 'plane') this.hitCell(target);
          else {
            if (target.piece && !target.piece.bone && !target.box && !target.mud) {
              target.piece = this.newPiece(null, target.r, target.c, { sp: other });
              await this.activate(target);
            } else this.hitCell(target);
          }
        }
      }
      await wait(120);
      await this.runChain();
      return;
    }
    // especial + peça comum
    const spCell = sa ? a : b, other = sa ? b : a;
    if (spCell.piece.sp === 'rainbow') {
      const k = other.piece && other.piece.k;
      spCell.piece = null;
      this.pop('rainbow', spCell.c + 0.5, spCell.r + 0.5);
      if (k) await this.clearColor(k, spCell.c, spCell.r);
      else await this.clearColor(this.mostCommonColor(), spCell.c, spCell.r);
    } else {
      await this.activate(spCell);
    }
    await this.runChain();
  }

  // as duas últimas casas de cada coluna: o ossinho sai quando chega nelas
  exitZone() {
    if (!this._exit) {
      this._exit = new Set();
      for (let c = 0; c < C; c++) {
        let n = 0;
        for (let r = R - 1; r >= 0 && n < 2; r--) { const cl = this.cells[r][c]; if (cl.on) { this._exit.add(cl); n++; } else if (n) break; }
      }
    }
    return this._exit;
  }

  collectBones() {
    let got = false;
    for (const cl of this.exitZone()) {
      const p = cl.piece;
      if (p && p.bone && this.holds(cl) && Math.abs(p.y - cl.r) < 0.05) {
        cl.piece = null;
        this.pop('bone', cl.c + 0.5, cl.r + 0.5, p);
        this.burst(cl.c + 0.5, cl.r + 0.5, '#FFF4DD', 12);
        sfx.star();
        this.credit('bone', undefined, cl.c + 0.5, cl.r + 0.5);
        got = true;
      }
    }
    return got;
  }

  countHoles() { let n = 0; this.forCells(cl => { if (this.holds(cl) && !cl.piece) n++; }); return n; }

  bonesOnBoard() { let n = 0; this.forCells(cl => { if (cl.piece && cl.piece.bone) n++; }); return n; }

  spawnKind() {
    const bone = this.goal('bone');
    if (bone) {
      const left = bone.need - bone.got - this.bonesOnBoard();
      if (left > 0 && this.bonesOnBoard() < 2 && this.live() < 0.25) return 'bone';
    }
    return this.colors[Math.floor(this.live() * this.colors.length)];
  }

  async gravity() {
    const spawnCount = new Array(C).fill(0);
    for (let guard = 0; guard < 200; guard++) {
      let moved = false;
      for (let c = 0; c < C; c++) {
        for (let r = R - 1; r >= 0; r--) {
          const cell = this.cells[r][c];
          if (!this.holds(cell) || cell.tape || cell.piece) continue;
          let rr = r - 1;
          while (rr >= 0 && !this.cells[rr][c].on) rr--;
          if (rr < 0) {
            spawnCount[c]++;
            const k = this.spawnKind();
            cell.piece = k === 'bone' ? this.newPiece(null, -spawnCount[c], c, { bone: true }) : this.newPiece(k, -spawnCount[c], c);
            cell.piece.y = Math.min(cell.piece.y, r - spawnCount[c]);
            moved = true;
          } else {
            const src = this.cells[rr][c];
            if (!this.fixed(src) && src.piece) { cell.piece = src.piece; src.piece = null; moved = true; }
          }
        }
      }
      if (!moved) {
        for (let r = R - 1; r >= 1 && !moved; r--) {
          for (let c = 0; c < C && !moved; c++) {
            const cell = this.cells[r][c];
            if (!this.holds(cell) || cell.tape || cell.piece) continue;
            for (const dc of [-1, 1]) {
              const src = this.at(r - 1, c + dc);
              if (!src || !this.movable(src)) continue;
              const below = this.at(r, c + dc);
              if (below && this.holds(below) && !below.tape && !below.piece) continue;
              cell.piece = src.piece; src.piece = null; moved = true; break;
            }
          }
        }
      }
      if (!moved) break;
    }
    await this.settle();
  }

  spreadMud() {
    const options = [];
    this.forCells(cl => {
      if (!cl.mud) return;
      DIRS.forEach(([dr, dc]) => {
        const n = this.at(cl.r + dr, cl.c + dc);
        if (n && n.on && n.piece && !n.piece.sp && !n.piece.bone && !n.tape && !n.box && !n.mud) options.push(n);
      });
    });
    if (!options.length) return;
    const n = options[Math.floor(this.live() * options.length)];
    this.pop(n.piece.k, n.c + 0.5, n.r + 0.5, n.piece);
    n.piece = null;
    n.mud = true;
    this.burst(n.c + 0.5, n.r + 0.5, '#7A5530', 10);
  }

  shuffle(auto) {
    const list = [];
    this.forCells(cl => { if (this.movable(cl) && !cl.piece.sp && !cl.piece.bone) list.push(cl); });
    const pieces = list.map(cl => cl.piece);
    for (let t = 0; t < 80; t++) {
      for (let i = pieces.length - 1; i > 0; i--) { const j = Math.floor(this.live() * (i + 1)); [pieces[i], pieces[j]] = [pieces[j], pieces[i]]; }
      list.forEach((cl, i) => { cl.piece = pieces[i]; });
      if (!this.findGroups().length && this.hasMoves()) break;
      if (t > 40) list.forEach(cl => { cl.piece.k = this.colors[Math.floor(this.live() * this.colors.length)]; });
    }
    if (auto) this.hooks.onToast && this.hooks.onToast('Sem jogadas: embaralhei pra você');
    sfx.swap();
  }

  async useBooster(cell) {
    const b = this.booster;
    this.booster = null;
    this.busy = true;
    this.hooks.onBoosterUsed && this.hooks.onBoosterUsed(b);
    if (b === 'hammer') {
      sfx.boom();
      this.fx.push({ type: 'ring', x: cell.c + 0.5, y: cell.r + 0.5, rad: 0.9, t: 0, dur: 0.3 });
      if (cell.piece && cell.piece.sp) await this.activate(cell);
      else this.hitCell(cell, { match: true });
    } else if (b === 'broom') {
      sfx.special();
      this.fx.push({ type: 'beam', dir: 'h', r: cell.r, c: cell.c, t: 0, dur: 0.4 });
      await wait(100);
      for (let i = 0; i < C; i++) this.hitCell(this.at(cell.r, i), { match: true });
    }
    await wait(150);
    await this.runChain();
    await this.gravity();
    await this.resolveNoMove();
  }

  async resolveNoMove() {
    this.mudCleared = 1;
    await this.resolve(null);
  }

  async doShuffleBooster() {
    if (this.busy || this.over) return false;
    this.shuffle(false);
    await this.settle();
    return true;
  }

  // ---------- animação e desenho ----------
  pop(id, x, y, p) { this.fx.push({ type: 'pop', id: p && p.sp ? p.sp : id, x, y, t: 0, dur: 0.22 }); }
  burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = this.live() * Math.PI * 2, v = 1.5 + this.live() * 3;
      this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, life: 0.5 + this.live() * 0.3, t: 0, color, size: 0.06 + this.live() * 0.06 });
    }
  }
  nudge(cell) { if (cell && cell.piece) cell.piece.s = 0.8; }

  settle() {
    if (TEST.fast) { this.forCells(cl => { if (cl.piece) { cl.piece.x = cl.c; cl.piece.y = cl.r; } }); return Promise.resolve(); }
    if (!this.moving()) return Promise.resolve();
    return new Promise(res => this.waiters.push(res));
  }

  moving() {
    let m = false;
    this.forCells(cl => { const p = cl.piece; if (p && (Math.abs(p.x - cl.c) > 0.001 || Math.abs(p.y - cl.r) > 0.001)) m = true; });
    return m;
  }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.step(dt);
    this.frame = (this.frame || 0) + 1;
    if (this.active || this.dirty || (this.hasSp && this.frame % 3 === 0)) { this.draw(); this.dirty = false; }
    requestAnimationFrame(this.loop);
  }

  step(dt) {
    let active = false, hasSp = false;
    this.forCells(cl => {
      const p = cl.piece;
      if (!p) return;
      if (p.sp) hasSp = true;
      if (p.s < 1 || p.land > 0 || p.x !== cl.c || p.y !== cl.r) active = true;
      const dx = cl.c - p.x, dy = cl.r - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.001) {
        p.v = Math.min((p.v || 4) + dt * 40, 16);
        const stepLen = Math.min(dist, p.v * dt);
        p.x += dx / dist * stepLen; p.y += dy / dist * stepLen;
        if (Math.hypot(cl.c - p.x, cl.r - p.y) < 0.002) { p.x = cl.c; p.y = cl.r; p.v = 0; p.land = 0.12; }
      }
      if (p.land > 0) p.land -= dt;
      if (p.s < 1) p.s = Math.min(1, p.s + dt * 4);
    });
    if (this.waiters.length && !this.moving()) { const w = this.waiters; this.waiters = []; w.forEach(f => f()); }
    this.fx.forEach(f => { f.t += dt; });
    this.fx = this.fx.filter(f => { if (f.t >= f.dur) { if (f.done) f.done(); return false; } return true; });
    this.parts.forEach(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 9 * dt; });
    this.parts = this.parts.filter(p => p.t < p.life);
    if (this.shake > 0) this.shake -= dt;
    this.active = active || this.fx.length > 0 || this.parts.length > 0 || this.shake > 0;
    this.hasSp = hasSp;
  }

  resize() {
    this.dirty = true;
    const css = this.cv.getBoundingClientRect();
    const w = Math.max(200, css.width || 360);
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.cv.width = Math.round(w * this.dpr);
    this.cv.height = Math.round(w * this.dpr);
    this.cs = (w / C);
  }

  draw() {
    const g = this.g2, cs = this.cs, d = this.dpr;
    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, cs * C, cs * R);
    if (this.shake > 0) g.translate((this.live() - 0.5) * 6 * this.shake, (this.live() - 0.5) * 6 * this.shake);
    // fundo das casas
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const cl = this.cells[r][c];
      if (!cl.on) continue;
      g.fillStyle = cl.dirt === 2 ? ((r + c) % 2 ? '#B48A62' : '#AD8259') : cl.dirt === 1 ? ((r + c) % 2 ? '#DDBF98' : '#D6B68C') : ((r + c) % 2 ? '#FFF6EA' : '#FBEBD6');
      roundRect(g, c * cs + 1, r * cs + 1, cs - 2, cs - 2, cs * 0.16);
      g.fill();
      if (cl.dirt) { const s = sprite(cl.dirt === 2 ? 'dirt2' : 'dirt'); if (s) g.drawImage(s, c * cs, r * cs, cs, cs); }
    }
    // saída dos ossinhos: faixa verdinha nas duas últimas casas
    if (this.goals.some(gl => gl.type === 'bone')) {
      g.fillStyle = 'rgba(109,186,90,.32)';
      for (const cl of this.exitZone()) { roundRect(g, cl.c * cs + 1, cl.r * cs + 1, cs - 2, cs - 2, cs * 0.16); g.fill(); }
      g.fillStyle = 'rgba(63,164,102,.55)';
      for (const cl of this.exitZone()) {
        const below = this.at(cl.r + 1, cl.c);
        if (below && below.on) continue;
        const x = cl.c * cs + cs / 2, y = (cl.r + 1) * cs - cs * 0.1;
        g.beginPath(); g.moveTo(x - cs * 0.14, y - cs * 0.1); g.lineTo(x + cs * 0.14, y - cs * 0.1); g.lineTo(x, y); g.closePath(); g.fill();
      }
    }
    // borda do tabuleiro
    g.strokeStyle = 'rgba(185,130,71,.35)';
    g.lineWidth = 2;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (!this.cells[r][c].on) continue;
      DIRS.forEach(([dr, dc]) => {
        const n = this.at(r + dr, c + dc);
        if (n && n.on) return;
        g.beginPath();
        if (dr === 0 && dc === 1) { g.moveTo((c + 1) * cs, r * cs); g.lineTo((c + 1) * cs, (r + 1) * cs); }
        if (dr === 1) { g.moveTo(c * cs, (r + 1) * cs); g.lineTo((c + 1) * cs, (r + 1) * cs); }
        if (dc === -1) { g.moveTo(c * cs, r * cs); g.lineTo(c * cs, (r + 1) * cs); }
        if (dr === -1) { g.moveTo(c * cs, r * cs); g.lineTo((c + 1) * cs, r * cs); }
        g.stroke();
      });
    }
    // peças (recortadas na área do tabuleiro)
    g.save();
    g.beginPath(); g.rect(0, 0, cs * C, cs * R); g.clip();
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const cl = this.cells[r][c];
      const p = cl.piece;
      if (p) {
        const id = p.bone ? 'bone' : (p.sp || p.k);
        const s = sprite(id);
        const sz = cs * 0.86 * p.s;
        const squash = p.land > 0 ? 1 - p.land * 0.6 : 1;
        const pulse = p.sp ? 1 + Math.sin(performance.now() / 220 + p.id) * 0.04 : 1;
        if (s) g.drawImage(s, (p.x + 0.5) * cs - sz * pulse / 2, (p.y + 0.5) * cs - sz * squash * pulse / 2 + (1 - squash) * sz / 2, sz * pulse, sz * squash * pulse);
      }
      if (cl.tape) { const s = sprite('tape'); if (s) g.drawImage(s, c * cs + cs * 0.04, r * cs + cs * 0.04, cs * 0.92, cs * 0.92); }
      if (cl.box) {
        const s = sprite(cl.boxKind === 'box2' ? 'box2' : 'box');
        if (s) g.drawImage(s, c * cs + 1, r * cs + 1, cs - 2, cs - 2);
        const layers = Math.ceil(cl.box / cl.boxHpl);
        if (cl.boxKind === 'box2' && cl.box % 2 === 1) { g.strokeStyle = '#3B2A3F'; g.lineWidth = 2; g.beginPath(); g.moveTo(c * cs + cs * 0.3, r * cs + cs * 0.2); g.lineTo(c * cs + cs * 0.45, r * cs + cs * 0.45); g.lineTo(c * cs + cs * 0.35, r * cs + cs * 0.6); g.stroke(); }
        if (layers > 1) badge(g, c * cs + cs * 0.8, r * cs + cs * 0.22, cs * 0.18, String(layers));
      }
      if (cl.mud) { const s = sprite('mud'); if (s) g.drawImage(s, c * cs + 1, r * cs + 1, cs - 2, cs - 2); }
    }
    g.restore();
    // efeitos
    for (const f of this.fx) {
      const k = f.t / f.dur;
      if (f.type === 'pop') {
        const s = sprite(f.id);
        if (!s) continue;
        const sz = cs * 0.86 * (1 + k * 0.5);
        g.globalAlpha = 1 - k;
        g.drawImage(s, f.x * cs - sz / 2, f.y * cs - sz / 2, sz, sz);
        g.globalAlpha = 1;
      } else if (f.type === 'beam') {
        g.save();
        g.globalAlpha = 1 - k;
        const grad = f.dir === 'h' ? g.createLinearGradient(0, (f.r + 0.5) * cs - cs * 0.4, 0, (f.r + 0.5) * cs + cs * 0.4) : g.createLinearGradient((f.c + 0.5) * cs - cs * 0.4, 0, (f.c + 0.5) * cs + cs * 0.4, 0);
        grad.addColorStop(0, 'rgba(255,214,90,0)'); grad.addColorStop(0.5, 'rgba(255,248,200,1)'); grad.addColorStop(1, 'rgba(255,214,90,0)');
        g.fillStyle = grad;
        const spread = Math.min(1, k * 3);
        if (f.dir === 'h') { const w = C * cs * spread; g.fillRect((f.c + 0.5) * cs - w, (f.r + 0.5) * cs - cs * 0.4, w * 2, cs * 0.8); }
        else { const h = R * cs * spread; g.fillRect((f.c + 0.5) * cs - cs * 0.4, (f.r + 0.5) * cs - h, cs * 0.8, h * 2); }
        g.restore();
      } else if (f.type === 'ring') {
        g.strokeStyle = `rgba(255,200,80,${1 - k})`;
        g.lineWidth = cs * 0.25 * (1 - k);
        g.beginPath(); g.arc(f.x * cs, f.y * cs, f.rad * cs * k + cs * 0.3, 0, Math.PI * 2); g.stroke();
        g.fillStyle = `rgba(255,240,200,${0.5 * (1 - k)})`;
        g.beginPath(); g.arc(f.x * cs, f.y * cs, f.rad * cs * k, 0, Math.PI * 2); g.fill();
      } else if (f.type === 'zap') {
        g.strokeStyle = `rgba(255,255,255,${1 - k})`;
        g.lineWidth = 3;
        g.beginPath(); g.moveTo(f.x0 * cs, f.y0 * cs); g.lineTo(f.x0 * cs + (f.x1 - f.x0) * cs * Math.min(1, k * 2), f.y0 * cs + (f.y1 - f.y0) * cs * Math.min(1, k * 2)); g.stroke();
      } else if (f.type === 'plane') {
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const x = f.x0 + (f.x1 - f.x0) * e, y = f.y0 + (f.y1 - f.y0) * e - Math.sin(k * Math.PI) * 1.2;
        const s = sprite('plane');
        if (s) g.drawImage(s, x * cs - cs * 0.45, y * cs - cs * 0.45, cs * 0.9, cs * 0.9);
      }
    }
    for (const p of this.parts) {
      g.globalAlpha = Math.max(0, 1 - p.t / p.life);
      g.fillStyle = p.color;
      g.beginPath(); g.arc(p.x * cs, p.y * cs, p.size * cs, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    g.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ---------- toque ----------
  bind() {
    const cellAt = e => {
      const rect = this.cv.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * C, y = (e.clientY - rect.top) / rect.height * R;
      return { cell: this.at(Math.floor(y), Math.floor(x)), x, y };
    };
    this.onDown = e => {
      e.preventDefault();
      const h = cellAt(e);
      this.drag = h.cell ? { cell: h.cell, x: h.x, y: h.y } : null;
    };
    this.onMove = e => {
      if (!this.drag) return;
      const h = cellAt(e);
      const dx = h.x - this.drag.x, dy = h.y - this.drag.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 0.35) return;
      const from = this.drag.cell;
      this.drag = null;
      if (this.booster) return;
      const to = Math.abs(dx) > Math.abs(dy) ? this.at(from.r, from.c + Math.sign(dx)) : this.at(from.r + Math.sign(dy), from.c);
      this.trySwap(from, to);
    };
    this.onUp = () => {
      if (this.drag) { const cell = this.drag.cell; this.drag = null; this.tap(cell); }
    };
    this.cv.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
  }

  destroy() {
    this.running = false;
    this.cv.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('resize', this.onResize);
  }

  // usado pelos testes automáticos
  allSwaps() {
    const out = [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const a = this.cells[r][c];
      if (!this.movable(a)) continue;
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const b = this.at(r + dr, c + dc);
        if (!this.movable(b)) continue;
        if (a.piece.sp || b.piece.sp) { out.push([a, b, 3]); continue; }
        this.swapPieces(a, b);
        const ok = this.matchAt(a) || this.matchAt(b);
        this.swapPieces(a, b);
        if (ok) out.push([a, b, 1]);
      }
    }
    return out;
  }
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

function badge(g, x, y, rad, txt) {
  g.fillStyle = '#3B2A3F';
  g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff';
  g.font = `800 ${Math.round(rad * 1.3)}px Nunito, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(txt, x, y + 1);
}
