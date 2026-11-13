// Todos os cômodos 3D da casa
import { buildQuintalBase, buildItem, buildGhost, CHAR_SPOTS } from '../quintal.js';
import sala from './sala.js';
import cozinha from './cozinha.js';
import quarto from './quarto.js';
import banheiro from './banheiro.js';
import escritorio from './escritorio.js';
import hospedes from './hospedes.js';
import gourmet from './gourmet.js';

export const ROOMS3D = {
  quintal: { id: 'quintal', base: buildQuintalBase, item: buildItem, ghost: buildGhost, spots: CHAR_SPOTS, center: [0.1, 0.3, -0.35], radius: 7.6, elev: 0.56, yaw: 0.06, yawMin: -0.5, yawMax: 0.5, want: 5.4, outdoor: true },
  sala, cozinha, quarto, banheiro, escritorio, hospedes, gourmet
};
