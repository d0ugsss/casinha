// Mapa da casa: planta com quem está em cada cômodo
import { ROOMS, CHARS, presence, availableMission } from './data.js';
import { state, isRoomUnlocked, roomProgress } from './state.js';
import { h } from './ui.js';

// retângulos dos cômodos na planta (350 x 540)
const RECTS = {
  quarto: [4, 4, 126, 121, 'Nosso quarto'], banheiro: [132, 4, 76, 121, 'Banheiro'], hospedes: [210, 4, 136, 121, 'Hóspedes'],
  escritorio: [4, 160, 99, 170, 'Escritório'], sala: [105, 160, 138, 170, 'Sala'], cozinha: [245, 160, 101, 170, 'Cozinha'],
  quintal: [2, 332, 346, 206, 'Quintal'], gourmet: [12, 392, 118, 128, 'Área gourmet']
};

export function renderMap(host, { onRoom, onBack, onPin }) {
  host.innerHTML = '';
  const back = h('button', { class: 'round', 'aria-label': 'Voltar pra casa', onclick: onBack }, h('i', { class: 'ico-back' }));
  host.append(h('div', { class: 'map-hud' }, back, h('div', {}, h('b', {}, 'Mapa da casa'), h('span', {}, 'Toque num cômodo pra ir até lá'))));
  const plan = h('div', { class: 'plan' });
  const k = Math.min(1, (window.innerWidth - 24) / 350, (window.innerHeight - 250) / 540);
  plan.style.setProperty('--k', k.toFixed(3));
  const svgParts = [];
  const unlocked = id => isRoomUnlocked(id);
  svgParts.push(`<rect x="2" y="332" width="346" height="206" rx="6" fill="#E7DFD2"/>`);
  svgParts.push(`<rect x="200" y="344" width="26" height="194" fill="#6DBA5A"/>`);
  for (let y = 352; y < 530; y += 26) svgParts.push(`<rect x="204" y="${y}" width="18" height="12" rx="2" fill="#B9B4AA"/>`);
  const qDone = state.roomsDone.quintal;
  svgParts.push(`<rect x="2" y="332" width="346" height="206" rx="6" fill="${qDone ? '#E3F3E6' : '#FBE3EC'}" fill-opacity=".5" stroke="${qDone ? '#3FA466' : '#D9A7CF'}" stroke-width="3"/>`);
  svgParts.push(`<rect x="182" y="530" width="62" height="10" rx="3" fill="#9B6A43"/>`);
  svgParts.push(`<rect x="2" y="2" width="346" height="330" rx="6" fill="#F4EFEA" stroke="#3B2A3F" stroke-width="4"/>`);
  for (const [id, [x, y, w, hh, label]] of Object.entries(RECTS)) {
    if (id === 'quintal') continue;
    const open = unlocked(id);
    const cur = state.room === id;
    if (id === 'gourmet') svgParts.push(`<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="8" fill="${open ? '#FBE3EC' : '#EFE9E2'}" stroke="#B5A792" stroke-width="2.5" stroke-dasharray="7 6"/>`);
    else svgParts.push(`<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${cur ? '#FBE3EC' : open ? '#FFF7EE' : '#EEE8E2'}"/>`);
    svgParts.push(`<text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="${id === 'gourmet' ? 13 : 14}" fill="${open ? '#3B2A3F' : '#8C7E90'}">${label}</text>`);
    if (!open) svgParts.push(`<g transform="translate(${x + w / 2 - 7} ${y + 34})" fill="#8C7E90"><rect x="0" y="5" width="14" height="11" rx="2"/><path d="M3 5V3a4 4 0 0 1 8 0v2" fill="none" stroke="#8C7E90" stroke-width="2.2"/></g>`);
  }
  svgParts.push(`<path d="M130 4V125M208 4V125M4 126H346M4 159H346M104 160V330M244 160V330" stroke="#3B2A3F" stroke-width="3"/>`);
  svgParts.push(`<path d="M40 126h30M150 126h30M260 126h30M40 159h30M150 159h40M280 159h30" stroke="#F8F4F0" stroke-width="5"/>`);
  svgParts.push(`<path d="M150 330h40" stroke="#F4EFEA" stroke-width="6"/>`);
  const qp = roomProgress('quintal');
  svgParts.push(`<text x="300" y="358" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="15" fill="#3B2A3F">Quintal</text>`);
  svgParts.push(`<text x="300" y="372" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="700" font-size="11" fill="#6E6074">${qp.placed} de ${qp.total}</text>`);
  svgParts.push(`<g transform="translate(-130 52)"><path d="M286 452l14-12 14 12v16h-28z" fill="#5D8FD8"/><path d="M282 454l18-16 18 16" fill="none" stroke="#E15B4F" stroke-width="4" stroke-linejoin="round"/></g>`);
  plan.innerHTML = `<svg viewBox="0 0 350 540" width="350" height="540">${svgParts.join('')}</svg>`;
  for (const [id, [x, y, w, hh]] of Object.entries(RECTS)) {
    const hit = h('button', { class: 'room-hit', 'aria-label': RECTS[id][4], style: { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' }, onclick: () => onRoom(id) });
    plan.append(hit);
  }
  // rostinhos
  const mission = availableMission(state);
  const byRoom = {};
  presence(state).forEach(p => { (byRoom[p.room] = byRoom[p.room] || []).push(p.id); });
  if (mission && mission.urgent) (byRoom[state.room] = byRoom[state.room] || []).unshift('margarida');
  for (const [room, ids] of Object.entries(byRoom)) {
    const [x, y, w, hh] = RECTS[room];
    const cx = room === 'quintal' ? 270 : x + w / 2, cy = room === 'quintal' ? 410 : y + hh / 2 + 10;
    const perRow = 3;
    ids.forEach((id, i) => {
      const urgent = id === 'margarida';
      const glow = urgent || (mission && !mission.urgent && mission.room === room && (mission.chars || [mission.char]).includes(id));
      const size = glow ? 48 : 42;
      const row = Math.floor(i / perRow), inRow = Math.min(perRow, ids.length - row * perRow), col = i % perRow;
      const px = cx - (inRow - 1) * 24 + col * 48 - size / 2, py = cy + row * 52 - size / 2;
      const pin = h('button', { class: 'pin' + (glow ? ' glow' : '') + (urgent ? ' urgent' : ''), style: { left: px + 'px', top: py + 'px' }, 'aria-label': CHARS[id].name, onclick: e => { e.stopPropagation(); onPin(id, room); } },
        h('img', { src: `assets/faces/${CHARS[id].img}.webp`, alt: '' }));
      plan.append(pin);
    });
  }
  host.append(plan);
  host.append(h('div', { class: 'map-legend' },
    h('div', {}, h('span', { class: 'lg-glow' }), 'Brilhando: tem desafio te esperando'),
    h('div', {}, h('i', { class: 'ico-lock', style: { width: '24px', height: '24px' } }), 'Cadeado: cômodo que libera mais pra frente')));
}
