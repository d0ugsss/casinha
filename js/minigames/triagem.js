// URGENTE 1 da Margarida: triagem. Classifique cada paciente pela cor do protocolo de risco.
import { MiniGame, shuffle } from './base.js';

export const CORES = [
  { id: 'vermelho', nome: 'Vermelho', sub: 'Emergência', cor: '#D93A3A' },
  { id: 'laranja', nome: 'Laranja', sub: 'Muito urgente', cor: '#F07B2A' },
  { id: 'amarelo', nome: 'Amarelo', sub: 'Urgente', cor: '#F2C230' },
  { id: 'verde', nome: 'Verde', sub: 'Pouco urgente', cor: '#3FA466' },
  { id: 'azul', nome: 'Azul', sub: 'Não urgente', cor: '#3D7FD1' }
];

const CASOS = [
  { nome: 'Seu Zé, 45 anos', chegada: 'chegou andando, com a esposa', fala: 'Cortei o dedo descascando laranja. Tá sangrando pouquinho, já enrolei no pano.', sinais: ['dor 3 de 10', 'consciente', 'sangramento controlado'], cor: 'verde', porque: 'Corte pequeno, sangramento controlado e dor leve: pouco urgente.' },
  { nome: 'Dona Cida, 62 anos', chegada: 'chegou com o filho, suando frio', fala: 'Tô com um aperto no peito faz meia hora, vai pro braço esquerdo.', sinais: ['dor 8 de 10', 'sudorese', 'pálida'], cor: 'laranja', porque: 'Dor no peito com cara de cardíaca e dor intensa: muito urgente.' },
  { nome: 'Lucas, 19 anos', chegada: 'trazido carregado pelos amigos', fala: '(não responde)', sinais: ['respiração ruidosa', 'lábios roxos', 'não acorda'], cor: 'vermelho', porque: 'Via aérea comprometida e não responde: emergência.' },
  { nome: 'Bia, 7 anos', chegada: 'no colo da mãe', fala: 'Ela tá com febre desde ontem e vomitou duas vezes.', sinais: ['febre 39 °C', 'dor 5 de 10', 'ativa'], cor: 'amarelo', porque: 'Criança com febre alta e vômitos, mas ativa: urgente.' },
  { nome: 'Seu Antônio, 70 anos', chegada: 'chegou sozinho, tranquilo', fala: 'Vim só pegar a receita do remédio de pressão, acabou ontem.', sinais: ['sem queixas', 'pressão normal', 'consciente'], cor: 'azul', porque: 'Só renovação de receita, sem queixa aguda: não urgente.' },
  { nome: 'Marina, 33 anos', chegada: 'mancando, apoiada no namorado', fala: 'Torci o tornozelo no vôlei faz duas horas. Inchou bastante.', sinais: ['dor 6 de 10', 'consegue apoiar', 'inchaço'], cor: 'amarelo', porque: 'Dor moderada depois da torção: urgente.' },
  { nome: 'Dona Rosa, 55 anos', chegada: 'trazida pela vizinha, confusa', fala: 'Sou diabética... tô tremendo, não sei onde tô.', sinais: ['glicemia 45 mg/dL', 'confusa', 'sudorese'], cor: 'laranja', porque: 'Hipoglicemia com alteração de consciência: muito urgente.' },
  { nome: 'Pedro, 28 anos', chegada: 'caiu na recepção', fala: '(está convulsionando agora)', sinais: ['convulsão ativa', 'não responde', 'trauma leve na queda'], cor: 'vermelho', porque: 'Convulsionando no momento: emergência.' },
  { nome: 'Júlia, 24 anos', chegada: 'chegou andando, sozinha', fala: 'Tô com uma dor de cabeça leve desde cedo, queria um remédio.', sinais: ['dor 3 de 10', 'sem febre', 'sem outros sintomas'], cor: 'verde', porque: 'Dor leve e recente, sem sinais de alerta: pouco urgente.' },
  { nome: 'Seu Jorge, 50 anos', chegada: 'chegou andando, tranquilo', fala: 'Minhas costas doem faz uns três meses, igual sempre. Queria um atestado.', sinais: ['dor crônica', 'sem mudança', 'sem outros sintomas'], cor: 'azul', porque: 'Queixa antiga, sem mudança: não urgente.' }
];

const FALA = {
  ok: ['Hmm. Certo.', 'Próximo!', 'Isso. Anda.', 'Pelo menos esse.'],
  erro: ['Tatiana!!', 'Não é isso não...', 'Revisa o protocolo, hein.'],
  tempo: ['Demorou demais!', 'O paciente não pode esperar, Tatiana.']
};
const pick = a => a[Math.floor(Math.random() * a.length)];

export class Triagem extends MiniGame {
  constructor(host, opts, hooks) {
    super(host, { ...opts, dom: 'triagem' }, hooks);
    const byCor = c => shuffle(CASOS.filter(x => x.cor === c));
    const um = CORES.map(c => byCor(c.id)[0]);
    const resto = shuffle(CASOS.filter(x => !um.includes(x)));
    this.fila = shuffle([...um, resto[0]]);
    this.total = this.fila.length; this.need = opts.need || 5;
    this.i = 0; this.acertos = 0; this.limit = opts.time || 20; this.left = this.limit; this.humor = 0.35;
    this.root.innerHTML = `
      <div class="tri-boss"><img src="assets/faces/margarida.webp" alt=""><div class="tri-say">A fila tá enorme, Tatiana. Classifica logo esse aí.</div></div>
      <div class="tri-mood"><span>humor da Margarida</span><i><b></b></i></div>
      <div class="tri-time"><i></i></div>
      <div class="tri-card"></div>
      <p class="tri-hint">Toque na cor da classificação</p>
      <div class="tri-cores">${CORES.map(c => `<button data-c="${c.id}" style="--c:${c.cor}"><b>${c.nome}</b><span>${c.sub}</span></button>`).join('')}</div>`;
    this.$ = s => this.root.querySelector(s);
    this.root.querySelectorAll('.tri-cores button').forEach(b => b.onclick = () => this.answer(b.dataset.c));
    this.show();
  }
  show() {
    const p = this.fila[this.i];
    this.left = this.limit; this.locked = false;
    this.$('.tri-card').className = 'tri-card in';
    this.$('.tri-card').innerHTML = `<div class="tri-who"><b>${p.nome}</b><span>${p.chegada}</span></div><p class="tri-fala">"${p.fala}"</p><div class="tri-sinais">${p.sinais.map(s => `<i>${s}</i>`).join('')}</div>`;
    this.status({ progress: [this.i, this.total], text: `Atendidos ${this.i} de ${this.total}` });
  }
  answer(c) {
    if (this.locked || this.over) return;
    this.locked = true;
    const p = this.fila[this.i], ok = c === p.cor, certo = CORES.find(x => x.id === p.cor);
    if (ok) { this.acertos++; this.humor = Math.min(1, this.humor + 0.13); this.sfx('star'); }
    else { this.humor = Math.max(0, this.humor - 0.15); this.sfx('bad'); }
    this.$('.tri-say').textContent = ok ? pick(FALA.ok) : c ? pick(FALA.erro) : pick(FALA.tempo);
    this.$('.tri-mood b').style.width = Math.round(this.humor * 100) + '%';
    const card = this.$('.tri-card');
    card.classList.add(ok ? 'ok' : 'bad');
    card.insertAdjacentHTML('beforeend', `<div class="tri-resp" style="--c:${certo.cor}"><b>${ok ? 'Certo!' : 'Era ' + certo.nome.toLowerCase()}</b> ${p.porque}</div>`);
    this.later(() => {
      this.i++;
      if (this.i >= this.total) {
        this.status({ progress: [this.total, this.total], text: `Acertou ${this.acertos} de ${this.total}` });
        if (this.acertos >= this.need) this.win(); else this.lose(`Acertou ${this.acertos} de ${this.total}. A Margarida quer pelo menos ${this.need}.`);
        return;
      }
      this.show();
    }, ok ? 1500 : 2900);
  }
  tick(dt) {
    if (this.over || this.locked || this.paused) return;
    this.left -= dt;
    const bar = this.$('.tri-time i');
    bar.style.width = Math.max(0, this.left / this.limit * 100) + '%';
    bar.classList.toggle('low', this.left < 6);
    if (this.left <= 0) this.answer(null);
  }
  devWin() { this.acertos = this.total; this.win(); }
}
