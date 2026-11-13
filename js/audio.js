// Sons feitos na hora (WebAudio) + música de fundo
import { state, save } from './state.js';

let ctx = null;
let master = null;
let music = null;

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function unlockAudio() {
  ac();
  if (state.music) startMusic();
}

function tone(freq, dur, { type = 'sine', vol = 0.3, slide = 0, delay = 0, attack = 0.005 } = {}) {
  if (!state.sound) return;
  const c = ac(); if (!c) return;
  const t0 = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

function noise(dur, { vol = 0.2, delay = 0, freq = 1200 } = {}) {
  if (!state.sound) return;
  const c = ac(); if (!c) return;
  const t0 = c.currentTime + delay;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = c.createBufferSource(); s.buffer = buf;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
  const g = c.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t0);
}

export const sfx = {
  tap: () => tone(660, 0.07, { type: 'triangle', vol: 0.18 }),
  swap: () => tone(420, 0.09, { type: 'triangle', vol: 0.16, slide: 1.4 }),
  bad: () => { tone(220, 0.12, { type: 'square', vol: 0.08 }); tone(180, 0.14, { type: 'square', vol: 0.08, delay: 0.08 }); },
  pop: (combo = 0) => { const f = 520 * Math.pow(1.12, Math.min(combo, 8)); tone(f, 0.12, { type: 'sine', vol: 0.22 }); tone(f * 1.5, 0.1, { type: 'triangle', vol: 0.08, delay: 0.02 }); },
  special: () => { tone(300, 0.25, { type: 'sawtooth', vol: 0.09, slide: 3 }); noise(0.25, { vol: 0.12, freq: 2200 }); },
  boom: () => { tone(120, 0.35, { type: 'sine', vol: 0.4, slide: 0.4 }); noise(0.35, { vol: 0.25, freq: 600 }); },
  box: () => { noise(0.12, { vol: 0.22, freq: 900 }); tone(180, 0.1, { type: 'square', vol: 0.06 }); },
  star: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.18, delay: i * 0.08 })),
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.2, delay: i * 0.11 })),
  lose: () => [392, 349, 311, 262].forEach((f, i) => tone(f, 0.3, { type: 'sine', vol: 0.18, delay: i * 0.14 })),
  place: () => { [659, 880, 1319].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.16, delay: i * 0.07 })); noise(0.4, { vol: 0.06, freq: 5000, delay: 0.05 }); },
  talk: () => tone(880 + Math.random() * 200, 0.04, { type: 'sine', vol: 0.06 }),
  urgent: () => [880, 660, 880, 660].forEach((f, i) => tone(f, 0.18, { type: 'square', vol: 0.07, delay: i * 0.2 }))
};

// ---------- músicas: uma pra cada momento, com troca suave ----------
const TRACKS = {
  casa: 'assets/audio/musica.mp3',      // passeando pela casa
  fases: 'assets/audio/pecinhas.mp3',   // combinando peças
  desafio: 'assets/audio/desafio.mp3',  // desafios dos personagens
  caixinha: 'assets/audio/caixinha.mp3' // mapa e cômodo pronto
};
const MUSIC_VOL = 0.32;
let wanted = 'casa';
let loading = null;
const raw = {};
const decoded = new Map(); // guarda no máximo 2 faixas abertas (economiza memória no celular)

function fetchRaw(name) {
  if (!raw[name]) raw[name] = fetch(TRACKS[name]).then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
  return raw[name];
}

async function getBuffer(name) {
  if (decoded.has(name)) { const b = decoded.get(name); decoded.delete(name); decoded.set(name, b); return b; }
  const ab = await fetchRaw(name);
  if (!ab || !ctx) return null;
  const buf = await new Promise(res => { try { ctx.decodeAudioData(ab.slice(0), res, () => res(null)); } catch (e) { res(null); } });
  if (buf) { decoded.set(name, buf); while (decoded.size > 2) decoded.delete(decoded.keys().next().value); }
  return buf;
}

function fadeOut(tr) {
  if (!tr || !ctx) return;
  const t = ctx.currentTime;
  tr.g.gain.cancelScheduledValues(t);
  tr.g.gain.setValueAtTime(tr.g.gain.value, t);
  tr.g.gain.linearRampToValueAtTime(0, t + 0.6);
  try { tr.src.stop(t + 0.65); } catch (e) { /* já parou */ }
}

async function playWanted() {
  const c = ac();
  if (!c || !state.music) return;
  const name = wanted;
  if ((music && music.name === name) || loading === name) return;
  loading = name;
  const buf = await getBuffer(name);
  if (loading === name) loading = null;
  if (!buf || wanted !== name || !state.music || (music && music.name === name)) return;
  fadeOut(music);
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(MUSIC_VOL, c.currentTime + 0.9);
  src.connect(g); g.connect(c.destination);
  src.start();
  music = { name, src, g };
  // já deixa a próxima provável baixada
  Object.keys(TRACKS).forEach(fetchRaw);
}

export function setMusic(name) {
  if (!TRACKS[name]) return;
  wanted = name;
  if (state.music && ctx) playWanted();
}

export function startMusic() {
  if (!state.music) return;
  playWanted();
}

export function stopMusic() {
  fadeOut(music);
  music = null;
}

// app em segundo plano: pausa tudo; voltando: continua
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else ctx.resume().catch(() => {});
});

export function toggleMusic() {
  state.music = !state.music;
  save();
  if (state.music) startMusic(); else stopMusic();
  return state.music;
}

// para os testes: qual música está tocando
export function musicNow() { return music ? music.name : null; }
