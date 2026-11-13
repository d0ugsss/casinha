// Peças de interface: folhas, janelas, conversas e avisos
import { CHARS } from './data.js';
import { sfx } from './audio.js';

export const $ = (s, root = document) => root.querySelector(s);
export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return e;
}

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
}

export function toast(text, ms = 2200) {
  const layer = $('#toast-layer');
  layer.innerHTML = '';
  const t = h('div', { class: 'toast' }, text);
  layer.append(t);
  setTimeout(() => t.remove(), ms);
}

// Folha que sobe de baixo
export function sheet(build, { onClose } = {}) {
  const layer = $('#sheet-layer');
  layer.innerHTML = '';
  const back = h('div', { class: 'sheet-back' });
  const body = h('div', { class: 'sheet' });
  const close = () => { layer.innerHTML = ''; onClose && onClose(); };
  back.addEventListener('click', close);
  build(body, close);
  layer.append(back, body);
  return close;
}
export function closeSheet() { $('#sheet-layer').innerHTML = ''; }

// Janela no meio da tela; resolve com o valor do botão
export function modal(build) {
  return new Promise(res => {
    const layer = $('#modal-layer');
    const back = h('div', { class: 'modal-back' });
    const box = h('div', { class: 'modal' });
    const done = v => { back.remove(); res(v); };
    build(box, done);
    back.append(box);
    layer.append(back);
  });
}

// Conversa no estilo Homescapes. lines: [[quem, texto], ...]. choices: [{label, value, cls}]
export function talk(lines, { choices = null, left = null } = {}) {
  return new Promise(res => {
    const layer = $('#talk-layer');
    layer.innerHTML = '';
    const ids = [...new Set(lines.map(l => l[0]))];
    const leftId = left || ids.find(i => i !== 'tata') || ids[0];
    const rightId = ids.find(i => i !== leftId) || null;
    const root = h('div', { class: 'talk' });
    const imgs = {};
    if (leftId) { imgs[leftId] = h('img', { class: 'who l', src: `assets/chars/${CHARS[leftId].img}.webp`, alt: CHARS[leftId].name }); root.append(imgs[leftId]); }
    if (rightId) { imgs[rightId] = h('img', { class: 'who r', src: `assets/chars/${CHARS[rightId].img}.webp`, alt: CHARS[rightId].name }); root.append(imgs[rightId]); }
    const tag = h('span', { class: 'tag l' });
    const p = h('p');
    const go = h('span', { class: 'go' }, 'toque pra continuar');
    const choiceBox = h('div', { class: 'choices' });
    const box = h('div', { class: 'box' }, tag, p, go, choiceBox);
    root.append(box);
    layer.append(root);
    let i = -1, typing = null, full = '';
    const finish = v => { layer.innerHTML = ''; res(v); };
    const next = () => {
      if (typing) { clearInterval(typing); typing = null; p.textContent = full; return showChoices(); }
      i++;
      if (i >= lines.length) { if (!choices) finish(true); return; }
      const [who, text] = lines[i];
      const side = who === leftId ? 'l' : 'r';
      tag.className = 'tag ' + side;
      tag.textContent = CHARS[who].name;
      Object.entries(imgs).forEach(([id, im]) => im.classList.toggle('dim', id !== who));
      full = text; p.textContent = '';
      let k = 0;
      typing = setInterval(() => {
        k += 2; p.textContent = full.slice(0, k);
        if (k % 6 === 0) sfx.talk();
        if (k >= full.length) { clearInterval(typing); typing = null; showChoices(); }
      }, 22);
    };
    const showChoices = () => {
      const last = i >= lines.length - 1;
      go.style.display = last && choices ? 'none' : '';
      if (last && choices && !choiceBox.children.length) {
        choices.forEach(c => choiceBox.append(h('button', { class: 'btn ' + (c.cls || 'green'), onclick: e => { e.stopPropagation(); sfx.tap(); finish(c.value); } }, c.label)));
      }
    };
    root.addEventListener('click', () => { if (i >= lines.length - 1 && choices && !typing) return; next(); });
    next();
  });
}

export function confetti(n = 60) {
  const layer = $('#toast-layer');
  const colors = ['#FFC23D', '#FF5470', '#5D8FD8', '#3FA466', '#B48CF2', '#FF8DBA'];
  for (let i = 0; i < n; i++) {
    const c = h('i', { class: 'confetti' });
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
    c.style.animationDelay = Math.random() * 0.5 + 's';
    c.style.borderRadius = i % 3 ? '2px' : '50%';
    layer.append(c);
    setTimeout(() => c.remove(), 4000);
  }
}
