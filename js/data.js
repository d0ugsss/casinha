// Nossa Casinha — dados do jogo (cômodos, itens, fases, personagens e história)

export const PIECES = {
  a: { name: 'almofada', plural: 'almofadas' },
  x: { name: 'xícara', plural: 'xícaras' },
  p: { name: 'plantinha', plural: 'plantinhas' },
  l: { name: 'livro', plural: 'livros' },
  b: { name: 'lâmpada', plural: 'lâmpadas' },
  h: { name: 'coração', plural: 'corações' }
};

export const ROOMS = [
  { id: 'quintal', name: 'Quintal', first: 1, ready: true,
    note: 'Bem-vinda à nossa casinha, tata. A Zozo já escolheu o lugar dela.',
    items: [
      { id: 'portao', name: 'Portão', cost: 1, styles: ['Madeira rústica', 'Ferro preto', 'Branco com flores'] },
      { id: 'caminho', name: 'Caminho de pedras', cost: 1, styles: ['Pedra natural', 'Tijolinho', 'Seixos coloridos'] },
      { id: 'canteiro', name: 'Canteiro de flores', cost: 1, styles: ['Girassóis', 'Lavanda', 'Rosas'] },
      { id: 'arvore', name: 'Árvore', cost: 2, styles: ['Ipê-amarelo', 'Jabuticabeira', 'Limoeiro'] },
      { id: 'casinha', name: 'Casinha da Zozo', cost: 2, styles: ['Madeira', 'Azul com telhado vermelho', 'Rosa com coração'] },
      { id: 'banco', name: 'Banco de jardim', cost: 2, styles: ['Madeira', 'Ferro', 'Balanço'] }
    ] },
  { id: 'sala', name: 'Sala', first: 9,
    note: 'Aqui vai ser o sofá dos nossos domingos de filme.',
    items: [
      { id: 'sofa', name: 'Sofá', cost: 2, styles: ['Cinza moderno', 'Verde veludo', 'Caramelo'] },
      { id: 'tapete', name: 'Tapete', cost: 1, styles: ['Listrado', 'Redondo felpudo', 'Geométrico'] },
      { id: 'rack', name: 'Rack e TV', cost: 2, styles: ['Madeira clara', 'Preto fosco', 'Branco'] },
      { id: 'mesa', name: 'Mesa de centro', cost: 1, styles: ['Madeira', 'Vidro', 'Redonda de mármore'] },
      { id: 'cortina', name: 'Cortina', cost: 1, styles: ['Linho bege', 'Azul', 'Blackout cinza'] },
      { id: 'fotos', name: 'Parede de fotos', cost: 2, styles: ['Molduras pretas', 'Molduras de madeira', 'Varal de fotos'] }
    ] },
  { id: 'cozinha', name: 'Cozinha', first: 17,
    note: 'O café da manhã mais gostoso é o que a gente toma junto.',
    items: [
      { id: 'armarios', name: 'Armários', cost: 2, styles: ['Branco', 'Verde-oliva', 'Madeira'] },
      { id: 'geladeira', name: 'Geladeira', cost: 2, styles: ['Inox', 'Retrô vermelha', 'Branca'] },
      { id: 'fogao', name: 'Fogão', cost: 1, styles: ['Inox', 'Retrô creme', 'Cooktop'] },
      { id: 'mesa', name: 'Mesa de jantar', cost: 2, styles: ['Redonda 4 lugares', 'Retangular 6 lugares', 'Banco alemão'] },
      { id: 'pendentes', name: 'Pendentes', cost: 1, styles: ['Cobre', 'Vidro', 'Palha'] },
      { id: 'cafe', name: 'Cantinho do café', cost: 1, styles: ['Prateleira de madeira', 'Carrinho bar', 'Bancada com nicho'] }
    ] },
  { id: 'quarto', name: 'Nosso quarto', first: 25,
    note: 'O lugar onde todo dia termina do melhor jeito: com você.',
    items: [
      { id: 'cama', name: 'Cama', cost: 2, styles: ['Cabeceira de madeira', 'Cabeceira estofada', 'Cama baixa'] },
      { id: 'roupa', name: 'Roupa de cama', cost: 1, styles: ['Branca', 'Rosa', 'Azul'] },
      { id: 'criados', name: 'Criados-mudos', cost: 1, styles: ['Madeira', 'Branco', 'Suspensos'] },
      { id: 'guarda', name: 'Guarda-roupa', cost: 2, styles: ['Portas de espelho', 'Madeira', 'Branco'] },
      { id: 'cortina', name: 'Cortina', cost: 1, styles: ['Linho', 'Rosa claro', 'Blackout'] },
      { id: 'quadro', name: 'Quadro especial', cost: 2, styles: ['Foto do casal', '"Te amo, momo"', '20.01.2020'] }
    ] },
  { id: 'banheiro', name: 'Banheiro', first: 33,
    note: 'Prometo dividir o espelho com você (às vezes).',
    items: [
      { id: 'revest', name: 'Revestimento', cost: 2, styles: ['Metrô branco', 'Verde', 'Cimento queimado'] },
      { id: 'pia', name: 'Pia e gabinete', cost: 2, styles: ['Madeira', 'Branco', 'Preto'] },
      { id: 'espelho', name: 'Espelho', cost: 1, styles: ['Redondo', 'Com luz', 'Moldura dourada'] },
      { id: 'box', name: 'Box e chuveiro', cost: 2, styles: ['Vidro', 'Cortina de pano', 'Chuveiro de teto'] },
      { id: 'toalhas', name: 'Toalhas', cost: 1, styles: ['Brancas', 'Rosas', 'Listradas'] },
      { id: 'planta', name: 'Plantinha', cost: 1, styles: ['Costela-de-adão', 'Samambaia', 'Cacto'] }
    ] },
  { id: 'escritorio', name: 'Escritório', first: 41,
    note: 'Pra eu trabalhar e você ler do meu lado.',
    items: [
      { id: 'mesa', name: 'Mesa', cost: 1, styles: ['Madeira', 'Branca', 'Em L'] },
      { id: 'cadeira', name: 'Cadeira', cost: 1, styles: ['Gamer', 'Ergonômica', 'Escandinava'] },
      { id: 'pc', name: 'Computador', cost: 2, styles: ['Dois monitores', 'Notebook', 'Setup com LED'] },
      { id: 'estante', name: 'Estante de livros', cost: 2, styles: ['Madeira', 'Nichos coloridos', 'Até o teto'] },
      { id: 'luminaria', name: 'Luminária', cost: 1, styles: ['De mesa', 'De piso', 'Fita de LED'] },
      { id: 'mural', name: 'Mural', cost: 2, styles: ['Cortiça', 'Quadro branco', 'Fotos'] }
    ] },
  { id: 'hospedes', name: 'Quarto de hóspedes', first: 49,
    note: 'Pra receber a nossa família com o carinho que você tem.',
    items: [
      { id: 'cama', name: 'Cama de hóspedes', cost: 2, styles: ['Bicama', 'Cama de casal', 'Sofá-cama'] },
      { id: 'poltrona', name: 'Poltrona de leitura', cost: 2, styles: ['Mostarda', 'Rosa', 'Verde'] },
      { id: 'comoda', name: 'Cômoda', cost: 2, styles: ['Madeira', 'Branca', 'Colorida'] },
      { id: 'tapete', name: 'Tapete', cost: 1, styles: ['Redondo', 'Felpudo', 'Listrado'] },
      { id: 'cortina', name: 'Cortina', cost: 1, styles: ['Linho', 'Floral', 'Persiana'] },
      { id: 'planta', name: 'Planta', cost: 1, styles: ['Jiboia', 'Ficus', 'Palmeira'] }
    ] },
  { id: 'gourmet', name: 'Área gourmet', first: 57,
    note: 'A nossa área gourmet saiu do papel. A primeira festa aqui é a nossa! Te amo, momo.',
    items: [
      { id: 'churrasqueira', name: 'Churrasqueira', cost: 2, styles: ['Tijolinho', 'Inox', 'Bafo'] },
      { id: 'bancada', name: 'Bancada', cost: 2, styles: ['Granito preto', 'Madeira', 'Porcelanato'] },
      { id: 'mesa', name: 'Mesa grande', cost: 2, styles: ['Madeira rústica', 'Branca', 'Com bancos'] },
      { id: 'banquetas', name: 'Banquetas', cost: 1, styles: ['Madeira', 'Ferro', 'Palha'] },
      { id: 'varal', name: 'Varal de luzes', cost: 1, styles: ['Lâmpadas quentes', 'Coloridas', 'Bandeirinhas'] },
      { id: 'rede', name: 'Rede', cost: 1, styles: ['Branca', 'Colorida', 'Cadeira suspensa'] }
    ] }
];

// Formatos de tabuleiro (# = casa jogável, . = buraco)
export const SHAPES = {
  casinha: ['...##...', '..####..', '.######.', '########', '########', '########', '########', '########'],
  buracos: ['########', '#.####.#', '########', '###..###', '###..###', '########', '#.####.#', '########'],
  sofa: ['.######.', '.######.', '.######.', '########', '########', '########', '########', '##....##'],
  xicara: ['######..', '########', '######.#', '######.#', '########', '######..', '.####...', '..##....'],
  coracao: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'],
  banheira: ['##......', '##......', '########', '########', '########', '########', '.######.', '.#....#.'],
  tela: ['########', '########', '########', '########', '########', '...##...', '...##...', '.######.'],
  cama: ['##......', '########', '########', '########', '########', '########', '#......#', '#......#'],
  churrasqueira: ['...##...', '...##...', '########', '########', '########', '########', '########', '##....##']
};

// g: objetivos. c = juntar peça, dirt = sujeira, dirt2 = sujeira dupla, box = caixa, box2 = caixa reforçada,
// tape = fita, mud = lama, bone = ossinho, make = fazer especiais. tier: 0 normal, 1 difícil, 2 muito difícil.
const L = (moves, g, extra = {}) => ({ moves, g, ...extra });
export const LEVELS = [
  null,
  L(25, [['c', 'p', 12]], { tut: 'basico' }),
  L(25, [['c', 'a', 15], ['c', 'x', 15]], { tut: 'foguete' }),
  L(25, [['dirt', 16]], { tut: 'sujeira' }),
  L(24, [['c', 'b', 20]], { tut: 'bomba' }),
  L(24, [['dirt', 24]], { shape: 'casinha' }),
  L(23, [['box', 12]], { tier: 1, tut: 'caixa' }),
  L(24, [['c', 'l', 20], ['dirt', 10]], { tut: 'aviao' }),
  L(26, [['box', 18], ['dirt', 18]], { tier: 2, tut: 'arcoiris' }),
  L(24, [['c', 'a', 30]], { shape: 'buracos' }),
  L(24, [['dirt', 30]]),
  L(22, [['box', 18]], { tier: 1 }),
  L(25, [['dirt2', 20]], { tut: 'sujeira2' }),
  L(22, [['make', 'rocket', 3], ['make', 'bomb', 2]], { tut: 'fazer' }),
  L(21, [['c', 'x', 25], ['box', 12]], { tier: 1 }),
  L(25, [['dirt', 36]], { shape: 'sofa' }),
  L(24, [['box', 24], ['dirt', 24]], { tier: 2 }),
  L(24, [['c', 'h', 25]], { tut: 'coracao' }),
  L(25, [['box2', 16]], { tut: 'caixa2' }),
  L(21, [['dirt', 30]], { tier: 1 }),
  L(22, [['c', 'x', 20], ['c', 'b', 20]], { shape: 'xicara' }),
  L(24, [['dirt2', 28]]),
  L(20, [['box', 24]], { tier: 1 }),
  L(22, [['c', 'p', 30], ['box', 15]]),
  L(23, [['dirt2', 40]], { tier: 2 }),
  L(22, [['c', 'a', 30]], { tut: 'fita', tapes: 12 }),
  L(20, [['tape', 20]], { tier: 1 }),
  L(22, [['dirt', 32]], { shape: 'coracao' }),
  L(23, [['box2', 18], ['tape', 10]]),
  L(22, [['make', 'rainbow', 2]]),
  L(20, [['dirt2', 30]], { tier: 1 }),
  L(20, [['c', 'h', 30]]),
  L(22, [['tape', 20], ['dirt2', 30]], { tier: 2 }),
  L(24, [['mud', 24]], { tut: 'lama' }),
  L(21, [['c', 'x', 30]]),
  L(20, [['dirt', 30], ['mud', 12]], { tier: 1 }),
  L(21, [['box', 24]], { shape: 'banheira' }),
  L(22, [['mud', 30]]),
  L(19, [['tape', 24]], { tier: 1 }),
  L(22, [['c', 'l', 20], ['c', 'b', 20], ['c', 'p', 20]]),
  L(22, [['mud', 30], ['box2', 16]], { tier: 2 }),
  L(22, [['bone', 4]], { tut: 'ossinho' }),
  L(22, [['dirt2', 36]]),
  L(20, [['bone', 5], ['box', 12]], { tier: 1 }),
  L(20, [['c', 'l', 35]], { shape: 'tela' }),
  L(21, [['mud', 30]]),
  L(22, [['tape', 24], ['bone', 3]]),
  L(20, [['box2', 28]], { tier: 1 }),
  L(21, [['bone', 6], ['dirt2', 30]], { tier: 2 }),
  L(21, [['c', 'a', 35], ['c', 'h', 20]]),
  L(20, [['dirt2', 40]], { tier: 1, shape: 'cama' }),
  L(21, [['bone', 6]]),
  L(21, [['box2', 30]]),
  L(19, [['mud', 36]], { tier: 1 }),
  L(20, [['make', 'bomb', 4], ['make', 'rainbow', 2]]),
  L(21, [['tape', 30], ['box', 15]]),
  L(21, [['mud', 15], ['tape', 15], ['bone', 3]], { tier: 2 }),
  L(20, [['c', 'b', 40]], { shape: 'churrasqueira' }),
  L(21, [['dirt2', 44]]),
  L(19, [['box2', 34]], { tier: 1 }),
  L(21, [['bone', 7], ['mud', 20]]),
  L(20, [['tape', 32]]),
  L(17, [['c', 'h', 30], ['c', 'x', 30]], { tier: 1 }),
  L(20, [['mud', 40], ['box', 20]]),
  L(22, [['c', 'h', 20], ['dirt2', 20], ['box2', 12], ['bone', 3]], { tier: 2 })
];
LEVELS.forEach((lv, i) => { if (lv) { lv.n = i; lv.colors = i >= 17 ? 6 : 5; lv.tier = lv.tier || 0; } });

export const LAST_PLAYABLE = 8; // nesta versão: até o fim do quintal

export function roomOfLevel(n) {
  let r = ROOMS[0];
  for (const room of ROOMS) if (n >= room.first) r = room;
  return r;
}

// Explicações rápidas (só na primeira vez)
export const TUTORIALS = {
  basico: { title: 'Como jogar', text: 'Arraste uma peça pro lado pra trocar com a vizinha e alinhar 3 ou mais iguais.' },
  foguete: { title: 'Foguete', icon: 'rocketH', text: '4 em linha viram um foguete. Toque nele ou arraste pra limpar a linha inteira.' },
  sujeira: { title: 'Sujeira', icon: 'dirt', text: 'Combine peças em cima das manchas pra limpar o chão.' },
  bomba: { title: 'Bomba', icon: 'bomb', text: 'Combinação em L ou T vira uma bomba que explode tudo em volta.' },
  caixa: { title: 'Caixas da mudança', icon: 'box', text: 'Combine peças do lado das caixas pra quebrar.' },
  aviao: { title: 'Aviãozinho', icon: 'plane', text: 'Um quadradinho 2×2 vira um aviãozinho que voa até um objetivo.' },
  arcoiris: { title: 'Arco-íris', icon: 'rainbow', text: '5 em linha viram um arco-íris. Troque com uma peça pra sumir com todas daquela cor.' },
  sujeira2: { title: 'Sujeira dupla', icon: 'dirt2', text: 'Mancha mais escura: precisa de duas combinações em cima.' },
  fazer: { title: 'Fazer especiais', icon: 'bomb', text: 'Aqui o objetivo é criar foguetes e bombas.' },
  coracao: { title: 'Peça nova', icon: 'h', text: 'Chegou o coração: agora são 6 tipos de peça.' },
  caixa2: { title: 'Caixa reforçada', icon: 'box2', text: 'Essa aguenta mais: precisa de 2 combinações do lado.' },
  fita: { title: 'Fita adesiva', icon: 'tape', text: 'A peça presa não se mexe. Combine com ela pra soltar.' },
  lama: { title: 'Lama da Zozo', icon: 'mud', text: 'Combine do lado pra limpar. Se uma jogada não limpar nenhuma, a lama se espalha.' },
  ossinho: { title: 'Ossinho da Zozo', icon: 'bone', text: 'Leve os ossinhos até a última linha do tabuleiro.' }
};

export const CHARS = {
  tata: { name: 'Tata', img: 'tata', h: 0.95 },
  dodo: { name: 'Dodô', img: 'dodo', h: 1.0 },
  zozo: { name: 'Zozo', img: 'zozo', h: 0.34 },
  milton: { name: 'Milton', img: 'milton', h: 0.99 },
  marci: { name: 'Marci', img: 'marci', h: 0.93 },
  vitoria: { name: 'Vitória', img: 'vitoria', h: 0.98 },
  ana: { name: 'Ana', img: 'ana', h: 0.96 },
  italo: { name: 'Italo', img: 'italo', h: 1.0 },
  pai: { name: 'Pai do Dodô', img: 'pai_mecanico', h: 0.99 },
  margarida: { name: 'Margarida', img: 'margarida', h: 0.9 }
};

// Desafios (minigames). after = fase que precisa estar completa pra aparecer.
export const MISSIONS = {
  milton1: {
    char: 'milton', room: 'quintal', after: 6, game: 'encaixe', title: 'Construindo o quintal',
    gift: 'Plaquinha "Feito com o Seu Milton" no quintal',
    talk: [
      ['milton', 'Tata, lembra quando eu ajudei vocês a construir esse quintal?'],
      ['tata', 'Lembro! O senhor que assentou as pedras.'],
      ['milton', 'Pois é. Faltou terminar um pedaço. Me ajuda a encaixar o resto?']
    ],
    done: [['milton', 'Ficou uma beleza! E agora o quintal tem até plaquinha.']]
  }
};

// Quem está em cada cômodo, dependendo do progresso (done = fases completas)
export function presence(st) {
  const d = st.done;
  const list = [];
  list.push({ id: 'tata', room: st.room });
  list.push({ id: 'dodo', room: st.room });
  list.push({ id: 'zozo', room: 'quintal' });
  if (d >= 4 && !(st.missions.milton1 && d >= 8)) list.push({ id: 'milton', room: 'quintal' });
  return list;
}

export function availableMission(st) {
  for (const [id, m] of Object.entries(MISSIONS)) {
    if (!st.missions[id] && st.done >= m.after) return { id, ...m };
  }
  return null;
}

// Conversas automáticas
export const SCENES = {
  intro: [
    ['dodo', 'Tata, chegamos! Essa é a nossa casinha.'],
    ['tata', 'Que lindaaa! Mas o quintal tá tão vazio...'],
    ['dodo', 'Bora arrumar tudo junto? Cada fase que você passa vale estrela, e com estrela a gente decora.']
  ],
  miltonChega: [
    ['milton', 'Opa, cheguei! Vim dar uma olhada na obra de vocês.'],
    ['tata', 'Pai! Fica à vontade, o quintal é seu também.']
  ]
};

export const IDLE_LINES = {
  tata: ['Opa, nada por aqui agora! Bora jogar mais uma?'],
  dodo: ['Opa, não tenho nada pra você por agora, momo!', 'Te amo, momo. Agora vai jogar que eu tô de olho no quintal!'],
  zozo: ['Au au! (ela só quer carinho agora)', 'Au! (abanando o rabo)'],
  milton: ['Opa, não tenho nada pra você por agora. Vai jogando que eu fico de olho na obra!']
};
