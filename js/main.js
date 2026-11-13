// Nossa Casinha — fluxo do jogo
import { ROOMS, LEVELS, LAST_PLAYABLE, TUTORIALS, CHARS, SCENES, IDLE_LINES, presence, availableMission, roomOfLevel } from './data.js';
import { state, save, reset, roomItems, roomProgress, isRoomUnlocked } from './state.js';
import { sfx, unlockAudio, toggleMusic } from './audio.js';
import { loadSprites, svgUrl } from './pieces.js';
import { Match3 } from './match3.js';
import { House } from './house.js';
import { Encaixe } from './minigames/encaixe.js';
import { renderMap } from './map.js';
import { $, h, showScreen, toast, sheet, closeSheet, modal, talk, confetti } from './ui.js';

const DEV = new URLSearchParams(location.search).has('dev') || location.hash === '#dev';
let house = null;
let game = null;
let mini = null;
let busyTalk = false;

const SWATCH = {
  portao: ['#9B6A43', '#2B2B2E', '#F6F3EE'],
  caminho: ['#B9B4AA', '#C0603C', 'conic-gradient(#5D8FD8, #F28DB2, #FFD84A, #6DBA5A, #9A73E0, #5D8FD8)'],
  canteiro: ['#FFC93D', '#9A73E0', '#E84A6A'],
  arvore: ['#F4C430', '#2F6B35', 'radial-gradient(circle at 60% 40%, #FFE14D 22%, #5FAE57 24%)'],
  casinha: ['#B07A4B', 'linear-gradient(180deg, #E15B4F 45%, #5D8FD8 45%)', 'linear-gradient(180deg, #D9467F 45%, #F2A7C3 45%)'],
  banco: ['#B9844D', '#2B2B2E', '#F28DB2']
};

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
  if (!isRoomUnlocked(state.room) || !ROOMS.find(r => r.id === state.room).ready) state.room = 'quintal';
  const room = ROOMS.find(r => r.id === state.room);
  await house.loadRoom(room.id, roomItems(room.id), { allItems: Object.fromEntries(room.items.map(i => [i.id, true])), plaque: room.id === 'quintal' && state.missions.milton1 });
  await refreshChars();
  house.resize();
  house.start();
  refreshHud();
  renderPanel();
  await runScenes();
}

async function refreshChars() {
  const m = availableMission(state);
  const list = presence(state).filter(p => p.room === state.room).map(p => ({ id: p.id, glow: !!(m && m.char === p.id && m.room === state.room) }));
  await house.setCharacters(list);
}

async function runScenes() {
  if (busyTalk) return;
  busyTalk = true;
  if (!state.seen.intro) {
    await talk(SCENES.intro);
    state.seen.intro = true; save();
  }
  if (state.done >= 4 && !state.seen.miltonChega && state.room === 'quintal') {
    await talk(SCENES.miltonChega);
    state.seen.miltonChega = true; save();
  }
  busyTalk = false;
}

function refreshHud() {
  const room = ROOMS.find(r => r.id === state.room);
  const p = roomProgress(room.id);
  $('#room-name').textContent = room.name;
  $('#room-prog').textContent = `${p.placed} de ${p.total} itens`;
  $('#star-count').textContent = state.stars;
  $('#map-dot').hidden = !availableMission(state);
}

function affordable() {
  const room = ROOMS.find(r => r.id === state.room);
  const it = roomItems(room.id);
  return room.items.filter(i => it[i.id] === undefined && i.cost <= state.stars).length;
}

function renderPanel() {
  const panel = $('#house-panel');
  panel.innerHTML = '';
  const m = availableMission(state);
  const next = state.done + 1;
  const room = ROOMS.find(r => r.id === state.room);
  const tasksBtn = () => {
    const n = affordable();
    return h('button', { class: 'btn white tasks-btn', 'aria-label': 'Tarefas', onclick: openTasks },
      h('i', { class: 'ico-star', style: { width: '30px', height: '30px' } }), n ? h('span', { class: 'n' }, n) : null);
  };
  if (m) {
    const name = CHARS[m.char].name;
    panel.append(h('div', { class: 'note' }, h('img', { src: `assets/faces/${CHARS[m.char].img}.webp`, alt: '' }), h('span', {}, `${name === 'Milton' ? 'O Milton' : name} tem um desafio pra você. Faça ele pra liberar as próximas fases.`)));
    panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn gold big', onclick: () => startMission(m) }, `Falar com ${name === 'Milton' ? 'o Milton' : name}`)));
    panel.append(h('div', { class: 'lock' }, h('i', { class: 'ico-lock' }), `Fase ${next} libera depois do desafio`));
    return;
  }
  if (next <= LAST_PLAYABLE) {
    const lv = LEVELS[next];
    const tierTxt = lv.tier === 2 ? 'muito difícil · vale 2 estrelas' : lv.tier === 1 ? 'difícil' : '';
    panel.append(h('div', { class: 'note' }, h('span', {}, affordable() ? 'Você tem estrelas pra decorar! Toque na estrela pra ver as tarefas.' : 'Passe de fase pra ganhar estrelas e decorar a casa.')));
    panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn green big', onclick: () => openLevel(next) }, `Jogar fase ${next}`)));
    if (tierTxt) panel.append(h('div', { class: 'lock' }, tierTxt));
    return;
  }
  const p = roomProgress(room.id);
  if (p.placed < p.total) {
    panel.append(h('div', { class: 'note' }, h('span', {}, 'Use suas estrelas pra terminar de decorar o quintal.')));
    panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn green big', onclick: openTasks }, 'Ver tarefas')));
  } else {
    panel.append(h('div', { class: 'note' }, h('img', { src: 'assets/faces/dodo.webp', alt: '' }), h('span', {}, 'Quintal pronto! A sala chega na próxima atualização do jogo, momo.')));
    panel.append(h('div', { class: 'row' }, tasksBtn(), h('button', { class: 'btn soft big', onclick: () => toast('Em breve: a sala!') }, 'Sala em breve')));
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
  if (m && m.char === id) { startMission(m); return; }
  const lines = IDLE_LINES[id] || ['Opa, não tenho nada pra você por agora!'];
  say(id, lines[Math.floor(Math.random() * lines.length)]);
}

function onItemTap(id) {
  if (busyTalk) return;
  const room = ROOMS.find(r => r.id === state.room);
  const item = room.items.find(i => i.id === id);
  if (item && roomItems(room.id)[id] !== undefined) openStyles(item, true);
}

// ---------- tarefas e estilos ----------
function openTasks() {
  sfx.tap();
  const room = ROOMS.find(r => r.id === state.room);
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
    const cards = item.styles.map((name, i) => {
      const sw = (SWATCH[item.id] || [])[i] || '#D9A7CF';
      const c = h('button', { class: 'style' + (i === pick ? ' on' : ''), onclick: () => {
        pick = i; cards.forEach((cc, j) => cc.classList.toggle('on', j === i)); house.setItem(item.id, i, true); sfx.place();
      } }, h('span', { class: 'sw', style: { background: sw } }), name);
      return c;
    });
    cards.forEach(c => grid.append(c));
    body.append(grid);
    body.append(h('button', { class: 'btn green big', style: { width: '100%' }, onclick: () => {
      confirmed = true;
      if (!isChange) state.stars -= item.cost;
      it[item.id] = pick;
      save();
      sfx.star();
      close();
      refreshHud();
      renderPanel();
      checkRoomDone();
    } }, isChange ? 'Pronto' : h('span', {}, 'Colocar · ', h('i', { class: 'ico-star', style: { verticalAlign: '-4px' } }), ' ' + item.cost)));
  }, { onClose: () => {
    if (confirmed) return;
    if (before === undefined) { house.root.remove(house.items[item.id]); delete house.items[item.id]; house.showGhost(item.id); }
    else house.setItem(item.id, before, false);
  } });
}

async function checkRoomDone() {
  const room = ROOMS.find(r => r.id === state.room);
  const p = roomProgress(room.id);
  if (p.placed < p.total || state.roomsDone[room.id]) return;
  state.roomsDone[room.id] = true;
  state.boosters.hammer++; state.boosters.broom++; state.boosters.shuffle++;
  save();
  await new Promise(r => setTimeout(r, 900));
  sfx.win(); confetti(80);
  await modal((box, done) => {
    box.append(h('h2', {}, `${room.name} pronto!`),
      h('div', { class: 'polaroid' }, h('img', { src: 'assets/photos/casal.jpg', alt: 'Dodô e Tata' }), h('span', {}, 'nosso cantinho')),
      h('p', {}, room.note),
      h('p', { style: { fontSize: '14px' } }, 'Ganhou +1 martelo, +1 vassoura e +1 embaralhar.'),
      h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done() }, 'Que lindo!')));
  });
  renderPanel();
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
  $('#lv-name').textContent = `Fase ${n}`;
  $('#lv-sub').textContent = `${roomOfLevel(n).name}${lv.tier === 2 ? ' · muito difícil' : lv.tier === 1 ? ' · difícil' : ''}`;
  if (game) game.destroy();
  const cv = $('#board');
  game = new Match3(cv, lv, {
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
    const key = i + ':' + left;
    const el = h('div', { class: 'goal' + (left === 0 ? ' ok' : '') + (lastGot[i] !== undefined && lastGot[i] !== left ? ' bump' : '') },
      h('img', { src: goalIcon(g), alt: '' }), left === 0 ? h('i', { class: 'ico-check' }) : String(left));
    lastGot[i] = left;
    box.append(el);
    void key;
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
  busyTalk = true;
  const choice = await talk(m.talk, { choices: [{ label: 'Iniciar desafio', value: 'go' }, { label: 'Agora não', value: 'no', cls: 'soft' }] });
  busyTalk = false;
  if (choice === 'go') openMinigame(m);
}

async function openMinigame(m) {
  house.stop();
  const scr = $('#s-mini');
  scr.innerHTML = '';
  showScreen('s-mini');
  const stones = h('div', { class: 'path-stones' });
  const back = h('button', { class: 'round', 'aria-label': 'Sair do desafio', onclick: async () => {
    const ok = await modal((box, done) => { box.append(h('h2', {}, 'Sair do desafio?'), h('p', {}, 'O Milton espera você voltar.'), h('div', { class: 'btns' }, h('button', { class: 'btn green', onclick: () => done(false) }, 'Continuar'), h('button', { class: 'btn soft', onclick: () => done(true) }, 'Sair'))); });
    if (ok) { if (mini) mini.destroy(); mini = null; goHouse(); }
  } }, h('i', { class: 'ico-back' }));
  scr.append(h('div', { class: 'mg-hud' }, back,
    h('div', { class: 'lv-title' }, h('span', { class: 'tagline' }, 'Desafio · Quintal'), h('b', {}, m.title)),
    h('img', { src: `assets/faces/${CHARS[m.char].img}.webp`, alt: '', style: { width: '52px', height: '52px', borderRadius: '50%', background: '#FFF0C7', border: '3px solid #fff' } })));
  scr.append(h('div', { class: 'mg-goal' }, stones));
  const area = h('div', { class: 'mg-area' });
  scr.append(area);
  const ctrl = h('div', { class: 'mg-ctrl' });
  scr.append(ctrl);
  const goal = 6;
  const paint = n => { stones.innerHTML = ''; for (let i = 0; i < goal; i++) stones.append(h('i', { class: i < n ? 'on' : '' })); };
  paint(0);
  if (!state.seen['mg_' + m.game]) {
    await modal((box, done) => {
      box.append(h('h2', {}, 'Como jogar'),
        h('p', {}, 'Encaixe as pedras pra fechar linhas inteiras. Cada linha completa assenta uma pedra do caminho: são 6.'),
        h('p', { style: { fontSize: '14px' } }, 'Arraste pro lado pra mover, toque pra girar e puxe pra baixo pra soltar. Fica mais rápido com o tempo.'),
        h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done() }, 'Começar')));
    });
    state.seen['mg_' + m.game] = true; save();
  }
  const begin = () => {
    if (mini) mini.destroy();
    area.innerHTML = '';
    paint(0);
    mini = new Encaixe(area, { lines: goal, speed: 720 }, {
      onLines: n => { paint(n); sfx.star(); },
      onWin: () => setTimeout(() => winMission(m), 400),
      onLose: () => setTimeout(async () => {
        const again = await modal((box, done) => { box.append(h('h2', {}, 'Ops, encheu!'), h('p', {}, 'As pedras chegaram no topo. Bora de novo?'), h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done(true) }, 'Tentar de novo'), h('button', { class: 'btn soft', onclick: () => done(false) }, 'Voltar pra casa'))); });
        if (again) begin(); else { mini.destroy(); mini = null; goHouse(); }
      }, 400)
    });
    ctrl.innerHTML = '';
    [['◀', () => mini.move(-1)], ['⟳', () => mini.rotate()], ['▶', () => mini.move(1)], ['▼', () => mini.drop()]].forEach(([t, fn]) => ctrl.append(h('button', { 'aria-label': t, onclick: fn }, t)));
    mini.start();
  };
  begin();
}

async function winMission(m) {
  state.missions[m.id] = true; save();
  confetti(70);
  await modal((box, done) => {
    box.append(h('h2', {}, 'Desafio completo!'), h('img', { src: `assets/faces/${CHARS[m.char].img}.webp`, alt: '', style: { width: '96px', height: '96px', borderRadius: '50%', background: '#FFF0C7' } }),
      h('p', {}, 'Presente pra casa: ' + m.gift),
      h('div', { class: 'btns' }, h('button', { class: 'btn green big', onclick: () => done() }, 'Ver no quintal')));
  });
  if (mini) { mini.destroy(); mini = null; }
  await goHouse();
  if (house.items.plaquinha) house.sparkle(house.items.plaquinha);
  sfx.place();
  busyTalk = true;
  await talk(m.done);
  busyTalk = false;
}

// ---------- mapa ----------
function openMap() {
  house.stop();
  showScreen('s-map');
  renderMap($('#s-map'), {
    onBack: () => { sfx.tap(); goHouse(); },
    onRoom: id => {
      const room = ROOMS.find(r => r.id === id);
      if (!isRoomUnlocked(id)) { toast(`${room.name}: libera depois do cômodo anterior`); return; }
      if (!room.ready) { toast(`${room.name}: chega na próxima atualização`); return; }
      sfx.tap(); state.room = id; save(); goHouse();
    },
    onPin: (id, room) => { state.room = room; save(); goHouse().then(() => onCharTap(id)); }
  });
}

// ---------- modo de teste ----------
function devPanel() {
  const box = h('div', { style: { position: 'absolute', left: '4px', top: '96px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '4px', opacity: '.75' } },
    h('button', { class: 'btn soft', style: { fontSize: '12px', padding: '6px 8px' }, onclick: () => { state.stars += 5; save(); refreshHud(); renderPanel(); } }, '+5 ⭐'),
    h('button', { class: 'btn soft', style: { fontSize: '12px', padding: '6px 8px' }, onclick: () => { if (game) { game.goals.forEach(g => { g.got = g.need; }); game.afterMove(); } else { state.done = Math.min(LAST_PLAYABLE, state.done + 1); state.stars++; save(); goHouse(); } } }, 'passar'),
    h('button', { class: 'btn soft', style: { fontSize: '12px', padding: '6px 8px' }, onclick: () => { if (mini) { mini.lines = mini.goal - 1; mini.clearRows([15]); } } }, 'desafio'),
    h('button', { class: 'btn soft', style: { fontSize: '12px', padding: '6px 8px' }, onclick: () => { reset(); location.reload(); } }, 'zerar'));
  $('#app').append(box);
}

boot();
