// Nossa Casinha — fluxo do jogo
import { ROOMS, LEVELS, LAST_PLAYABLE, TUTORIALS, CHARS, SCENES, IDLE_LINES, MISSIONS, FINAL_LETTER, presence, availableMission, nextMission, isFinale, giftsFor, roomOfLevel } from './data.js';
import { state, save, reset, roomItems, roomProgress, isRoomUnlocked } from './state.js';
import { sfx, unlockAudio, toggleMusic, setMusic } from './audio.js';
import { loadSprites, svgUrl } from './pieces.js';
import { Match3 } from './match3.js';
import { House } from './house.js';
import { Encaixe } from './minigames/encaixe.js';
import { Frescobol } from './minigames/frescobol.js';
import { Ingredientes } from './minigames/ingredientes.js';
import { Triagem } from './minigames/triagem.js';
import { Memoria } from './minigames/memoria.js';
import { Banho } from './minigames/banho.js';
import { Fios } from './minigames/fios.js';
import { Remedios } from './minigames/remedios.js';
import { Glace } from './minigames/glace.js';
import { Tijolos } from './minigames/tijolos.js';
import { Pitstop } from './minigames/pitstop.js';
import { Corredor } from './minigames/corredor.js';
import { Pizza } from './minigames/pizza.js';
import { renderMap } from './map.js';
import { $, h, showScreen, toast, sheet, closeSheet, modal, talk, confetti } from './ui.js';

const DEV = new URLSearchParams(location.search).has('dev') || location.hash === '#dev';
let house = null;
let game = null;
let mini = null;
let busyTalk = false;

const GAMES = {
  encaixe: { cls: Encaixe, opts: { lines: 6, speed: 720 } },
  frescobol: { cls: Frescobol, opts: { hits: 20 } },
  ingredientes: { cls: Ingredientes },
  triagem: { cls: Triagem, opts: { need: 5, time: 20 } },
  memoria: { cls: Memoria, opts: { tries: 24 } },
  banho: { cls: Banho, opts: { time: 45, shake: 7 } },
  fios: { cls: Fios },
  remedios: { cls: Remedios },
  glace: { cls: Glace },
  tijolos: { cls: Tijolos, opts: { rows: 15 } },
  pitstop: { cls: Pitstop, opts: { time: 42 } },
  corredor: { cls: Corredor, opts: { dist: 26 } },
  pizza: { cls: Pizza }
};

const SWATCH = {
  portao: ['#9B6A43', '#2B2B2E', '#F6F3EE'],
  caminho: ['#B9B4AA', '#C0603C', 'conic-gradient(#5D8FD8, #F28DB2, #FFD84A, #6DBA5A, #9A73E0, #5D8FD8)'],
  canteiro: ['#FFC93D', '#9A73E0', '#E84A6A'],
  arvore: ['#F4C430', '#2F6B35', 'radial-gradient(circle at 60% 40%, #FFE14D 22%, #5FAE57 24%)'],
  casinha: ['#B07A4B', 'linear-gradient(180deg, #E15B4F 45%, #5D8FD8 45%)', 'linear-gradient(180deg, #D9467F 45%, #F2A7C3 45%)'],
  banco: ['#B9844D', '#2B2B2E', '#F28DB2'],
  sofa: ['#8E949C', '#4F7D5C', '#C98A4B'], tapete: ['repeating-linear-gradient(90deg,#F3E3C3 0 8px,#D9A7CF 8px 12px)', '#F0D9CC', 'conic-gradient(#5D8FD8 25%, #F3E3C3 0 50%, #5D8FD8 0 75%, #F3E3C3 0)'],
  rack: ['#D9B48A', '#2F2F33', '#F4F2EE'], mesa: ['#B98652', 'linear-gradient(135deg,#DDF0FA,#B9D9E8)', '#F5F3EF'], cortina: ['#EADCC2', '#7FA7D6', '#6E7178'],
  fotos: ['#2B2B2B', '#9B6A43', 'repeating-linear-gradient(90deg,#FFF 0 10px,#E9E1D6 10px 12px)'],
  armarios: ['#F4F2EE', '#7D8B5A', '#B98652'], geladeira: ['#C9CED3', '#D9463F', '#F7F7F5'], fogao: ['#C9CED3', '#EFE2C4', '#2F2F33'],
  pendentes: ['#B87333', '#E8F4F8', '#D8B67A'], cafe: ['#9C6E43', '#2B2B2E', '#F4F2EE'],
  cama: ['#9C6E43', '#D8B9C3', '#D9B48A'], roupa: ['#FAFAF7', '#F2B8C6', '#9DBCE0'], criados: ['#B98652', '#F4F2EE', '#C9A07A'],
  guarda: ['linear-gradient(135deg,#CFE3EA,#9FC3D1)', '#9C6E43', '#FAFAF7'], quadro: ['#2B2B2B', '#FFF5F7', '#F4D9E8'],
  revest: ['#F7F7F4', '#7DAA92', '#B9B6B0'], pia: ['#B98652', '#F4F2EE', '#2F2F33'], espelho: ['#2B2B2E', '#FFF6DD', '#C8A15A'],
  box: ['#D8EEF4', '#F2B8C6', '#C9CED3'], toalhas: ['#FAFAF7', '#F2B8C6', 'repeating-linear-gradient(0deg,#9DBCE0 0 6px,#FFF 6px 12px)'], planta: ['#3E8E4B', '#5FAE57', '#4E9A4B'],
  cadeira: ['#E85D8A', '#5F6670', '#D9B48A'], pc: ['#23272C', '#C9CED3', 'linear-gradient(90deg,#B25CFF,#3BD1FF)'], estante: ['#9C6E43', 'conic-gradient(#E85D8A 25%,#5D8FD8 0 50%,#FFC93D 0 75%,#6DBA5A 0)', '#C9A07A'],
  luminaria: ['#FFE9B0', '#2B2B2E', '#FFB3D9'], mural: ['#C49A6C', '#FBFBF9', '#9C6E43'],
  poltrona: ['#D8A43B', '#E79AB5', '#6E9E86'], comoda: ['#B98652', '#F4F2EE', '#7FB8E0'],
  churrasqueira: ['#C1603E', '#BFC5CA', '#C0392B'], bancada: ['#3B3B3E', '#B98652', '#F1EFEA'], banquetas: ['#9C6E43', '#2B2B2E', '#D8B67A'],
  varal: ['#FFE08A', 'conic-gradient(#FF6B6B 25%,#6BD3FF 0 50%,#9BE36B 0 75%,#FFB3E6 0)', 'linear-gradient(135deg,#E85D8A 33%,#FFC93D 0 66%,#5D8FD8 0)'], rede: ['#FAFAF7', 'linear-gradient(90deg,#E85D8A,#FFC93D,#5D8FD8)', '#D8B67A']
};
const SWATCH_ROOM = { mesa: { cozinha: ['#C9A07A', '#8F6440', '#E79AB5'], escritorio: ['#B98652', '#F4F2EE', '#C9A07A'], gourmet: ['#8F6440', '#F4F2EE', '#6B4A2E'] }, cortina: { quarto: ['#EADCC2', '#F4C9D4', '#5F6670'], hospedes: ['#EADCC2', '#F6D7E0', '#F4F2EE'] }, cama: { hospedes: ['#B9D4C6', '#F2D7A6', '#7FA7D6'] }, tapete: { hospedes: ['#E9D3C0', '#F7F1E8', '#9DBCE0'] }, planta: { hospedes: ['#4E9A4B', '#3E8E4B', '#5FAE57'] } };
const swatch = (room, id, i) => ((SWATCH_ROOM[id] && SWATCH_ROOM[id][room]) || SWATCH[id] || [])[i] || '#D9A7CF';

const roomById = id => ROOMS.find(r => r.id === id);
const low = s => s.charAt(0).toLowerCase() + s.slice(1);
const em = r => (r.art === 'a' ? 'na ' : 'no ') + low(r.name);
const pra = r => (r.art === 'a' ? 'pra ' : 'pro ') + low(r.name);
const oA = r => (r.art === 'a' ? 'a ' : 'o ') + low(r.name);
const charName = id => CHARS[id].name;
const withArt = id => ({ milton: 'O Seu Milton', marci: 'A Marci', vitoria: 'A Vitória', zozo: 'A Zozo', dodo: 'O Dodô', pai: 'O pai do Dodô', ana: 'A Ana', italo: 'O Italo', margarida: 'A Margarida' }[id] || charName(id));
const missionWho = m => m.chars ? m.chars.map(charName).join(' e ') : charName(m.char);

// ---------- início ----------
async function boot() {
  const fill = $('#load-fill');
  let done = 0;
  const step = n => { done += n; fill.style.width = Math.min(100, done) + '%'; };
  const imgs = [];
  for (const c of Object.values(CHARS)) imgs.push(`assets/chars/${c.img}.webp`, `assets/faces/${c.img}.webp`);
  imgs.push('assets/photos/casal.jpg');
  await Promise.all([
    loadSprites(160).then(() => step(30)),
    ...imgs.map(src => new Promise(r => { const im = new Image(); im.onload = im.onerror = () => { step(60 / imgs.length); r(); }; im.src = src; }))
  ]);
  step(10);
  house = new House($('#house-host'), { onCharTap, onItemTap, onFrame: updateMarks });
  const btn = $('#btn-start');
  btn.hidden = false;
  btn.onclick = () => { unlockAudio(); sfx.tap(); goHouse(); };
  $('#btn-music').onclick = () => { const on = toggleMusic(); $('#btn-music').classList.toggle('muted', !on); };
  $('#btn-music').classList.toggle('muted', !state.music);
  $('#btn-map').onclick = () => { sfx.tap(); openMap(); };
  $('#btn-lv-back').onclick = leaveLevel;
  $('#urgent-call').onclick = () => { const m = availableMission(state); if (m && m.urgent) urgentCall(m); };
  document.querySelectorAll('.boost').forEach(b => {
    b.querySelector('img').src = svgUrl(b.dataset.b);
    b.onclick = () => useBooster(b.dataset.b);
  });
  ['gesturestart', 'gesturechange'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));
  document.addEventListener('dblclick', e => e.preventDefault());
  if (DEV) devPanel();
}

// ---------- casa ----------
async function goHouse() {
  closeSheet();
  showScreen('s-house');
  setMusic('casa');
  if (isFinale(state)) state.room = state.room || 'gourmet';
  if (!roomById(state.room) || !isRoomUnlocked(state.room)) state.room = 'quintal';
  if (state.missions.milton2 && roomItems('gourmet').churrasqueira === undefined) roomItems('gourmet').churrasqueira = 0;
  const room = roomById(state.room);
  $('#house-host').classList.toggle('indoor', !(room.id === 'quintal' || room.id === 'gourmet'));
  await house.loadRoom(room.id, roomItems(room.id), { allItems: Object.fromEntries(room.items.map(i => [i.id, true])), gifts: giftsFor(state, room.id) });
  await refreshChars();
  house.resize();
  house.start();
  refreshHud();
  renderPanel();
  await runScenes();
}

async function refreshChars() {
  const m = availableMission(state);
  const glowIds = m && !m.urgent && m.room === state.room ? (m.chars || [m.char]) : [];
  const list = presence(state).filter(p => p.room === state.room).map(p => ({ id: p.id, glow: glowIds.includes(p.id) }));
  await house.setCharacters(list);
}

async function runScenes() {
  if (busyTalk) return;
  busyTalk = true;
  if (!state.seen.intro) { await talk(SCENES.intro); state.seen.intro = true; save(); }
  const r = state.room;
  if (r !== 'quintal' && SCENES[r] && !state.seen['chega_' + r]) { await talk(SCENES[r]); state.seen['chega_' + r] = true; save(); }
  const nm = nextMission(state);
  if (nm && nm.hello && !state.seen['hello_' + nm.id] && nm.room === r && presence(state).some(p => p.id === nm.char && p.room === r)) {
    await talk(nm.hello); state.seen['hello_' + nm.id] = true; save();
  }
  busyTalk = false;
  const m = availableMission(state);
  if (m && m.urgent && !state.seen['call_' + m.id]) { state.seen['call_' + m.id] = true; save(); await urgentCall(m); return; }
  if (isFinale(state) && !state.seen.festa) await festa();
}

function refreshHud() {
  const room = roomById(state.room);
  const p = roomProgress(room.id);
  const m = availableMission(state);
  $('#room-name').textContent = room.name;
  $('#room-prog').textContent = `${p.placed} de ${p.total} itens`;
  $('#star-count').textContent = state.stars;
  $('#map-dot').hidden = !m;
  $('#map-dot').classList.toggle('red', !!(m && m.urgent));
  $('#urgent-call').hidden = !(m && m.urgent);
}

function affordable() {
  const room = roomById(state.room);
  const it = roomItems(room.id);
  return room.items.filter(i => it[i.id] === undefined && i.cost <= state.stars).length;
}

function goRoom(id) { sfx.tap(); state.room = id; save(); goHouse(); }

function renderPanel() {
  const panel = $('#house-panel');
  panel.innerHTML = '';
  const room = roomById(state.room);
  const tasksBtn = () => {
    const n = affordable();
    return h('button', { class: 'btn white tasks-btn', 'aria-label': 'Tarefas', onclick: openTasks },
      h('i', { class: 'ico-star', style: { width: '30px', height: '30px' } }), n ? h('span', { class: 'n' }, n) : null);
  };
  const note = (text, faceId) => h('div', { class: 'note' }, faceId ? h('img', { src: `assets/faces/${CHARS[faceId].img}.webp`, alt: '' }) : null, h('span', {}, text));
  if (isFinale(state)) {
    panel.append(note('A nossa casinha está pronta. Obrigado por jogar, momo!', 'dodo'));
    panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn gold big', onclick: () => { if (state.room !== 'gourmet') { state.room = 'gourmet'; save(); goHouse().then(festa); } else festa(); } }, 'Rever a festa')));
    return;
  }
  const m = availableMission(state);
  if (m) {
    if (m.urgent) {
      panel.append(note('URGENTE: a Margarida tá ligando do plantão.', 'margarida'));
      panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn red big', onclick: () => urgentCall(m) }, 'Atender o plantão')));
      panel.append(h('div', { class: 'lock' }, h('i', { class: 'ico-lock' }), `Fase ${state.done + 1} libera depois do plantão`));
      return;
    }
    const mr = roomById(m.room);
    if (m.room === state.room) {
      panel.append(note(`${missionWho(m)} ${m.chars ? 'têm' : 'tem'} um desafio pra você. Faça ele pra liberar as próximas fases.`, m.char));
      panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn gold big', onclick: () => startMission(m) }, `Falar com ${m.chars ? 'eles' : charName(m.char)}`)));
    } else {
      panel.append(note(`${m.chars ? missionWho(m) + ' te chamam' : withArt(m.char) + ' te chama'} ${em(mr)}.`, m.char));
      panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn gold big', onclick: () => goRoom(m.room) }, `Ir ${pra(mr)}`)));
    }
    panel.append(h('div', { class: 'lock' }, h('i', { class: 'ico-lock' }), `Fase ${state.done + 1} libera depois do desafio`));
    return;
  }
  const next = state.done + 1;
  if (next <= LAST_PLAYABLE) {
    const lr = roomOfLevel(next);
    if (!isRoomUnlocked(lr.id)) {
      const prev = ROOMS[ROOMS.indexOf(lr) - 1];
      if (state.room === prev.id) {
        panel.append(note(`Use as estrelas pra terminar ${oA(prev)}. Aí libera ${oA(lr)}!`));
        panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn green big', onclick: openTasks }, 'Ver tarefas')));
      } else {
        panel.append(note(`Falta terminar de decorar ${oA(prev)} pra liberar ${oA(lr)}.`));
        panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn green big', onclick: () => goRoom(prev.id) }, `Ir ${pra(prev)}`)));
      }
      return;
    }
    const lv = LEVELS[next];
    const tierTxt = lv.tier === 2 ? 'muito difícil · vale 2 estrelas' : lv.tier === 1 ? 'difícil' : '';
    panel.append(note(affordable() ? 'Você tem estrelas pra decorar! Toque na estrela pra ver as tarefas.' : 'Passe de fase pra ganhar estrelas e decorar a casa.'));
    panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn green big', onclick: () => openLevel(next) }, `Jogar fase ${next}`)));
    if (tierTxt) panel.append(h('div', { class: 'lock' }, tierTxt));
    return;
  }
  const p = roomProgress(room.id);
  const pending = ROOMS.find(r => roomProgress(r.id).placed < roomProgress(r.id).total);
  if (p.placed < p.total) {
    panel.append(note(`Use suas estrelas pra terminar ${oA(room)}.`));
    panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn green big', onclick: openTasks }, 'Ver tarefas')));
  } else if (pending) {
    panel.append(note(`Falta decorar ${oA(pending)}.`));
    panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn green big', onclick: () => goRoom(pending.id) }, `Ir ${pra(pending)}`)));
  } else {
    panel.append(note('Tudo pronto por aqui!', 'dodo'));
    panel.append(h('div', { class: 'row' }, tasksBtn()));
  }
}

// marcadores "!" e balões em cima dos personagens
const bubbles = {};
function updateMarks(hs) {
  const layer = $('#marks');
  const pos = hs.headPositions();
  for (const [id, p] of Object.entries(pos)) {
    let mk = layer.querySelector(`.mark[data-id="${id}"]`);
    if (p.glow) {
      if (!mk) { mk = h('div', { class: 'mark', 'data-id': id, onclick: () => onCharTap(id) }, '!'); layer.append(mk); }
      mk.style.left = p.x + 'px'; mk.style.top = p.y - 6 + 'px';
    } else if (mk) mk.remove();
    const b = bubbles[id];
    if (b) { b.el.style.left = p.x + 'px'; b.el.style.top = p.y - (p.glow ? 40 : 4) + 'px'; }
  }
  layer.querySelectorAll('.mark').forEach(mk => { if (!pos[mk.dataset.id]) mk.remove(); });
}

function say(id, text) {
  const layer = $('#marks');
  if (bubbles[id]) { bubbles[id].el.remove(); clearTimeout(bubbles[id].t); }
  const el = h('div', { class: 'bubble' }, h('b', {}, CHARS[id].name), text);
  layer.append(el);
  bubbles[id] = { el, t: setTimeout(() => { el.remove(); delete bubbles[id]; }, 2800) };
}

function onCharTap(id) {
  if (busyTalk) return;
  sfx.tap();
  const m = availableMission(state);
  if (m && !m.urgent && m.room === state.room && (m.chars || [m.char]).includes(id)) { startMission(m); return; }
  const lines = IDLE_LINES[id] || ['Opa, não tenho nada pra você por agora!'];
  say(id, lines[Math.floor(Math.random() * lines.length)]);
}

function onItemTap(id) {
  if (busyTalk) return;
  const room = roomById(state.room);
  const item = room.items.find(i => i.id === id);
  if (item && roomItems(room.id)[id] !== undefined) openStyles(item, true);
}

// ---------- tarefas e estilos ----------
function openTasks() {
  sfx.tap();
  const room = roomById(state.room);
  const it = roomItems(room.id);
  sheet((body, close) => {
    body.append(h('h2', {}, `Tarefas · ${room.name}`), h('p', { class: 'sub' }, `Você tem ${state.stars} ${state.stars === 1 ? 'estrela' : 'estrelas'}. Cada item tem 3 estilos pra escolher.`));
    for (const item of room.items) {
      const placed = it[item.id] !== undefined;
      const right = placed
        ? h('button', { class: 'btn soft', style: { fontSize: '15px', padding: '8px 12px' }, onclick: () => { close(); openStyles(item, true); } }, 'Trocar')
        : h('button', { class: 'cost', disabled: state.stars < item.cost ? true : null, onclick: () => { if (state.stars < item.cost) { toast('Faltam estrelas: passe mais uma fase!'); return; } close(); openStyles(item, false); } }, h('i', { class: 'ico-star' }), String(item.cost));
      body.append(h('div', { class: 'task' },
        placed ? h('span', { class: 'done' }, h('i', { class: 'ico-check' })) : null,
        h('div', { class: 'tx' }, h('b', {}, item.name), h('span', {}, placed ? item.styles[it[item.id]] : item.styles.join(' · '))),
        right));
    }
  });
}

function openStyles(item, isChange) {
  const roomId = state.room;
  const it = roomItems(roomId);
  const before = it[item.id];
  let pick = before !== undefined ? before : 0;
  house.setItem(item.id, pick, true);
  sfx.place();
  let confirmed = false;
  sheet((body, close) => {
    body.append(h('h2', {}, item.name), h('p', { class: 'sub' }, isChange ? 'Toque num estilo pra trocar. Trocar não gasta estrela.' : 'Toque num estilo pra ver no lugar.'));
    const grid = h('div', { class: 'styles' });
    const cards = item.styles.map((name, i) => h('button', { class: 'style' + (i === pick ? ' on' : ''), onclick: () => {
      pick = i; cards.forEach((cc, j) => cc.classList.toggle('on', j === i)); house.setItem(item.id, i, true); sfx.place();
    } }, h('span', { class: 'sw', style: { background: swatch(roomId, item.id, i) } }), name));
    cards.forEach(c => grid.append(c));
    body.append(grid);
    body.append(h('button', { class: 'btn green big', style: { width: '100%' }, onclick: () => {
      confirmed = true;
      if (!isChange) state.stars -= item.cost;
      it[item.id] = pick;
      save(); sfx.star(); close(); refreshHud(); renderPanel(); checkRoomDone();
    } }, isChange ? 'Pronto' : h('span', {}, 'Colocar · ', h('i', { class: 'ico-star', style: { verticalAlign: '-4px' } }), ' ' + item.cost)));
  }, { onClose: () => {
    if (confirmed) return;
    if (before === undefined) { house.root.remove(house.items[item.id]); delete house.items[item.id]; house.showGhost(item.id); }
    else house.setItem(item.id, before, false);
  } });
}

async function checkRoomDone() {
  const room = roomById(state.room);
  const p = roomProgress(room.id);
  if (p.placed < p.total || state.roomsDone[room.id]) return;
  state.roomsDone[room.id] = true;
  state.boosters.hammer++; state.boosters.broom++; state.boosters.shuffle++;
  save();
  await new Promise(r => setTimeout(r, 900));
  setMusic('caixinha');
  sfx.win(); confetti(80);
  await modal((box, done) => {
    box.append(h('h2', {}, `${room.name} ${room.art === 'a' ? 'pronta' : 'pronto'}!`),
      h('div', { class: 'polaroid' }, h('img', { src: 'assets/photos/casal.jpg', alt: 'Dodô e Tata' }), h('span', {}, 'nosso cantinho')),
      h('p', {}, room.note),
      h('p', { style: { fontSize: '14px' } }, 'Ganhou +1 martelo, +1 vassoura e +1 embaralhar.'),
      h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done() }, 'Que lindo!')));
  });
  setMusic('casa');
  refreshHud(); renderPanel();
  if (isFinale(state)) { await festa(); return; }
  const nextRoom = ROOMS[ROOMS.indexOf(room) + 1];
  if (nextRoom && isRoomUnlocked(nextRoom.id)) {
    busyTalk = true;
    const go = await talk([['dodo', `Agora ${oA(nextRoom)}, momo! Bora?`]], { choices: [{ label: `Ir ${pra(nextRoom)}`, value: 'go' }, { label: 'Ficar mais um pouco', value: 'no', cls: 'soft' }] });
    busyTalk = false;
    if (go === 'go') goRoom(nextRoom.id);
  }
}

// ---------- fases ----------
function goalIcon(g) {
  if (g.type === 'c') return svgUrl(g.key);
  if (g.type === 'make') return svgUrl(g.key === 'rocket' ? 'rocketV' : g.key);
  return svgUrl(g.type);
}
function goalText(goalDef) {
  const [t, a, b] = goalDef;
  const n = t === 'c' || t === 'make' ? b : a;
  return { n, icon: t === 'c' ? svgUrl(a) : t === 'make' ? svgUrl(a === 'rocket' ? 'rocketV' : a) : svgUrl(t) };
}

async function openLevel(n) {
  sfx.tap();
  const lv = LEVELS[n];
  const go = await modal((box, done) => {
    const tier = lv.tier === 2 ? h('span', { class: 'tier t2' }, 'Muito difícil · vale 2 estrelas') : lv.tier === 1 ? h('span', { class: 'tier t1' }, 'Difícil') : null;
    box.append(...[h('h2', {}, `Fase ${n}`), tier,
      h('div', { class: 'goal-row' }, lv.g.map(gd => { const t = goalText(gd); return h('span', { class: 'goal-chip' }, h('img', { src: t.icon, alt: '' }), String(t.n)); })),
      h('p', {}, `${lv.moves} jogadas`),
      h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done(true) }, 'Jogar'), h('button', { class: 'btn soft', onclick: () => done(false) }, 'Agora não'))].filter(Boolean));
  });
  if (!go) return;
  if (lv.tut && !state.seen['tut_' + lv.tut]) {
    const tut = TUTORIALS[lv.tut];
    await modal((box, done) => {
      box.append(...[tut.icon ? h('img', { class: 'tut-icon', src: svgUrl(tut.icon), alt: '' }) : null, h('h2', {}, tut.title), h('p', {}, tut.text),
        h('div', { class: 'btns' }, h('button', { class: 'btn green', onclick: () => done() }, 'Entendi'))].filter(Boolean));
    });
    state.seen['tut_' + lv.tut] = true; save();
  }
  startLevel(n);
}

function startLevel(n) {
  const lv = { ...LEVELS[n] };
  house.stop();
  showScreen('s-level');
  setMusic('fases');
  $('#lv-name').textContent = `Fase ${n}`;
  $('#lv-sub').textContent = `${roomOfLevel(n).name}${lv.tier === 2 ? ' · muito difícil' : lv.tier === 1 ? ' · difícil' : ''}`;
  if (game) game.destroy();
  game = new Match3($('#board'), lv, {
    onMoves: m => { $('#lv-moves').textContent = m; $('.moves').classList.toggle('low', m <= 5); },
    onGoals: renderGoals,
    onWin: () => setTimeout(() => winLevel(n, lv), 500),
    onLose: () => setTimeout(() => loseLevel(n), 500),
    onToast: t => toast(t),
    onBoosterUsed: b => { state.boosters[b]--; save(); renderBoosters(); $('#boost-hint').hidden = true; }
  });
  if (DEV) window.__game = game;
  $('#lv-moves').textContent = lv.moves;
  $('.moves').classList.remove('low');
  renderGoals(game.goals);
  renderBoosters();
}

let lastGot = {};
function renderGoals(goals) {
  const box = $('#lv-goals');
  box.innerHTML = '';
  goals.forEach((g, i) => {
    const left = Math.max(0, g.need - g.got);
    box.append(h('div', { class: 'goal' + (left === 0 ? ' ok' : '') + (lastGot[i] !== undefined && lastGot[i] !== left ? ' bump' : '') },
      h('img', { src: goalIcon(g), alt: '' }), left === 0 ? h('i', { class: 'ico-check' }) : String(left)));
    lastGot[i] = left;
  });
}

function renderBoosters() {
  document.querySelectorAll('.boost').forEach(b => {
    const n = state.boosters[b.dataset.b];
    b.querySelector('.n').textContent = n;
    b.disabled = n <= 0;
    b.classList.toggle('on', game && game.booster === b.dataset.b);
  });
}

async function useBooster(b) {
  if (!game || game.busy || game.over) return;
  if (state.boosters[b] <= 0) return;
  sfx.tap();
  if (b === 'shuffle') {
    if (await game.doShuffleBooster()) { state.boosters.shuffle--; save(); renderBoosters(); }
    return;
  }
  game.booster = game.booster === b ? null : b;
  const hint = $('#boost-hint');
  hint.hidden = !game.booster;
  hint.textContent = b === 'hammer' ? 'Toque numa peça ou obstáculo pra quebrar' : 'Toque numa linha pra limpar inteira';
  renderBoosters();
}

async function winLevel(n, lv) {
  const first = state.done < n;
  const gain = lv.tier === 2 ? 2 : 1;
  if (first) { state.done = n; state.stars += gain; save(); }
  sfx.win(); confetti(60);
  await modal((box, done) => {
    box.append(h('h2', {}, `Fase ${n} completa!`),
      h('div', { class: 'stars-won' }, Array.from({ length: gain }, () => h('i', { class: 'ico-star' }))),
      h('p', {}, first ? `+${gain} ${gain > 1 ? 'estrelas' : 'estrela'} pra decorar a casa` : 'Mandou bem de novo!'),
      h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done() }, 'Voltar pra casa')));
  });
  lastGot = {};
  if (game) { game.destroy(); game = null; }
  goHouse();
}

async function loseLevel(n) {
  sfx.lose();
  const again = await modal((box, done) => {
    box.append(h('h2', {}, 'Acabaram as jogadas'), h('p', {}, 'Faltou pouquinho! Tenta de novo, sem pressa.'),
      h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done(true) }, 'Tentar de novo'), h('button', { class: 'btn soft', onclick: () => done(false) }, 'Voltar pra casa')));
  });
  lastGot = {};
  if (again) startLevel(n);
  else { if (game) { game.destroy(); game = null; } goHouse(); }
}

async function leaveLevel() {
  sfx.tap();
  const ok = await modal((box, done) => {
    box.append(h('h2', {}, 'Sair da fase?'), h('p', {}, 'Você pode jogar de novo quando quiser.'),
      h('div', { class: 'btns' }, h('button', { class: 'btn green', onclick: () => done(false) }, 'Continuar jogando'), h('button', { class: 'btn soft', onclick: () => done(true) }, 'Sair')));
  });
  if (!ok) return;
  lastGot = {};
  if (game) { game.destroy(); game = null; }
  goHouse();
}

// ---------- desafios ----------
async function startMission(m) {
  if (busyTalk) return;
  if (m.urgent) { urgentCall(m); return; }
  busyTalk = true;
  const choice = await talk(m.talk, { choices: [{ label: 'Iniciar desafio', value: 'go' }, { label: 'Agora não', value: 'no', cls: 'soft' }] });
  busyTalk = false;
  if (choice === 'go') openMinigame(m);
}

// videochamada da Margarida
async function urgentCall(m) {
  if (busyTalk) return;
  busyTalk = true;
  sfx.urgent && sfx.urgent();
  const go = await modal((box, done) => {
    box.classList.add('urgent-box');
    box.append(h('div', { class: 'urg-top' }, 'URGENTE'),
      h('div', { class: 'urg-video' }, h('img', { src: 'assets/faces/margarida.webp', alt: '' }), h('span', { class: 'rec' }, 'ao vivo')),
      h('b', { class: 'urg-name' }, 'Margarida'), h('span', { class: 'urg-role' }, 'chefe do plantão · videochamada'),
      h('p', { class: 'urg-quote' }, `"${m.call}"`),
      h('div', { class: 'urg-chips' }, h('span', {}, `Urgente ${m.urgent} de 3`), h('span', {}, `dificuldade ${m.level}`), h('span', { class: 'gold' }, 'vale 2 estrelas')),
      h('div', { class: 'btns' }, h('button', { class: 'btn red big', onclick: () => done(true) }, 'Atender o plantão'), h('button', { class: 'btn soft', onclick: () => done(false) }, 'Já vou')));
  });
  if (!go) { busyTalk = false; refreshHud(); renderPanel(); return; }
  await talk(m.talk);
  busyTalk = false;
  openMinigame(m);
}

function renderStatus(el, s) {
  el.innerHTML = '';
  if (s.lives) el.append(h('span', { class: 'mg-lives' }, Array.from({ length: s.lives[1] }, (_, i) => h('i', { class: i < s.lives[0] ? 'on' : '' }))));
  if (s.progress) {
    const [n, g] = s.progress;
    el.append(h('span', { class: 'mg-prog' }, h('i', { style: { width: Math.min(100, n / g * 100) + '%' } })));
  }
  el.append(h('b', { class: 'mg-text' }, s.text || (s.progress ? `${s.progress[0]} de ${s.progress[1]}` : '')));
  if (s.time !== undefined) el.append(h('span', { class: 'mg-time' + (s.time <= 8 ? ' low' : '') }, `${Math.floor(s.time / 60)}:${String(s.time % 60).padStart(2, '0')}`));
}

async function openMinigame(m) {
  house.stop();
  const scr = $('#s-mini');
  scr.innerHTML = '';
  scr.classList.toggle('urgent', !!m.urgent);
  scr.classList.toggle('has-ctrl', m.game === 'encaixe');
  showScreen('s-mini');
  setMusic('desafio');
  const who = m.chars || [m.char];
  const back = h('button', { class: 'round', 'aria-label': 'Sair do desafio', onclick: async () => {
    if (mini) mini.paused = true;
    const ok = await modal((box, done) => { box.append(h('h2', {}, 'Sair do desafio?'), h('p', {}, m.urgent ? 'A Margarida não vai gostar nada disso...' : `${missionWho(m)} ${m.chars ? 'esperam' : 'espera'} você voltar.`), h('div', { class: 'btns' }, h('button', { class: 'btn green', onclick: () => done(false) }, 'Continuar'), h('button', { class: 'btn soft', onclick: () => done(true) }, 'Sair'))); });
    if (ok) { if (mini) mini.destroy(); mini = null; goHouse(); } else if (mini) mini.paused = false;
  } }, h('i', { class: 'ico-back' }));
  const tag = m.urgent ? `URGENTE ${m.urgent} de 3 · Plantão` : `Desafio · ${roomById(m.room).name}`;
  scr.append(h('div', { class: 'mg-hud' }, back,
    h('div', { class: 'lv-title' }, h('span', { class: 'tagline' }, tag), h('b', {}, m.title)),
    h('div', { class: 'mg-faces' }, who.map(id => h('img', { src: `assets/faces/${CHARS[id].img}.webp`, alt: '' })))));
  const stat = h('div', { class: 'mg-status' });
  scr.append(stat);
  const area = h('div', { class: 'mg-area' });
  scr.append(area);
  const ctrl = h('div', { class: 'mg-ctrl' });
  scr.append(ctrl);
  if (!state.seen['mg_' + m.game]) {
    await modal((box, done) => {
      box.append(h('span', { class: 'tagline' }, `${m.title} · ${m.urgent ? 'URGENTE' : 'desafio ' + (m.chars ? 'da Ana e do Italo' : m.char === 'dodo' ? 'do Dodô' : m.char === 'pai' ? 'do pai do Dodô' : m.char === 'milton' ? 'do Seu Milton' : 'da ' + charName(m.char))}`),
        h('h2', {}, 'Como jogar'),
        h('ol', { class: 'howto' }, m.howto.map(t => h('li', {}, t))),
        h('div', { class: 'urg-chips' }, m.faster ? h('span', {}, 'fica mais rápido com o tempo') : null, h('span', {}, m.level)),
        h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done() }, 'Começar')));
    });
    state.seen['mg_' + m.game] = true; save();
  }
  const G = GAMES[m.game];
  const begin = () => {
    if (mini) mini.destroy();
    area.innerHTML = ''; ctrl.innerHTML = ''; stat.innerHTML = '';
    const hooks = {
      onStatus: s => renderStatus(stat, s),
      onWin: () => setTimeout(() => winMission(m), 400),
      onLose: msg => setTimeout(async () => {
        sfx.lose();
        const again = await modal((box, done) => { box.append(h('h2', {}, 'Quase!'), h('p', {}, msg || 'Não foi dessa vez.'), h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done(true) }, 'Tentar de novo'), h('button', { class: 'btn soft', onclick: () => done(false) }, 'Voltar pra casa'))); });
        if (again) begin(); else { if (mini) mini.destroy(); mini = null; goHouse(); }
      }, 400),
      sfx: (name, ...a) => sfx[name] && sfx[name](...a)
    };
    if (m.game === 'encaixe') {
      const goal = G.opts.lines;
      hooks.onLines = n => { renderStatus(stat, { progress: [n, goal], text: `Pedras ${n} de ${goal}` }); sfx.star(); };
      renderStatus(stat, { progress: [0, goal], text: `Pedras 0 de ${goal}` });
      mini = new Encaixe(area, G.opts, hooks);
      [['◀', () => mini.move(-1)], ['⟳', () => mini.rotate()], ['▶', () => mini.move(1)], ['▼', () => mini.drop()]].forEach(([t, fn]) => ctrl.append(h('button', { 'aria-label': t, onclick: fn }, t)));
    } else mini = new G.cls(area, G.opts || {}, hooks);
    if (DEV) window.__mini = mini;
    mini.start();
  };
  begin();
}

async function winMission(m) {
  state.missions[m.id] = true;
  if (m.stars) state.stars += m.stars;
  if (m.id === 'milton2') { const g = roomItems('gourmet'); if (g.churrasqueira === undefined) g.churrasqueira = 0; }
  save();
  sfx.win(); confetti(70);
  const [giftRoom, giftItem] = m.gift;
  const canSee = isRoomUnlocked(giftRoom);
  await modal((box, done) => {
    box.append(...[h('h2', {}, m.urgent ? 'Plantão resolvido!' : 'Desafio completo!'),
      h('img', { class: 'win-face', src: `assets/faces/${CHARS[m.char].img}.webp`, alt: '' }),
      m.stars ? h('div', { class: 'stars-won' }, Array.from({ length: m.stars }, () => h('i', { class: 'ico-star' }))) : null,
      m.stars ? h('p', { style: { fontSize: '14px' } }, `+${m.stars} estrelas pra decorar`) : null,
      h('p', {}, 'Presente pra casa: ' + m.giftText + (canSee ? '' : ` (${oA(roomById(giftRoom))} libera mais pra frente)`)),
      h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done() }, canSee ? 'Ver o presente' : 'Voltar pra casa'))].filter(Boolean));
  });
  if (mini) { mini.destroy(); mini = null; }
  if (canSee) state.room = giftRoom;
  if (m.room !== 'any' && m.room !== giftRoom && !canSee) state.room = m.room;
  save();
  await goHouse();
  if (canSee && house.items[giftItem]) house.sparkle(house.items[giftItem]);
  sfx.place();
  busyTalk = true;
  await talk(m.done);
  busyTalk = false;
  renderPanel();
}

// ---------- festa final ----------
async function festa() {
  if (busyTalk) return;
  if (state.room !== 'gourmet') { state.room = 'gourmet'; save(); await goHouse(); }
  busyTalk = true;
  setMusic('caixinha');
  confetti(120); sfx.win();
  await talk(SCENES.festa);
  const shot = house.snapshot();
  confetti(80);
  await modal((box, done) => {
    box.classList.add('final-box');
    box.append(h('h2', {}, 'A nossa casinha'),
      h('div', { class: 'polaroid big' }, h('img', { src: shot, alt: 'Todo mundo na festa da casinha' }), h('span', {}, 'todo mundo que a gente ama')),
      h('p', { class: 'letter' }, FINAL_LETTER),
      h('p', { class: 'sign' }, 'Dodô'),
      h('div', { class: 'btns' }, h('button', { class: 'btn gold big', onclick: () => done() }, 'Te amo também')));
  });
  state.seen.festa = true; save();
  setMusic('casa');
  busyTalk = false;
  renderPanel();
}

// ---------- mapa ----------
function openMap() {
  house.stop();
  showScreen('s-map');
  setMusic('caixinha');
  renderMap($('#s-map'), {
    onBack: () => { sfx.tap(); goHouse(); },
    onRoom: id => {
      const room = roomById(id);
      if (!isRoomUnlocked(id)) { toast(`${room.name}: libera depois ${ROOMS[ROOMS.indexOf(room) - 1].art === 'a' ? 'da' : 'do'} ${low(ROOMS[ROOMS.indexOf(room) - 1].name)}`); return; }
      goRoom(id);
    },
    onPin: (id, room) => {
      const m = availableMission(state);
      if (id === 'margarida' && m && m.urgent) { state.room = room; save(); goHouse().then(() => urgentCall(m)); return; }
      state.room = room; save(); goHouse().then(() => onCharTap(id));
    }
  });
}

// ---------- modo de teste ----------
function devPanel() {
  const b = (t, fn) => h('button', { class: 'btn soft', style: { fontSize: '12px', padding: '6px 8px' }, onclick: fn }, t);
  const box = h('div', { style: { position: 'absolute', left: '4px', top: '96px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '4px', opacity: '.75' } },
    b('+5 ⭐', () => { state.stars += 5; save(); refreshHud(); renderPanel(); }),
    b('passar', () => { if (game) { game.goals.forEach(g => { g.got = g.need; }); game.afterMove(); } else { state.done = Math.min(LAST_PLAYABLE, state.done + 1); state.stars++; save(); goHouse(); } }),
    b('desafio', () => { if (mini) mini.devWin(); }),
    b('cômodo', () => { const r = roomById(state.room); const it = roomItems(r.id); r.items.forEach(i => { if (it[i.id] === undefined) it[i.id] = 0; }); save(); goHouse().then(checkRoomDone); }),
    b('zerar', () => { reset(); location.reload(); }));
  $('#app').append(box);
}

boot();
