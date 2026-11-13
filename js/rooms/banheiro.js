// Banheiro: pia com espelho de um lado, box do outro
import * as THREE from 'three';
import { S, mat, box, cyl, ball, group, kit, kitTop, interior, texMat, drawTex, textTex, glow, onBackWall, onLeftWall, makeRoom } from './common.js';

const W = 3.6, D = 2.6, x0 = -W / 2, z0 = -D / 2;
const WIN = [1.0, 1.6, 0.98, 1.36];
const SINKZ = -0.2;

const ITEMS = {
  revest(s) {
    const name = ['metro', 'verde', 'cimento'][s];
    const h = 1.0;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, h), texMat(name, [W / 0.6, h / 0.6], 0.4));
    back.position.set(0, h / 2, z0 + 0.004); back.receiveShadow = true;
    const left = new THREE.Mesh(new THREE.PlaneGeometry(D, h), texMat(name, [D / 0.6, h / 0.6], 0.4));
    left.rotation.y = Math.PI / 2; left.position.set(x0 + 0.004, h / 2, 0); left.receiveShadow = true;
    return group(back, left, box(W, 0.025, 0.02, s === 1 ? '#5F907A' : '#E8E6E1', 0, h, z0 + 0.012));
  },
  pia(s) {
    const wood = ['#B98652', '#F4F2EE', '#2F2F33'][s];
    return group(kit('bathroomCabinetDrawer', { x: x0 + 0.33, z: SINKZ, ry: Math.PI / 2, s: S * 1.15, colors: { wood, carpetWhite: '#F7F7F5', metalLight: '#DADFE3' } }));
  },
  espelho(s) {
    const g = new THREE.Group();
    const mirror = mat('#DCEBF0', 0.05, { metalness: 0.6 });
    if (s === 0) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 10, 40), mat('#2B2B2E', 0.5)); ring.castShadow = true; g.add(ring);
      const m = new THREE.Mesh(new THREE.CircleGeometry(0.22, 40), mirror); m.position.z = -0.005; g.add(m);
    } else if (s === 1) {
      g.add(box(0.46, 0.56, 0.02, glow('#FFF6DD', 0.9), 0, 0, -0.01));
      const m = box(0.4, 0.5, 0.02, mirror, 0, 0, 0.005); g.add(m);
    } else {
      g.add(box(0.44, 0.58, 0.03, mat('#C8A15A', 0.35, { metalness: 0.6 }), 0, 0, -0.012));
      g.add(box(0.36, 0.5, 0.02, mirror, 0, 0, 0.006));
    }
    return onLeftWall(g, SINKZ, 1.08, W);
  },
  box(s) {
    const g = new THREE.Group();
    const cx = 1.15, cz = z0 + 0.5, sw = 0.95, sd = 0.95;
    g.add(box(sw, 0.05, sd, '#F4F2EE', cx, 0.025, cz));
    g.add(cyl(0.03, 0.03, 0.01, '#9AA3A8', cx, 0.055, cz, 12));
    const glass = new THREE.MeshStandardMaterial({ color: '#D8EEF4', transparent: true, opacity: 0.3, roughness: 0.05 });
    if (s === 1) {
      const geo = new THREE.PlaneGeometry(sd, 1.2, 20, 1);
      const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 18) * 0.02);
      geo.computeVertexNormals();
      const c = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#F2B8C6', roughness: 1, side: THREE.DoubleSide })); c.castShadow = true;
      c.rotation.y = Math.PI / 2; c.position.set(cx - sw / 2, 0.72, cz); g.add(c);
      const rod = cyl(0.008, 0.008, sd, '#C9CED3', cx - sw / 2, 1.33, cz); rod.rotation.x = Math.PI / 2; g.add(rod);
    } else {
      const side = box(0.02, 1.25, sd, glass, cx - sw / 2, 0.68, cz); side.castShadow = false; g.add(side);
      const front = box(sw * 0.55, 1.25, 0.02, glass, cx - sw * 0.22, 0.68, cz + sd / 2); front.castShadow = false; g.add(front);
      g.add(box(0.02, 1.25, 0.03, '#9AA3A8', cx - sw / 2, 0.68, cz + sd / 2));
    }
    if (s === 2) { g.add(cyl(0.16, 0.16, 0.02, '#C9CED3', cx, 1.4, cz)); g.add(cyl(0.008, 0.008, 0.18, '#C9CED3', cx, 1.48, cz)); }
    else { g.add(cyl(0.008, 0.008, 0.3, '#C9CED3', cx, 1.18, z0 + 0.06)); const head = cyl(0.06, 0.04, 0.03, '#C9CED3', cx, 1.3, z0 + 0.12); head.rotation.x = 0.6; g.add(head); }
    return g;
  },
  toalhas(s) {
    const g = new THREE.Group();
    const bar = cyl(0.01, 0.01, 0.55, '#C9CED3', 0.2, 0.92, z0 + 0.05); bar.rotation.z = Math.PI / 2; g.add(bar);
    const cols = [['#FAFAF7', '#F0EEE9'], ['#F2B8C6', '#E68FA6'], ['#9DBCE0', '#FAFAF7']][s];
    [-0.13, 0.13].forEach((dx, i) => {
      if (s === 2) {
        const t = drawTex(64, 128, (gg, w, h) => { for (let k = 0; k < 8; k++) { gg.fillStyle = k % 2 ? cols[0] : cols[1]; gg.fillRect(0, k * h / 8, w, h / 8); } });
        g.add(box(0.2, 0.42, 0.025, new THREE.MeshStandardMaterial({ map: t, roughness: 1 }), 0.2 + dx, 0.72, z0 + 0.06));
      } else g.add(box(0.2, 0.42, 0.025, cols[i % 2], 0.2 + dx, 0.72, z0 + 0.06));
    });
    return g;
  },
  planta(s) {
    const g = new THREE.Group();
    const x = x0 + 0.3, z = 0.85;
    g.add(cyl(0.11, 0.08, 0.2, '#E9E1D6', x, 0.1, z));
    if (s === 0) for (let i = 0; i < 6; i++) { const a = i * 1.05; const l = new THREE.Mesh(new THREE.CircleGeometry(0.11, 10), mat('#3E8E4B', 0.8, { side: THREE.DoubleSide })); l.position.set(x + Math.cos(a) * 0.1, 0.42 + (i % 2) * 0.1, z + Math.sin(a) * 0.1); l.rotation.set(-0.6, a, 0.3); l.castShadow = true; g.add(l); g.add(cyl(0.006, 0.006, 0.25, '#3E8E4B', x + Math.cos(a) * 0.05, 0.3, z + Math.sin(a) * 0.05)); }
    else if (s === 1) for (let i = 0; i < 9; i++) { const a = i * 0.7; const f = box(0.04, 0.02, 0.3, '#5FAE57', x + Math.cos(a) * 0.12, 0.3, z + Math.sin(a) * 0.12); f.rotation.set(0.5, -a + Math.PI / 2, 0); g.add(f); }
    else { g.add(cyl(0.05, 0.06, 0.36, '#4E9A4B', x, 0.38, z)); const arm = cyl(0.03, 0.035, 0.15, '#4E9A4B', x + 0.07, 0.42, z); arm.rotation.z = -0.9; g.add(arm); g.add(ball(0.025, '#F28DB2', x, 0.57, z)); }
    return g;
  },
  toalhinha() { // presente da Zozo
    const t = textTex('ZOZO', { w: 128, h: 96, bg: '#F2B8C6', fg: '#FFFFFF', font: 'bold 40px "Baloo 2", Nunito, sans-serif' });
    const g = group(box(0.24, 0.18, 0.02, new THREE.MeshStandardMaterial({ map: t, roughness: 1 }), 0, 0, 0.02), cyl(0.012, 0.012, 0.05, '#C9CED3', 0, 0.1, 0.02));
    return onLeftWall(g, 0.75, 0.82, W);
  }
};

export default makeRoom({
  id: 'banheiro',
  kit: ['bathroomCabinetDrawer', 'toiletSquare', 'rugDoormat'],
  base() {
    return group(interior({ w: W, d: D, win: WIN, floor: 'porcelanato', floorRepeat: [W / 0.75, D / 0.75], wall: '#E1E4E8' }),
      kit('toiletSquare', { x: -0.45, z: z0 + 0.32, s: S * 1.15, colors: { carpetWhite: '#FAFAF8', metalLight: '#E7EAEC' } }),
      kit('rugDoormat', { x: -0.9, z: 0.35, s: S * 1.3, colors: { wood: '#E9C9D3' } }));
  },
  items: ITEMS,
  spots: { tata: [-0.3, 0.75], dodo: [0.3, 0.8], zozo: [-0.75, 0.55], marci: [0.9, 0.7], ana: [0.9, 0.7], vitoria: [1.0, 0.75], milton: [1.0, 0.75], italo: [1.1, 0.7], pai: [1.0, 0.7] },
  center: [-0.05, 0.5, 0.0], radius: 8.0, elev: 0.52, yaw: 0.5, yawMin: 0.12, yawMax: 0.9, want: 4.7
});
