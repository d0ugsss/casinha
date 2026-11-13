// Quintal em 3D: cenário fixo + os 6 itens com 3 estilos cada
import * as THREE from 'three';

const M = {};
export function mat(color, rough = 0.85, extra = {}) {
  const key = color + rough + JSON.stringify(extra);
  if (!M[key]) M[key] = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
  return M[key];
}
function mesh(geo, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.castShadow = true; o.receiveShadow = true;
  return o;
}
export const box = (w, h, d, color, x, y, z, rough) => mesh(new THREE.BoxGeometry(w, h, d), mat(color, rough), x, y, z);
const cyl = (rt, rb, h, color, x, y, z, seg = 12, rough) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color, rough), x, y, z);
const ball = (r, color, x, y, z, rough) => mesh(new THREE.SphereGeometry(r, 16, 12), mat(color, rough), x, y, z);
const cone = (r, h, color, x, y, z, seg = 10) => mesh(new THREE.ConeGeometry(r, h, seg), mat(color), x, y, z);

function textTex(text, { w = 256, h = 96, bg = '#F3E3C3', fg = '#3B2A3F', font = 'bold 44px Nunito, sans-serif' } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = text.split('\n');
  lines.forEach((ln, i) => g.fillText(ln, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (h / (lines.length + 0.6))));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function prism(w, h, d, color) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  return mesh(g, mat(color));
}

// ---------- cenário fixo ----------
export function buildQuintalBase() {
  const g = new THREE.Group();
  // chão de cimento
  const slab = box(5.0, 0.16, 3.9, '#E2D9CB', 0, -0.08, -0.15, 0.95);
  slab.castShadow = false;
  g.add(slab);
  const seam = mat('#D2C6B3');
  for (const z of [-1.1, -0.2, 0.7, 1.5]) { const s = mesh(new THREE.BoxGeometry(4.98, 0.005, 0.015), seam, 0, 0.002, z); s.castShadow = false; g.add(s); }
  // casa rosa ao fundo
  g.add(box(2.1, 1.9, 0.5, '#DCA6CE', -1.45, 0.95, -2.35));
  g.add(box(2.18, 0.08, 0.58, '#F4EEF2', -1.45, 1.94, -2.35));
  g.add(box(1.9, 1.62, 0.5, '#E4B6D8', 0.55, 0.81, -2.35));
  g.add(box(1.98, 0.08, 0.58, '#F4EEF2', 0.55, 1.66, -2.35));
  g.add(box(0.06, 1.62, 0.52, '#C88DBA', -0.4, 0.81, -2.35));
  // porta e degrau
  g.add(box(0.46, 1.05, 0.04, '#2A2E33', 0.2, 0.525, -2.09, 0.5));
  g.add(ball(0.025, '#C9CED3', 0.38, 0.52, -2.06, 0.3));
  g.add(box(0.6, 0.06, 0.22, '#C88DBA', 0.2, 0.03, -1.99));
  g.add(ball(0.05, '#FFF6D8', 0.2, 1.2, -2.07, 0.4));
  // janela alta e janela da direita
  g.add(box(0.52, 1.28, 0.04, '#8F9696', -1.5, 0.92, -2.09, 0.5));
  const glass = mat('#2E3B3A', 0.15);
  g.add(mesh(new THREE.BoxGeometry(0.44, 1.2, 0.02), glass, -1.5, 0.92, -2.07));
  g.add(box(0.03, 1.2, 0.03, '#8F9696', -1.5, 0.92, -2.06, 0.5));
  g.add(box(0.56, 0.42, 0.04, '#8F9696', 1.0, 0.95, -2.09, 0.5));
  g.add(mesh(new THREE.BoxGeometry(0.48, 0.34, 0.02), glass, 1.0, 0.95, -2.07));
  // muro cinza à direita (com abertura do portão) e ao fundo
  const wallC = '#C9C2B7', capC = '#B3AC9F';
  const wallSeg = (z0, z1) => { const len = z1 - z0; g.add(box(0.14, 1.25, len, wallC, 2.45, 0.625, (z0 + z1) / 2, 0.95)); g.add(box(0.2, 0.06, len, capC, 2.45, 1.28, (z0 + z1) / 2)); };
  wallSeg(-2.6, 1.8);
  // abertura do portão no muro do fundo, entre a casa e o muro da direita
  g.add(box(0.16, 1.4, 0.24, capC, 1.55, 0.7, -2.5));
  g.add(box(0.16, 1.4, 0.24, capC, 2.4, 0.7, -2.5));
  // árvore de verdade atrás do muro
  g.add(cyl(0.08, 0.12, 1.2, '#7A5A3C', 2.3, 1.2, -2.95));
  [[2.1, 2.1, -3.0, 0.55, '#4E9A4B'], [2.6, 2.35, -2.9, 0.5, '#5FAE57'], [2.35, 2.6, -3.1, 0.45, '#4E9A4B'], [1.8, 2.3, -3.1, 0.4, '#5FAE57']]
    .forEach(([x, y, z, r, c]) => g.add(ball(r, c, x, y, z)));
  // gramado com o caminho de pedrinhas laranja
  const grass = box(1.52, 0.03, 2.62, '#6DBA5A', 0.86, 0.015, -0.31, 1);
  grass.castShadow = false; g.add(grass);
  const peb = mat('#E2B878', 1);
  const p1 = mesh(new THREE.BoxGeometry(0.52, 0.035, 4.1), peb, 1.98, 0.02, -0.35); p1.castShadow = false; g.add(p1);
  const p2 = mesh(new THREE.BoxGeometry(1.75, 0.035, 0.4), peb, 0.86, 0.02, -1.86); p2.castShadow = false; g.add(p2);
  // pedrinhas soltas
  for (let i = 0; i < 70; i++) {
    const onA = i % 3 !== 0;
    const x = onA ? 1.74 + Math.random() * 0.48 : 0.0 + Math.random() * 1.72;
    const z = onA ? -2.38 + Math.random() * 4.06 : -2.04 + Math.random() * 0.36;
    const s = ball(0.018 + Math.random() * 0.012, ['#D9A866', '#F0C88C', '#C99456'][i % 3], x, 0.04, z);
    s.scale.y = 0.5; s.castShadow = false; g.add(s);
  }
  return g;
}

// ---------- itens ----------
export const SPOTS = {
  portao: { x: 1.975, z: -2.5, ry: 0 },
  caminho: { x: 0, z: 0, ry: 0 },
  canteiro: { x: -1.4, z: -1.85, ry: 0 },
  arvore: { x: -1.7, z: 0.45, ry: 0 },
  casinha: { x: -1.05, z: -0.6, ry: 0.5 },
  banco: { x: 1.12, z: 1.38, ry: -0.18 },
  plaquinha: { x: 0.3, z: -1.35, ry: 0.25 }
};

export const CHAR_SPOTS = {
  tata: [-0.15, 0.95], dodo: [0.3, 0.85], zozo: [-0.6, -0.05], milton: [1.0, -0.75],
  marci: [-0.55, 0.6], vitoria: [-0.9, 0.7], pai: [1.4, -0.3], ana: [-0.8, 0.5], italo: [-0.4, 0.45], margarida: [1.0, 0.2]
};

const ITEMS = {
  portao(style) {
    const g = new THREE.Group();
    const W = 0.84, H = 1.12;
    if (style === 0) {
      for (let i = 0; i < 8; i++) {
        const plank = box(W / 8 - 0.015, H - (i % 2) * 0.05, 0.05, i % 2 ? '#9B6A43' : '#A8764B', -W / 2 + W / 16 + i * W / 8, (H - (i % 2) * 0.05) / 2, 0);
        g.add(plank);
      }
      g.add(box(W, 0.08, 0.07, '#7E5435', 0, 0.25, 0.03));
      g.add(box(W, 0.08, 0.07, '#7E5435', 0, 0.85, 0.03));
      const brace = box(0.07, 0.9, 0.06, '#7E5435', 0, 0.55, 0.05); brace.rotation.z = 0.62; g.add(brace);
      g.add(ball(0.03, '#3B3B3B', 0.36, 0.55, 0.07, 0.4));
    } else if (style === 1) {
      const iron = '#2B2B2E';
      g.add(box(W, 0.05, 0.05, iron, 0, 0.08, 0, 0.5));
      g.add(box(W, 0.05, 0.05, iron, 0, H - 0.08, 0, 0.5));
      g.add(box(W, 0.04, 0.04, iron, 0, H * 0.55, 0, 0.5));
      for (let i = 0; i < 11; i++) {
        const x = -W / 2 + 0.04 + i * (W - 0.08) / 10;
        g.add(cyl(0.012, 0.012, H, iron, x, H / 2, 0, 8, 0.5));
        g.add(cone(0.03, 0.08, iron, x, H + 0.04, 0, 8));
      }
      const ring = mesh(new THREE.TorusGeometry(0.12, 0.015, 8, 24), mat(iron, 0.5), 0, H * 0.78, 0); g.add(ring);
    } else {
      const white = '#F6F3EE';
      for (let i = 0; i < 9; i++) {
        const x = -W / 2 + 0.055 + i * (W - 0.11) / 8;
        const h = H - 0.25 + Math.sin(i / 8 * Math.PI) * 0.2;
        g.add(box(0.075, h, 0.04, white, x, h / 2, 0));
        g.add(ball(0.038, white, x, h, 0));
      }
      g.add(box(W, 0.07, 0.05, '#E9E4DC', 0, 0.3, 0.03));
      g.add(box(W, 0.07, 0.05, '#E9E4DC', 0, 0.8, 0.03));
      for (let i = 0; i < 14; i++) {
        const x = -W / 2 + Math.random() * W, y = 0.75 + Math.random() * 0.3;
        g.add(ball(0.035, i % 3 ? '#4E9A4B' : '#5FAE57', x, y, 0.05));
        if (i % 2 === 0) g.add(ball(0.03, ['#F28DB2', '#E84A6A', '#FFFFFF'][i % 3], x + 0.03, y + 0.02, 0.07));
      }
    }
    return g;
  },

  caminho(style) {
    const g = new THREE.Group();
    const pts = [];
    for (let z = 1.5; z > -2.3; z -= 0.32) pts.push([1.98, z]);
    for (let x = 1.6; x > 0.1; x -= 0.32) pts.push([x, -1.86]);
    pts.forEach(([x, z], i) => {
      if (style === 0) {
        const s = cyl(0.14, 0.15, 0.04, ['#B9B4AA', '#ABA69B', '#C4BFB5'][i % 3], x, 0.055, z, 7);
        s.scale.set(1 + (i % 3) * 0.08, 1, 0.85 + (i % 2) * 0.12); s.rotation.y = i * 0.7; g.add(s);
      } else if (style === 1) {
        const horiz = z < -1.7 && x < 1.7;
        for (const d of [-0.07, 0.07]) {
          const b = box(horiz ? 0.13 : 0.28, 0.04, horiz ? 0.28 : 0.13, i % 2 ? '#C0603C' : '#B5553A', horiz ? x + d : x, 0.055, horiz ? z : z + d);
          g.add(b);
        }
      } else {
        for (let k = 0; k < 7; k++) {
          const a = k / 7 * Math.PI * 2 + i;
          const s = ball(0.04 + (k % 3) * 0.008, ['#5D8FD8', '#F28DB2', '#FFD84A', '#6DBA5A', '#9A73E0', '#FF9F3D', '#F6F3EE'][(k + i) % 7], x + Math.cos(a) * 0.09, 0.055, z + Math.sin(a) * 0.09, 0.4);
          s.scale.y = 0.5; g.add(s);
        }
      }
    });
    return g;
  },

  canteiro(style) {
    const g = new THREE.Group();
    g.add(box(1.6, 0.16, 0.36, '#C9955B', 0, 0.08, 0));
    g.add(box(1.5, 0.04, 0.28, '#6B4A2E', 0, 0.165, 0, 1));
    for (let i = 0; i < 9; i++) {
      const x = -0.68 + i * 0.17, z = (i % 2 ? -0.06 : 0.06);
      if (style === 0) {
        const h = 0.38 + (i % 3) * 0.08;
        g.add(cyl(0.012, 0.015, h, '#3E8A43', x, 0.17 + h / 2, z, 6));
        const head = new THREE.Group();
        head.position.set(x, 0.17 + h, z + 0.02);
        head.rotation.x = 0.5;
        for (let p = 0; p < 10; p++) { const a = p / 10 * Math.PI * 2; const pet = ball(0.035, '#FFC93D', Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0); pet.scale.set(1, 0.6, 0.3); pet.rotation.z = a; head.add(pet); }
        head.add(ball(0.05, '#7A4A1E', 0, 0, 0.01));
        head.children.forEach(c => { c.castShadow = true; });
        g.add(head);
        g.add(ball(0.05, '#4E9A4B', x + 0.04, 0.17 + h * 0.45, z));
      } else if (style === 1) {
        for (let k = 0; k < 5; k++) {
          const xx = x + (k - 2) * 0.03, h = 0.22 + (k % 3) * 0.05;
          g.add(cyl(0.006, 0.008, h, '#5E8C6A', xx, 0.17 + h / 2, z, 5));
          const spike = cyl(0.016, 0.022, 0.1, k % 2 ? '#9A73E0' : '#B48CF2', xx, 0.17 + h + 0.03, z, 6);
          g.add(spike);
        }
      } else {
        g.add(ball(0.11, '#3E8A43', x, 0.25, z));
        for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + i; g.add(ball(0.045, i % 2 ? '#E84A6A' : '#F28DB2', x + Math.cos(a) * 0.08, 0.3 + (k % 2) * 0.04, z + Math.sin(a) * 0.08)); }
      }
    }
    return g;
  },

  arvore(style) {
    const g = new THREE.Group();
    const soil = cyl(0.42, 0.45, 0.05, '#7A5A3C', 0, 0.03, 0, 18); soil.castShadow = false; g.add(soil);
    if (style === 0) {
      g.add(cyl(0.07, 0.11, 1.3, '#7A5A3C', 0, 0.65, 0));
      const b1 = cyl(0.04, 0.05, 0.5, '#7A5A3C', -0.15, 1.15, 0); b1.rotation.z = 0.6; g.add(b1);
      const b2 = cyl(0.04, 0.05, 0.5, '#7A5A3C', 0.15, 1.2, 0.05); b2.rotation.z = -0.6; g.add(b2);
      [[0, 1.55, 0, 0.42, '#F4C430'], [-0.35, 1.4, 0.05, 0.3, '#F9D65C'], [0.36, 1.42, -0.05, 0.32, '#F9D65C'], [0.05, 1.85, 0.05, 0.28, '#FFDF6E'], [-0.15, 1.6, 0.3, 0.25, '#F4C430']]
        .forEach(([x, y, z, r, c]) => g.add(ball(r, c, x, y, z)));
      for (let i = 0; i < 8; i++) { const f = ball(0.03, '#F4C430', -0.4 + Math.random() * 0.8, 0.06, -0.4 + Math.random() * 0.8); f.scale.y = 0.4; g.add(f); }
    } else if (style === 1) {
      for (const [dx, dz, rz] of [[-0.08, 0, 0.25], [0.09, 0.03, -0.2], [0, -0.08, 0.05]]) {
        const t = cyl(0.05, 0.07, 0.9, '#6E5A4A', dx, 0.45, dz); t.rotation.z = rz; g.add(t);
        for (let k = 0; k < 9; k++) g.add(ball(0.03, '#2B1830', dx * 2 + Math.sin(k * 2.1) * 0.06, 0.2 + k * 0.08, dz + Math.cos(k * 2.1) * 0.06, 0.3));
      }
      [[0, 1.1, 0, 0.48, '#2F6B35'], [-0.35, 0.98, 0.05, 0.32, '#3A7A3F'], [0.36, 1.0, 0, 0.33, '#2F6B35'], [0, 1.4, 0, 0.3, '#3A7A3F']]
        .forEach(([x, y, z, r, c]) => g.add(ball(r, c, x, y, z)));
    } else {
      g.add(cyl(0.06, 0.09, 0.8, '#8A6A4C', 0, 0.4, 0));
      [[0, 1.05, 0, 0.45, '#5FAE57'], [-0.32, 0.92, 0.08, 0.3, '#6DBA5A'], [0.34, 0.95, -0.04, 0.3, '#5FAE57'], [0, 1.35, 0.05, 0.28, '#6DBA5A']]
        .forEach(([x, y, z, r, c]) => g.add(ball(r, c, x, y, z)));
      for (let i = 0; i < 14; i++) {
        const a = i * 2.3, rr = 0.42 + (i % 3) * 0.05;
        const l = ball(0.05, '#FFE14D', Math.cos(a) * rr * 0.9, 0.85 + (i % 5) * 0.11, Math.sin(a) * rr * 0.6 + 0.12, 0.4);
        l.scale.set(1, 0.8, 0.8); g.add(l);
      }
    }
    return g;
  },

  casinha(style) {
    const g = new THREE.Group();
    const wall = ['#B07A4B', '#5D8FD8', '#F2A7C3'][style];
    const roof = ['#7E5435', '#E15B4F', '#D9467F'][style];
    g.add(box(0.56, 0.4, 0.56, wall, 0, 0.2, 0));
    if (style === 0) for (let i = 0; i < 4; i++) g.add(box(0.565, 0.01, 0.565, '#8E5E36', 0, 0.08 + i * 0.09, 0));
    const r1 = box(0.42, 0.04, 0.66, roof, -0.16, 0.52, 0); r1.rotation.z = 0.72; g.add(r1);
    const r2 = box(0.42, 0.04, 0.66, roof, 0.16, 0.52, 0); r2.rotation.z = -0.72; g.add(r2);
    const gable = prism(0.56, 0.26, 0.5, wall); gable.position.y = 0.4; g.add(gable);
    g.add(box(0.06, 0.06, 0.68, roof, 0, 0.66, 0));
    const arch = new THREE.Shape();
    arch.moveTo(-0.11, 0); arch.lineTo(-0.11, 0.17); arch.absarc(0, 0.17, 0.11, Math.PI, 0, true); arch.lineTo(0.11, 0); arch.lineTo(-0.11, 0);
    const door = mesh(new THREE.ExtrudeGeometry(arch, { depth: 0.01, bevelEnabled: false }), mat('#2C2233'), 0, 0.005, 0.281);
    g.add(door);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.08), new THREE.MeshStandardMaterial({ map: textTex('ZOZO'), roughness: 0.8 }));
    plate.position.set(0, 0.4, 0.29); g.add(plate);
    if (style === 2) { const h = ball(0.05, '#FF5470', 0, 0.56, 0.29); h.scale.set(1, 0.9, 0.3); g.add(h); g.add(ball(0.04, '#FF5470', -0.035, 0.585, 0.29)); g.add(ball(0.04, '#FF5470', 0.035, 0.585, 0.29)); }
    const bowl = cyl(0.09, 0.06, 0.05, '#E15B4F', 0.42, 0.025, 0.25, 16); g.add(bowl);
    const food = cyl(0.07, 0.07, 0.01, '#B98652', 0.42, 0.05, 0.25, 16); g.add(food);
    const bone = new THREE.Group();
    bone.add(cyl(0.012, 0.012, 0.12, '#F6EFE0', 0, 0, 0, 6));
    [-0.06, 0.06].forEach(y => { bone.add(ball(0.018, '#F6EFE0', 0.012, y, 0)); bone.add(ball(0.018, '#F6EFE0', -0.012, y, 0)); });
    bone.rotation.z = Math.PI / 2; bone.rotation.y = 0.6; bone.position.set(-0.32, 0.02, 0.32); g.add(bone);
    return g;
  },

  banco(style) {
    const g = new THREE.Group();
    if (style === 0) {
      for (let i = 0; i < 3; i++) g.add(box(0.95, 0.03, 0.09, '#B9844D', 0, 0.36, -0.1 + i * 0.1));
      for (let i = 0; i < 2; i++) g.add(box(0.95, 0.08, 0.025, '#B9844D', 0, 0.52 + i * 0.12, -0.16));
      [[-0.42, 0.1], [0.42, 0.1], [-0.42, -0.14], [0.42, -0.14]].forEach(([x, z]) => g.add(box(0.05, 0.36, 0.05, '#8A5F36', x, 0.18, z)));
      [-0.42, 0.42].forEach(x => g.add(box(0.05, 0.36, 0.04, '#8A5F36', x, 0.55, -0.16)));
    } else if (style === 1) {
      const iron = '#2B2B2E';
      for (let i = 0; i < 4; i++) g.add(box(0.95, 0.025, 0.07, '#C9955B', 0, 0.37, -0.12 + i * 0.08));
      for (let i = 0; i < 3; i++) g.add(box(0.95, 0.05, 0.02, '#C9955B', 0, 0.5 + i * 0.09, -0.17));
      [-0.45, 0.45].forEach(x => {
        g.add(box(0.03, 0.75, 0.03, iron, x, 0.375, -0.17, 0.5));
        g.add(box(0.03, 0.36, 0.03, iron, x, 0.18, 0.13, 0.5));
        const arm = mesh(new THREE.TorusGeometry(0.15, 0.015, 8, 20, Math.PI), mat(iron, 0.5), x, 0.38, -0.02);
        arm.rotation.y = Math.PI / 2; g.add(arm);
      });
    } else {
      const wood = '#A8743F';
      [-0.55, 0.55].forEach(x => {
        const a = box(0.06, 1.15, 0.06, wood, x, 0.56, -0.18); a.rotation.x = 0.28; g.add(a);
        const b = box(0.06, 1.15, 0.06, wood, x, 0.56, 0.18); b.rotation.x = -0.28; g.add(b);
      });
      g.add(box(1.22, 0.07, 0.07, wood, 0, 1.1, 0));
      [-0.32, 0.32].forEach(x => g.add(cyl(0.008, 0.008, 0.68, '#E9DCC4', x, 0.76, 0, 6)));
      g.add(box(0.75, 0.04, 0.26, '#F28DB2', 0, 0.42, 0));
      g.add(box(0.75, 0.2, 0.03, '#F28DB2', 0, 0.53, -0.12));
    }
    return g;
  },

  plaquinha() {
    const g = new THREE.Group();
    g.add(box(0.05, 0.55, 0.05, '#8A5F36', 0, 0.275, 0));
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.03), [mat('#B9844D'), mat('#B9844D'), mat('#B9844D'), mat('#B9844D'),
      new THREE.MeshStandardMaterial({ map: textTex('Feito com o\nSeu Milton', { w: 300, h: 140, bg: '#C9955B', fg: '#3B2412', font: 'bold 40px Nunito, sans-serif' }), roughness: 0.8 }), mat('#B9844D')]);
    sign.position.set(0, 0.5, 0.03); sign.castShadow = true; g.add(sign);
    return g;
  }
};

export function buildItem(id, style) {
  const g = ITEMS[id](style);
  const s = SPOTS[id];
  const wrap = new THREE.Group();
  wrap.add(g);
  wrap.position.set(s.x, 0, s.z);
  wrap.rotation.y = s.ry;
  wrap.userData.item = id;
  wrap.traverse(o => { if (o.isMesh) o.userData.item = id; });
  return wrap;
}

const ghostMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.28, depthWrite: false });
export function buildGhost(id) {
  const g = buildItem(id, 0);
  g.traverse(o => { if (o.isMesh) { o.material = ghostMat; o.castShadow = false; o.receiveShadow = false; } });
  g.userData.ghost = true;
  return g;
}
export { ghostMat };
