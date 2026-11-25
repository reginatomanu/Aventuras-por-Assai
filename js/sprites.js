// Sprites e cenário em Pixel Art — TODOS desenhados na mesma densidade (1 pixel lógico)
// O canvas tem resolução nativa de 384x216 e é ampliado sem suavização.

const PALETTE = {
  K: '#111827', S: '#fccba6', s: '#e29e73', C: '#f87171', R: '#dc2626', r: '#991b1b',
  B: '#1f6fd6', b: '#0055a4', L: '#6ea8f0', Y: '#f5b301', y: '#b98200', W: '#ffffff',
  D: '#78350f', d: '#451a03', M: '#94a3b8', O: '#fb923c', q: '#4a0d0d', P: '#f472b6',
  p: '#be185d', w: '#fbcfe8', G: '#22c55e', N: '#475569',
};

// ---------- Personagens (16x20) ----------
const SORA_IDLE = [
  '....K.KKKK.K....', '...KKKKKKKKKK...', '..KKKKKKKKKKKK..', '..KKKSSSSSSKKK..',
  '..KKSSKSSKSSKK..', '..KKSSKSSKSSKK..', '...KSSSSSSSSK...', '....KSSssSSK....',
  '....KKKKKKKK....', '..KKYKBYYBKYKK..', '.KYYYKBBBBKYYYK.', '.KSYKBBLBBBKYSK.',
  '.KSSKBBBBBBKSSK.', '..KKKBBBBBBKKK..', '....KBBKKBBK....', '....KBBKKBBK....',
  '....KLLKKLLK....', '...KDDDKKDDDK...', '...KKKKKKKKKK...', '................',
];
const SORA_WALK = [
  '....K.KKKK.K....', '...KKKKKKKKKK...', '..KKKKKKKKKKKK..', '..KKKSSSSSSKKK..',
  '..KKSSKSSKSSKK..', '..KKSSKSSKSSKK..', '...KSSSSSSSSK...', '....KSSssSSK....',
  '....KKKKKKKK....', '..KKYKBYYBKYKK..', '.KYYYKBBBBKYYYK.', '.KSSKBBLBBBKSSK.',
  '..KKKBBBBBBKKK..', '....KBBBBBBK....', '...KBBK..KBBK...', '..KLLK....KLLK..',
  '..KDDK....KDDK..', '..KKKK....KKKK..', '................', '................',
];
const SORA_JUMP = [
  '....K.KKKK.K....', '...KKKKKKKKKK...', '..KKKKKKKKKKKK..', '..KKKSSSSSSKKK..',
  '..KKSSKSSKSSKK..', '..KKSSKSSKSSKK..', '...KSSSSSSSSK...', '....KSSssSSK..K.',
  '...KKKKKKKKKKSK.', '.KKYYKBYYBKYYK..', 'KSSYYKBBBBKKK...', '.KKKKBBLBBBK....',
  '....KBBBBBBK....', '...KBBK..KBBK...', '..KLLK....KLLK..', '..KDDK....KDDK..',
  '..KKKK....KKKK..', '................', '................', '................',
];
const RIKU_IDLE = [
  '....KKKKKKKK....', '...KKKKKKKYYK...', '..KKKKKKKKYyYK..', '..KKKKSSSSKKYK..',
  '..KKKSKSSKSKKK..', '..KKKSKSSKSKKK..', '..KKKCSSSSCKKK..', '..KKKKSssSKKKK..',
  '...KKKKKKKKKK...', '..KKBBBBBBBBKK..', '.KBBKBBBBBBKBBK.', '.KSSKYYyKYYKSSK.',
  '.KSSKBBBBBBKSSK.', '..KKBBBBBBBBKK..', '...KBBBBBBBBK...', '....KSSKKSSK....',
  '....KWWKKWWK....', '...KKKKKKWKKK...', '...KKKKKKKKKK...', '................',
];
const RIKU_WALK = [
  '....KKKKKKKK....', '...KKKKKKKYYK...', '..KKKKKKKKYyYK..', '..KKKKSSSSKKYK..',
  '..KKKSKSSKSKKK..', '..KKKSKSSKSKKK..', '..KKKCSSSSCKKK..', '..KKKKSssSKKKK..',
  '...KKKKKKKKKK...', '..KKBBBBBBBBKK..', '.KBBKBBBBBBKBBK.', '.KSSKYYyKYYKSSK.',
  '..KKKBBBBBBKKK..', '...KBBBBBBBBK...', '..KBBBBBBBBBBK..', '...KSSK..KSSK...',
  '..KWWK....KWWK..', '..KKKK....KKKK..', '................', '................',
];
const RIKU_JUMP = [
  '....KKKKKKKK....', '...KKKKKKKYYK...', '..KKKKKKKKYyYK..', '..KKKKSSSSKKYK..',
  '..KKKSKSSKSKKK..', '..KKKSKSSKSKKK..', '..KKKCSSSSCKKK..', '..KKKKSssSKKKK..',
  '...KKKKKKKKKK.K.', '.KKBBBBBBBBBBKSK', 'KSSKBBBBBBBBKKK.', '.KKKYYyKYYK.....',
  '...KBBBBBBBBK...', '..KBBBBBBBBBBK..', '...KSSK..KSSK...', '..KWWK....KWWK..',
  '..KKKK....KKKK..', '................', '................', '................',
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

// ---------- Lanterna japonesa (chōchin 10x15) ----------
const LANTERN_OFF = [
  '....KK....', '...KKKK...', '..KyyyyK..', '.KrrrrrrK.', 'KrrrrrrrrK',
  'KqqqqqqqqK', 'KrrrrrrrrK', 'KrrrqqrrrK', 'KqqqqqqqqK', 'KrrrrrrrrK',
  '.KrrrrrrK.', '..KyyyyK..', '...KKKK...', '....yy....', '....y.....',
];
const LANTERN_ON = [
  '....KK....', '...KKKK...', '..KYYYYK..', '.KRRRRRRK.', 'KRROOOORRK',
  'KrrrrrrrrK', 'KROYWWYORK', 'KROYWWYORK', 'KrrrrrrrrK', 'KRROOOORRK',
  '.KRRRRRRK.', '..KYYYYK..', '...KKKK...', '....YY....', '....Y.....',
];
const GOLD_MAP = { _id: 'gold', R: '#f5b301', r: '#b45309', O: '#fff1a8', q: '#78350f' };

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

// ---------- Castelo Japonês de Assaí (baseado nas fotos reais) ----------
function drawCastle(ctx, x, gy, night, frame) {
  const wall = night ? '#c7d2e0' : '#f8fafc', wallS = night ? '#94a3b8' : '#dbe3ec';
  const roof = night ? '#3b4a63' : '#6b7a8f', roofD = night ? '#1e293b' : '#475569', roofL = night ? '#56657d' : '#94a3b8';
  const stone = night ? '#2e2a27' : '#5f5751', stoneD = night ? '#1c1917' : '#433d38', stoneL = night ? '#3f3a36' : '#7a716a';
  const win = night ? '#fde047' : '#1e293b';

  // torre de antena (presente em todas as fotos do castelo)
  ctx.fillStyle = night ? '#475569' : '#7b8794';
  ctx.fillRect(x - 18, gy - 100, 1, 100); ctx.fillRect(x - 11, gy - 100, 1, 100);
  for (let k = 0; k < 100; k += 7) { ctx.fillRect(x - 18, gy - 100 + k, 8, 1); for (let d = 0; d < 7; d++) ctx.fillRect(x - 18 + d, gy - 100 + k + d, 1, 1); }
  ctx.fillStyle = Math.floor(frame / 30) % 2 ? '#ef4444' : '#7f1d1d'; ctx.fillRect(x - 15, gy - 103, 2, 2);

  // base de pedra
  ctx.fillStyle = stone; ctx.fillRect(x, gy - 16, 100, 16);
  for (let r = 0; r < 4; r++) {
    ctx.fillStyle = stoneD; ctx.fillRect(x, gy - 16 + r * 4, 100, 1);
    for (let c = (r % 2) * 4; c < 100; c += 8) { ctx.fillRect(x + c, gy - 15 + r * 4, 1, 3); ctx.fillStyle = stoneL; ctx.fillRect(x + c + 2, gy - 14 + r * 4, 2, 1); ctx.fillStyle = stoneD; }
  }
  // 1º andar
  ctx.fillStyle = wall; ctx.fillRect(x + 3, gy - 34, 94, 18);
  ctx.fillStyle = wallS; ctx.fillRect(x + 3, gy - 34, 94, 2); ctx.fillRect(x + 90, gy - 34, 7, 18);
  ctx.fillStyle = win; for (let wx = x + 8; wx < x + 92; wx += 7) { if (Math.abs(wx - (x + 50)) < 7) continue; ctx.fillRect(wx, gy - 29, 1, 4); }
  ctx.fillStyle = '#4a2511'; ctx.fillRect(x + 45, gy - 26, 10, 10);
  ctx.fillStyle = night ? '#a16207' : '#7c3f1d'; ctx.fillRect(x + 46, gy - 25, 4, 9); ctx.fillRect(x + 51, gy - 25, 3, 9);
  // telhado 1
  ctx.fillStyle = roofD; ctx.fillRect(x - 6, gy - 38, 112, 2); ctx.fillRect(x - 8, gy - 40, 3, 2); ctx.fillRect(x + 105, gy - 40, 3, 2);
  ctx.fillStyle = roof; ctx.fillRect(x - 4, gy - 36, 108, 2); ctx.fillStyle = roofL; ctx.fillRect(x - 4, gy - 36, 108, 1);
  for (const gx of [x + 22, x + 78]) { pxTri(ctx, gx, gy - 46, 8, roofD); pxTri(ctx, gx, gy - 44, 6, wall); }
  // 2º andar
  ctx.fillStyle = wall; ctx.fillRect(x + 14, gy - 52, 72, 14); ctx.fillStyle = wallS; ctx.fillRect(x + 80, gy - 52, 6, 14);
  ctx.fillStyle = win; [30, 38, 58, 66].forEach((o) => ctx.fillRect(x + o, gy - 48, 2, 4));
  // telhado 2
  ctx.fillStyle = roofD; ctx.fillRect(x + 6, gy - 55, 88, 2); ctx.fillRect(x + 4, gy - 57, 3, 2); ctx.fillRect(x + 93, gy - 57, 3, 2);
  ctx.fillStyle = roof; ctx.fillRect(x + 8, gy - 53, 84, 1);
  // 3º andar
  ctx.fillStyle = wall; ctx.fillRect(x + 28, gy - 68, 44, 13); ctx.fillStyle = win; ctx.fillRect(x + 40, gy - 64, 20, 3);
  // telhado superior
  for (let i = 0; i < 12; i++) { ctx.fillStyle = i < 2 ? roofD : roof; ctx.fillRect(x + 46 - i * 2, gy - 82 + i, 8 + i * 4, 1); }
  ctx.fillStyle = roofD; ctx.fillRect(x + 22, gy - 70, 56, 1); ctx.fillRect(x + 20, gy - 72, 3, 2); ctx.fillRect(x + 77, gy - 72, 3, 2);
  ctx.fillStyle = roofL; ctx.fillRect(x + 49, gy - 85, 2, 3);
  if (night) {
    ctx.fillStyle = 'rgba(253,224,71,0.18)';
    ctx.fillRect(x + 40, gy - 16, 20, 16);
  }
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
