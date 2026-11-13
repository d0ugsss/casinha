// Sala: parede cinza-clara, porcelanato branco, janela alta com a árvore e o corredor
import * as THREE from 'three';
import { S, mat, box, cyl, group, at, kit, kitTop, interior, curtains, frame, photo, drawTex, onBackWall, onLeftWall, texMat, makeRoom, ROOM } from './common.js';

const x0 = -ROOM.w / 2, z0 = -ROOM.d / 2;
const WIN = [0.45, 1.15, 0.12, 1.36]; // janela no fundo, medida da esquerda
const winC = x0 + (WIN[0] + WIN[1]) / 2;

function beachTex() {
  return drawTex(256, 192, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * 0.5); sky.addColorStop(0, '#8FD0F2'); sky.addColorStop(1, '#D8F0FA');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = '#FFD84A'; g.beginPath(); g.arc(200, 44, 22, 0, 7); g.fill();
    g.fillStyle = '#3E8FC9'; g.fillRect(0, h * 0.48, w, h * 0.16);
    g.fillStyle = '#7CC3E8'; for (let i = 0; i < 6; i++) g.fillRect(i * 46 + 6, h * 0.52, 26, 3);
    g.fillStyle = '#F2D9A6'; g.fillRect(0, h * 0.64, w, h * 0.36);
    // duas amigas jogando frescobol
    const person = (x, c) => { g.fillStyle = '#6B4A3A'; g.beginPath(); g.arc(x, 112, 8, 0, 7); g.fill(); g.fillStyle = c; g.fillRect(x - 7, 120, 14, 26); g.fillStyle = '#C98F6B'; g.fillRect(x - 6, 146, 5, 16); g.fillRect(x + 1, 146, 5, 16); };
    person(70, '#E85D8A'); person(186, '#FFFFFF');
    g.fillStyle = '#7A4B2E'; g.beginPath(); g.ellipse(86, 118, 6, 8, 0.4, 0, 7); g.fill(); g.beginPath(); g.ellipse(170, 118, 6, 8, -0.4, 0, 7); g.fill();
    g.fillStyle = '#FFF'; g.beginPath(); g.arc(128, 92, 4, 0, 7); g.fill();
    g.fillStyle = '#3B2A3F'; g.font = 'bold 20px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('dia de praia', w / 2, h - 12);
  });
}

const ITEMS = {
  sofa(s) {
    const z = z0 + 0.34;
    if (s === 0) return kit('loungeDesignSofa', { x: 0.1, z, ry: Math.PI, s: S * 1.15, colors: { carpetBlue: '#8E949C', metal: '#2B2B2E' } });
    if (s === 1) return kit('loungeSofa', { x: 0.1, z, ry: Math.PI, s: S * 1.18, colors: { carpet: '#4F7D5C', wood: '#6B4A2E' } });
    return group(kit('loungeSofa', { x: 0.1, z, ry: Math.PI, s: S * 1.18, colors: { carpet: '#C98A4B', wood: '#7A5232' } }),
      kit('loungeSofaOttoman', { x: -0.75, z: z + 0.45, s: S, colors: { carpet: '#C98A4B', wood: '#7A5232' } }));
  },
  tapete(s) {
    if (s === 0) return kit('rugRectangle', { x: 0.1, z: -0.15, s: S * 1.1, colors: { carpet: '#F3E3C3', carpetDarker: '#D9A7CF' } });
    if (s === 1) return kit('rugRound', { x: 0.1, z: -0.15, s: S * 1.35, colors: { carpet: '#FAF6EF', carpetDarker: '#EADFCF' } });
    return kit('rugSquare', { x: 0.1, z: -0.15, s: S * 1.3, colors: { carpet: '#5D8FD8', carpetDarker: '#F3E3C3' } });
  },
  rack(s) {
    const wood = ['#D9B48A', '#2F2F33', '#F4F2EE'][s];
    const cab = s === 1 ? 'cabinetTelevisionDoors' : 'cabinetTelevision';
    return group(kit(cab, { x: x0 + 0.22, z: -0.15, ry: Math.PI / 2, s: S, colors: { wood, metal: '#C9CED3' } }),
      kit('televisionModern', { x: x0 + 0.15, y: kitTop(cab), z: -0.15, ry: Math.PI / 2, s: S, colors: { metalDark: '#23272C', metal: '#3A3F45' } }));
  },
  mesa(s) {
    if (s === 0) return kit('tableCoffee', { x: 0.1, z: -0.2, s: S, colors: { wood: '#B98652' } });
    if (s === 1) return kit('tableCoffeeGlass', { x: 0.1, z: -0.2, s: S, colors: { metal: '#C8A15A' } });
    const top = cyl(0.3, 0.3, 0.035, texMat('porcelanato', [0.5, 0.5], 0.3), 0.1, 0.3, -0.2, 28);
    return group(top, cyl(0.05, 0.12, 0.29, mat('#C8A15A', 0.4), 0.1, 0.145, -0.2));
  },
  cortina(s) {
    const color = ['#EADCC2', '#7FA7D6', '#6E7178'][s];
    return curtains({ wall: 'back', c: winC, span: WIN[1] - WIN[0], color, blackout: s === 2 });
  },
  fotos(s) {
    const files = ['quadro1.jpg', 'quadro2.jpg', 'quadro3.jpg'];
    if (s < 2) {
      const border = s === 0 ? '#2B2B2B' : '#9B6A43';
      const spots = [[-0.34, 1.0, 0.26, 0.26], [0, 1.04, 0.26, 0.34], [0.34, 1.0, 0.26, 0.26]];
      return group(spots.map(([x, y, w, h], i) => onBackWall(frame(photo(files[i]), { w, h, border }), 0.1 + x, y)));
    }
    // varal de fotos com pregadores
    const g = new THREE.Group();
    const pts = [];
    for (let i = 0; i <= 12; i++) { const k = i / 12; pts.push(new THREE.Vector3(-0.62 + k * 1.24, 1.16 - Math.sin(k * Math.PI) * 0.07, 0.02)); }
    const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.004, 5), mat('#7A5A3C'));
    g.add(line);
    ['quadro1.jpg', 'casal.jpg', 'quadro2.jpg', 'quadro3.jpg', 'quadro1.jpg'].forEach((f, i) => {
      const k = (i + 0.5) / 5, x = -0.62 + k * 1.24, y = 1.16 - Math.sin(k * Math.PI) * 0.07;
      const pol = frame(photo(f), { w: 0.16, h: 0.16, border: '#FFFFFF', bw: 0.018, depth: 0.008 });
      pol.position.set(x, y - 0.12, 0.012); pol.rotation.z = (i % 2 ? 1 : -1) * 0.06;
      g.add(pol, box(0.015, 0.04, 0.012, '#C98F6B', x, y - 0.02, 0.025));
    });
    return onBackWall(g, 0.1, 0);
  },
  quadroPraia() { return onLeftWall(frame(beachTex(), { w: 0.42, h: 0.31, border: '#F4F2EE', bw: 0.03 }), 0.85, 0.98); }
};

export default makeRoom({
  id: 'sala',
  kit: ['loungeDesignSofa', 'loungeSofa', 'loungeSofaOttoman', 'rugRectangle', 'rugRound', 'rugSquare', 'cabinetTelevision', 'cabinetTelevisionDoors', 'televisionModern', 'tableCoffee', 'tableCoffeeGlass', 'pottedPlant', 'lampRoundFloor', 'plantSmall1'],
  base() {
    return group(
      interior({ win: WIN, door: [3.55, 4.1] }),
      kit('pottedPlant', { x: 1.05, z: z0 + 0.25, s: S * 1.1, colors: { plant: '#5DB86A' } }),
      kit('lampRoundFloor', { x: -0.85, z: z0 + 0.22, s: S, colors: { lamp: '#FFF1C9' } })
    );
  },
  items: ITEMS,
  spots: { tata: [-0.25, 0.8], dodo: [0.4, 0.72], zozo: [-0.75, 0.62], vitoria: [1.15, 0.35], marci: [1.2, 0.3], milton: [1.3, 0.1], ana: [1.0, 0.5], italo: [1.45, 0.4], pai: [1.3, 0.2] },
  center: [0.0, 0.5, -0.05], radius: 8.4, elev: 0.5, yaw: 0.5, yawMin: 0.12, yawMax: 0.9, want: 5.5
});
