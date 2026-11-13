// Base dos desafios: canvas que ocupa a área, laço de animação, toques e fim de jogo
export const C = {
  ink: '#3B2A3F', soft: '#8C7E90', cream: '#FFF7EE', pink: '#E85D8A', rose: '#F28DB2', green: '#3FA466',
  leaf: '#6DBA5A', gold: '#FFC23D', blue: '#5D8FD8', purple: '#9A73E0', red: '#D93A3A', white: '#FFFFFF'
};

const IMGS = {};
export function img(src) {
  if (!IMGS[src]) { const i = new Image(); i.src = src; IMGS[src] = i; }
  return IMGS[src];
}
export const face = id => img(`assets/faces/${id}.webp`);

export function rr(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
export function text(g, s, x, y, { size = 18, color = C.ink, align = 'center', weight = 800, font = '"Baloo 2", Nunito, sans-serif', base = 'middle' } = {}) {
  g.font = `${weight} ${size}px ${font}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = base; g.fillText(s, x, y);
}
export function emoji(g, ch, x, y, size) {
  g.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, x, y);
}
export function drawImgFit(g, im, cx, bottom, h) {
  if (!im.complete || !im.naturalWidth) return;
  const w = h * im.naturalWidth / im.naturalHeight;
  g.drawImage(im, cx - w / 2, bottom - h, w, h);
}
export function circleImg(g, im, cx, cy, r, ring = '#FFFFFF') {
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fillStyle = '#FFF0C7'; g.fill(); g.clip();
  if (im.complete && im.naturalWidth) g.drawImage(im, cx - r, cy - r, r * 2, r * 2);
  g.restore(); g.lineWidth = 3; g.strokeStyle = ring; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
}
export const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class MiniGame {
  constructor(host, opts = {}, hooks = {}) {
    this.host = host; this.opts = opts; this.hooks = hooks;
    this.over = false; this.t = 0; this.fx = [];
    if (!opts.dom) {
      this.cv = document.createElement('canvas');
      this.cv.className = 'mg-canvas';
      host.append(this.cv);
      this.g = this.cv.getContext('2d');
      this.bindPointer();
    } else {
      this.root = document.createElement('div');
      this.root.className = 'mg-dom ' + (opts.dom === true ? '' : opts.dom);
      host.append(this.root);
    }
    this.resize();
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    this.loop = this.loop.bind(this);
  }

  resize() {
    const r = this.host.getBoundingClientRect();
    this.w = Math.max(200, r.width); this.h = Math.max(260, r.height);
    if (!this.cv) return;
    const d = Math.min(window.devicePixelRatio || 1, 2.5);
    this.d = d;
    this.cv.width = Math.round(this.w * d); this.cv.height = Math.round(this.h * d);
    this.cv.style.width = this.w + 'px'; this.cv.style.height = this.h + 'px';
    this.layout && this.layout();
  }

  bindPointer() {
    const pos = e => { const r = this.cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    this.cv.addEventListener('pointerdown', e => { e.preventDefault(); this.pid = e.pointerId; if (this.over || this.paused) return; const [x, y] = pos(e); this.down && this.down(x, y); });
    this.pmove = e => { if (this.pid !== e.pointerId || this.over || this.paused) return; const [x, y] = pos(e); this.move && this.move(x, y); };
    this.pup = e => { if (this.pid !== e.pointerId) return; this.pid = null; if (this.over || this.paused) return; const [x, y] = pos(e); this.up && this.up(x, y); };
    window.addEventListener('pointermove', this.pmove);
    window.addEventListener('pointerup', this.pup);
  }

  status(s) { this.hooks.onStatus && this.hooks.onStatus(s); }
  win() { if (this.over) return; this.over = true; this.hooks.onWin && this.hooks.onWin(); }
  lose(msg) { if (this.over) return; this.over = true; this.hooks.onLose && this.hooks.onLose(msg); }
  devWin() { this.win(); }
  sfx(name, ...a) { this.hooks.sfx && this.hooks.sfx(name, ...a); }

  // texto que sobe e some ("Boa!", "+1")
  pop(s, x, y, color = C.ink, size = 26) { this.fx.push({ s, x, y, color, size, t: 0 }); }
  drawFx(g, dt) {
    this.fx = this.fx.filter(f => {
      f.t += dt; const k = f.t / 0.9;
      g.globalAlpha = Math.max(0, 1 - k);
      text(g, f.s, f.x, f.y - k * 40, { size: f.size, color: f.color });
      g.globalAlpha = 1;
      return k < 1;
    });
  }

  start() { this.running = true; this.last = performance.now(); requestAnimationFrame(this.loop); }
  stop() { this.running = false; }
  loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    if (!this.paused) { this.t += dt; if (!this.over) this.update && this.update(dt); }
    if (this.cv) {
      const g = this.g;
      g.setTransform(this.d, 0, 0, this.d, 0, 0);
      g.clearRect(0, 0, this.w, this.h);
      this.draw && this.draw(g, dt);
      this.drawFx(g, dt);
    } else this.tick && this.tick(dt);
    requestAnimationFrame(this.loop);
  }

  destroy() {
    this.stop(); this.over = true;
    window.removeEventListener('resize', this.onResize);
    if (this.pmove) { window.removeEventListener('pointermove', this.pmove); window.removeEventListener('pointerup', this.pup); }
    (this.cv || this.root).remove();
    this.timers && this.timers.forEach(clearTimeout);
  }
  later(fn, ms) { (this.timers = this.timers || []).push(setTimeout(() => { if (!this.over || this.allowAfter) fn(); }, ms)); }
}
