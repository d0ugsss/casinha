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

export function startMusic() {
  if (!state.music) return;
  if (!music) {
    music = new Audio('assets/audio/musica.mp3');
    music.loop = true;
    music.volume = 0.32;
  }
  const p = music.play();
  if (p && p.catch) p.catch(() => {});
}

export function stopMusic() {
  if (music) music.pause();
}

export function toggleMusic() {
  state.music = !state.music;
  save();
  if (state.music) startMusic(); else stopMusic();
  return state.music;
}
