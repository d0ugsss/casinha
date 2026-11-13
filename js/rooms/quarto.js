// Nosso quarto: cama no meio, janela de lado, guarda-roupa na parede do fundo
import * as THREE from 'three';
import { S, mat, box, cyl, group, kit, kitTop, interior, curtains, frame, photo, drawTex, textTex, onBackWall, onLeftWall, makeRoom, ROOM } from './common.js';

const x0 = -ROOM.w / 2, z0 = -ROOM.d / 2;
const WINL = [0.55, 1.35, 0.45, 1.3]; // janela na parede da esquerda, medida a partir do fundo
const BS = S * 0.62;                   // escala da cama do kit
const BX = -0.5, BW = 1.62 * BS, BL = 1.91 * BS;
const BZ = z0 + BL / 2 + 0.02;

const sheet = { carpetWhite: '#F2EEE8', carpet: '#E9E4DC', metal: '#C9CED3' };
const ITEMS = {
  cama(s) {
    const g = new THREE.Group();
    if (s === 2) {
      g.add(kit('bedDouble', { x: BX, z: BZ, s: BS, sy: 0.65, colors: { ...sheet, wood: '#D9B48A' } }));
      g.add(box(BW + 0.16, 0.08, BL + 0.12, '#C9A07A', BX, 0.04, BZ));
      return g;
    }
    g.add(kit('bedDouble', { x: BX, z: BZ, s: BS, colors: { ...sheet, wood: s === 0 ? '#9C6E43' : '#E9E1D6' } }));
    if (s === 0) g.add(box(BW + 0.06, 0.62, 0.06, '#8B5E3C', BX, 0.31, z0 + 0.04));
    else {
      for (let i = 0; i < 4; i++) {
        const p = box(BW / 4 - 0.02, 0.5, 0.08, '#D8B9C3', BX - BW / 2 + BW / 8 + i * BW / 4, 0.45, z0 + 0.05);
        g.add(p);
      }
      g.add(box(BW + 0.06, 0.24, 0.05, '#C7A3AF', BX, 0.12, z0 + 0.04));
    }
    return g;
  },
  roupa(s) {
    const c = ['#FAFAF7', '#F2B8C6', '#9DBCE0'][s], c2 = ['#E6E1D8', '#E68FA6', '#6F97C8'][s];
    const top = kitTop('bedDouble', BS) + 0.005;
    const g = group(box(BW + 0.05, 0.07, BL * 0.66, c, BX, top + 0.02, BZ + BL * 0.17));
    g.add(box(BW + 0.06, 0.075, 0.16, c2, BX, top + 0.025, BZ + BL * 0.42));
    [-0.3, 0.3].forEach(dx => { const p = box(0.42, 0.1, 0.2, s === 0 ? '#FFFFFF' : c2, BX + dx, top + 0.06, z0 + 0.22); g.add(p); });
    return g;
  },
  criados(s) {
    const wood = ['#B98652', '#F4F2EE', '#C9A07A'][s];
    const g = new THREE.Group();
    [BX - BW / 2 - 0.22, BX + BW / 2 + 0.22].forEach(x => {
      if (s === 2) g.add(box(0.36, 0.14, 0.3, wood, x, 0.42, z0 + 0.17));
      else g.add(kit('cabinetBedDrawerTable', { x, z: z0 + 0.2, colors: { wood, metal: '#C8A15A' } }));
      const y = s === 2 ? 0.49 : kitTop('cabinetBedDrawerTable');
      g.add(kit('lampRoundTable', { x, y, z: z0 + 0.2, s: S * 0.85, colors: { lamp: '#FFF1C9', metal: '#C8A15A' } }));
    });
    return g;
  },
  guarda(s) {
    const g = new THREE.Group();
    const cx = 0.98, w = 0.78, h = 1.32, d = 0.42, z = z0 + d / 2 + 0.01;
    const body = ['#F4F2EE', '#9C6E43', '#FAFAF7'][s];
    g.add(box(w, h, d, body, cx, h / 2, z));
    const doorM = s === 0 ? mat('#CFE3EA', 0.08, { metalness: 0.5 }) : mat(s === 1 ? '#8B5E3C' : '#F1EEE8', 0.8);
    [-w / 4, w / 4].forEach(dx => { g.add(box(w / 2 - 0.03, h - 0.08, 0.02, doorM, cx + dx, h / 2, z + d / 2 + 0.01)); g.add(box(0.015, 0.16, 0.025, '#C8A15A', cx + (dx < 0 ? -0.03 : 0.03), h / 2, z + d / 2 + 0.03)); });
    return g;
  },
  cortina(s) {
    return curtains({ wall: 'left', c: z0 + (WINL[0] + WINL[1]) / 2, span: WINL[1] - WINL[0], top: 1.38, len: 1.2, color: ['#EADCC2', '#F4C9D4', '#5F6670'][s], blackout: s === 2 });
  },
  quadro(s) {
    let map;
    if (s === 0) map = photo('casal.jpg');
    else if (s === 1) map = textTex('Te amo,\nmomo', { w: 256, h: 192, bg: '#FFF5F7', fg: '#C2185B', font: 'bold 46px "Baloo 2", Nunito, sans-serif' });
    else map = drawTex(256, 192, (g, w, h) => {
      g.fillStyle = '#FBF7F0'; g.fillRect(0, 0, w, h);
      [['#F28DB2', 70, 90], ['#9A73E0', 128, 70], ['#FFC93D', 186, 95], ['#F4A3B4', 110, 120], ['#7FB8E0', 160, 125]].forEach(([c, x, y]) => {
        g.fillStyle = c; g.globalAlpha = 0.55; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(x + Math.cos(k) * 14, y + Math.sin(k) * 14, 16, 0, 7); g.fill(); }
        g.globalAlpha = 1; g.fillStyle = '#5FAE57'; g.fillRect(x - 1, y + 18, 3, 50);
      });
    });
    return onBackWall(frame(map, { w: 0.62, h: 0.42, border: s === 0 ? '#2B2B2B' : '#F4F2EE', bw: 0.03 }), BX, 1.13);
  },
  data2020() { // presente do jogo da memória
    const t = textTex('20.01.2020', { w: 320, h: 120, bg: '#FFFFFF', fg: '#3B2A3F', font: 'bold 52px "Baloo 2", Nunito, sans-serif' });
    return onLeftWall(frame(t, { w: 0.42, h: 0.16, border: '#C8A15A', bw: 0.025 }), 0.62, 1.12);
  },
  jaleco() { // presente da Margarida (urgente 1): jaleco pendurado
    const g = new THREE.Group();
    g.add(kit('coatRackStanding', { x: 1.75, z: 0.95, s: S * 1.15, colors: { wood: '#8B5E3C' } }));
    const coat = box(0.26, 0.5, 0.08, '#FFFFFF', 1.75, 0.62, 1.04); g.add(coat);
    g.add(box(0.1, 0.02, 0.085, '#5D8FD8', 1.68, 0.78, 1.04));
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.05), new THREE.MeshBasicMaterial({ map: textTex('Tati', { w: 128, h: 52, bg: '#FFFFFF', fg: '#2F6FB5', font: 'bold 36px Nunito, sans-serif' }) }));
    tag.position.set(1.8, 0.76, 1.085); g.add(tag);
    return g;
  }
};

export default makeRoom({
  id: 'quarto',
  kit: ['bedDouble', 'cabinetBedDrawerTable', 'lampRoundTable', 'coatRackStanding', 'rugRounded', 'plantSmall2'],
  base() {
    return group(interior({ winLeft: WINL, door: [3.75, 4.25], floor: 'madeira', wall: '#E3DCE0' }),
      kit('rugRounded', { x: BX, z: 0.65, s: S * 1.1, colors: { carpet: '#EDE3D6', carpetDarker: '#D9C7B4' } }));
  },
  items: ITEMS,
  spots: { tata: [-0.2, 1.0], dodo: [0.4, 0.95], zozo: [-0.75, 0.95], marci: [1.2, 0.5], ana: [1.1, 0.55], vitoria: [1.3, 0.45], milton: [1.4, 0.45], italo: [1.5, 0.55], pai: [1.35, 0.5] },
  center: [0.0, 0.5, -0.05], radius: 8.4, elev: 0.5, yaw: 0.5, yawMin: 0.12, yawMax: 0.9, want: 5.5
});
