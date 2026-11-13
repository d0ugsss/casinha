// Quarto de hóspedes: cama e poltrona de leitura perto da janela
import * as THREE from 'three';
import { S, mat, box, cyl, ball, group, kit, kitTop, interior, curtains, drawTex, onLeftWall, makeRoom, ROOM } from './common.js';

const x0 = -ROOM.w / 2, z0 = -ROOM.d / 2;
const WIN = [0.45, 1.25, 0.42, 1.32];
const winC = x0 + (WIN[0] + WIN[1]) / 2;
const BS = S * 0.62, BX = 0.75;

const ITEMS = {
  cama(s) {
    const g = new THREE.Group();
    const sheet = { carpetWhite: '#F7F3EC', carpet: '#B9D4C6', wood: '#C9A07A', metal: '#C9CED3' };
    if (s === 0) {
      g.add(kit('bedSingle', { x: BX, z: z0 + 1.89 * BS / 2 + 0.02, s: BS * 1.1, colors: sheet }));
      g.add(box(1.62 * BS * 0.95, 0.12, 1.91 * BS * 0.9, '#C9A07A', BX, 0.06, z0 + 1.89 * BS / 2 + 0.25));
    } else if (s === 1) g.add(kit('bedDouble', { x: BX, z: z0 + 1.91 * BS / 2 + 0.02, s: BS, colors: { ...sheet, carpet: '#F2D7A6' } }));
    else {
      g.add(kit('loungeSofa', { x: BX, z: z0 + 0.34, ry: Math.PI, s: S * 1.15, colors: { carpet: '#7FA7D6', wood: '#6B4A2E' } }));
      g.add(box(0.3, 0.2, 0.08, '#F7F3EC', BX - 0.3, 0.5, z0 + 0.33), box(0.3, 0.2, 0.08, '#F2B8C6', BX + 0.3, 0.5, z0 + 0.33));
    }
    return g;
  },
  poltrona(s) {
    const carpet = ['#D8A43B', '#E79AB5', '#6E9E86'][s];
    return group(kit('loungeChairRelax', { x: -1.25, z: -0.55, ry: 0.5, s: S * 1.05, colors: { carpet, wood: '#8B5E3C', metal: '#C9CED3' } }),
      kit('lampRoundFloor', { x: -1.85, z: -1.15, s: S, colors: { lamp: '#FFF1C9' } }));
  },
  comoda(s) {
    const wood = ['#B98652', '#F4F2EE', '#7FB8E0'][s];
    const g = group(kit('sideTableDrawers', { x: x0 + 0.3, z: 0.55, ry: Math.PI / 2, s: S * 1.45, colors: { wood, _defaultMat: s === 2 ? '#F28DB2' : '#E9E1D6', metal: '#C8A15A' } }));
    if (s === 2) g.add(box(0.03, 0.12, 0.55, '#FFC93D', x0 + 0.62, 0.42, 0.55));
    return g;
  },
  tapete(s) {
    if (s === 0) return kit('rugRound', { x: -0.2, z: 0.35, s: S * 1.3, colors: { carpet: '#E9D3C0', carpetDarker: '#D7B8A0' } });
    if (s === 1) return kit('rugRounded', { x: -0.1, z: 0.35, s: S * 1.15, colors: { carpet: '#F7F1E8', carpetDarker: '#EADFCF' } });
    return kit('rugRectangle', { x: -0.1, z: 0.35, s: S * 1.15, colors: { carpet: '#9DBCE0', carpetDarker: '#F7F1E8' } });
  },
  cortina(s) {
    if (s === 2) {
      const g = new THREE.Group();
      for (let i = 0; i < 12; i++) g.add(box(WIN[1] - WIN[0] + 0.1, 0.025, 0.01, '#F4F2EE', winC, 0.48 + i * 0.075, z0 + 0.05));
      return g;
    }
    const color = s === 0 ? '#EADCC2' : '#F6D7E0';
    return curtains({ wall: 'back', c: winC, span: WIN[1] - WIN[0], top: 1.4, len: 1.25, color });
  },
  planta(s) {
    const g = new THREE.Group();
    const x = 1.85, z = 0.9;
    g.add(cyl(0.12, 0.09, 0.24, '#C9A07A', x, 0.12, z));
    if (s === 0) for (let i = 0; i < 10; i++) { const a = i * 0.63; const v = box(0.03, 0.42, 0.03, '#4E9A4B', x + Math.cos(a) * 0.08, 0.3, z + Math.sin(a) * 0.08); v.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7); g.add(v); for (let k = 0; k < 3; k++) g.add(ball(0.035, '#6DBA5A', x + Math.cos(a) * (0.16 + k * 0.06), 0.42 - k * 0.1, z + Math.sin(a) * (0.16 + k * 0.06))); }
    else if (s === 1) { g.add(cyl(0.015, 0.02, 0.6, '#7A5A3C', x, 0.5, z)); [[0, 0.85, 0], [0.12, 0.72, 0.05], [-0.1, 0.7, -0.06], [0.03, 0.62, 0.12]].forEach(([dx, y, dz]) => g.add(ball(0.14, '#3E8E4B', x + dx, y, z + dz))); }
    else for (let i = 0; i < 7; i++) { const a = i * 0.9; const f = box(0.06, 0.02, 0.45, '#5FAE57', x + Math.cos(a) * 0.15, 0.55, z + Math.sin(a) * 0.15); f.rotation.set(0.6, -a + Math.PI / 2, 0); g.add(f); g.add(cyl(0.01, 0.012, 0.35, '#7A5A3C', x, 0.38, z)); }
    return g;
  },
  carrinho() { // presente do pai do Dodô: carrinho com a placa MARCHA LENTA, numa prateleira
    const g = new THREE.Group();
    g.add(box(0.2, 0.025, 0.5, '#9C6E43', 0, 0, 0));
    g.add(box(0.13, 0.06, 0.26, '#C0392B', 0.02, 0.05, 0), box(0.11, 0.05, 0.13, '#C0392B', 0.02, 0.1, -0.02), box(0.1, 0.04, 0.12, '#BFE3F0', 0.02, 0.1, -0.02));
    [[-0.05, -0.08], [0.09, -0.08], [-0.05, 0.08], [0.09, 0.08]].forEach(([dx, dz]) => { const w = cyl(0.025, 0.025, 0.02, '#1F1F1F', dx, 0.03, dz); w.rotation.z = Math.PI / 2; g.add(w); });
    const plate = drawTex(160, 48, (gg, w, h) => { gg.fillStyle = '#FFFFFF'; gg.fillRect(0, 0, w, h); gg.fillStyle = '#2F4F9F'; gg.fillRect(0, 0, w, 12); gg.fillStyle = '#1F1F1F'; gg.font = 'bold 22px Nunito, sans-serif'; gg.textAlign = 'center'; gg.fillText('MARCHA LENTA', w / 2, 38); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.036), new THREE.MeshBasicMaterial({ map: plate }));
    p.rotation.y = Math.PI / 2; p.position.set(0.09, 0.05, 0); g.add(p);
    return onLeftWall(g, -0.45, 0.9);
  }
};

export default makeRoom({
  id: 'hospedes',
  kit: ['bedSingle', 'bedDouble', 'loungeSofa', 'loungeChairRelax', 'lampRoundFloor', 'sideTableDrawers', 'rugRound', 'rugRounded', 'rugRectangle'],
  base() { return group(interior({ win: WIN, floor: 'madeira', wall: '#E6E0D6' })); },
  items: ITEMS,
  spots: { tata: [-0.35, 1.0], dodo: [0.25, 1.0], zozo: [-0.85, 1.0], pai: [0.0, 0.45], marci: [1.3, 0.85], milton: [1.5, 0.75], ana: [1.2, 0.9], italo: [1.6, 0.85], vitoria: [1.4, 0.9] },
  center: [0.0, 0.5, -0.05], radius: 8.4, elev: 0.5, yaw: 0.5, yawMin: 0.12, yawMax: 0.9, want: 5.5
});
