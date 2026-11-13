// Área gourmet: nasce do zero no fundo do quintal
import * as THREE from 'three';
import { S, mat, box, cyl, ball, group, kit, kitTop, texMat, drawTex, glow, makeRoom } from './common.js';

const W = 4.6, D = 3.2, x0 = -W / 2, z0 = -D / 2;

const ITEMS = {
  churrasqueira(s) {
    const g = new THREE.Group();
    const x = x0 + 0.55, z = z0 + 0.38;
    if (s === 0) {
      g.add(box(0.9, 0.62, 0.6, texMat('tijolo', [1.5, 1]), x, 0.31, z));
      g.add(box(0.96, 0.05, 0.66, '#9C9890', x, 0.645, z));
      g.add(box(0.7, 0.42, 0.04, '#2B2B2E', x, 0.9, z - 0.2), box(0.08, 0.42, 0.45, texMat('tijolo', [0.3, 1]), x - 0.41, 0.9, z), box(0.08, 0.42, 0.45, texMat('tijolo', [0.3, 1]), x + 0.41, 0.9, z));
      g.add(box(0.9, 0.12, 0.5, texMat('tijolo', [1.5, 0.3]), x, 1.17, z - 0.03), box(0.3, 0.45, 0.3, texMat('tijolo', [0.5, 0.8]), x, 1.45, z - 0.1));
      for (let i = 0; i < 4; i++) g.add(box(0.05, 0.03, 0.03, glow('#FF7A2E', 1.4), x - 0.25 + i * 0.16, 0.7, z));
    } else if (s === 1) {
      g.add(box(0.9, 0.62, 0.55, mat('#BFC5CA', 0.3, { metalness: 0.6 }), x, 0.31, z));
      g.add(box(0.86, 0.06, 0.5, '#2B2B2E', x, 0.65, z), box(0.9, 0.3, 0.06, mat('#BFC5CA', 0.3, { metalness: 0.6 }), x, 0.82, z - 0.25));
      g.add(box(0.5, 0.02, 0.02, '#2B2B2E', x, 0.5, z + 0.28));
    } else {
      [-1, 1].forEach(a => [-1, 1].forEach(b => { const l = cyl(0.015, 0.015, 0.6, '#2B2B2E', x + a * 0.16, 0.3, z + b * 0.16); l.rotation.set(b * 0.15, 0, -a * 0.15); g.add(l); }));
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat('#2B2B2E', 0.4)); bowl.position.set(x, 0.62, z); bowl.castShadow = true; g.add(bowl);
      const lid = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat('#C0392B', 0.4)); lid.position.set(x, 0.63, z); lid.castShadow = true; g.add(lid);
      g.add(cyl(0.03, 0.03, 0.04, '#2B2B2E', x, 0.95, z));
    }
    return g;
  },
  bancada(s) {
    const g = new THREE.Group();
    const x = 0.25, z = z0 + 0.32, w = 1.5;
    const body = ['#3B3B3E', '#B98652', '#F1EFEA'][s];
    g.add(box(w, 0.6, 0.55, body, x, 0.3, z));
    g.add(box(w + 0.04, 0.04, 0.6, s === 0 ? texMat('granito', [2, 0.5], 0.3) : s === 1 ? mat('#8F6440', 0.6) : texMat('porcelanato', [2, 0.6], 0.3), x, 0.62, z));
    g.add(box(0.36, 0.05, 0.3, '#C9CED3', x + 0.35, 0.615, z), cyl(0.01, 0.01, 0.22, '#C9CED3', x + 0.35, 0.74, z - 0.18));
    [-0.5, -0.1].forEach(dx => g.add(box(0.36, 0.5, 0.02, s === 0 ? '#2B2B2E' : s === 1 ? '#9C6E43' : '#E2DED6', x + dx, 0.3, z + 0.28)));
    return g;
  },
  mesa(s) {
    const g = new THREE.Group();
    const x = 0.15, z = 0.45;
    const wood = s === 1 ? '#F4F2EE' : '#8F6440';
    g.add(box(1.5, 0.05, 0.7, wood, x, 0.5, z));
    [[-0.68, -0.28], [0.68, -0.28], [-0.68, 0.28], [0.68, 0.28]].forEach(([dx, dz]) => g.add(box(0.06, 0.48, 0.06, s === 0 ? '#6B4A2E' : wood, x + dx, 0.24, z + dz)));
    if (s === 2) [-0.48, 0.48].forEach(dz => g.add(box(1.4, 0.04, 0.22, '#8F6440', x, 0.3, z + dz), box(0.05, 0.28, 0.18, '#6B4A2E', x - 0.6, 0.14, z + dz), box(0.05, 0.28, 0.18, '#6B4A2E', x + 0.6, 0.14, z + dz)));
    else [-0.45, 0, 0.45].forEach(dx => { g.add(kit('chair', { x: x + dx, z: z - 0.5, colors: { wood: s === 0 ? '#9C6E43' : '#F4F2EE' } })); g.add(kit('chair', { x: x + dx, z: z + 0.5, ry: Math.PI, colors: { wood: s === 0 ? '#9C6E43' : '#F4F2EE' } })); });
    return g;
  },
  banquetas(s) {
    const g = new THREE.Group();
    const wood = ['#9C6E43', '#2B2B2E', '#D8B67A'][s], seat = ['#9C6E43', '#3B3B3E', '#E8D2A0'][s];
    [-0.3, 0.2, 0.7].forEach(dx => g.add(kit('stoolBarSquare', { x: 0.25 + dx - 0.2, z: z0 + 0.82, s: S * 1.15, colors: { wood, carpet: seat } })));
    return g;
  },
  varal(s) {
    const g = new THREE.Group();
    const posts = [[x0 + 0.1, z0 + 0.1], [W / 2 - 0.1, z0 + 0.1], [W / 2 - 0.1, D / 2 - 0.1], [x0 + 0.1, D / 2 - 0.1]];
    posts.forEach(([x, z]) => g.add(cyl(0.025, 0.03, 1.75, '#6B4A2E', x, 0.875, z)));
    const cols = ['#FFE08A', '#FF6B6B', '#6BD3FF', '#9BE36B', '#FFB3E6', '#FFC93D'];
    const span = (a, b, n) => {
      for (let i = 0; i <= n; i++) {
        const k = i / n, x = a[0] + (b[0] - a[0]) * k, z = a[1] + (b[1] - a[1]) * k, y = 1.7 - Math.sin(k * Math.PI) * 0.18;
        if (i < n) { const nx = a[0] + (b[0] - a[0]) * (k + 1 / n), nz = a[1] + (b[1] - a[1]) * (k + 1 / n), ny = 1.7 - Math.sin((k + 1 / n) * Math.PI) * 0.18; const len = Math.hypot(nx - x, ny - y, nz - z); const seg = cyl(0.003, 0.003, len, '#3B3B3B', (x + nx) / 2, (y + ny) / 2, (z + nz) / 2); seg.lookAt(nx, ny, nz); seg.rotateX(Math.PI / 2); g.add(seg); }
        if (i === 0 || i === n) continue;
        if (s === 2) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 3), mat(cols[i % 6], 0.8)); f.rotation.x = Math.PI; f.position.set(x, y - 0.06, z); g.add(f); }
        else g.add(ball(0.03, glow(s === 0 ? '#FFE08A' : cols[i % 6], 1.6), x, y - 0.04, z));
      }
    };
    span(posts[0], posts[2], 10); span(posts[1], posts[3], 10);
    return g;
  },
  rede(s) {
    const g = new THREE.Group();
    const x = W / 2 - 0.45;
    if (s === 2) {
      g.add(cyl(0.02, 0.02, 1.0, '#C9CED3', x, 1.2, 0.0));
      const egg = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14, 0, Math.PI * 1.3, 0, Math.PI), mat('#D8B67A', 0.9, { side: THREE.DoubleSide }));
      egg.position.set(x, 0.6, 0); egg.rotation.y = 0.9; egg.castShadow = true; g.add(egg);
      g.add(box(0.36, 0.08, 0.36, '#F4F2EE', x, 0.38, 0));
      return g;
    }
    [-0.7, 0.7].forEach(dz => g.add(cyl(0.035, 0.04, 1.2, '#6B4A2E', x, 0.6, dz)));
    const geo = new THREE.PlaneGeometry(0.5, 1.2, 8, 16);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const v = p.getY(i) / 0.6; p.setZ(i, -(1 - v * v) * 0.28 - Math.abs(p.getX(i)) * 0.0); }
    geo.computeVertexNormals();
    const tex = drawTex(64, 128, (gg, w, h) => { const c = s === 0 ? ['#FAFAF7', '#EDE7DD'] : ['#E85D8A', '#FFC93D', '#5D8FD8', '#6DBA5A']; for (let k = 0; k < 16; k++) { gg.fillStyle = c[k % c.length]; gg.fillRect(k * w / 16, 0, w / 16, h); } });
    const net = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 1, side: THREE.DoubleSide }));
    net.rotation.x = -Math.PI / 2; net.rotation.z = Math.PI / 2; net.position.set(x, 0.85, 0); net.castShadow = true; g.add(net);
    return g;
  },
  forno() { // presente da Ana e do Italo: forno de pizza
    const g = new THREE.Group();
    const x = W / 2 - 0.5, z = z0 + 0.45;
    g.add(box(0.8, 0.55, 0.7, texMat('tijolo', [1.3, 1]), x, 0.275, z));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat('#D9774F', 0.9)); dome.position.set(x, 0.55, z); dome.castShadow = true; g.add(dome);
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20, 0, Math.PI), new THREE.MeshBasicMaterial({ color: '#2B1A12' })); mouth.position.set(x, 0.56, z + 0.37); g.add(mouth);
    g.add(ball(0.05, glow('#FF8A3D', 1.5), x, 0.6, z + 0.25));
    g.add(cyl(0.06, 0.06, 0.3, '#9C9890', x, 1.0, z - 0.1));
    return g;
  }
};

export default makeRoom({
  id: 'gourmet',
  outdoor: true,
  kit: ['chair', 'stoolBarSquare', 'pottedPlant'],
  base() {
    const g = new THREE.Group();
    const grass = box(W + 1.0, 0.1, D + 0.8, texMat('grama', [4, 3], 1), 0, -0.07, 0.2); grass.castShadow = false; g.add(grass);
    const deck = box(W, 0.06, D, texMat('deck', [W / 0.9, 1], 0.8), 0, 0.0, 0); deck.castShadow = false; g.add(deck);
    g.add(box(W + 0.2, 1.1, 0.16, texMat('tijolo', [6, 1.6]), 0, 0.55, z0 - 0.1), box(W + 0.28, 0.06, 0.22, '#9C9890', 0, 1.12, z0 - 0.1));
    g.add(box(0.16, 1.1, D * 0.5, texMat('tijolo', [2, 1.6]), x0 - 0.08, 0.55, z0 + D * 0.25), box(0.22, 0.06, D * 0.5, '#9C9890', x0 - 0.08, 1.12, z0 + D * 0.25));
    g.add(kit('pottedPlant', { x: x0 + 0.3, z: D / 2 - 0.3, s: S * 1.15, colors: { plant: '#5DB86A' } }));
    [[x0 - 0.3, -0.2], [W / 2 + 0.25, -1.3]].forEach(([x, z]) => { g.add(cyl(0.06, 0.09, 1.1, '#7A5A3C', x, 0.55, z)); [[0, 1.3, 0, 0.45], [0.25, 1.15, 0.1, 0.32], [-0.2, 1.2, -0.1, 0.32]].forEach(([dx, y, dz, r]) => g.add(ball(r, '#4E9A4B', x + dx, y, z + dz))); });
    return g;
  },
  items: ITEMS,
  spots: {
    tata: [-0.2, 1.15], dodo: [0.35, 1.15], zozo: [-0.65, 1.2], ana: [-1.3, 0.55], italo: [-0.85, 0.85],
    marci: [1.05, 1.05], milton: [1.5, 0.85], vitoria: [-1.6, 0.95], pai: [1.85, 0.4], margarida: [0.95, 0.3]
  },
  center: [0.0, 0.45, -0.05], radius: 8.6, elev: 0.52, yaw: 0.35, yawMin: -0.2, yawMax: 0.85, want: 5.7
});
