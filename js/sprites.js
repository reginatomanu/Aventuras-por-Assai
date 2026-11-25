// Sprites e cenário em Pixel Art — TODOS desenhados na mesma densidade (1 pixel lógico)
// O canvas tem resolução nativa de 384x216 e é ampliado sem suavização.

const PALETTE = {
  K: '#141824', H: '#252b42', S: '#ffcca8', s: '#e09b70', C: '#f48fb1', R: '#dc2626', r: '#991b1b',
  B: '#2b72d6', b: '#1c52a3', L: '#5b9cf0', Y: '#ffd026', y: '#d49b00', W: '#ffffff',
  D: '#7d4218', d: '#52290c', M: '#94a3b8', O: '#fb923c', q: '#4a0d0d', P: '#f472b6',
  p: '#be185d', w: '#fbcfe8', G: '#22c55e', N: '#475569',
};

// ---------- Personagens (16x22) ----------
const SORA_IDLE = [
  '....KKKKKK.K....',
  '..KKKKKKKKKKKK..',
  '.KKHKKKKKKKKHKK.',
  '.KKKKKKKKKKKKKK.',
  '..KKSSSKKSSSKK..',
  '.KSSSKSSSSKSSSK.',
  '.KSSSKSSSSKSSSK.',
  '..KSSSSSSSSSSK..',
  '..KSSSSssSSSSK..',
  '...KKSSSSSSKK...',
  '..KYYBYYYYBYYK..',
  '.KYYYBWBBWBYYYK.',
  '.KSYYBBBBBBYYSK.',
  '.KSSKBBbbBBKSSK.',
  '.KSSKBBBBBBKSSK.',
  '..KKBBBBBBBBKK..',
  '...KBBBBBBBBK...',
  '...KBBbKKbBBK...',
  '...KBBBKKBBBK...',
  '...KLLLKKLLLK...',
  '..KDDDDKKDDDDK..',
  '..KKKKKKKKKKKK..',
];
const SORA_WALK1 = [
  '....KKKKKK.K....',
  '..KKKKKKKKKKKK..',
  '.KKHKKKKKKKKHKK.',
  '.KKKKKKKKKKKKKK.',
  '..KKSSSKKSSSKK..',
  '.KSSSKSSSSKSSSK.',
  '.KSSSKSSSSKSSSK.',
  '..KSSSSSSSSSSK..',
  '..KSSSSssSSSSK..',
  '...KKSSSSSSKK...',
  '..KYYBYYYYBYYK..',
  '.KYYYBWBBWBYYYK.',
  '.KSYYBBBBBBYYSK.',
  '.KSSKBBbbBBKSSK.',
  '..KKBBBBBBBBKK..',
  '...KBBBBBBBBK...',
  '..KBBBbKKbBBBK..',
  '..KBBBK..KBBBK..',
  '..KLLLK..KBBBK..',
  '.KDDDDK..KLLLK..',
  '.KKKKKK..KDDDDK.',
  '.........KKKKKK.',
];
const SORA_WALK2 = [
  '....KKKKKK.K....',
  '..KKKKKKKKKKKK..',
  '.KKHKKKKKKKKHKK.',
  '.KKKKKKKKKKKKKK.',
  '..KKSSSKKSSSKK..',
  '.KSSSKSSSSKSSSK.',
  '.KSSSKSSSSKSSSK.',
  '..KSSSSSSSSSSK..',
  '..KSSSSssSSSSK..',
  '...KKSSSSSSKK...',
  '..KYYBYYYYBYYK..',
  '.KYYYBWBBWBYYYK.',
  '.KSYYBBBBBBYYSK.',
  '.KSSKBBbbBBKSSK.',
  '..KKBBBBBBBBKK..',
  '...KBBBBBBBBK...',
  '..KBBBbKKbBBBK..',
  '..KBBBK..KBBBK..',
  '..KBBBK..KLLLK..',
  '..KLLLK..KDDDDK.',
  '.KDDDDK..KKKKKK.',
  '.KKKKKK.........',
];
const SORA_JUMP = [
  '....KKKKKK.K....',
  '..KKKKKKKKKKKK..',
  '.KKHKKKKKKKKHKK.',
  '.KKKKKKKKKKKKKK.',
  '..KKSSSKKSSSKK..',
  '.KSSSKSSSSKSSSK.',
  '.KSSSKSSSSKSSSK.',
  '..KSSSSSSSSSSKK.',
  '..KSSSSssSSSSSSK',
  '...KKSSSSSSKKYYK',
  '..KYYBYYYYBYYYYK',
  '.KSYYBWBBWBYYKK.',
  '.KSSKBBBBBBBBK..',
  '..KKKBBbbBBBBK..',
  '...KBBBBBBBBBK..',
  '..KBBBbKKbBBBK..',
  '.KLLLK....KLLLK.',
  '.KDDDDK..KDDDDK.',
  '.KKKKKK..KKKKKK.',
  '................',
  '................',
  '................',
];
const RIKU_IDLE = [
  '....KKKKKKKK....',
  '..KKKKKKKKYYKK..',
  '.KKHKKKKKYyyYYK.',
  '.KKKKKKKKKYYKKK.',
  '.KKKSSSSKKSSKKK.',
  '.KKSSKSSSSKSSKK.',
  '.KKSSKSSSSKSSKK.',
  '.KKSCSSSSSSCSKK.',
  '.KKKSSSssSSSKKK.',
  '.KKKKSSSSSSKKKK.',
  '..KKBBBBBBBBKK..',
  '.KBBBBBBBBBBBBK.',
  '.KSBBLBBBBBLBSK.',
  '.KSSKYYyyYYKSSK.',
  '.KSSKBBBBBBKSSK.',
  '..KKBBBBBBBBKK..',
  '.KBBBBbBBbBBBBK.',
  '.KBBBBbBBbBBBBK.',
  '..KKKKKKKKKKKK..',
  '...KSSK..KSSK...',
  '...KWWK..KWWK...',
  '..KKKKK..KKKKK..',
];
const RIKU_WALK1 = [
  '....KKKKKKKK....',
  '..KKKKKKKKYYKK..',
  '.KKHKKKKKYyyYYK.',
  '.KKKKKKKKKYYKKK.',
  '.KKKSSSSKKSSKKK.',
  '.KKSSKSSSSKSSKK.',
  '.KKSSKSSSSKSSKK.',
  '.KKSCSSSSSSCSKK.',
  '.KKKSSSssSSSKKK.',
  '.KKKKSSSSSSKKKK.',
  '..KKBBBBBBBBKK..',
  '.KBBBBBBBBBBBBK.',
  '.KSBBLBBBBBLBSK.',
  '.KSSKYYyyYYKSSK.',
  '..KKBBBBBBBBKK..',
  '.KBBBBbBBbBBBBK.',
  '.KBBBBbBBbBBBBK.',
  '..KKKKKKKKKKKK..',
  '..KSSK....KSSK..',
  '..KWWK....KSSK..',
  '.KKKKK....KWWK..',
  '.........KKKKK..',
];
const RIKU_WALK2 = [
  '....KKKKKKKK....',
  '..KKKKKKKKYYKK..',
  '.KKHKKKKKYyyYYK.',
  '.KKKKKKKKKYYKKK.',
  '.KKKSSSSKKSSKKK.',
  '.KKSSKSSSSKSSKK.',
  '.KKSSKSSSSKSSKK.',
  '.KKSCSSSSSSCSKK.',
  '.KKKSSSssSSSKKK.',
  '.KKKKSSSSSSKKKK.',
  '..KKBBBBBBBBKK..',
  '.KBBBBBBBBBBBBK.',
  '.KSBBLBBBBBLBSK.',
  '.KSSKYYyyYYKSSK.',
  '..KKBBBBBBBBKK..',
  '.KBBBBbBBbBBBBK.',
  '.KBBBBbBBbBBBBK.',
  '..KKKKKKKKKKKK..',
  '..KSSK....KSSK..',
  '..KSSK....KWWK..',
  '..KWWK....KKKKK.',
  '..KKKKK.........',
];
const RIKU_JUMP = [
  '....KKKKKKKK....',
  '..KKKKKKKKYYKK..',
  '.KKHKKKKKYyyYYK.',
  '.KKKKKKKKKYYKKK.',
  '.KKKSSSSKKSSKKK.',
  '.KKSSKSSSSKSSKK.',
  '.KKSSKSSSSKSSKK.',
  '.KKSCSSSSSSCSKK.',
  '.KKKSSSssSSSKKK.',
  '.KKKKSSSSSSKKSSK',
  '..KKBBBBBBBBBBBK',
  '.KSBBLBBBBBLBBK.',
  '.KSSKYYyyYYKKK..',
  '..KKBBBBBBBBK...',
  '.KBBBBbBBbBBBBK.',
  '.KBBBBbBBbBBBBK.',
  '..KKKKKKKKKKKK..',
  '..KSSK....KSSK..',
  '.KWWK......KWWK.',
  '.KKKK......KKKK.',
  '................',
  '................',
];

// ---------- Bichinho (joaninha/besouro fofo 14x10) ----------
const BUG_A = [
  '..K..K........', '...K..K.......', '..KKKKKKKKK...', '.KWKKRRRRRRK..',
  '.KWKRRYRRRRRK.', '.KKKRRRRRYRRK.', '.KKKRRRRRRRRK.', '..KKKKKKKKKK..',
  '..K..K..K..K..', '.K..K..K..K...',
];
const BUG_B = [...BUG_A.slice(0, 8), '...K..K..K..K.', '..K..K..K..K..'];
const BUG_SQUASH = ['..KKKKKKKKKK..', '.KRRYRRRRYRRK.', 'KKKKKKKKKKKKKK', '.K.K.K..K.K.K.'];
const BUG_NIGHT = { _id: 'bn', R: '#7c3aed', Y: '#fde047' };
const BUG_SUNSET = { _id: 'bs', R: '#ea580c', Y: '#fef08a' };

// ---------- Lanterna japonesa (design clássico Chōchin com tampa dourada, corpo oval e núcleo brilhante) ----------
function drawJapaneseLantern(ctx, x, y, lit, frameCount, golden = false) {
  const cx = Math.floor(x + 6);
  const bob = Math.round(Math.sin(frameCount * 0.08 + x) * 1);
  const topY = Math.floor(y + bob);

  if (lit) {
    // Halo de luz quente pulsante ao redor da lanterna acesa
    const pulse = 1 + Math.sin(frameCount * 0.18 + x) * 0.12;
    const radius = 18 * pulse;
    const grad = ctx.createRadialGradient(cx, topY + 8, 2, cx, topY + 8, radius);
    grad.addColorStop(0, 'rgba(255, 245, 157, 0.85)');
    grad.addColorStop(0.45, 'rgba(251, 146, 60, 0.45)');
    grad.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, topY + 8, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cordinha/suporte superior
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(cx, topY - 2, 1, 3);

  // Tampa superior (madeira escura + detalhe dourado)
  ctx.fillStyle = '#111827';
  ctx.fillRect(cx - 3, topY, 7, 2);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(cx - 2, topY + 1, 5, 1);

  // Contorno externo do corpo oval da lanterna
  ctx.fillStyle = '#111827';
  ctx.fillRect(cx - 5, topY + 2, 11, 11);
  ctx.fillRect(cx - 6, topY + 4, 13, 7);

  if (!lit) {
    // Lanterna apagada (vermelho escuro fosco ou dourado escuro na fase secreta)
    ctx.fillStyle = golden ? '#92400e' : '#7f1d1d';
    ctx.fillRect(cx - 4, topY + 3, 9, 9);
    ctx.fillRect(cx - 5, topY + 4, 11, 7);
    // Sombra/reflexo sutil central
    ctx.fillStyle = golden ? '#b45309' : '#991b1b';
    ctx.fillRect(cx - 3, topY + 4, 7, 7);
    // Gomos horizontais da lanterna
    ctx.fillStyle = golden ? '#451a03' : '#450a0a';
    ctx.fillRect(cx - 5, topY + 5, 11, 1);
    ctx.fillRect(cx - 5, topY + 9, 11, 1);
  } else {
    // Lanterna ACESA (vermelho/laranja vibrante + núcleo amarelo/branco brilhante!)
    ctx.fillStyle = golden ? '#f59e0b' : '#ef4444';
    ctx.fillRect(cx - 4, topY + 3, 9, 9);
    ctx.fillRect(cx - 5, topY + 4, 11, 7);
    // Camada laranja quente
    ctx.fillStyle = '#fb923c';
    ctx.fillRect(cx - 3, topY + 4, 7, 7);
    // Núcleo luminoso amarelo/branco
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx - 2, topY + 5, 5, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 1, topY + 6, 3, 3);
    // Gomos horizontais iluminados
    ctx.fillStyle = golden ? '#d97706' : '#b91c1c';
    ctx.fillRect(cx - 5, topY + 5, 11, 1);
    ctx.fillRect(cx - 5, topY + 9, 11, 1);
  }

  // Base inferior da lanterna
  ctx.fillStyle = '#111827';
  ctx.fillRect(cx - 3, topY + 13, 7, 2);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(cx - 2, topY + 13, 5, 1);

  // Borla (tassel) pendurada embaixo
  ctx.fillStyle = lit ? '#facc15' : '#b45309';
  ctx.fillRect(cx - 1, topY + 15, 3, 2);
  ctx.fillStyle = lit ? '#fef08a' : '#78350f';
  ctx.fillRect(cx, topY + 17, 1, 1);
}

// ---------- Flor de sakura (7x7) ----------
const FLOWER = ['..P.P..', '.PwPwP.', 'PPpYpPP', '.PYYYP.', 'PPpYpPP', '.PwPwP.', '..P.P..'];

// ---------- Lanterna de pedra (tōrō 7x12) ----------
const TORO = [
  '..KKK..', '.KMMMK.', 'KMMMMMK', '.KYYYK.', '.KYWYK.', '.KMMMK.',
  'KMMMMMK', '..KMK..', '..KMK..', '..KMK..', '.KMMMK.', 'KMMMMMK',
];
const TORO_OFF = { _id: 'toff', Y: '#57534e', W: '#78716c' };

// ---------- Coração (HUD) ----------
const HEART = ['.KK.KK.', 'KRRKRRK', 'KRWRRRK', 'KRRRRRK', '.KRRRK.', '..KRK..', '...K...'];

function heartSVG(full) {
  const map = full ? { K: '#1a1a2e', R: '#e11d48', W: '#fecdd3' } : { K: '#1a1a2e', R: '#3b4a63', W: '#56657d' };
  let r = '';
  HEART.forEach((row, y) => [...row].forEach((c, x) => {
    if (map[c]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${map[c]}"/>`;
  }));
  return `<svg viewBox="0 0 7 7" shape-rendering="crispEdges">${r}</svg>`;
}

// ---------- Desenho de matrizes com cache ----------
function drawPixelMatrix(ctx, m, x, y, flip = false, map = null) {
  const k = (map ? map._id : 'd') + (flip ? 'f' : 'n');
  if (!m._cache) m._cache = {};
  let c = m._cache[k];
  if (!c) {
    c = document.createElement('canvas');
    c.width = m[0].length;
    c.height = m.length;
    const g = c.getContext('2d');
    for (let r = 0; r < m.length; r++) {
      for (let col = 0; col < m[r].length; col++) {
        const ch = m[r][col];
        if (ch === '.') continue;
        const color = (map && map[ch]) || PALETTE[ch];
        if (!color) continue;
        g.fillStyle = color;
        g.fillRect(flip ? c.width - 1 - col : col, r, 1, 1);
      }
    }
    m._cache[k] = c;
  }
  ctx.drawImage(c, Math.round(x), Math.round(y));
}

// ---------- Fonte pixel 3x5 ----------
const FONT = {
  A: ['111', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'], C: ['111', '100', '100', '100', '111'],
  D: ['110', '101', '101', '101', '110'], E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'],
  G: ['111', '100', '101', '101', '111'], H: ['101', '101', '111', '101', '101'], I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '111'], K: ['101', '101', '110', '101', '101'], L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'], N: ['110', '101', '101', '101', '101'], O: ['111', '101', '101', '101', '111'],
  P: ['111', '101', '111', '100', '100'], Q: ['111', '101', '101', '111', '001'], R: ['110', '101', '110', '101', '101'],
  S: ['111', '100', '111', '001', '111'], T: ['111', '010', '010', '010', '010'], U: ['101', '101', '101', '101', '111'],
  V: ['101', '101', '101', '101', '010'], W: ['101', '101', '111', '111', '101'], X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'], Z: ['111', '001', '010', '100', '111'],
  0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'],
  3: ['111', '001', '111', '001', '111'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '001', '001', '001'], 8: ['111', '101', '111', '101', '111'],
  9: ['111', '101', '111', '001', '111'], '-': ['000', '000', '111', '000', '000'], '!': ['010', '010', '010', '000', '010'],
  '>': ['100', '010', '001', '010', '100'], '+': ['000', '010', '111', '010', '000'], ':': ['000', '010', '000', '010', '000'],
  '.': ['000', '000', '000', '000', '010'], '?': ['111', '001', '011', '000', '010'],
};

function normText(str) {
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function pixelTextWidth(str) { return normText(str).length * 4 - 1; }

function drawPixelText(ctx, str, x, y, color, shadow) {
  const s = normText(str);
  x = Math.round(x); y = Math.round(y);
  const pass = (ox, oy, col) => {
    ctx.fillStyle = col;
    for (let i = 0; i < s.length; i++) {
      const g = FONT[s[i]];
      if (!g) continue;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
        if (g[r][c] === '1') ctx.fillRect(x + ox + i * 4 + c, y + oy + r, 1, 1);
      }
    }
  };
  if (shadow) pass(1, 1, shadow);
  pass(0, 0, color);
}

// ---------- Primitivas ----------
function pxTri(ctx, cx, top, rows, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < rows; i++) ctx.fillRect(cx - i, top + i, i * 2 + 1, 1);
}

function pxCircle(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(r * r - dy * dy));
    ctx.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
  }
}

// ---------- Árvores (cerejeira e ipês) ----------
const TREE_COLS = {
  sakura: ['#c2477f', '#f28bbf', '#ffd1e6'],
  'ipe-branco': ['#b9c4d2', '#eef2f7', '#ffffff'],
  'ipe-amarelo': ['#c88f00', '#f5b301', '#ffe27a'],
  'ipe-rosa': ['#a8326e', '#e7559b', '#ffa6cf'],
};

function drawTree(ctx, x, gy, type) {
  const [d, m, l] = TREE_COLS[type] || TREE_COLS.sakura;
  ctx.fillStyle = '#5c3a21'; ctx.fillRect(x - 2, gy - 24, 4, 24);
  ctx.fillStyle = '#3e2416'; ctx.fillRect(x + 1, gy - 24, 1, 24);
  if (type !== 'sakura') { ctx.fillStyle = '#e8edf2'; ctx.fillRect(x - 2, gy - 7, 4, 7); } // tronco caiado das ruas de Assaí
  ctx.fillStyle = '#5c3a21'; ctx.fillRect(x - 8, gy - 22, 6, 2); ctx.fillRect(x + 2, gy - 26, 7, 2);
  ctx.fillStyle = d; ctx.fillRect(x - 15, gy - 40, 30, 14); ctx.fillRect(x - 18, gy - 34, 36, 7);
  ctx.fillStyle = m; ctx.fillRect(x - 13, gy - 44, 26, 15); ctx.fillRect(x - 17, gy - 38, 34, 8); ctx.fillRect(x - 8, gy - 47, 14, 4);
  ctx.fillStyle = l; ctx.fillRect(x - 9, gy - 45, 8, 3); ctx.fillRect(x - 15, gy - 37, 5, 3); ctx.fillRect(x + 5, gy - 41, 6, 3); ctx.fillRect(x - 2, gy - 33, 4, 2);
  ctx.fillStyle = d; ctx.fillRect(x + 9, gy - 31, 2, 1); ctx.fillRect(x - 12, gy - 29, 2, 1); ctx.fillRect(x + 2, gy - 28, 2, 1);
}

// ---------- Torii (pilares atrás, vigas na frente: o personagem passa POR BAIXO) ----------
function drawToriiBack(ctx, x, gy, col = '#c81e1e') {
  ctx.fillStyle = col; ctx.fillRect(x - 15, gy - 40, 3, 40); ctx.fillRect(x + 12, gy - 40, 3, 40);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x - 13, gy - 40, 1, 40); ctx.fillRect(x + 14, gy - 40, 1, 40);
  ctx.fillStyle = '#8a8580'; ctx.fillRect(x - 16, gy - 3, 5, 3); ctx.fillRect(x + 11, gy - 3, 5, 3);
}

function drawToriiFront(ctx, x, gy, col = '#e02424', dark = '#1f2937') {
  ctx.fillStyle = col; ctx.fillRect(x - 18, gy - 33, 36, 2); ctx.fillRect(x - 20, gy - 40, 40, 3);
  ctx.fillStyle = dark; ctx.fillRect(x - 21, gy - 42, 42, 2); ctx.fillRect(x - 23, gy - 43, 3, 2); ctx.fillRect(x + 20, gy - 43, 3, 2);
  ctx.fillRect(x - 2, gy - 38, 4, 6);
  ctx.fillStyle = '#f5b301'; ctx.fillRect(x - 1, gy - 37, 2, 4);
}

// ---------- Castelo Japonês de Assaí (fiel à fachada real da foto) ----------
function drawCastle(ctx, x, gy, night, frame) {
  const wall = night ? '#d5deeb' : '#f8fafc', wallS = night ? '#94a3b8' : '#dbe3ec';
  const roof = night ? '#46566e' : '#738296', roofD = night ? '#1e293b' : '#475569', roofL = night ? '#64748b' : '#94a3b8';
  const gableFill = night ? '#64748b' : '#94a3b8';
  const stone = night ? '#3a342f' : '#635951', stoneD = night ? '#231f1c' : '#433c36', stoneL = night ? '#524942' : '#7d7268';
  const win = night ? '#fde047' : '#1e293b';
  const slit = night ? '#cbd5e1' : '#334155';

  // Torre de antena metálica à direita (como na foto real) e menor atrás à esquerda
  ctx.fillStyle = night ? '#475569' : '#7b8794';
  ctx.fillRect(x + 106, gy - 98, 1, 98); ctx.fillRect(x + 112, gy - 98, 1, 98);
  for (let k = 0; k < 98; k += 7) {
    ctx.fillRect(x + 106, gy - 98 + k, 7, 1);
    for (let d = 0; d < 6; d++) ctx.fillRect(x + 106 + d, gy - 98 + k + d, 1, 1);
  }
  ctx.fillStyle = Math.floor(frame / 30) % 2 ? '#ef4444' : '#7f1d1d';
  ctx.fillRect(x + 108, gy - 100, 2, 2);

  // Base de pedra escura
  ctx.fillStyle = stone; ctx.fillRect(x, gy - 14, 100, 14);
  for (let r = 0; r < 4; r++) {
    ctx.fillStyle = stoneD; ctx.fillRect(x, gy - 14 + r * 3, 100, 1);
    for (let c = (r % 2) * 4; c < 100; c += 8) {
      ctx.fillRect(x + c, gy - 13 + r * 3, 1, 2);
      ctx.fillStyle = stoneL; ctx.fillRect(x + c + 2, gy - 12 + r * 3, 2, 1);
      ctx.fillStyle = stoneD;
    }
  }

  // 1º Andar (parede branca larga)
  ctx.fillStyle = wall; ctx.fillRect(x + 2, gy - 38, 96, 24);
  ctx.fillStyle = wallS; ctx.fillRect(x + 2, gy - 38, 96, 2); ctx.fillRect(x + 88, gy - 38, 10, 24);

  // 6 janelas verticais estreitas alinhadas na parte superior do 1º andar (exatamente como na foto!)
  ctx.fillStyle = win;
  for (const wx of [12, 26, 41, 57, 72, 86]) {
    ctx.fillRect(x + wx, gy - 33, 2, 6);
  }

  // Grupos de 3 frestas pequenas (|||) na parte baixa do 1º andar, ao lado da porta
  ctx.fillStyle = slit;
  for (const gx of [10, 22, 34, 62, 75]) {
    ctx.fillRect(x + gx, gy - 19, 1, 3);
    ctx.fillRect(x + gx + 2, gy - 19, 1, 3);
    ctx.fillRect(x + gx + 4, gy - 19, 1, 3);
  }

  // Porta central escura + muretinhas cinzas do patamar de entrada
  ctx.fillStyle = '#1c1917'; ctx.fillRect(x + 44, gy - 22, 12, 10);
  ctx.fillStyle = '#3f2312'; ctx.fillRect(x + 45, gy - 21, 10, 9);
  if (night) {
    ctx.fillStyle = 'rgba(253,224,71,0.22)';
    ctx.fillRect(x + 46, gy - 20, 8, 8);
  }
  // Muretinhas cinzas do patamar em frente à porta
  ctx.fillStyle = night ? '#64748b' : '#94a3b8';
  ctx.fillRect(x + 26, gy - 12, 18, 4);
  ctx.fillRect(x + 56, gy - 12, 18, 4);
  ctx.fillStyle = night ? '#475569' : '#64748b';
  ctx.fillRect(x + 26, gy - 8, 18, 2);
  ctx.fillRect(x + 56, gy - 8, 18, 2);

  // Telhado do 1º Andar (beiral largo curvado nas pontas)
  ctx.fillStyle = roofD; ctx.fillRect(x - 6, gy - 41, 112, 2);
  ctx.fillRect(x - 8, gy - 42, 3, 2); ctx.fillRect(x + 105, gy - 42, 3, 2);
  ctx.fillStyle = roof; ctx.fillRect(x - 4, gy - 39, 108, 2);
  ctx.fillStyle = roofL; ctx.fillRect(x - 4, gy - 39, 108, 1);

  // 2º Andar (parede branca recuada)
  ctx.fillStyle = wall; ctx.fillRect(x + 12, gy - 55, 76, 14);
  ctx.fillStyle = wallS; ctx.fillRect(x + 12, gy - 55, 76, 1); ctx.fillRect(x + 80, gy - 55, 8, 14);

  // 2 frontões triangulares (Chidori-hafu) com borda branca e interior cinza + 2 na lateral direita
  for (const gx of [x + 28, x + 68]) {
    pxTri(ctx, gx, gy - 50, 9, roofD);
    pxTri(ctx, gx, gy - 49, 8, '#ffffff');
    pxTri(ctx, gx, gy - 47, 6, gableFill);
  }

  // Janelas do 2º Andar: 2 janelas quadradas juntas ENTRE os frontões + 1 estreita em cada ponta!
  ctx.fillStyle = win;
  ctx.fillRect(x + 43, gy - 50, 4, 5);
  ctx.fillRect(x + 50, gy - 50, 4, 5);
  ctx.fillRect(x + 16, gy - 50, 2, 5);
  ctx.fillRect(x + 78, gy - 50, 2, 5);

  // Telhado do 2º Andar
  ctx.fillStyle = roofD; ctx.fillRect(x + 4, gy - 58, 92, 2);
  ctx.fillRect(x + 2, gy - 59, 3, 2); ctx.fillRect(x + 95, gy - 59, 3, 2);
  ctx.fillStyle = roof; ctx.fillRect(x + 6, gy - 56, 88, 2);
  ctx.fillStyle = roofL; ctx.fillRect(x + 6, gy - 56, 88, 1);

  // 3º Andar (topo)
  ctx.fillStyle = wall; ctx.fillRect(x + 24, gy - 71, 52, 13);
  ctx.fillStyle = wallS; ctx.fillRect(x + 70, gy - 71, 6, 13);

  // Frontão curvo branco (Karahafu) no centro do 3º andar com janela horizontal dividida
  ctx.fillStyle = roofD;
  ctx.fillRect(x + 37, gy - 69, 26, 1);
  ctx.fillRect(x + 41, gy - 71, 18, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 38, gy - 68, 24, 9);
  ctx.fillRect(x + 42, gy - 70, 16, 2);
  // Janela horizontal dentro do arco central + divisórias brancas
  ctx.fillStyle = win;
  ctx.fillRect(x + 42, gy - 65, 16, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 47, gy - 65, 1, 3);
  ctx.fillRect(x + 52, gy - 65, 1, 3);
  // Janelinhas baixas laterais no 3º andar
  ctx.fillStyle = win;
  ctx.fillRect(x + 29, gy - 63, 3, 2);
  ctx.fillRect(x + 68, gy - 63, 3, 2);

  // Grande telhado superior (Irimoya) com frontão triangular branco e cinza voltado para a frente!
  ctx.fillStyle = roofD;
  ctx.fillRect(x + 16, gy - 73, 68, 2);
  ctx.fillRect(x + 14, gy - 74, 3, 2); ctx.fillRect(x + 83, gy - 74, 3, 2);
  // Triângulo principal do topo
  pxTri(ctx, x + 50, gy - 88, 15, roofD);
  pxTri(ctx, x + 50, gy - 86, 13, '#ffffff');
  pxTri(ctx, x + 50, gy - 84, 11, gableFill);
  // Beiral branco abaixo do arco superior
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 36, gy - 73, 28, 1);
  ctx.fillStyle = roofL;
  ctx.fillRect(x + 49, gy - 90, 2, 2);
}

// ---------- Galho de cerejeira para os cantos da tela inicial ----------
function drawSakuraBranch(ctx, W, flip) {
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(flip ? W - x - w : x, y, w, h); };
  const wood = '#3b2433';
  R(0, 4, 74, 3, wood); R(40, 7, 34, 2, wood); R(68, 9, 22, 2, wood);
  R(16, 7, 3, 26, wood); R(52, 9, 2, 20, wood); R(30, 7, 2, 10, wood);
  const clusters = [[6, 6], [22, 2], [38, 8], [56, 5], [74, 10], [88, 12], [14, 22], [30, 16], [50, 24], [66, 18], [8, 36], [24, 34], [52, 32]];
  for (const [bx, by] of clusters) {
    R(bx - 6, by - 2, 13, 7, '#be185d');
    R(bx - 5, by - 4, 11, 7, '#f472b6');
    R(bx - 7, by - 1, 15, 4, '#f472b6');
    R(bx - 3, by - 3, 4, 2, '#fde2f0');
    R(bx + 2, by, 2, 1, '#fde2f0');
    R(bx, by + 1, 1, 1, '#f5b301');
  }
}
