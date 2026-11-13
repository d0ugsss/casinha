// Desafio da Tata e do Dodô: jogo da memória com fotos de vocês (20/01/2020)
import { MiniGame, shuffle } from './base.js';

const CARTAS = [
  { k: 'casal', html: '<img src="assets/photos/casal.jpg" alt="">' },
  { k: 'q1', html: '<img src="assets/photos/quadro1.jpg" alt="">' },
  { k: 'q2', html: '<img src="assets/photos/quadro2.jpg" alt="">' },
  { k: 'q3', html: '<img src="assets/photos/quadro3.jpg" alt="">' },
  { k: 'tata', html: '<img class="face" src="assets/faces/tata.webp" alt="">' },
  { k: 'dodo', html: '<img class="face" src="assets/faces/dodo.webp" alt="">' },
  { k: 'zozo', html: '<img class="face" src="assets/faces/zozo.webp" alt="">' },
  { k: 'data', html: '<span class="mem-date">20<br>01<br>2020</span>' }
];

export class Memoria extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, { ...opts, dom: 'memoria' }, hooks);
    this.tries = opts.tries || 24; this.pairs = 0; this.open = [];
    const deck = shuffle([...CARTAS, ...CARTAS].map((c, i) => ({ ...c, i })));
    this.root.innerHTML = `<div class="mem-grid">${deck.map(c => `<button class="mem-card" data-k="${c.k}"><span class="back">♥</span><span class="front">${c.html}</span></button>`).join('')}</div>`;
    this.root.querySelectorAll('.mem-card').forEach(b => b.onclick = () => this.flip(b));
    this.upd();
  }
  upd() { this.status({ progress: [this.pairs, 8], text: `Pares ${this.pairs} de 8 · ${this.tries} viradas` }); }
  flip(b) {
    if (this.over || this.busy || b.classList.contains('up')) return;
    b.classList.add('up'); this.sfx('tap');
    this.open.push(b);
    if (this.open.length < 2) return;
    const [a, c] = this.open; this.open = [];
    this.tries--;
    if (a.dataset.k === c.dataset.k) {
      this.pairs++; this.sfx('star');
      a.classList.add('ok'); c.classList.add('ok');
      this.upd();
      if (this.pairs >= 8) this.later(() => this.win(), 600);
      else if (this.tries <= 0) this.later(() => this.lose('Acabaram as viradas.'), 600);
      return;
    }
    this.busy = true; this.upd();
    this.later(() => {
      a.classList.remove('up'); c.classList.remove('up'); this.busy = false;
      if (this.tries <= 0) this.lose('Acabaram as viradas.');
    }, 850);
  }
  devWin() { this.pairs = 8; this.win(); }
}
