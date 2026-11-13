// Escritório: mesa de dois lugares, um trabalha e a outra estuda
import * as THREE from 'three';
import { S, mat, box, cyl, group, kit, kitTop, interior, frame, photo, drawTex, textTex, glow, onBackWall, onLeftWall, makeRoom, ROOM } from './common.js';

const x0 = -ROOM.w / 2, z0 = -ROOM.d / 2;
const WIN = [1.55, 2.35, 0.62, 1.34];
const DX = -0.25, DZ = z0 + 0.42; // centro da mesa dupla
const deskTop = () => kitTop('desk');

const ITEMS = {
  mesa(s) {
    const g = new THREE.Group();
    if (s === 2) g.add(kit('deskCorner', { x: DX + 0.2, z: DZ + 0.22, s: S * 1.05, colors: { wood: '#C9A07A', metal: '#2B2B2E' } }));
    else {
      const wood = s === 0 ? '#B98652' : '#F4F2EE';
      [-0.5, 0.5].forEach(dx => g.add(kit('desk', { x: DX + dx, z: DZ, colors: { wood, metal: '#2B2B2E' } })));
    }
    // cantinho de estudo da Tata: livros e caderno
    const y = deskTop();
    ['#E85D8A', '#5D8FD8', '#FFC93D'].forEach((c, i) => g.add(box(0.22, 0.04, 0.16, c, DX + 0.62, y + 0.02 + i * 0.04, DZ - 0.05)));
    g.add(box(0.24, 0.01, 0.17, '#FFFFFF', DX + 0.3, y + 0.005, DZ + 0.05));
    return g;
  },
  cadeira(s) {
    const g = new THREE.Group();
    [-0.5, 0.5].forEach(dx => {
      const x = DX + dx, z = DZ + 0.48;
      if (s === 0) {
        g.add(box(0.36, 0.06, 0.34, '#2B2B2E', x, 0.34, z), box(0.36, 0.58, 0.07, '#2B2B2E', x, 0.66, z + 0.17), box(0.2, 0.5, 0.075, '#E85D8A', x, 0.66, z + 0.17));
        g.add(cyl(0.025, 0.025, 0.3, '#3B3B3B', x, 0.17, z), cyl(0.18, 0.18, 0.03, '#3B3B3B', x, 0.03, z, 5));
      } else if (s === 1) g.add(kit('chairDesk', { x, z, ry: Math.PI, s: S * 1.05, colors: { metalMedium: '#5F6670', carpet: '#4C5560' } }));
      else g.add(kit('chairCushion', { x, z, ry: Math.PI, s: S * 1.05, colors: { wood: '#D9B48A', carpet: '#F4F2EE' } }));
    });
    return g;
  },
  pc(s) {
    const g = new THREE.Group();
    const y = deskTop(), x = DX - 0.5;
    if (s === 1) { g.add(kit('laptop', { x, y, z: DZ, s: S * 0.75, colors: { metalDark: '#3B3F45', metal: '#C9CED3' } })); return g; }
    [-0.17, 0.17].forEach(dx => { const sc = kit('computerScreen', { x: x + dx, y, z: DZ - 0.05, ry: dx * -1.2, s: S * 0.9, colors: { metalDark: '#23272C', metal: '#2B2F35' } }); g.add(sc); });
    g.add(kit('computerKeyboard', { x, y, z: DZ + 0.12, s: S * 0.9, colors: { metalDark: '#2B2B2E', metalMedium: '#3B3B3B' } }));
    g.add(kit('computerMouse', { x: x + 0.24, y, z: DZ + 0.13, s: S * 0.9 }));
    if (s === 2) { g.add(box(1.9, 0.015, 0.015, glow('#B25CFF', 2.2), DX, y - 0.02, DZ + 0.28)); g.add(box(0.6, 0.015, 0.015, glow('#3BD1FF', 2.2), x, y + 0.42, DZ - 0.12)); }
    return g;
  },
  estante(s) {
    const g = new THREE.Group();
    if (s === 2) {
      [0.25, 0.85].forEach(z => { g.add(kit('bookcaseClosedWide', { x: x0 + 0.18, z, ry: Math.PI / 2, colors: { wood: '#C9A07A' } })); g.add(kit('bookcaseClosedWide', { x: x0 + 0.18, y: kitTop('bookcaseClosedWide'), z, ry: Math.PI / 2, sy: 0.55, colors: { wood: '#C9A07A' } })); });
      return g;
    }
    [0.2, 0.75].forEach(z => g.add(kit('bookcaseOpen', { x: x0 + 0.18, z, ry: Math.PI / 2, colors: { wood: s === 0 ? '#9C6E43' : '#F4F2EE' } })));
    const cols = ['#E85D8A', '#5D8FD8', '#FFC93D', '#6DBA5A', '#9A73E0'];
    [0.3, 0.62, 0.92].forEach((y, row) => [0.2, 0.75].forEach((z, j) => {
      if (s === 1) g.add(box(0.2, 0.22, 0.42, cols[(row + j * 2) % 5], x0 + 0.13, y + 0.11, z));
      for (let k = 0; k < 5; k++) g.add(box(0.13, 0.17 + (k % 3) * 0.02, 0.05, cols[(k + row + j) % 5], x0 + 0.2, y + 0.09, z - 0.13 + k * 0.065));
    }));
    return g;
  },
  luminaria(s) {
    if (s === 0) return kit('lampSquareTable', { x: DX - 0.05, y: deskTop(), z: DZ - 0.1, colors: { lamp: '#FFE9B0', metal: '#2B2B2E' } });
    if (s === 1) return kit('lampSquareFloor', { x: DX + 1.18, z: DZ + 0.1, s: S * 1.1, colors: { lamp: '#FFE9B0', metal: '#2B2B2E' } });
    return group(box(ROOM.w - 0.2, 0.02, 0.02, glow('#FFB3D9', 2.4), 0, 1.5, z0 + 0.02), box(0.02, 0.02, ROOM.d - 0.2, glow('#FFB3D9', 2.4), x0 + 0.02, 1.5, 0));
  },
  mural(s) {
    let map;
    if (s === 0) map = drawTex(256, 192, (g, w, h) => {
      g.fillStyle = '#C49A6C'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(90,60,30,${Math.random() * 0.25})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      [['#FFF59D', 30, 24], ['#F8BBD0', 120, 30], ['#B3E5FC', 190, 70], ['#C8E6C9', 60, 110], ['#FFF59D', 150, 120]].forEach(([c, x, y]) => { g.fillStyle = c; g.fillRect(x, y, 50, 46); g.fillStyle = '#C0392B'; g.beginPath(); g.arc(x + 25, y + 5, 4, 0, 7); g.fill(); });
    });
    else if (s === 1) map = drawTex(256, 192, (g, w, h) => {
      g.fillStyle = '#FBFBF9'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#2F6FB5'; g.lineWidth = 4; g.font = 'bold 26px Nunito, sans-serif'; g.fillStyle = '#2F6FB5'; g.fillText('metas 2027', 18, 40);
      g.strokeStyle = '#C0392B'; [70, 100, 130].forEach(y => { g.beginPath(); g.moveTo(24, y); g.lineTo(150 + Math.random() * 60, y); g.stroke(); });
      g.fillStyle = '#C0392B'; g.fillText('♥', 200, 160);
    });
    else map = photo('quadro2.jpg');
    const g = frame(map, { w: 0.6, h: 0.45, border: s === 1 ? '#C9CED3' : '#9C6E43', bw: 0.025 });
    return onBackWall(g, 1.1, 1.0);
  },
  cracha() { // presente da Margarida (urgente 2)
    const t = drawTex(96, 128, (g, w, h) => { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h); g.fillStyle = '#2F6FB5'; g.fillRect(0, 0, w, 30); g.fillStyle = '#FFF'; g.font = 'bold 16px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('HOSPITAL', w / 2, 21); g.fillStyle = '#D9A7CF'; g.fillRect(28, 38, 40, 44); g.fillStyle = '#3B2A3F'; g.font = 'bold 18px Nunito, sans-serif'; g.fillText('Tatiana', w / 2, 104); g.font = '13px Nunito, sans-serif'; g.fillText('Enfermagem', w / 2, 120); });
    const card = box(0.1, 0.13, 0.008, new THREE.MeshStandardMaterial({ map: t }), 0, 0, 0.02);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.006, 6, 24, Math.PI), mat('#2F6FB5'));
    strap.rotation.z = Math.PI; strap.position.set(0, 0.1, 0.015);
    return onBackWall(group(card, strap, cyl(0.01, 0.01, 0.04, '#C8A15A', 0, 0.18, 0.02)), 0.55, 0.98);
  },
  placaEnf() { // presente da Margarida (urgente 3)
    const t = textTex('Enf. Tati', { w: 320, h: 110, bg: '#2F6FB5', fg: '#FFFFFF', font: 'bold 54px "Baloo 2", Nunito, sans-serif' });
    return onBackWall(frame(t, { w: 0.42, h: 0.14, border: '#F4F2EE', bw: 0.02 }), -1.4, 1.22);
  }
};

export default makeRoom({
  id: 'escritorio',
  kit: ['desk', 'deskCorner', 'chairDesk', 'chairCushion', 'laptop', 'computerScreen', 'computerKeyboard', 'computerMouse', 'bookcaseOpen', 'bookcaseClosedWide', 'lampSquareTable', 'lampSquareFloor', 'rugRectangle', 'plantSmall3'],
  base() {
    return group(interior({ win: WIN, floor: 'madeira', wall: '#DCE3E2' }),
      kit('rugRectangle', { x: DX, z: 0.55, s: S * 1.05, colors: { carpet: '#E4E9EF', carpetDarker: '#9DB2C9' } }),
      kit('plantSmall3', { x: 1.85, z: z0 + 0.2, s: S * 1.3, colors: { plant: '#5DB86A' } }));
  },
  items: ITEMS,
  spots: { tata: [-0.3, 1.05], dodo: [0.3, 1.0], zozo: [-0.85, 1.0], marci: [1.25, 0.6], milton: [1.45, 0.45], ana: [1.2, 0.6], italo: [1.5, 0.55], vitoria: [1.3, 0.6], pai: [1.35, 0.55] },
  center: [0.0, 0.5, -0.05], radius: 8.4, elev: 0.5, yaw: 0.5, yawMin: 0.12, yawMax: 0.9, want: 5.5
});
