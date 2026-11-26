// Sprites e cenário estilizados — Aventuras por Assaí
// Suporta sprite sheet chibi de alta definição (assets/char-sheet.png) + cenário 16-bit rico

const PALETTE = {
  K: '#141824', H: '#252b42', S: '#ffcca8', s: '#e09b70', C: '#f48fb1', R: '#dc2626', r: '#991b1b',
  B: '#2b72d6', b: '#1c52a3', L: '#5b9cf0', Y: '#ffd026', y: '#d49b00', W: '#ffffff',
  D: '#7d4218', d: '#52290c', M: '#94a3b8', O: '#fb923c', q: '#4a0d0d', P: '#f472b6',
  p: '#be185d', w: '#fbcfe8', G: '#22c55e', N: '#475569',
};

// ---------- Sprite Sheet Chibi Original (assets/char-sheet.png) ----------
const charSheetImg = new Image();
charSheetImg.src = 'assets/char-sheet.png?v=16';

const CHAR_ANIMS = {
  male: {
    idle: [{ x: 19, y: 430, w: 54, h: 87 }],
    // Ciclo natural de caminhada/corrida usando os quadros originais (passo -> passagem -> passada aberta -> passagem)
    walk: [
      { x: 208, y: 432, w: 50, h: 86 },
      { x: 264, y: 432, w: 48, h: 86 },
      { x: 399, y: 432, w: 60, h: 85 },
      { x: 317, y: 432, w: 49, h: 86 },
    ],
    run: [
      { x: 399, y: 432, w: 60, h: 85 },
      { x: 264, y: 432, w: 48, h: 86 },
      { x: 479, y: 432, w: 59, h: 83 },
      { x: 317, y: 432, w: 49, h: 86 },
    ],
    jump: [
      { x: 567, y: 428, w: 50, h: 84 },
      { x: 632, y: 428, w: 50, h: 83 },
    ],
    fall: [{ x: 702, y: 443, w: 58, h: 77 }],
    hurt: [{ x: 21, y: 564, w: 55, h: 85 }],
  },
  female: {
    idle: [{ x: 15, y: 101, w: 61, h: 81 }],
    walk: [
      { x: 198, y: 101, w: 53, h: 81 },
      { x: 252, y: 101, w: 51, h: 81 },
      { x: 434, y: 101, w: 49, h: 77 },
      { x: 302, y: 101, w: 52, h: 81 },
    ],
    run: [
      { x: 375, y: 101, w: 59, h: 77 },
      { x: 434, y: 101, w: 49, h: 77 },
      { x: 483, y: 100, w: 50, h: 78 },
      { x: 434, y: 101, w: 49, h: 77 },
    ],
    jump: [{ x: 552, y: 95, w: 65, h: 85 }],
    fall: [{ x: 646, y: 99, w: 62, h: 82 }],
    hurt: [{ x: 14, y: 229, w: 68, h: 81 }],
  },
};

function drawChibiFrame(ctx, charKey, animName, frameIdx, centerX, bottomY, flipX = false, yOffset = 0) {
  if (!charSheetImg.complete || !charSheetImg.naturalWidth) return;
  const set = CHAR_ANIMS[charKey] || CHAR_ANIMS.male;
  const list = set[animName] || set.idle;
  const f = list[frameIdx % list.length];
  // Escala fixa por personagem baseada no idle original (preserva 100% dos detalhes sem deformar)
  const targetHeight = 27;
  const scale = targetHeight / set.idle[0].h;
  const dw = f.w * scale;
  const dh = f.h * scale;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(Math.round(centerX), Math.round(bottomY + yOffset));
  if (flipX) ctx.scale(-1, 1);
  ctx.drawImage(charSheetImg, f.x, f.y, f.w, f.h, -dw / 2, -dh, dw, dh);
  ctx.restore();
}
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

// ---------- Lanterna japonesa (design clássico Chōchin) ----------
function drawJapaneseLantern(ctx, x, y, lit, frameCount, golden = false) {
  const cx = Math.floor(x + 6);
  const bob = Math.round(Math.sin(frameCount * 0.08 + x) * 1);
  const topY = Math.floor(y + bob);

  if (lit) {
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

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(cx, topY - 2, 1, 3);

  ctx.fillStyle = '#111827';
  ctx.fillRect(cx - 3, topY, 7, 2);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(cx - 2, topY + 1, 5, 1);

  ctx.fillStyle = '#111827';
  ctx.fillRect(cx - 5, topY + 2, 11, 11);
  ctx.fillRect(cx - 6, topY + 4, 13, 7);

  if (!lit) {
    ctx.fillStyle = golden ? '#92400e' : '#7f1d1d';
    ctx.fillRect(cx - 4, topY + 3, 9, 9);
    ctx.fillRect(cx - 5, topY + 4, 11, 7);
    ctx.fillStyle = golden ? '#b45309' : '#991b1b';
    ctx.fillRect(cx - 3, topY + 4, 7, 7);
    ctx.fillStyle = golden ? '#451a03' : '#450a0a';
    ctx.fillRect(cx - 5, topY + 5, 11, 1);
    ctx.fillRect(cx - 5, topY + 9, 11, 1);
  } else {
    ctx.fillStyle = golden ? '#f59e0b' : '#ef4444';
    ctx.fillRect(cx - 4, topY + 3, 9, 9);
    ctx.fillRect(cx - 5, topY + 4, 11, 7);
    ctx.fillStyle = '#fb923c';
    ctx.fillRect(cx - 3, topY + 4, 7, 7);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx - 2, topY + 5, 5, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 1, topY + 6, 3, 3);
    ctx.fillStyle = golden ? '#d97706' : '#b91c1c';
    ctx.fillRect(cx - 5, topY + 5, 11, 1);
    ctx.fillRect(cx - 5, topY + 9, 11, 1);
  }

  ctx.fillStyle = '#111827';
  ctx.fillRect(cx - 3, topY + 13, 7, 2);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(cx - 2, topY + 13, 5, 1);

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

function hasCJK(str) {
  return /[\u3000-\u9fff\uff00-\uffef]/.test(String(str));
}

function pixelTextWidth(str) {
  const s = String(str);
  if (hasCJK(s)) {
    let w = 0;
    for (const ch of s) w += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? 6 : 4;
    return w;
  }
  return normText(s).length * 4 - 1;
}

function drawPixelText(ctx, str, x, y, color, shadow) {
  const raw = String(str);
  x = Math.round(x); y = Math.round(y);
  if (hasCJK(raw)) {
    ctx.save();
    ctx.font = 'bold 6px "DotGothic16", "MS Gothic", sans-serif';
    ctx.textBaseline = 'top';
    if (shadow) {
      ctx.fillStyle = shadow;
      ctx.fillText(raw, x + 1, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(raw, x, y - 1);
    ctx.restore();
    return;
  }
  const s = normText(raw);
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

// ---------- Árvores estilizadas (copa arredondada em 4 tons + tronco sombreado com raízes) ----------
const TREE_COLS = {
  sakura: ['#8f295a', '#c94a86', '#f284b8', '#ffc4e1'],
  'ipe-branco': ['#7d8ca3', '#b8c4d6', '#e6ecf5', '#ffffff'],
  'ipe-amarelo': ['#9e6500', '#d69000', '#f5b800', '#ffe36e'],
  'ipe-rosa': ['#7d2051', '#b83779', '#e862a6', '#ffb5da'],
};

function drawTree(ctx, x, gy, type) {
  const [c0, c1, c2, c3] = TREE_COLS[type] || TREE_COLS.sakura;
  x = Math.round(x);

  // Sombra no chão
  ctx.fillStyle = 'rgba(10, 20, 35, 0.25)';
  ctx.fillRect(x - 14, gy - 1, 28, 2);

  // Tronco orgânico com raízes e galhos
  ctx.fillStyle = '#3d2314';
  ctx.fillRect(x - 5, gy - 3, 10, 3);
  ctx.fillRect(x - 4, gy - 8, 8, 5);
  ctx.fillRect(x - 3, gy - 24, 6, 16);
  ctx.fillStyle = '#5e3720';
  ctx.fillRect(x - 3, gy - 3, 6, 3);
  ctx.fillRect(x - 2, gy - 24, 4, 21);
  ctx.fillStyle = '#7a492b';
  ctx.fillRect(x - 1, gy - 22, 2, 18);
  // Galhos superiores aparentes
  ctx.fillStyle = '#4a2b18';
  ctx.fillRect(x - 8, gy - 23, 6, 2);
  ctx.fillRect(x + 2, gy - 25, 7, 2);

  // Copa arredondada multicamadas (igual à estilização de referência!)
  // Camada de sombra base (c0)
  pxCircle(ctx, x - 11, gy - 29, 9, c0);
  pxCircle(ctx, x + 11, gy - 29, 9, c0);
  pxCircle(ctx, x, gy - 27, 11, c0);
  pxCircle(ctx, x, gy - 37, 13, c0);

  // Camada média escura (c1)
  pxCircle(ctx, x - 11, gy - 31, 9, c1);
  pxCircle(ctx, x + 11, gy - 31, 9, c1);
  pxCircle(ctx, x - 6, gy - 38, 10, c1);
  pxCircle(ctx, x + 6, gy - 38, 10, c1);
  pxCircle(ctx, x, gy - 41, 10, c1);

  // Camada principal vibrante (c2)
  pxCircle(ctx, x - 10, gy - 32, 7, c2);
  pxCircle(ctx, x + 10, gy - 32, 7, c2);
  pxCircle(ctx, x - 5, gy - 39, 8, c2);
  pxCircle(ctx, x + 5, gy - 39, 8, c2);
  pxCircle(ctx, x, gy - 42, 8, c2);
  pxCircle(ctx, x, gy - 33, 8, c2);

  // Brilhos superiores da copa (c3)
  pxCircle(ctx, x - 5, gy - 43, 4, c3);
  pxCircle(ctx, x + 4, gy - 44, 4, c3);
  pxCircle(ctx, x - 11, gy - 35, 3, c3);
  pxCircle(ctx, x + 10, gy - 35, 3, c3);
  pxCircle(ctx, x, gy - 46, 4, c3);
}

// ---------- Torii estilizado (pilares atrás, vigas na frente) ----------
function drawToriiBack(ctx, x, gy) {
  x = Math.round(x);
  // Pilares com volume cilíndrico (sombra, vermelho vivo e luz)
  for (const px of [x - 15, x + 11]) {
    ctx.fillStyle = '#7f1d1d'; ctx.fillRect(px, gy - 40, 4, 40);
    ctx.fillStyle = '#dc2626'; ctx.fillRect(px + 1, gy - 40, 2, 40);
    ctx.fillStyle = '#f87171'; ctx.fillRect(px + 1, gy - 40, 1, 36);
    // Pedestal de pedra
    ctx.fillStyle = '#475569'; ctx.fillRect(px - 1, gy - 5, 6, 5);
    ctx.fillStyle = '#64748b'; ctx.fillRect(px, gy - 5, 4, 4);
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(px, gy - 5, 2, 1);
  }
}

function drawToriiFront(ctx, x, gy) {
  x = Math.round(x);
  // Viga inferior (Nuki)
  ctx.fillStyle = '#991b1b'; ctx.fillRect(x - 19, gy - 33, 38, 3);
  ctx.fillStyle = '#dc2626'; ctx.fillRect(x - 19, gy - 33, 38, 2);
  // Viga superior curvada (Kasagi)
  ctx.fillStyle = '#7f1d1d'; ctx.fillRect(x - 21, gy - 40, 42, 4);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(x - 21, gy - 40, 42, 2);
  // Telhadinho escuro do Torii com pontas arrebitadas
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 22, gy - 42, 44, 2);
  ctx.fillRect(x - 24, gy - 43, 4, 2);
  ctx.fillRect(x + 20, gy - 43, 4, 2);
  // Plaqueta central dourada
  ctx.fillStyle = '#7f1d1d'; ctx.fillRect(x - 2, gy - 37, 4, 5);
  ctx.fillStyle = '#facc15'; ctx.fillRect(x - 1, gy - 36, 2, 3);
}

// ---------- Castelo Japonês de Assaí estilizado (com brilho quente nas janelas e sombreamento 16-bit) ----------
function drawCastle(ctx, x, gy, night, frame) {
  x = Math.round(x);
  const wall = night ? '#d8e0ed' : '#f8fafc';
  const wallMid = night ? '#b8c4d9' : '#e2e8f0';
  const wallS = night ? '#8e9db8' : '#cbd5e1';
  const roof = night ? '#2c3a57' : '#5b6b82';
  const roofD = night ? '#162038' : '#334155';
  const roofL = night ? '#495d82' : '#8596ad';
  const gableFill = night ? '#495d82' : '#94a3b8';

  // Duas torres de antena metálicas à direita (como na imagem de referência!)
  const drawTower = (tx, th) => {
    ctx.fillStyle = night ? '#3b4a68' : '#7b8794';
    ctx.fillRect(tx, gy - th, 1, th);
    ctx.fillRect(tx + 6, gy - th, 1, th);
    for (let k = 0; k < th; k += 6) {
      ctx.fillRect(tx, gy - th + k, 7, 1);
      for (let d = 0; d < 6; d++) ctx.fillRect(tx + d, gy - th + k + d, 1, 1);
    }
    const blink = Math.floor(frame / 28) % 2 === 0;
    ctx.fillStyle = blink ? '#ef4444' : '#991b1b';
    ctx.fillRect(tx + 2, gy - th - 2, 3, 2);
  };
  drawTower(x + 106, 108);
  drawTower(x + 118, 66);

  // Base de pedra escura chanfrada com textura de blocos e escadaria central
  ctx.fillStyle = night ? '#2d2a32' : '#57534e';
  ctx.fillRect(x - 4, gy - 15, 108, 15);
  ctx.fillStyle = night ? '#3e3a45' : '#6e6862';
  ctx.fillRect(x - 2, gy - 14, 104, 13);
  for (let r = 0; r < 4; r++) {
    ctx.fillStyle = night ? '#1c1a21' : '#3f3b37';
    ctx.fillRect(x - 3, gy - 15 + r * 4, 106, 1);
    for (let c = (r % 2) * 5; c < 104; c += 10) {
      ctx.fillRect(x - 2 + c, gy - 14 + r * 4, 1, 3);
      ctx.fillStyle = night ? '#524d5c' : '#857d76';
      ctx.fillRect(x + c, gy - 13 + r * 4, 3, 1);
      ctx.fillStyle = night ? '#1c1a21' : '#3f3b37';
    }
  }
  // Muretinhas e escadaria central na base
  ctx.fillStyle = night ? '#4b4754' : '#78716c';
  ctx.fillRect(x + 24, gy - 14, 18, 8);
  ctx.fillRect(x + 58, gy - 14, 18, 8);
  ctx.fillStyle = night ? '#635e6e' : '#948d86';
  ctx.fillRect(x + 24, gy - 14, 18, 2);
  ctx.fillRect(x + 58, gy - 14, 18, 2);
  // Degraus centrais
  for (let s = 0; s < 4; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#3e3a45' : '#26232b';
    ctx.fillRect(x + 42 - s, gy - 12 + s * 3, 16 + s * 2, 3);
  }

  // Função para desenhar janela iluminada com halo quente à noite
  const drawWin = (wx, wy, ww, wh) => {
    if (night) {
      ctx.fillStyle = 'rgba(255, 200, 70, 0.25)';
      ctx.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(wx - 1, wy - 1, ww + 2, wh + 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(wx, wy, ww, wh);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(wx, wy, Math.max(1, ww - 1), Math.max(1, wh - 2));
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(wx - 1, wy - 1, ww + 2, wh + 2);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(wx, wy, ww, wh);
    }
  };

  // 1º Andar (parede branca larga com sombreamento lateral e sob o beiral)
  ctx.fillStyle = wall; ctx.fillRect(x + 2, gy - 38, 96, 23);
  ctx.fillStyle = wallMid; ctx.fillRect(x + 2, gy - 38, 96, 3); ctx.fillRect(x + 86, gy - 38, 12, 23);
  ctx.fillStyle = wallS; ctx.fillRect(x + 2, gy - 38, 96, 1); ctx.fillRect(x + 92, gy - 38, 6, 23);

  // 6 janelas iluminadas alinhadas no 1º andar
  for (const wx of [11, 25, 39, 58, 72, 86]) {
    drawWin(x + wx, gy - 32, 3, 6);
  }

  // Porta dupla de madeira no centro do 1º andar
  ctx.fillStyle = '#29170b'; ctx.fillRect(x + 44, gy - 25, 12, 11);
  ctx.fillStyle = '#63371a'; ctx.fillRect(x + 45, gy - 24, 5, 10); ctx.fillRect(x + 51, gy - 24, 4, 10);
  ctx.fillStyle = '#7c4724'; ctx.fillRect(x + 46, gy - 23, 3, 8); ctx.fillRect(x + 51, gy - 23, 3, 8);

  // Telhado do 1º Andar (em camadas azul-marinho escuro)
  ctx.fillStyle = roofD;
  ctx.fillRect(x - 7, gy - 41, 114, 3);
  ctx.fillRect(x - 9, gy - 42, 4, 2); ctx.fillRect(x + 105, gy - 42, 4, 2);
  ctx.fillStyle = roof;
  ctx.fillRect(x - 5, gy - 43, 110, 2);
  ctx.fillRect(x - 2, gy - 45, 104, 2);
  ctx.fillStyle = roofL;
  ctx.fillRect(x - 5, gy - 43, 110, 1);

  // 2º Andar
  ctx.fillStyle = wall; ctx.fillRect(x + 12, gy - 58, 76, 13);
  ctx.fillStyle = wallMid; ctx.fillRect(x + 12, gy - 58, 76, 2); ctx.fillRect(x + 78, gy - 58, 10, 13);

  // 2 frontões triangulares (Chidori-hafu) no 2º andar
  for (const gx of [x + 26, x + 74]) {
    pxTri(ctx, gx, gy - 54, 11, roofD);
    pxTri(ctx, gx, gy - 52, 9, '#ffffff');
    pxTri(ctx, gx, gy - 50, 7, gableFill);
  }
  // Janelas do 2º andar: 2 juntas no centro (entre os frontões) + 1 em cada lateral
  drawWin(x + 44, gy - 53, 3, 5);
  drawWin(x + 52, gy - 53, 3, 5);
  drawWin(x + 15, gy - 53, 2, 5);
  drawWin(x + 82, gy - 53, 2, 5);

  // Telhado do 2º Andar
  ctx.fillStyle = roofD;
  ctx.fillRect(x + 3, gy - 61, 94, 3);
  ctx.fillRect(x + 1, gy - 62, 4, 2); ctx.fillRect(x + 95, gy - 62, 4, 2);
  ctx.fillStyle = roof;
  ctx.fillRect(x + 6, gy - 63, 88, 2);
  ctx.fillRect(x + 10, gy - 65, 80, 2);
  ctx.fillStyle = roofL;
  ctx.fillRect(x + 6, gy - 63, 88, 1);

  // 3º Andar (topo)
  ctx.fillStyle = wall; ctx.fillRect(x + 22, gy - 77, 56, 12);
  ctx.fillStyle = wallMid; ctx.fillRect(x + 22, gy - 77, 56, 2); ctx.fillRect(x + 70, gy - 77, 8, 12);

  // Janelas iluminadas do 3º andar (3 centrais + 1 em cada lateral, como no mockup!)
  drawWin(x + 27, gy - 73, 3, 5);
  drawWin(x + 42, gy - 74, 3, 6);
  drawWin(x + 48, gy - 74, 4, 6);
  drawWin(x + 55, gy - 74, 3, 6);
  drawWin(x + 70, gy - 73, 3, 5);

  // Grande telhado superior (Irimoya) com frontão triangular branco e azul-acinzentado
  ctx.fillStyle = roofD;
  ctx.fillRect(x + 13, gy - 80, 74, 3);
  ctx.fillRect(x + 11, gy - 81, 4, 2); ctx.fillRect(x + 85, gy - 81, 4, 2);
  ctx.fillStyle = roof;
  ctx.fillRect(x + 16, gy - 82, 68, 2);
  pxTri(ctx, x + 50, gy - 96, 16, roofD);
  pxTri(ctx, x + 50, gy - 94, 14, '#ffffff');
  pxTri(ctx, x + 50, gy - 92, 11, gableFill);
  ctx.fillStyle = roofL;
  ctx.fillRect(x + 49, gy - 98, 2, 2);
}

// ---------- Galho de cerejeira rico para os cantos da tela inicial ----------
function drawSakuraBranch(ctx, W, flip) {
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(flip ? W - x - w : x, y, w, h); };
  const C = (cx, cy, r, c) => { pxCircle(ctx, flip ? W - cx : cx, cy, r, c); };

  // Galhos de madeira mais claros e grossos (bem visíveis contra o céu noturno)
  R(0, 3, 86, 6, '#3a1d33'); R(0, 4, 84, 4, '#7a4a62'); R(0, 4, 84, 1, '#a8708a');
  R(42, 9, 40, 4, '#3a1d33'); R(43, 10, 38, 2, '#7a4a62');
  R(68, 11, 30, 3, '#3a1d33'); R(69, 12, 28, 1, '#7a4a62');
  R(14, 9, 5, 32, '#3a1d33'); R(15, 9, 3, 30, '#7a4a62'); R(15, 9, 1, 30, '#a8708a');
  R(52, 12, 4, 26, '#3a1d33'); R(53, 12, 2, 24, '#7a4a62');

  // Clusters arredondados de flores de cerejeira, mais vivos e luminosos
  const clusters = [
    [10, 10, 9], [27, 6, 8], [43, 12, 8], [61, 8, 8], [79, 13, 8], [94, 15, 7],
    [16, 26, 9], [33, 20, 7], [53, 29, 8], [69, 22, 7], [8, 42, 8], [25, 38, 7], [47, 40, 6],
  ];
  for (const [bx, by, br] of clusters) {
    C(bx, by + 1, br, '#c73a82');
    C(bx, by, br - 1, '#ff6fb0');
    C(bx - 1, by - 1, Math.max(2, br - 2), '#ff9ccb');
    C(bx - 2, by - 2, Math.max(1, br - 4), '#ffe0f0');
    // miolo dourado das flores
    ctx.fillStyle = '#ffd84d';
    ctx.fillRect((flip ? W - bx : bx) + 2, by + 2, 1, 1);
  }
}
