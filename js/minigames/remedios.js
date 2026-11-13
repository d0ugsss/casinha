// URGENTE 2 da Margarida: bandeja de remédios. Repita a sequência da prescrição na mesma ordem.
import { MiniGame } from './base.js';

const MEDS = [
  { e: '💊', n: 'Comprimido', c: '#F28DB2' }, { e: '💉', n: 'Injeção', c: '#5D8FD8' }, { e: '💧', n: 'Soro', c: '#6BC5E8' },
  { e: '🩹', n: 'Curativo', c: '#E8B06A' }, { e: '🧴', n: 'Pomada', c: '#9A73E0' }, { e: '🥄', n: 'Xarope', c: '#3FA466' }
];

export class Remedios extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, { ...opts, dom: 'remedios' }, hooks);
    this.lens = [3, 4, 5, 6, 7, 8]; this.round = 0; this.lives = 2;
    this.root.innerHTML = `
      <div class="rem-rx"><b>Prescrição</b><div class="rem-steps"></div></div>
      <p class="rem-say">Presta atenção, Tatiana.</p>
      <div class="rem-tray">${MEDS.map((m, i) => `<button data-i="${i}" style="--c:${m.c}"><span>${m.e}</span><b>${m.n}</b></button>`).join('')}</div>`;
    this.btns = [...this.root.querySelectorAll('.rem-tray button')];
    this.btns.forEach(b => b.onclick = () => this.press(+b.dataset.i));
    this.newSeq();
    this.later(() => this.show(), 700);
  }
  newSeq() {
    const n = this.lens[this.round];
    this.seq = [];
    while (this.seq.length < n) { const k = Math.floor(Math.random() * MEDS.length); if (this.seq[this.seq.length - 1] !== k) this.seq.push(k); }
  }
  steps(done = 0) {
    this.root.querySelector('.rem-steps').innerHTML = this.seq.map((k, i) => `<i class="${i < done ? 'on' : ''}">${i < done ? MEDS[k].e : i + 1}</i>`).join('');
  }
  upd() { this.status({ progress: [this.round, this.lens.length], lives: [this.lives, 2], text: `Prescrição ${this.round + 1} de ${this.lens.length}` }); }
  show() {
    this.showing = true; this.pos = 0; this.upd(); this.steps(0);
    this.root.querySelector('.rem-say').textContent = 'Olha a prescrição...';
    this.root.classList.add('showing');
    const gap = Math.max(380, 700 - this.round * 50);
    this.seq.forEach((k, i) => this.later(() => this.flash(k, gap * 0.7), 400 + i * gap));
    this.later(() => { this.showing = false; this.root.classList.remove('showing'); this.root.querySelector('.rem-say').textContent = 'Agora você. Na mesma ordem.'; }, 400 + this.seq.length * gap);
  }
  flash(k, ms) {
    const b = this.btns[k];
    b.classList.add('lit'); this.sfx('pop', k + 1);
    this.later(() => b.classList.remove('lit'), ms);
  }
  press(k) {
    if (this.showing || this.over || this.wait) return;
    this.flash(k, 220);
    if (k === this.seq[this.pos]) {
      this.pos++; this.steps(this.pos);
      if (this.pos >= this.seq.length) {
        this.wait = true; this.sfx('star');
        this.root.querySelector('.rem-say').textContent = this.round === this.lens.length - 1 ? 'Hmpf. Certo.' : 'Certo. Próxima, mais longa.';
        this.later(() => { this.wait = false; this.round++; if (this.round >= this.lens.length) { this.win(); return; } this.newSeq(); this.show(); }, 1100);
      }
      return;
    }
    this.lives--; this.sfx('bad'); this.upd();
    this.root.querySelector('.rem-say').textContent = this.lives > 0 ? 'Errou a ordem! Vou mostrar de novo.' : 'Errou de novo, Tatiana...';
    this.btns[k].classList.add('bad'); this.later(() => this.btns[k].classList.remove('bad'), 500);
    this.wait = true;
    if (this.lives <= 0) { this.later(() => this.lose('Errou a ordem duas vezes.'), 900); return; }
    this.later(() => { this.wait = false; this.show(); }, 1200);
  }
}
