// Progresso salvo no aparelho
import { ROOMS } from './data.js';

const KEY = 'nossa-casinha-v1';

function fresh() {
  return {
    stars: 0,
    done: 0,            // fases completas (a próxima é done + 1)
    room: 'quintal',    // cômodo que está sendo mostrado
    items: {},          // { quintal: { portao: 0, ... } } índice do estilo
    missions: {},       // { milton1: true }
    seen: {},           // explicações e conversas já vistas
    boosters: { hammer: 3, broom: 3, shuffle: 3 },
    roomsDone: {},      // { quintal: true }
    music: true,
    sound: true
  };
}

export const state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return Object.assign(fresh(), JSON.parse(raw));
  } catch (e) { /* sem armazenamento: segue com progresso só nesta sessão */ }
  return fresh();
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignora */ }
}

export function reset() {
  const f = fresh();
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, f);
  save();
}

export function roomItems(roomId) {
  if (!state.items[roomId]) state.items[roomId] = {};
  return state.items[roomId];
}

export function roomProgress(roomId) {
  const room = ROOMS.find(r => r.id === roomId);
  const it = roomItems(roomId);
  const placed = room.items.filter(i => it[i.id] !== undefined).length;
  return { placed, total: room.items.length };
}

export function isRoomUnlocked(roomId) {
  const idx = ROOMS.findIndex(r => r.id === roomId);
  if (idx === 0) return true;
  return !!state.roomsDone[ROOMS[idx - 1].id];
}
