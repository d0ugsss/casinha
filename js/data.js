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
  { id: 'quintal', art: 'o', name: 'Quintal', first: 1,
    note: 'Bem-vinda à nossa casinha, tata. A Zozo já escolheu o lugar dela.',
    items: [
      { id: 'portao', name: 'Portão', cost: 1, styles: ['Madeira rústica', 'Ferro preto', 'Branco com flores'] },
      { id: 'caminho', name: 'Caminho de pedras', cost: 1, styles: ['Pedra natural', 'Tijolinho', 'Seixos coloridos'] },
      { id: 'canteiro', name: 'Canteiro de flores', cost: 1, styles: ['Girassóis', 'Lavanda', 'Rosas'] },
      { id: 'arvore', name: 'Árvore', cost: 2, styles: ['Ipê-amarelo', 'Jabuticabeira', 'Limoeiro'] },
      { id: 'casinha', name: 'Casinha da Zozo', cost: 2, styles: ['Madeira', 'Azul com telhado vermelho', 'Rosa com coração'] },
      { id: 'banco', name: 'Banco de jardim', cost: 2, styles: ['Madeira', 'Ferro', 'Balanço'] }
    ] },
  { id: 'sala', art: 'a', name: 'Sala', first: 9,
    note: 'Aqui vai ser o sofá dos nossos domingos de filme.',
    items: [
      { id: 'sofa', name: 'Sofá', cost: 2, styles: ['Cinza moderno', 'Verde veludo', 'Caramelo'] },
      { id: 'tapete', name: 'Tapete', cost: 1, styles: ['Listrado', 'Redondo felpudo', 'Geométrico'] },
      { id: 'rack', name: 'Rack e TV', cost: 2, styles: ['Madeira clara', 'Preto fosco', 'Branco'] },
      { id: 'mesa', name: 'Mesa de centro', cost: 1, styles: ['Madeira', 'Vidro', 'Redonda de mármore'] },
      { id: 'cortina', name: 'Cortina', cost: 1, styles: ['Linho bege', 'Azul', 'Blackout cinza'] },
      { id: 'fotos', name: 'Parede de fotos', cost: 2, styles: ['Molduras pretas', 'Molduras de madeira', 'Varal de fotos'] }
    ] },
  { id: 'cozinha', art: 'a', name: 'Cozinha', first: 17,
    note: 'O café da manhã mais gostoso é o que a gente toma junto.',
    items: [
      { id: 'armarios', name: 'Armários', cost: 2, styles: ['Branco', 'Verde-oliva', 'Madeira'] },
      { id: 'geladeira', name: 'Geladeira', cost: 2, styles: ['Inox', 'Retrô vermelha', 'Branca'] },
      { id: 'fogao', name: 'Fogão', cost: 1, styles: ['Inox', 'Retrô creme', 'Cooktop'] },
      { id: 'mesa', name: 'Mesa de jantar', cost: 2, styles: ['Redonda 4 lugares', 'Retangular 6 lugares', 'Banco alemão'] },
      { id: 'pendentes', name: 'Pendentes', cost: 1, styles: ['Cobre', 'Vidro', 'Palha'] },
      { id: 'cafe', name: 'Cantinho do café', cost: 1, styles: ['Prateleira de madeira', 'Carrinho bar', 'Bancada com nicho'] }
    ] },
  { id: 'quarto', art: 'o', name: 'Nosso quarto', first: 25,
    note: 'O lugar onde todo dia termina do melhor jeito: com você.',
    items: [
      { id: 'cama', name: 'Cama', cost: 2, styles: ['Cabeceira de madeira', 'Cabeceira estofada', 'Cama baixa'] },
      { id: 'roupa', name: 'Roupa de cama', cost: 1, styles: ['Branca', 'Rosa', 'Azul'] },
      { id: 'criados', name: 'Criados-mudos', cost: 1, styles: ['Madeira', 'Branco', 'Suspensos'] },
      { id: 'guarda', name: 'Guarda-roupa', cost: 2, styles: ['Portas de espelho', 'Madeira', 'Branco'] },
      { id: 'cortina', name: 'Cortina', cost: 1, styles: ['Linho', 'Rosa claro', 'Blackout'] },
      { id: 'quadro', name: 'Quadro especial', cost: 2, styles: ['Foto do casal', '"Te amo, momo"', 'Aquarela de flores'] }
    ] },
  { id: 'banheiro', art: 'o', name: 'Banheiro', first: 33,
    note: 'Prometo dividir o espelho com você (às vezes).',
    items: [
      { id: 'revest', name: 'Revestimento', cost: 2, styles: ['Metrô branco', 'Verde', 'Cimento queimado'] },
      { id: 'pia', name: 'Pia e gabinete', cost: 2, styles: ['Madeira', 'Branco', 'Preto'] },
      { id: 'espelho', name: 'Espelho', cost: 1, styles: ['Redondo', 'Com luz', 'Moldura dourada'] },
      { id: 'box', name: 'Box e chuveiro', cost: 2, styles: ['Vidro', 'Cortina de pano', 'Chuveiro de teto'] },
      { id: 'toalhas', name: 'Toalhas', cost: 1, styles: ['Brancas', 'Rosas', 'Listradas'] },
      { id: 'planta', name: 'Plantinha', cost: 1, styles: ['Costela-de-adão', 'Samambaia', 'Cacto'] }
    ] },
  { id: 'escritorio', art: 'o', name: 'Escritório', first: 41,
    note: 'Pra eu trabalhar e você ler do meu lado.',
    items: [
      { id: 'mesa', name: 'Mesa', cost: 1, styles: ['Madeira', 'Branca', 'Em L'] },
      { id: 'cadeira', name: 'Cadeira', cost: 1, styles: ['Gamer', 'Ergonômica', 'Escandinava'] },
      { id: 'pc', name: 'Computador', cost: 2, styles: ['Dois monitores', 'Notebook', 'Setup com LED'] },
      { id: 'estante', name: 'Estante de livros', cost: 2, styles: ['Madeira', 'Nichos coloridos', 'Até o teto'] },
      { id: 'luminaria', name: 'Luminária', cost: 1, styles: ['De mesa', 'De piso', 'Fita de LED'] },
      { id: 'mural', name: 'Mural', cost: 2, styles: ['Cortiça', 'Quadro branco', 'Fotos'] }
    ] },
  { id: 'hospedes', art: 'o', name: 'Quarto de hóspedes', first: 49,
    note: 'Pra receber a nossa família com o carinho que você tem.',
    items: [
      { id: 'cama', name: 'Cama de hóspedes', cost: 2, styles: ['Bicama', 'Cama de casal', 'Sofá-cama'] },
      { id: 'poltrona', name: 'Poltrona de leitura', cost: 2, styles: ['Mostarda', 'Rosa', 'Verde'] },
      { id: 'comoda', name: 'Cômoda', cost: 2, styles: ['Madeira', 'Branca', 'Colorida'] },
      { id: 'tapete', name: 'Tapete', cost: 1, styles: ['Redondo', 'Felpudo', 'Listrado'] },
      { id: 'cortina', name: 'Cortina', cost: 1, styles: ['Linho', 'Floral', 'Persiana'] },
      { id: 'planta', name: 'Planta', cost: 1, styles: ['Jiboia', 'Ficus', 'Palmeira'] }
    ] },
  { id: 'gourmet', art: 'a', name: 'Área gourmet', first: 57,
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
  L(18, [['c', 'p', 24]], { tut: 'basico' }),
  L(19, [['c', 'a', 28], ['c', 'x', 28]], { tut: 'foguete' }),
  L(20, [['dirt', 24]], { tut: 'sujeira' }),
  L(21, [['c', 'b', 30]], { tut: 'bomba' }),
  L(18, [['dirt', 30]], { shape: 'casinha' }),
  L(21, [['box', 20]], { tier: 1, tut: 'caixa' }),
  L(17, [['c', 'l', 28], ['dirt', 14]], { tut: 'aviao' }),
  L(26, [['box', 18], ['dirt', 18]], { tier: 2, tut: 'arcoiris' }),
  L(25, [['c', 'a', 30]], { shape: 'buracos' }),
  L(21, [['dirt', 30]]),
  L(23, [['box', 22]], { tier: 1 }),
  L(19, [['dirt2', 14]], { tut: 'sujeira2' }),
  L(21, [['make', 'rocket', 3], ['make', 'bomb', 1]], { tut: 'fazer' }),
  L(17, [['c', 'x', 25], ['box', 12]], { tier: 1 }),
  L(20, [['dirt', 36]], { shape: 'sofa' }),
  L(27, [['box', 24], ['dirt', 24]], { tier: 2 }),
  L(26, [['c', 'h', 25]], { tut: 'coracao' }),
  L(25, [['box2', 11]], { tut: 'caixa2' }),
  L(28, [['dirt', 30]], { tier: 1 }),
  L(27, [['c', 'x', 20], ['c', 'b', 20]], { shape: 'xicara' }),
  L(20, [['dirt2', 15]]),
  L(16, [['box', 24]], { tier: 1 }),
  L(25, [['c', 'p', 24], ['box', 12]]),
  L(27, [['dirt2', 22]], { tier: 2 }),
  L(28, [['c', 'a', 30]], { tut: 'fita', tapes: 12 }),
  L(32, [['tape', 20]], { tier: 1 }),
  L(29, [['dirt', 32]], { shape: 'coracao' }),
  L(30, [['box2', 12], ['tape', 8]]),
  L(22, [['make', 'rainbow', 1], ['make', 'rocket', 4], ['c', 'h', 30]]),
  L(22, [['dirt2', 26]], { tier: 1 }),
  L(24, [['c', 'h', 30]]),
  L(25, [['tape', 14], ['dirt2', 20]], { tier: 2 }),
  L(21, [['mud', 24]], { tut: 'lama' }),
  L(26, [['c', 'x', 30]]),
  L(31, [['dirt', 30], ['mud', 12]], { tier: 1 }),
  L(28, [['box', 24]], { shape: 'banheira' }),
  L(21, [['mud', 30]]),
  L(30, [['tape', 24]], { tier: 1 }),
  L(22, [['c', 'l', 20], ['c', 'b', 20], ['c', 'p', 20]]),
  L(31, [['mud', 10], ['box2', 12]], { tier: 2 }),
  L(34, [['bone', 3]], { tut: 'ossinho' }),
  L(26, [['dirt2', 26]]),
  L(25, [['bone', 2], ['box', 8]], { tier: 1 }),
  L(33, [['c', 'l', 35]], { shape: 'tela' }),
  L(18, [['mud', 26]]),
  L(32, [['tape', 12], ['bone', 2]]),
  L(29, [['box2', 16]], { tier: 1 }),
  L(20, [['bone', 3], ['dirt2', 20]], { tier: 2 }),
  L(30, [['c', 'a', 35], ['c', 'h', 20]]),
  L(29, [['dirt2', 22]], { tier: 1, shape: 'cama' }),
  L(31, [['bone', 4]]),
  L(34, [['box2', 18]]),
  L(17, [['mud', 26]], { tier: 1 }),
  L(34, [['make', 'rocket', 4], ['make', 'rainbow', 1], ['c', 'l', 30]]),
  L(28, [['tape', 15], ['box', 10]]),
  L(23, [['mud', 12], ['tape', 12], ['bone', 2]], { tier: 2 }),
  L(30, [['c', 'b', 36]], { shape: 'churrasqueira' }),
  L(30, [['dirt2', 30]]),
  L(33, [['box2', 18]], { tier: 1 }),
  L(33, [['bone', 3], ['mud', 16]]),
  L(30, [['tape', 18]]),
  L(24, [['c', 'h', 30], ['c', 'x', 30]], { tier: 1 }),
  L(22, [['mud', 40], ['box', 20]]),
  L(27, [['c', 'h', 20], ['dirt2', 16], ['box2', 10], ['bone', 2]], { tier: 2 })
];
LEVELS.forEach((lv, i) => { if (lv) { lv.n = i; lv.colors = i >= 17 ? 6 : 5; lv.tier = lv.tier || 0; } });

export const LAST_PLAYABLE = 64;

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
  ossinho: { title: 'Ossinho da Zozo', icon: 'bone', text: 'Leve os ossinhos até a faixa verdinha lá embaixo. Combine as peças debaixo deles pra eles descerem.' }
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

// Desafios (minigames), em ordem. after = fase que precisa estar completa pra aparecer.
// gift: [cômodo, item que aparece na casa]. urgent: ligação da Margarida (vale 2 estrelas).
export const MISSIONS = [
  {
    id: 'milton1', char: 'milton', room: 'quintal', after: 6, game: 'encaixe', title: 'Construindo o quintal', level: 'fácil',
    gift: ['quintal', 'plaquinha'], giftText: 'Plaquinha "Feito com o Seu Milton" no quintal',
    hello: [['milton', 'Opa, cheguei! Vim dar uma olhada na obra de vocês.'], ['tata', 'Pai! Fica à vontade, o quintal é seu também.']],
    talk: [['milton', 'Tata, lembra quando eu ajudei vocês a construir esse quintal?'], ['tata', 'Lembro! O senhor que assentou as pedras.'], ['milton', 'Pois é. Faltou terminar um pedaço. Me ajuda a encaixar o resto?']],
    done: [['milton', 'Ficou uma beleza! E agora o quintal tem até plaquinha.']],
    howto: ['Encaixe as pedras pra fechar linhas inteiras. Cada linha assenta uma pedra do caminho: são 6.', 'Arraste pro lado pra mover, toque pra girar e puxe pra baixo pra soltar.'], faster: true
  },
  {
    id: 'vitoria1', char: 'vitoria', room: 'sala', after: 13, game: 'frescobol', title: 'Dia de praia', level: 'fácil-média',
    gift: ['sala', 'quadroPraia'], giftText: 'Quadro da praia de vocês, na sala',
    hello: [['vitoria', 'Tataaa! Vim conhecer a casa nova!'], ['tata', 'Vivi! Entra, a sala tá ficando linda.']],
    talk: [['vitoria', 'Lembra da nossa praia? Até hoje eu acho que ganhei aquele frescobol.'], ['tata', 'Ganhou nada! Eu que não deixei a bolinha cair.'], ['vitoria', 'Então prova! 20 rebatidas.']],
    done: [['vitoria', 'Tá bom, tá bom, você ganhou. Trouxe um quadro daquele dia pra sala!']],
    howto: ['Toque quando a bolinha chegar na sua raquete.', 'Faça 20 rebatidas. Se ela cair 3 vezes, começa de novo.'], faster: true
  },
  {
    id: 'marci1', char: 'marci', room: 'cozinha', after: 20, game: 'ingredientes', title: 'Strogonoff da Marci', level: 'média',
    gift: ['cozinha', 'caderno'], giftText: 'Caderno de receitas da Marci, na cozinha',
    hello: [['marci', 'Filha! Trouxe umas coisinhas pra cozinha nova.'], ['tata', 'Mãe! Chegou na hora certa.']],
    talk: [['marci', 'Tata, bora fazer o strogonoff que o Dodô ama?'], ['dodo', 'O melhor do mundo, sogrinha!'], ['marci', 'Então pega os ingredientes na ordem da receita. E nada do que não vai, hein!']],
    done: [['marci', 'Ficou igualzinho ao meu! Deixei meu caderno de receitas aqui pra vocês.']],
    howto: ['Arraste a panela pra pegar o que cai.', 'Pegue na ordem da receita, mostrada lá em cima.', 'Pegou o que não vai ou fora da ordem: 3 erros e a receita desanda.'], faster: true
  },
  {
    id: 'urg1', char: 'margarida', room: 'any', urgent: 1, stars: 2, after: 22, game: 'triagem', title: 'Plantão: triagem', level: 'média',
    gift: ['quarto', 'jaleco'], giftText: 'Jaleco novo com o seu nome (fica pendurado no quarto)',
    call: 'Tatiana! Pronto-socorro lotado e ninguém aparece. Preciso de você AGORA.',
    talk: [['margarida', 'Seis pacientes na fila. Classifica cada um pela cor do protocolo, e rápido.'], ['tata', 'Pode deixar, chefe.']],
    done: [['margarida', 'Hmpf. Não fez mais que a obrigação. Toma, seu jaleco novo.']],
    howto: ['Leia o caso e toque na cor da classificação de risco.', 'Cada paciente tem um tempinho pra ser classificado.', 'Acerte pelo menos 5 dos 6.']
  },
  {
    id: 'dodo1', char: 'dodo', room: 'quarto', after: 28, game: 'memoria', title: '20/01/2020', level: 'média',
    gift: ['quarto', 'data2020'], giftText: 'Quadro "20.01.2020" na parede do quarto',
    talk: [['dodo', 'Tata, achei as fotos do nosso começo.'], ['tata', '20 de janeiro de 2020...'], ['dodo', 'Vamos ver se você lembra de todas? Acha os pares!']],
    done: [['dodo', 'Lembrou de tudo! Coloquei a nossa data na parede do quarto.']],
    howto: ['Toque em duas cartas pra virar.', 'Ache os 8 pares de fotos.', 'As viradas são contadas: se acabar, começa de novo.']
  },
  {
    id: 'zozo1', char: 'zozo', room: 'banheiro', after: 33, game: 'banho', title: 'Banho da Zozo', level: 'média',
    gift: ['banheiro', 'toalhinha'], giftText: 'Toalhinha com o nome da Zozo, no banheiro. E agora ela passeia pela casa!',
    hello: [['zozo', 'Au! (ela se enfiou no banheiro toda suja de lama)']],
    talk: [['tata', 'Zozo! Onde você se meteu?'], ['zozo', 'Au au! (ela rolou na lama do quintal)'], ['dodo', 'Banho, mocinha. Rápido, antes dela se sacudir!']],
    done: [['zozo', 'Au! (cheirosa e com toalhinha nova)'], ['tata', 'Agora ela vai passear pela casa toda, né?']],
    howto: ['Esfregue a Zozo com o dedo pra tirar a lama.', 'De tempos em tempos ela se sacode e suja um pouco de novo.', 'Deixe ela limpinha antes do tempo acabar.']
  },
  {
    id: 'dodo2', char: 'dodo', room: 'quintal', after: 37, game: 'fios', title: 'Varal de luzes', level: 'média-difícil',
    gift: ['quintal', 'varal'], giftText: 'Varal de luzes acendendo o quintal',
    talk: [['dodo', 'Momo, comprei um varal de luzes pro quintal.'], ['tata', 'E por que tá tudo apagado?'], ['dodo', 'Os fios embolaram... Me ajuda a ligar?']],
    done: [['dodo', 'Olha que lindo! Agora o quintal tem luz pras nossas noites.']],
    howto: ['Toque nos fios pra girar.', 'Ligue a tomada a todas as lâmpadas.', 'São 3 varais, cada um com o seu tempo.']
  },
  {
    id: 'urg2', char: 'margarida', room: 'any', urgent: 2, stars: 2, after: 41, game: 'remedios', title: 'Plantão: bandeja de remédios', level: 'difícil',
    gift: ['escritorio', 'cracha'], giftText: 'Crachá da Tatiana, no escritório',
    call: 'Tatiana, a enfermaria tá um caos. Monta a bandeja de remédios pra mim. AGORA.',
    talk: [['margarida', 'Vou mostrar a prescrição uma vez. Repete na mesma ordem.'], ['tata', 'Uma vez só?!'], ['margarida', 'Uma.']],
    done: [['margarida', 'Bom trabalho... pros padrões daqui. Seu crachá tá pronto.']],
    howto: ['A Margarida acende os remédios da prescrição, um por um.', 'Toque neles na mesma ordem.', 'Começa com 3 e vai até 8. Errou duas vezes, começa de novo.']
  },
  {
    id: 'marci2', char: 'marci', room: 'cozinha', after: 44, game: 'glace', title: 'Biscoitos de Natal', level: 'difícil',
    gift: ['cozinha', 'biscoitos'], giftText: 'Pote de biscoitos de Natal, na cozinha',
    hello: [['marci', 'Cheguei com as forminhas de biscoito! Já tá quase no Natal.']],
    talk: [['marci', 'Tata, bora decorar os biscoitos de Natal?'], ['tata', 'Bora! Mas eu tremo no glacê...'], ['marci', 'Passa o dedo devagar no contorno, sem sair da linha.']],
    done: [['marci', 'Que capricho! O pote fica aqui. Mas o Dodô só come depois da ceia!']],
    howto: ['Passe o dedo por cima do contorno do biscoito.', 'Saiu muito da linha, o biscoito borra.', 'São 6 biscoitos, cada um mais caprichado. 3 borrados e começa de novo.']
  },
  {
    id: 'milton2', char: 'milton', room: 'quintal', after: 48, game: 'tijolos', title: 'Mutirão da churrasqueira', level: 'difícil',
    gift: ['gourmet', 'churrasqueira'], giftText: 'Churrasqueira de tijolinho: já vai estar pronta na área gourmet',
    hello: [['milton', 'Voltei! E trouxe tijolo pra área gourmet de vocês.']],
    talk: [['milton', 'Mutirão da churrasqueira! Eu misturo a massa e você assenta os tijolos.'], ['dodo', 'Já tô sentindo cheiro de churrasco.'], ['milton', 'Primeiro os tijolos, rapaz! Bem alinhados.']],
    done: [['milton', 'Churrasqueira de tijolinho prontinha! Quando a área gourmet sair, ela já tá lá.']],
    howto: ['O tijolo vai e volta. Toque pra soltar.', 'O que fica pra fora cai, e o próximo fica menor.', 'Empilhe 15 fileiras.'], faster: true
  },
  {
    id: 'pai1', char: 'pai', room: 'hospedes', after: 52, game: 'pitstop', title: 'Revisão relâmpago', level: 'difícil',
    gift: ['hospedes', 'carrinho'], giftText: 'Carrinho com a placa MARCHA LENTA, no quarto de hóspedes',
    hello: [['pai', 'E aí, filho! Vim estrear o quarto de hóspedes.'], ['dodo', 'Pai! Fica à vontade.']],
    talk: [['pai', 'Tata, lá na Marcha Lenta a gente troca pneu rapidinho. Duvida?'], ['tata', 'Duvido nada, sogrão!'], ['pai', 'Então me ajuda: os parafusos na ordem certa, antes do relógio acabar.']],
    done: [['pai', 'Contrata essa menina! Deixei um carrinho da Marcha Lenta de lembrança.']],
    howto: ['Toque nos parafusos na ordem dos números.', 'Solte os 5, o pneu troca, depois aperte os 5 de novo.', 'São 3 pneus contra o relógio. Errar custa 2 segundos.']
  },
  {
    id: 'urg3', char: 'margarida', room: 'any', urgent: 3, stars: 2, after: 57, game: 'corredor', title: 'Plantão: corredor lotado', level: 'muito difícil',
    gift: ['escritorio', 'placaEnf'], giftText: 'Plaquinha "Enf. Tati", no escritório',
    call: 'Tatiana! Paciente grave chegando e o corredor tá lotado. Corre!',
    talk: [['margarida', 'Leva a maca até a sala vermelha. Desvia de tudo.'], ['tata', 'Tô indo!']],
    done: [['margarida', '(ela sorriu!) Tatiana... você é a melhor enfermeira desse plantão.'], ['margarida', 'Mandei fazer uma plaquinha pra você. Não conta pra ninguém que eu sorri.']],
    howto: ['Deslize pro lado, ou toque no lado da tela, pra trocar de faixa.', 'Desvie das cadeiras, carrinhos e baldes.', 'Chegue na sala vermelha. 3 batidas e começa de novo.'], faster: true
  },
  {
    id: 'pizza1', char: 'ana', chars: ['ana', 'italo'], room: 'gourmet', after: 60, game: 'pizza', title: 'Noite da pizza', level: 'difícil',
    gift: ['gourmet', 'forno'], giftText: 'Forno de pizza na área gourmet. E a família toda vem pra festa!',
    hello: [['ana', 'Chegamos! Soube que tem área gourmet nova.'], ['italo', 'E forno de pizza?'], ['dodo', 'Ainda não...']],
    talk: [['ana', 'Lembra da nossa noite da pizza, nós quatro?'], ['italo', 'Hoje vocês que cozinham!'], ['tata', 'Fechado: cada um com a sua pizza favorita.']],
    done: [['italo', 'Melhor pizzaria da cidade!'], ['ana', 'Trouxemos um forno de pizza pra vocês. E chamamos todo mundo pra festa!']],
    howto: ['Cada um pede uma pizza: toque nos ingredientes certos, começando pelo molho.', 'Depois toque em Assar. Ingrediente errado estraga a pizza.', 'Entregue as 4 antes de esfriar.']
  }
];
export const missionById = id => MISSIONS.find(m => m.id === id);

// Desafio que está esperando agora (eles vêm um de cada vez, em ordem)
export function availableMission(st) {
  for (const m of MISSIONS) if (!st.missions[m.id]) return st.done >= m.after ? m : null;
  return null;
}
export function nextMission(st) { return MISSIONS.find(m => !st.missions[m.id]) || null; }

export function isFinale(st) {
  return st.done >= 64 && !!st.roomsDone.gourmet && MISSIONS.every(m => st.missions[m.id]);
}

// Presentes que aparecem num cômodo (os que não se compram com estrela)
export function giftsFor(st, roomId) {
  const room = ROOMS.find(r => r.id === roomId);
  return MISSIONS.filter(m => st.missions[m.id] && m.gift[0] === roomId && !room.items.some(i => i.id === m.gift[1])).map(m => m.gift[1]);
}

// Quem está em cada cômodo, dependendo do progresso (done = fases completas)
export function presence(st) {
  const d = st.done, m = st.missions, list = [];
  const add = (id, room) => list.push({ id, room });
  if (isFinale(st)) {
    ['tata', 'dodo', 'zozo', 'ana', 'italo', 'marci', 'milton', 'vitoria', 'pai'].forEach(id => add(id, 'gourmet'));
    return list;
  }
  add('tata', st.room); add('dodo', st.room);
  if (m.zozo1) add('zozo', st.room); else if (d >= 33) add('zozo', 'banheiro'); else add('zozo', 'quintal');
  if ((d >= 4 && !(m.milton1 && d >= 8)) || (d >= 46 && !(m.milton2 && d >= 51))) add('milton', 'quintal');
  if (d >= 11 && !(m.vitoria1 && d >= 16)) add('vitoria', 'sala');
  if ((d >= 18 && !(m.marci1 && d >= 24)) || (d >= 42 && !(m.marci2 && d >= 47))) add('marci', 'cozinha');
  if (d >= 50 && !(m.pai1 && d >= 56)) add('pai', 'hospedes');
  if (d >= 58) { add('ana', 'gourmet'); add('italo', 'gourmet'); }
  return list;
}

// Conversas automáticas
export const SCENES = {
  intro: [
    ['dodo', 'Tata, chegamos! Essa é a nossa casinha.'],
    ['tata', 'Que lindaaa! Mas o quintal tá tão vazio...'],
    ['dodo', 'Bora arrumar tudo junto? Cada fase que você passa vale estrela, e com estrela a gente decora.']
  ],
  sala: [['dodo', 'Quintal prontinho! Agora a sala, momo.'], ['tata', 'Aqui vai ser o nosso cantinho de filme.']],
  cozinha: [['tata', 'A cozinha! Já tô sentindo cheiro de café.'], ['dodo', 'E de strogonoff, se a sua mãe aparecer...']],
  quarto: [['dodo', 'O nosso quarto, tata.'], ['tata', 'O lugar mais importante da casa.']],
  banheiro: [['tata', 'Banheiro novo! A Zozo vai adorar tomar banho aqui.'], ['dodo', 'Ela vai discordar, pode apostar.']],
  escritorio: [['dodo', 'Escritório: eu trabalho de um lado e você estuda do outro.'], ['tata', 'Combinado. Sem jogo no volume alto!']],
  hospedes: [['tata', 'Quarto de hóspedes, pra receber a família.'], ['dodo', 'Meu pai já disse que vem fazer uma visita.']],
  gourmet: [['dodo', 'Agora a área gourmet, lá no fundo do quintal.'], ['tata', 'A gente vai fazer tanta festa aqui!']],
  festa: [
    ['dodo', 'Tata, olha só: a casinha tá pronta.'],
    ['tata', 'E todo mundo que a gente ama tá aqui.'],
    ['marci', 'Um brinde aos noivos!'],
    ['milton', 'E à churrasqueira!'],
    ['vitoria', 'E à melhor amiga do mundo!'],
    ['dodo', 'Te amo, momo. Bem-vinda à nossa casinha.']
  ]
};

export const FINAL_LETTER = 'Tata, cada cantinho dessa casinha foi feito pensando em você. Obrigado por construir a vida comigo, fase por fase. Que a nossa casa de verdade seja assim: cheia de gente que a gente ama, de risada e de amor. Te amo, momo.';

export const IDLE_LINES = {
  tata: ['Opa, nada por aqui agora! Bora jogar mais uma?'],
  dodo: ['Opa, não tenho nada pra você por agora, momo!', 'Te amo, momo. Agora vai jogar que eu tô de olho na casa!'],
  zozo: ['Au au! (ela só quer carinho agora)', 'Au! (abanando o rabo)'],
  milton: ['Opa, não tenho nada pra você por agora. Vai jogando que eu fico de olho na obra!'],
  vitoria: ['Opa, nada por agora! Sua casa tá linda, amiga.', 'Depois a gente marca outra praia, hein!'],
  marci: ['Opa, nada por agora, filha. Tá comendo direitinho?', 'Essa cozinha tá pedindo um bolo de fubá.'],
  pai: ['Opa, nada por agora! Qualquer barulho no carro, me chama.'],
  ana: ['Opa, nada por agora! Amei a área gourmet.'],
  italo: ['Opa, nada por agora. Quando é o próximo churrasco?'],
  margarida: ['Plantão não espera, Tatiana.']
};
