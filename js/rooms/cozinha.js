// Cozinha: azulejo geométrico claro, bancada de granito escuro sob a janela, porcelanato branco e a porta pro corredor
import * as THREE from 'three';
import { S, mat, box, cyl, ball, group, kit, kitTop, interior, texMat, drawTex, glow, makeRoom, ROOM } from './common.js';

const x0 = -ROOM.w / 2, z0 = -ROOM.d / 2;
const WIN = [1.55, 2.25, 0.72, 1.32];
const CAB = 0.43 * S;            // largura de um módulo
const ROW = [-1.45, -1.45 + CAB, -1.45 + CAB * 2, -1.45 + CAB * 3, -1.45 + CAB * 4]; // x dos módulos de baixo
const zRow = z0 + 0.34;

const ITEMS = {
  armarios(s) {
    const wood = ['#F4F2EE', '#7D8B5A', '#B98652'][s], dark = ['#E2DED6', '#6B7A4B', '#9C6E43'][s];
    const c = { wood, woodDark: dark, metal: '#C9CED3' };
    const g = group(
      kit('kitchenCabinetDrawer', { x: ROW[0], z: zRow, colors: c }),
      kit('kitchenCabinet', { x: ROW[1], z: zRow, colors: c }),
      kit('kitchenSink', { x: ROW[2], z: zRow, colors: { ...c, metalLight: '#DADFE3' } }),
      kit('kitchenCabinetDrawer', { x: ROW[3], z: zRow, colors: c })
    );
    const top = kitTop('kitchenCabinet');
    const slab = box(CAB * 4 + 0.04, 0.035, 0.68, texMat('granito', [2, 0.5], 0.35), ROW[0] + CAB * 1.5, top + 0.017, zRow + 0.02);
    g.add(slab);
    g.add(kit('kitchenCabinetUpper', { x: ROW[0], y: 0.98, z: z0 + 0.16, colors: c }), kit('kitchenCabinetUpper', { x: ROW[3], y: 0.98, z: z0 + 0.16, colors: c }));
    return g;
  },
  geladeira(s) {
    const body = ['#C9CED3', '#D9463F', '#F7F7F5'][s];
    return kit('kitchenFridge', { x: x0 + 0.27, z: -0.3, ry: Math.PI / 2, s: S * 1.05, shine: s === 0, colors: { metalLight: body, metal: s === 1 ? '#F4E9DA' : '#DADFE3', metalDark: '#6E7378' } });
  },
  fogao(s) {
    const g = new THREE.Group();
    if (s === 2) {
      g.add(kit('kitchenCabinet', { x: ROW[4], z: zRow, colors: { wood: '#2F2F33', woodDark: '#25252A' } }));
      g.add(box(CAB - 0.02, 0.02, 0.5, '#151517', ROW[4], kitTop('kitchenCabinet') + 0.01, zRow + 0.02));
      [[-0.07, -0.08], [0.07, -0.08], [-0.07, 0.1], [0.07, 0.1]].forEach(([dx, dz]) => { const r = cyl(0.05, 0.05, 0.004, glow('#C0392B', 0.25), ROW[4] + dx, kitTop('kitchenCabinet') + 0.022, zRow + dz); g.add(r); });
    } else {
      g.add(kit('kitchenStove', { x: ROW[4], z: zRow, shine: s === 0, colors: s === 1 ? { metal: '#EFE2C4', wood: '#EFE2C4', metalDark: '#3B3B3B' } : { metal: '#C9CED3', wood: '#C9CED3' } }));
    }
    g.add(kit('hoodModern', { x: ROW[4], y: 1.02, z: z0 + 0.17, colors: { metalMedium: s === 1 ? '#EFE2C4' : '#BFC5CA' } }));
    return g;
  },
  mesa(s) {
    const g = new THREE.Group();
    const cx = 0.35, cz = 0.25;
    const chair = (x, z, ry) => kit(s === 2 ? 'chair' : 'chairCushion', { x, z, ry, colors: { wood: '#B98652', carpet: '#E8C9A0' } });
    if (s === 0) {
      g.add(kit('tableRound', { x: cx, z: cz, s: S * 1.1, colors: { wood: '#C9A07A' } }));
      [[0, -0.5, 0], [0, 0.5, Math.PI], [-0.5, 0, Math.PI / 2], [0.5, 0, -Math.PI / 2]].forEach(([dx, dz, ry]) => g.add(chair(cx + dx, cz + dz, ry)));
    } else if (s === 1) {
      g.add(kit('table', { x: cx, z: cz, s: S * 1.25, colors: { wood: '#8F6440' } }));
      [-0.4, 0, 0.4].forEach(dx => { g.add(chair(cx + dx, cz - 0.48, 0)); g.add(chair(cx + dx, cz + 0.48, Math.PI)); });
    } else {
      g.add(kit('table', { x: cx, z: cz, s: S * 1.15, colors: { wood: '#C9A07A' } }));
      g.add(kit('bench', { x: cx, z: cz - 0.45, s: S * 1.1, sy: 1, colors: { wood: '#9C6E43' } }));
      g.add(box(0.95, 0.05, 0.2, '#E79AB5', cx, 0.33, cz - 0.45));
      [-0.3, 0.3].forEach(dx => g.add(chair(cx + dx, cz + 0.48, Math.PI)));
    }
    return g;
  },
  pendentes(s) {
    const g = new THREE.Group();
    [-0.05, 0.35, 0.75].forEach(x => {
      g.add(cyl(0.004, 0.004, 0.4, '#3B3B3B', x, 1.42, 0.25));
      if (s === 0) { const sh = cyl(0.03, 0.11, 0.12, mat('#B87333', 0.35, { metalness: 0.6 }), x, 1.17, 0.25); g.add(sh); }
      else if (s === 1) { const gl = ball(0.09, new THREE.MeshStandardMaterial({ color: '#E8F4F8', transparent: true, opacity: 0.45, roughness: 0.05 }), x, 1.15, 0.25); g.add(gl); }
      else { const pa = cyl(0.04, 0.13, 0.11, mat('#D8B67A', 1), x, 1.17, 0.25); g.add(pa); }
      g.add(ball(0.03, glow('#FFE9B0', 1.2), x, 1.12, 0.25));
    });
    return g;
  },
  cafe(s) {
    const g = new THREE.Group();
    const z = 0.75;
    if (s === 0) {
      [0.62, 0.9].forEach(y => g.add(box(0.12, 0.025, 0.55, '#9C6E43', x0 + 0.06, y, z)));
      g.add(kit('kitchenCoffeeMachine', { x: x0 + 0.1, y: 0.635, z: z - 0.1, ry: Math.PI / 2, s: S * 0.8, colors: { metalMedium: '#3B3B3B' } }));
      [-0.12, 0, 0.12].forEach(dz => g.add(cyl(0.025, 0.022, 0.05, ['#F28DB2', '#FFFFFF', '#5D8FD8'][Math.round(dz * 8 + 1)], x0 + 0.08, 0.94, z + 0.1 + dz)));
    } else if (s === 1) {
      g.add(box(0.3, 0.02, 0.42, '#2B2B2E', x0 + 0.3, 0.42, z), box(0.3, 0.02, 0.42, '#2B2B2E', x0 + 0.3, 0.16, z));
      [[-0.13, -0.19], [0.13, -0.19], [-0.13, 0.19], [0.13, 0.19]].forEach(([dx, dz]) => g.add(cyl(0.008, 0.008, 0.42, '#C8A15A', x0 + 0.3 + dx, 0.21, z + dz)));
      g.add(kit('kitchenCoffeeMachine', { x: x0 + 0.3, y: 0.43, z, ry: Math.PI / 2, s: S * 0.7, colors: { metalMedium: '#C0392B' } }));
    } else {
      g.add(kit('kitchenCabinet', { x: x0 + 0.33, z, ry: Math.PI / 2, colors: { wood: '#F4F2EE', woodDark: '#E2DED6' } }));
      g.add(box(0.16, 0.32, 0.6, '#C9A07A', x0 + 0.1, 0.95, z), box(0.12, 0.26, 0.54, '#F4EEE6', x0 + 0.12, 0.95, z));
      g.add(kit('kitchenCoffeeMachine', { x: x0 + 0.33, y: kitTop('kitchenCabinet'), z, ry: Math.PI / 2, s: S * 0.7, colors: { metalMedium: '#5D8FD8' } }));
    }
    return g;
  },
  caderno() { // presente da Marci: caderno de receitas
    const top = kitTop('kitchenCabinet') + 0.035;
    const cover = drawTex(128, 96, (g, w, h) => { g.fillStyle = '#E85D8A'; g.fillRect(0, 0, w, h); g.fillStyle = '#FFF'; g.font = 'bold 18px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('Receitas', w / 2, 40); g.fillText('da Marci', w / 2, 64); });
    const b = box(0.2, 0.035, 0.15, new THREE.MeshStandardMaterial({ map: cover }), ROW[0] - 0.02, top + 0.018, zRow + 0.05);
    b.rotation.y = 0.2;
    return group(b);
  },
  biscoitos() { // presente da Marci: pote de biscoitos de Natal
    const top = kitTop('kitchenCabinet') + 0.035;
    const g = new THREE.Group();
    g.add(cyl(0.07, 0.07, 0.16, new THREE.MeshStandardMaterial({ color: '#E8F4F8', transparent: true, opacity: 0.45, roughness: 0.05 }), ROW[1], top + 0.08, zRow - 0.02));
    g.add(cyl(0.075, 0.075, 0.025, '#C0392B', ROW[1], top + 0.17, zRow - 0.02));
    for (let i = 0; i < 5; i++) g.add(cyl(0.035, 0.035, 0.012, '#D8A15E', ROW[1] + (i % 2 - 0.5) * 0.05, top + 0.02 + i * 0.026, zRow - 0.02));
    return g;
  }
};

export default makeRoom({
  id: 'cozinha',
  kit: ['kitchenCabinet', 'kitchenCabinetDrawer', 'kitchenSink', 'kitchenCabinetUpper', 'kitchenFridge', 'kitchenStove', 'hoodModern', 'tableRound', 'table', 'chair', 'chairCushion', 'bench', 'kitchenCoffeeMachine', 'pottedPlant'],
  base() {
    const back = new THREE.Mesh(new THREE.PlaneGeometry(CAB * 5 + 0.05, 0.42), texMat('geometrico', [6, 1], 0.6));
    back.position.set(ROW[0] + CAB * 2, 0.86, z0 + 0.003); back.receiveShadow = true;
    return group(interior({ win: WIN, door: [3.65, 4.15] }), back,
      kit('pottedPlant', { x: x0 + 0.3, z: 1.15, s: S, colors: { plant: '#5DB86A' } }));
  },
  items: ITEMS,
  spots: { tata: [-0.75, 1.0], dodo: [-0.15, 1.05], zozo: [-1.2, 0.85], marci: [-1.15, 0.45], milton: [1.55, 0.6], vitoria: [1.4, 0.7], ana: [1.3, 0.8], italo: [1.7, 0.6], pai: [1.5, 0.7] },
  center: [0.0, 0.5, -0.05], radius: 8.4, elev: 0.5, yaw: 0.5, yawMin: 0.12, yawMax: 0.9, want: 5.5
});
