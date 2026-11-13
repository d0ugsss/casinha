// Desafio da Ana e do Italo: noite da pizza. Monte a pizza de cada um antes de esfriar.
import { MiniGame, shuffle } from './base.js';

const ING = {
  molho: ['🥫', 'molho'], queijo: ['🧀', 'mussarela'], calabresa: ['🌭', 'calabresa'], cebola: ['🧅', 'cebola'],
  frango: ['🍗', 'frango'], catupiry: ['🥛', 'catupiry'], milho: ['🌽', 'milho'], tomate: ['🍅', 'tomate'],
  manjericao: ['🌿', 'manjericão'], presunto: ['🥓', 'presunto'], ovo: ['🥚', 'ovo'], azeitona: ['🫒', 'azeitona']
};
const PEDIDOS = [
  { who: 'ana', nome: 'Ana', sabor: 'Calabresa', ing: ['molho', 'queijo', 'calabresa', 'cebola'] },
  { who: 'italo', nome: 'Italo', sabor: 'Frango com catupiry', ing: ['molho', 'queijo', 'frango', 'catupiry', 'milho'] },
  { who: 'tata', nome: 'Tata', sabor: 'Margherita', ing: ['molho', 'queijo', 'tomate', 'manjericao'] },
  { who: 'dodo', nome: 'Dodô', sabor: 'Portuguesa', ing: ['molho', 'queijo', 'presunto', 'ovo', 'cebola', 'azeitona'] }
];

export class Pizza extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, { ...opts, dom: 'pizza' }, hooks);
    this.lives = 3; this.i = 0;
    this.root.innerHTML = `
      <div class="pz-order"></div>
      <div class="pz-wait"><i></i></div>
      <div class="pz-board"><div class="pz-pizza"><div class="pz-tops"></div></div><button class="btn gold pz-bake" disabled>Assar</button></div>
      <div class="pz-ing">${shuffle(Object.keys(ING)).map(k => `<button data-k="${k}"><span>${ING[k][0]}</span><b>${ING[k][1]}</b></button>`).join('')}</div>`;
    this.$ = s => this.root.querySelector(s);
    this.root.querySelectorAll('.pz-ing button').forEach(b => b.onclick = () => this.add(b.dataset.k));
    this.$('.pz-bake').onclick = () => this.bake();
    this.startOrder();
  }
  startOrder() {
    const p = PEDIDOS[this.i];
    this.have = []; this.limit = 28 - this.i * 2; this.left = this.limit; this.busy = false;
    this.$('.pz-order').innerHTML = `<img src="assets/faces/${p.who}.webp" alt=""><div><b>${p.nome}: ${p.sabor}</b><div class="pz-need">${p.ing.map(k => `<i data-k="${k}">${ING[k][0]}</i>`).join('')}</div></div>`;
    this.$('.pz-tops').innerHTML = '';
    this.$('.pz-pizza').className = 'pz-pizza';
    this.$('.pz-bake').disabled = true;
    this.upd();
  }
  upd() { this.status({ progress: [this.i, PEDIDOS.length], lives: [this.lives, 3], text: `Pizzas ${this.i} de 4` }); }
  add(k) {
    if (this.busy || this.over) return;
    const p = PEDIDOS[this.i];
    if (this.have.includes(k)) return;
    if (!p.ing.includes(k)) { this.ruin(`${ING[k][1]} não vai nessa!`); return; }
    if (k !== 'molho' && !this.have.includes('molho')) { this.hint('Primeiro o molho!'); return; }
    this.have.push(k); this.sfx('pop', this.have.length);
    this.$(`.pz-need i[data-k="${k}"]`).classList.add('ok');
    const tops = this.$('.pz-tops');
    if (k === 'molho') this.$('.pz-pizza').classList.add('molho');
    else if (k === 'queijo') this.$('.pz-pizza').classList.add('queijo');
    else for (let n = 0; n < 6; n++) { const a = n / 6 * Math.PI * 2 + Math.random() * 0.5, r = 18 + Math.random() * 22; tops.insertAdjacentHTML('beforeend', `<span style="left:${50 + Math.cos(a) * r}%;top:${50 + Math.sin(a) * r}%">${ING[k][0]}</span>`); }
    if (p.ing.every(x => this.have.includes(x))) this.$('.pz-bake').disabled = false;
  }
  hint(t) { const o = this.$('.pz-order b'); const old = o.textContent; o.textContent = t; this.later(() => { if (!this.over) o.textContent = old; }, 900); }
  ruin(msg) {
    this.lives--; this.sfx('bad'); this.busy = true; this.upd();
    this.$('.pz-pizza').classList.add('ruim'); this.hint(msg);
    this.later(() => { if (this.lives <= 0) this.lose('Três pizzas estragaram.'); else this.startOrder(); }, 1100);
  }
  bake() {
    if (this.busy) return;
    this.busy = true; this.sfx('swap');
    this.$('.pz-pizza').classList.add('assando');
    this.later(() => {
      this.sfx('star'); this.i++; this.upd();
      if (this.i >= PEDIDOS.length) { this.win(); return; }
      this.startOrder();
    }, 1200);
  }
  tick(dt) {
    if (this.over || this.busy || this.paused) return;
    this.left -= dt;
    const bar = this.$('.pz-wait i');
    bar.style.width = Math.max(0, this.left / this.limit * 100) + '%';
    bar.classList.toggle('low', this.left < 7);
    if (this.left <= 0) this.ruin('Esfriou! Faz de novo.');
  }
  devWin() { this.i = 4; this.win(); }
}
