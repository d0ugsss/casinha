// Peças comuns dos cômodos: móveis do kit (Kenney, CC0), paredes, pisos, cortinas, quadros
import * as THREE from 'three';
import { GLTFLoader } from '../../lib/GLTFLoader.js';

export const S = 1.35; // escala dos móveis em relação aos personagens

// ---------- materiais e formas ----------
const M = {};
export function mat(color, rough = 0.85, extra = {}) {
  const key = color + rough + JSON.stringify(extra);
  if (!M[key]) M[key] = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
  return M[key];
}
export function mesh(geo, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, typeof m === 'string' ? mat(m) : m);
  o.position.set(x, y, z);
  o.castShadow = true; o.receiveShadow = true;
  return o;
}
export const box = (w, h, d, m, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), m, x, y, z);
export const cyl = (rt, rb, h, m, x, y, z, seg = 16) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z);
export const ball = (r, m, x, y, z) => mesh(new THREE.SphereGeometry(r, 18, 14), m, x, y, z);
export const group = (...kids) => { const g = new THREE.Group(); kids.flat().forEach(k => k && g.add(k)); return g; };
export function at(obj, x = 0, y = 0, z = 0, ry = 0) { obj.position.set(x, y, z); obj.rotation.y = ry; return obj; }
export function glow(color, intensity = 1.4) { return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.6 }); }

// ---------- texturas desenhadas ----------
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

const TEX = {};
export function tex(name, repeat = [1, 1]) {
  const key = name + repeat.join('x');
  if (TEX[key]) return TEX[key];
  const r = rnd(name.length * 977 + 11);
  const draws = {
    porcelanato: (g, w, h) => {
      g.fillStyle = '#F5F3EF'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 22; i++) {
        g.strokeStyle = `rgba(170,165,156,${0.04 + r() * 0.07})`; g.lineWidth = 0.6 + r() * 1.4;
        g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y);
        for (let k = 0; k < 3; k++) { const nx = x + (r() - 0.3) * 300, ny = y + (r() - 0.5) * 200; g.quadraticCurveTo((x + nx) / 2, (y + ny) / 2 + (r() - 0.5) * 80, nx, ny); x = nx; y = ny; }
        g.stroke();
      }
      g.strokeStyle = '#DCD7CE'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
    },
    madeira: (g, w, h) => {
      const cols = ['#C9A07A', '#C29873', '#CFA883', '#BE936D'];
      for (let i = 0; i < 8; i++) {
        g.fillStyle = cols[i % 4]; g.fillRect(0, i * h / 8, w, h / 8);
        g.fillStyle = 'rgba(90,60,30,.25)'; g.fillRect(0, i * h / 8, w, 2);
        const cut = r() * w; g.fillRect(cut, i * h / 8, 2, h / 8);
        g.strokeStyle = 'rgba(110,75,40,.12)';
        for (let k = 0; k < 4; k++) { g.beginPath(); const y = i * h / 8 + 6 + r() * (h / 8 - 12); g.moveTo(0, y); g.bezierCurveTo(w / 3, y + (r() - 0.5) * 8, 2 * w / 3, y + (r() - 0.5) * 8, w, y); g.stroke(); }
      }
    },
    geometrico: (g, w, h) => {
      g.fillStyle = '#F2F0EB'; g.fillRect(0, 0, w, h);
      const n = 4, s = w / n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        g.fillStyle = (x + y) % 2 ? '#C9D6D3' : '#E4D2BE';
        g.beginPath(); g.moveTo(x * s + s / 2, y * s); g.lineTo(x * s + s, y * s + s / 2); g.lineTo(x * s + s / 2, y * s + s); g.lineTo(x * s, y * s + s / 2); g.closePath(); g.fill();
        g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.strokeRect(x * s, y * s, s, s);
      }
    },
    metro: (g, w, h) => {
      g.fillStyle = '#F7F7F4'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#D5D5CF'; g.lineWidth = 3;
      const rows = 8, bw = w / 4;
      for (let y = 0; y < rows; y++) { g.beginPath(); g.moveTo(0, y * h / rows); g.lineTo(w, y * h / rows); g.stroke(); for (let x = -1; x < 5; x++) { const xx = x * bw + (y % 2) * bw / 2; g.beginPath(); g.moveTo(xx, y * h / rows); g.lineTo(xx, (y + 1) * h / rows); g.stroke(); } }
    },
    verde: (g, w, h) => {
      const n = 6, s = w / n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const v = r(); g.fillStyle = v < 0.33 ? '#6E9E86' : v < 0.66 ? '#7DAA92' : '#5F907A'; g.fillRect(x * s, y * s, s, s); }
      g.strokeStyle = '#EDEFE8'; g.lineWidth = 3;
      for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); }
    },
    cimento: (g, w, h) => {
      g.fillStyle = '#B9B6B0'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '60,60,60'},${r() * 0.06})`; const s = 2 + r() * 14; g.fillRect(r() * w, r() * h, s, s); }
    },
    granito: (g, w, h) => {
      g.fillStyle = '#2E2C2E'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) { const v = r(); g.fillStyle = v < 0.4 ? 'rgba(255,255,255,.18)' : v < 0.7 ? 'rgba(150,140,130,.35)' : 'rgba(0,0,0,.4)'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
    },
    grama: (g, w, h) => {
      g.fillStyle = '#6DBA5A'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1500; i++) { g.fillStyle = r() < 0.5 ? 'rgba(80,150,70,.5)' : 'rgba(140,210,110,.4)'; g.fillRect(r() * w, r() * h, 2, 4 + r() * 5); }
    },
    deck: (g, w, h) => {
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#A97A52' : '#B3845A'; g.fillRect(i * w / 6, 0, w / 6, h); g.fillStyle = 'rgba(60,35,20,.35)'; g.fillRect(i * w / 6, 0, 3, h); }
    },
    tijolo: (g, w, h) => {
      g.fillStyle = '#E8DCCB'; g.fillRect(0, 0, w, h);
      const rows = 8, bw = w / 3;
      for (let y = 0; y < rows; y++) for (let x = -1; x < 4; x++) {
        const v = r(); g.fillStyle = v < 0.33 ? '#B85C3C' : v < 0.66 ? '#C66A45' : '#AE5536';
        g.fillRect(x * bw + (y % 2) * bw / 2 + 3, y * h / rows + 3, bw - 6, h / rows - 6);
      }
    }
  };
  TEX[key] = canvasTex(256, 256, draws[name], repeat);
  return TEX[key];
}
export const texMat = (name, repeat, rough = 0.8) => new THREE.MeshStandardMaterial({ map: tex(name, repeat), roughness: rough });

export function textTex(text, { w = 256, h = 96, bg = '#F3E3C3', fg = '#3B2A3F', font = 'bold 44px Nunito, sans-serif' } = {}) {
  return canvasTex(w, h, g => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    const lines = text.split('\n');
    lines.forEach((ln, i) => g.fillText(ln, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (h / (lines.length + 0.6))));
  });
}
export function drawTex(w, h, draw) { return canvasTex(w, h, draw); }

const photoLoader = new THREE.TextureLoader();
const PH = {};
export function photo(file) {
  if (!PH[file]) { PH[file] = photoLoader.load('assets/photos/' + file); PH[file].colorSpace = THREE.SRGBColorSpace; PH[file].anisotropy = 4; }
  return PH[file];
}

// paisagem da janela
const OUT = {};
export function outside(kind = 'arvore') {
  if (OUT[kind]) return OUT[kind];
  OUT[kind] = canvasTex(256, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9FD3F2'); gr.addColorStop(1, '#D9EEF8');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#C8C1B6'; g.fillRect(0, 360, w, 152);
    if (kind === 'arvore') {
      [['#4E9A4B', 90, 150, 95], ['#5FAE57', 170, 120, 85], ['#6DBA5A', 120, 230, 80], ['#4E9A4B', 200, 250, 60]].forEach(([c, x, y, rad]) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); });
      g.fillStyle = '#7A5A3C'; g.fillRect(118, 280, 18, 90);
    } else {
      g.fillStyle = '#E8D9C9'; g.fillRect(20, 200, 90, 170); g.fillStyle = '#F2C9D6'; g.fillRect(130, 160, 110, 210);
      g.fillStyle = '#9FB7C9'; for (let i = 0; i < 4; i++) g.fillRect(150 + (i % 2) * 50, 190 + Math.floor(i / 2) * 60, 30, 36);
      g.fillStyle = '#5FAE57'; g.beginPath(); g.arc(60, 360, 60, 0, 7); g.fill();
    }
  });
  return OUT[kind];
}

// ---------- móveis do kit ----------
const loader = new GLTFLoader();
const KIT = {};
let PACK = null;
const pack = () => (PACK = PACK || import('../kitpack.js').then(m => m.default));
export function preloadKit(names) {
  return Promise.all(names.map(n => {
    if (!KIT[n]) KIT[n] = pack().then(p => new Promise(res => {
      if (!p[n]) { res(null); return; }
      const bin = Uint8Array.from(atob(p[n]), c => c.charCodeAt(0));
      loader.parse(bin.buffer, '', g => res(g.scene), () => res(null));
    }));
    return KIT[n];
  }));
}
const KIT_READY = {};
export async function ensureKit(names) {
  const scenes = await preloadKit(names);
  names.forEach((n, i) => { KIT_READY[n] = scenes[i]; });
}
// cópia do móvel, com o chão no y=0, centralizado, cores trocadas pelo nome do material
export function kit(name, { x = 0, y = 0, z = 0, ry = 0, s = S, sy = 1, colors = {}, shine = false } = {}) {
  const src = KIT_READY[name];
  const wrap = new THREE.Group();
  if (!src) return wrap;
  const g = src.clone(true);
  g.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    const fix = m => {
      const c = m.clone();
      if (colors[m.name]) c.color.set(colors[m.name]);
      c.metalness = shine && /metal/.test(m.name) ? 0.35 : 0;
      c.roughness = shine && /metal/.test(m.name) ? 0.35 : Math.max(c.roughness, 0.7);
      if (m.name === 'glass') { c.transparent = true; c.opacity = 0.35; c.roughness = 0.1; }
      if (m.name === 'lamp') { c.emissive = new THREE.Color(colors.lamp || '#FFF1C9'); c.emissiveIntensity = 0.6; }
      return c;
    };
    o.material = Array.isArray(o.material) ? o.material.map(fix) : fix(o.material);
  });
  const b = new THREE.Box3().setFromObject(g);
  const c = b.getCenter(new THREE.Vector3());
  g.position.set(-c.x, -b.min.y, -c.z);
  wrap.add(g);
  wrap.scale.set(s, s * sy, s);
  wrap.rotation.y = ry;
  wrap.position.set(x, y, z);
  return wrap;
}
export function kitTop(name, s = S) { // altura do topo do móvel já escalado
  const src = KIT_READY[name];
  if (!src) return 0;
  const b = new THREE.Box3().setFromObject(src);
  return (b.max.y - b.min.y) * s;
}

// ---------- cômodo (estilo casa de bonecas: piso + parede do fundo + parede da esquerda) ----------
export const ROOM = { w: 4.4, d: 3.0, h: 1.55, t: 0.1 };
export function interior({ floor = 'porcelanato', floorRepeat, wall = '#DCDFE4', win = null, winLeft = null, door = null, view = 'arvore', wallMat = null, w = ROOM.w, d = ROOM.d, h = ROOM.h } = {}) {
  const t = ROOM.t, x0 = -w / 2, z0 = -d / 2;
  const g = new THREE.Group();
  const fl = box(w, 0.14, d, texMat(floor, floorRepeat || [w / 1.1, d / 1.1], floor === 'porcelanato' ? 0.35 : 0.8), 0, -0.07, 0);
  fl.castShadow = false; g.add(fl);
  const wm = wallMat || mat(wall, 0.95);
  const wallShape = (len, holes) => {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(len, 0); s.lineTo(len, h); s.lineTo(0, h); s.lineTo(0, 0);
    holes.forEach(([a, b, y1, y2]) => { const p = new THREE.Path(); p.moveTo(a, y1); p.lineTo(a, y2); p.lineTo(b, y2); p.lineTo(b, y1); p.lineTo(a, y1); s.holes.push(p); });
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }), wm);
    m.castShadow = true; m.receiveShadow = true; return m;
  };
  const backHoles = [], leftHoles = [];
  if (win) backHoles.push([win[0] + t, win[1] + t, win[2], win[3]]);
  if (door) backHoles.push([door[0] + t, door[1] + t, 0.001, 1.16]);
  if (winLeft) leftHoles.push([d - winLeft[1], d - winLeft[0], winLeft[2], winLeft[3]]);
  const back = wallShape(w + t, backHoles); back.position.set(x0 - t, 0, z0 - t); g.add(back);
  const left = wallShape(d, leftHoles); left.rotation.y = Math.PI / 2; left.position.set(x0 - t, 0, z0 + d); g.add(left);
  const sk = mat('#F4F2EE', 0.6);
  g.add(box(w, 0.05, 0.015, sk, 0, 0.025, z0 + 0.008));
  g.add(box(0.015, 0.05, d, sk, x0 + 0.008, 0.025, 0));
  const cap = mat('#C8CBD1', 0.8);
  g.add(box(w + t, 0.02, t, cap, -t / 2, h + 0.01, z0 - t / 2));
  g.add(box(t, 0.02, d + t, cap, x0 - t / 2, h + 0.01, -t / 2));
  // janelas
  const frame = mat('#8F9696', 0.5);
  const windowAt = (cx, cy, ww, wh, onLeft) => {
    const wg = new THREE.Group();
    wg.add(box(ww + 0.04, 0.035, 0.12, frame, 0, -wh / 2, 0), box(ww + 0.04, 0.035, 0.12, frame, 0, wh / 2, 0),
      box(0.035, wh, 0.12, frame, -ww / 2, 0, 0), box(0.035, wh, 0.12, frame, ww / 2, 0, 0), box(0.025, wh, 0.06, frame, 0, 0, 0));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshStandardMaterial({ color: '#DDF0FA', transparent: true, opacity: 0.18, roughness: 0.05 }));
    wg.add(glass);
    const out = new THREE.Mesh(new THREE.PlaneGeometry(ww + 0.06, wh + 0.06), new THREE.MeshBasicMaterial({ map: outside(view) }));
    out.position.z = -t / 2 - 0.03; wg.add(out);
    if (onLeft) { wg.rotation.y = Math.PI / 2; wg.position.set(x0 - t / 2, cy, cx); } else wg.position.set(cx, cy, z0 - t / 2);
    g.add(wg);
  };
  if (win) windowAt(x0 + (win[0] + win[1]) / 2, (win[2] + win[3]) / 2, win[1] - win[0], win[3] - win[2], false);
  if (winLeft) windowAt(z0 + (winLeft[0] + winLeft[1]) / 2, (winLeft[2] + winLeft[3]) / 2, winLeft[1] - winLeft[0], winLeft[3] - winLeft[2], true);
  // porta pro corredor
  if (door) {
    const dx1 = x0 + door[0], dx2 = x0 + door[1], dcx = (dx1 + dx2) / 2, dw = dx2 - dx1;
    const dm = mat('#7B4B32', 0.6);
    g.add(box(0.04, 1.18, 0.14, dm, dx1, 0.59, z0 - t / 2), box(0.04, 1.18, 0.14, dm, dx2, 0.59, z0 - t / 2), box(dw + 0.08, 0.04, 0.14, dm, dcx, 1.18, z0 - t / 2));
    const hall = new THREE.Mesh(new THREE.PlaneGeometry(dw + 0.02, 1.17), new THREE.MeshBasicMaterial({ color: '#B8BEC6' }));
    hall.position.set(dcx, 0.585, z0 - t - 0.3); g.add(hall);
    const hf = box(dw, 0.01, 0.3, texMat(floor, [1, 0.3]), dcx, 0.001, z0 - t - 0.15); hf.castShadow = false; g.add(hf);
  }
  return g;
}

// cortina dupla numa janela (wall: 'back' usa x do centro; 'left' usa z do centro)
export function curtains({ wall = 'back', c, span, top = 1.45, len = 1.42, color = '#EADCC2', d = ROOM.d, w = ROOM.w, panel = 0.26, blackout = false }) {
  const g = new THREE.Group();
  const x0 = -w / 2, z0 = -d / 2;
  const m = new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide });
  const one = (off, pw) => {
    const geo = new THREE.PlaneGeometry(pw, len, 24, 1);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) / pw * Math.PI * (blackout ? 3 : 6)) * (blackout ? 0.012 : 0.025));
    geo.computeVertexNormals();
    const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true;
    o.position.set(off, top - len / 2, 0); return o;
  };
  g.add(one(-span / 2 - panel / 2 + 0.06, panel), one(span / 2 + panel / 2 - 0.06, panel));
  const rod = cyl(0.008, 0.008, span + panel * 2 + 0.1, mat('#6B4A2E', 0.4), 0, top + 0.02, 0); rod.rotation.z = Math.PI / 2; g.add(rod);
  if (wall === 'back') g.position.set(c, 0, z0 + 0.06);
  else { g.rotation.y = Math.PI / 2; g.position.set(x0 + 0.06, 0, c); }
  return g;
}

// quadro com foto ou textura na parede
export function frame(map, { w = 0.3, h = 0.3, border = '#2B2B2B', bw = 0.025, depth = 0.025 } = {}) {
  const g = new THREE.Group();
  g.add(box(w + bw * 2, h + bw * 2, depth, mat(border, 0.5), 0, 0, depth / 2));
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map, roughness: 0.6 }));
  p.position.z = depth + 0.002; g.add(p);
  return g;
}
export function onBackWall(obj, x, y, d = ROOM.d) { obj.position.set(x, y, -d / 2); return obj; }
export function onLeftWall(obj, z, y, w = ROOM.w) { obj.rotation.y = Math.PI / 2; obj.position.set(-w / 2, y, z); return obj; }

// ---------- montagem do cômodo pra casa ----------
export const ghostMat = new THREE.MeshBasicMaterial({ color: '#E88AB4', transparent: true, opacity: 0.28, depthWrite: false });
export function makeRoom(def) {
  const room = {
    ...def,
    async preload() { if (def.kit && def.kit.length) await ensureKit(def.kit); },
    item(id, style) {
      const g = def.items[id](style);
      const wrap = new THREE.Group();
      wrap.add(g);
      wrap.userData.item = id;
      wrap.traverse(o => { if (o.isMesh) o.userData.item = id; });
      return wrap;
    },
    ghost(id) {
      const g = room.item(id, 0);
      g.traverse(o => { if (o.isMesh) { o.material = ghostMat; o.castShadow = false; o.receiveShadow = false; } });
      g.userData.ghost = true;
      return g;
    }
  };
  return room;
}
