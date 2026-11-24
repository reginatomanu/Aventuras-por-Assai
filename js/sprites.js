// Gerador de Sprites em Pixel Art para "Made In Assaí"

const PALETTE = {
  '.': null,
  'K': '#111827', // Contorno / Cabelo preto / Sapatilha
  'S': '#fccba6', // Pele clara
  's': '#e29e73', // Sombra pele / Boca
  'C': '#f87171', // Bochecha rosada
  'R': '#dc2626', // Vermelho
  'r': '#991b1b', // Vermelho escuro
  'B': '#3b82f6', // Azul jeans / Vestido
  'b': '#2563eb', // Azul sombra
  'L': '#60a5fa', // Azul claro detalhe
  'Y': '#facc15', // Amarelo (camiseta Sora / flor e cinto Riku)
  'y': '#ca8a04', // Amarelo sombra / fivela
  'W': '#ffffff', // Branco (meias / brilho)
  'D': '#78350f', // Marrom (sapatos Sora)
  'd': '#451a03', // Marrom escuro
  'M': '#94a3b8', // Cinza metálico
};

// SORA (Masculino - 16x20, inspirado na referência: cabelo preto, camiseta amarela, macacão azul, sapato marrom)
const SORA_IDLE = [
  '....K.KKKK.K....',
  '...KKKKKKKKKK...',
  '..KKKKKKKKKKKK..',
  '..KKKSSSSSSKKK..',
  '..KKSSKSSKSSKK..',
  '..KKSSKSSKSSKK..',
  '...KSSSSSSSSK...',
  '....KSSssSSK....',
  '....KKKKKKKK....',
  '..KKYKBYYBKYKK..',
  '.KYYYKBBBBKYYYK.',
  '.KSYKBBLBBBKYSK.',
  '.KSSKBBBBBBKSSK.',
  '..KKKBBBBBBKKK..',
  '....KBBKKBBK....',
  '....KBBKKBBK....',
  '....KLLKKLLK....',
  '...KDDDKKDDDK...',
  '...KKKKKKKKKK...',
  '................',
];

const SORA_WALK = [
  '....K.KKKK.K....',
  '...KKKKKKKKKK...',
  '..KKKKKKKKKKKK..',
  '..KKKSSSSSSKKK..',
  '..KKSSKSSKSSKK..',
  '..KKSSKSSKSSKK..',
  '...KSSSSSSSSK...',
  '....KSSssSSK....',
  '....KKKKKKKK....',
  '..KKYKBYYBKYKK..',
  '.KYYYKBBBBKYYYK.',
  '.KSSKBBLBBBKSSK.',
  '..KKKBBBBBBKKK..',
  '....KBBBBBBK....',
  '...KBBK..KBBK...',
  '..KLLK....KLLK..',
  '..KDDK....KDDK..',
  '..KKKK....KKKK..',
  '................',
  '................',
];

const SORA_JUMP = [
  '....K.KKKK.K....',
  '...KKKKKKKKKK...',
  '..KKKKKKKKKKKK..',
  '..KKKSSSSSSKKK..',
  '..KKSSKSSKSSKK..',
  '..KKSSKSSKSSKK..',
  '...KSSSSSSSSK...',
  '....KSSssSSK..K.',
  '...KKKKKKKKKKSK.',
  '.KKYYKBYYBKYYK..',
  'KSSYYKBBBBKKK...',
  '.KKKKBBLBBBK....',
  '....KBBBBBBK....',
  '...KBBK..KBBK...',
  '..KLLK....KLLK..',
  '..KDDK....KDDK..',
  '..KKKK....KKKK..',
  '................',
  '................',
  '................',
];

// RIKU (Feminina - 16x20, inspirada na referência: cabelo preto c/ flor amarela, vestido azul, cinto amarelo, meias brancas)
const RIKU_IDLE = [
  '....KKKKKKKK....',
  '...KKKKKKKYYK...',
  '..KKKKKKKKYyYK..',
  '..KKKKSSSSKKYK..',
  '..KKKSKSSKSKKK..',
  '..KKKSKSSKSKKK..',
  '..KKKCSSSSCKKK..',
  '..KKKKSssSKKKK..',
  '...KKKKKKKKKK...',
  '..KKBBBBBBBBKK..',
  '.KBBKBBBBBBKBBK.',
  '.KSSKYYyKYYKSSK.',
  '.KSSKBBBBBBKSSK.',
  '..KKBBBBBBBBKK..',
  '...KBBBBBBBBK...',
  '....KSSKKSSK....',
  '....KWWKKWWK....',
  '...KKKKKKWKKK...',
  '...KKKKKKKKKK...',
  '................',
];

const RIKU_WALK = [
  '....KKKKKKKK....',
  '...KKKKKKKYYK...',
  '..KKKKKKKKYyYK..',
  '..KKKKSSSSKKYK..',
  '..KKKSKSSKSKKK..',
  '..KKKSKSSKSKKK..',
  '..KKKCSSSSCKKK..',
  '..KKKKSssSKKKK..',
  '...KKKKKKKKKK...',
  '..KKBBBBBBBBKK..',
  '.KBBKBBBBBBKBBK.',
  '.KSSKYYyKYYKSSK.',
  '..KKKBBBBBBKKK..',
  '...KBBBBBBBBK...',
  '..KBBBBBBBBBBK..',
  '...KSSK..KSSK...',
  '..KWWK....KWWK..',
  '..KKKK....KKKK..',
  '................',
  '................',
];

const RIKU_JUMP = [
  '....KKKKKKKK....',
  '...KKKKKKKYYK...',
  '..KKKKKKKKYyYK..',
  '..KKKKSSSSKKYK..',
  '..KKKSKSSKSKKK..',
  '..KKKSKSSKSKKK..',
  '..KKKCSSSSCKKK..',
  '..KKKKSssSKKKK..',
  '...KKKKKKKKKK.K.',
  '.KKBBBBBBBBBBKSK',
  'KSSKBBBBBBBBKKK.',
  '.KKKYYyKYYK.....',
  '...KBBBBBBBBK...',
  '..KBBBBBBBBBBK..',
  '...KSSK..KSSK...',
  '..KWWK....KWWK..',
  '..KKKK....KKKK..',
  '................',
  '................',
  '................',
];

// Inimigo (Drone/Besouro Pixelado 12x10)
const ENEMY_1 = [
  '....KKKK....',
  '..KKMMMMKK..',
  '.KMMWWWWMMK.',
  'KMWKMMMMKWMK',
  'KMMMMMMMMMMK',
  'KRRRRRRRRRRK',
  '.KKKKKKKKKK.',
  '..KK....KK..',
  '.KK......KK.',
  '............',
];

const ENEMY_2 = [
  '....KKKK....',
  '..KKMMMMKK..',
  '.KMMWWWWMMK.',
  'KMWKMMMMKWMK',
  'KMMMMMMMMMMK',
  'KYYYYYYYYYYK',
  '.KKKKKKKKKK.',
  '...KK..KK...',
  '..KK....KK..',
  '............',
];

function drawPixelMatrix(ctx, matrix, x, y, scale, flipX = false) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = matrix[r][c];
      const color = PALETTE[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      const drawX = flipX ? x + (cols - 1 - c) * scale : x + c * scale;
      ctx.fillRect(Math.floor(drawX), Math.floor(y + r * scale), scale, scale);
    }
  }
}

// Renderiza preview dos personagens no menu
function renderCharacterPreviews() {
  const maleCanvas = document.getElementById('preview-male');
  const femaleCanvas = document.getElementById('preview-female');
  if (maleCanvas) {
    const mCtx = maleCanvas.getContext('2d');
    mCtx.imageSmoothingEnabled = false;
    mCtx.clearRect(0, 0, maleCanvas.width, maleCanvas.height);
    drawPixelMatrix(mCtx, SORA_IDLE, 0, 2, 4, false);
  }
  if (femaleCanvas) {
    const fCtx = femaleCanvas.getContext('2d');
    fCtx.imageSmoothingEnabled = false;
    fCtx.clearRect(0, 0, femaleCanvas.width, femaleCanvas.height);
    drawPixelMatrix(fCtx, RIKU_IDLE, 0, 2, 4, false);
  }
}

// Renderiza avatar na caixa de diálogo (quebra da 4ª parede)
function renderDialogueAvatar(character) {
  const avatarCanvas = document.getElementById('dialogue-avatar');
  if (!avatarCanvas) return;
  const aCtx = avatarCanvas.getContext('2d');
  aCtx.imageSmoothingEnabled = false;
  aCtx.clearRect(0, 0, avatarCanvas.width, avatarCanvas.height);
  const sprite = character === 'male' ? SORA_IDLE : RIKU_IDLE;
  drawPixelMatrix(aCtx, sprite, 0, 2, 4, false);
}

// Desenha a Lanterna Japonesa (Chōchin) em Pixel Art no lugar do bloco "?"
// Quando o personagem bate a cabeça (lit = true), ela acende e brilha forte!
function drawJapaneseLantern(ctx, x, y, w, h, lit, frameCount) {
  ctx.save();
  const cx = Math.floor(x + w / 2);
  const bob = Math.round(Math.sin(frameCount * 0.08 + x) * (lit ? 1.5 : 1));
  const topY = Math.floor(y + bob);

  if (lit) {
    // Halo de luz quente pulsante ao redor da lanterna acesa
    const pulse = 1 + Math.sin(frameCount * 0.18 + x) * 0.12;
    const radius = 38 * pulse;
    const grad = ctx.createRadialGradient(cx, topY + 18, 4, cx, topY + 18, radius);
    grad.addColorStop(0, 'rgba(255, 245, 157, 0.85)');
    grad.addColorStop(0.45, 'rgba(251, 146, 60, 0.45)');
    grad.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, topY + 18, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cordinha/suporte superior
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(cx - 1, topY - 4, 2, 5);

  // Tampa superior (madeira escura / preto)
  ctx.fillStyle = '#111827';
  ctx.fillRect(cx - 7, topY + 1, 14, 4);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(cx - 5, topY + 2, 10, 2);

  // Contorno externo do corpo oval da lanterna
  ctx.fillStyle = '#111827';
  ctx.fillRect(cx - 11, topY + 5, 22, 22);
  ctx.fillRect(cx - 13, topY + 8, 26, 16);

  if (!lit) {
    // Lanterna apagada (vermelho escuro fosco)
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(cx - 9, topY + 7, 18, 18);
    ctx.fillRect(cx - 11, topY + 9, 22, 14);
    // Sombra/reflexo sutil
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(cx - 6, topY + 8, 12, 16);
    // Gomos horizontais da lanterna
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(cx - 11, topY + 12, 22, 2);
    ctx.fillRect(cx - 11, topY + 18, 22, 2);
  } else {
    // Lanterna ACESA (vermelho/laranja vibrante + núcleo amarelo brilhante!)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 9, topY + 7, 18, 18);
    ctx.fillRect(cx - 11, topY + 9, 22, 14);
    // Camada laranja quente
    ctx.fillStyle = '#fb923c';
    ctx.fillRect(cx - 7, topY + 8, 14, 16);
    // Núcleo luminoso amarelo/branco
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx - 4, topY + 10, 8, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 2, topY + 13, 4, 6);
    // Gomos horizontais iluminados
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(cx - 11, topY + 12, 22, 1);
    ctx.fillRect(cx - 11, topY + 19, 22, 1);
  }

  // Base inferior da lanterna
  ctx.fillStyle = '#111827';
  ctx.fillRect(cx - 7, topY + 27, 14, 4);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(cx - 5, topY + 28, 10, 2);

  // Borla (tassel) pendurada embaixo
  ctx.fillStyle = lit ? '#facc15' : '#b45309';
  ctx.fillRect(cx - 2, topY + 31, 4, 5);
  ctx.fillStyle = lit ? '#fef08a' : '#78350f';
  ctx.fillRect(cx - 1, topY + 35, 2, 3);

  ctx.restore();
}

// Desenha o Castelo Japonês de Assaí em Pixel Art (baseado nas fotos reais)
// nightMode = true deixa o castelo iluminado pelo luar com janelas acesas (Tela Inicial e Fase 3)
function drawJapaneseCastle(ctx, x, y, scale = 1, nightMode = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const wallColor = nightMode ? '#cbd5e1' : '#f8fafc';
  const wallShade = nightMode ? '#94a3b8' : '#e2e8f0';
  const roofMain = nightMode ? '#334155' : '#64748b';
  const roofDark = nightMode ? '#1e293b' : '#475569';
  const roofHighlight = nightMode ? '#475569' : '#94a3b8';
  const stoneBase = nightMode ? '#27272a' : '#57534e';
  const stoneBrick = nightMode ? '#18181b' : '#44403c';
  const windowColor = nightMode ? '#fde047' : '#1e293b';

  // Torre de antena ao lado esquerdo (característica real das fotos de Assaí)
  ctx.strokeStyle = nightMode ? '#475569' : '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-36, 128);
  ctx.lineTo(-28, -32);
  ctx.lineTo(-20, 128);
  ctx.moveTo(-34, 86);
  ctx.lineTo(-22, 86);
  ctx.moveTo(-32, 44);
  ctx.lineTo(-24, 44);
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-30, -36, 4, 4);

  // Base de pedra escura (muralha de pedras realista em pixel art)
  ctx.fillStyle = stoneBase;
  ctx.fillRect(-4, 102, 188, 32);
  ctx.fillStyle = stoneBrick;
  for (let bx = 0; bx < 180; bx += 14) {
    ctx.fillRect(bx, 105, 11, 6);
    ctx.fillRect(bx + 6, 114, 11, 6);
    ctx.fillRect(bx + 2, 123, 11, 6);
  }
  ctx.fillStyle = nightMode ? '#3f3f46' : '#78716c';
  for (let bx = 3; bx < 176; bx += 28) {
    ctx.fillRect(bx, 106, 5, 3);
    ctx.fillRect(bx + 12, 115, 5, 3);
  }

  // 1º Andar (parede branca larga)
  ctx.fillStyle = wallColor;
  ctx.fillRect(4, 64, 172, 38);
  ctx.fillStyle = wallShade;
  ctx.fillRect(4, 64, 172, 4);
  ctx.fillRect(164, 64, 12, 38);

  // Janelas verticais estreitas (acesas à noite!)
  ctx.fillStyle = windowColor;
  for (let wx = 16; wx < 168; wx += 18) {
    ctx.fillRect(wx, 72, 4, 10);
  }
  // Porta de entrada
  ctx.fillStyle = '#451a03';
  ctx.fillRect(82, 84, 16, 18);
  if (nightMode) {
    ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
    ctx.fillRect(85, 86, 10, 14);
  }

  // Telhado 1º Andar (curvado estilo japonês)
  ctx.fillStyle = roofMain;
  ctx.fillRect(-8, 56, 196, 8);
  ctx.fillStyle = roofDark;
  ctx.fillRect(-12, 54, 204, 4);
  ctx.fillStyle = roofHighlight;
  ctx.fillRect(-6, 58, 192, 2);
  // Pontas arrebitadas
  ctx.fillStyle = roofDark;
  ctx.fillRect(-14, 51, 6, 4);
  ctx.fillRect(188, 51, 6, 4);

  // Frontões triangulares
  ctx.fillStyle = wallColor;
  ctx.beginPath();
  ctx.moveTo(26, 56); ctx.lineTo(42, 42); ctx.lineTo(58, 56); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(122, 56); ctx.lineTo(138, 42); ctx.lineTo(154, 56); ctx.fill();
  ctx.strokeStyle = roofDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(26, 56); ctx.lineTo(42, 42); ctx.lineTo(58, 56);
  ctx.moveTo(122, 56); ctx.lineTo(138, 42); ctx.lineTo(154, 56);
  ctx.stroke();

  // 2º Andar
  ctx.fillStyle = wallColor;
  ctx.fillRect(22, 34, 136, 22);
  ctx.fillStyle = wallShade;
  ctx.fillRect(146, 34, 12, 22);
  ctx.fillStyle = windowColor;
  ctx.fillRect(68, 40, 6, 8);
  ctx.fillRect(80, 40, 6, 8);
  ctx.fillRect(106, 40, 6, 8);

  // Telhado 2º Andar
  ctx.fillStyle = roofMain;
  ctx.fillRect(10, 26, 160, 8);
  ctx.fillStyle = roofDark;
  ctx.fillRect(6, 24, 168, 4);
  ctx.fillRect(4, 21, 5, 4);
  ctx.fillRect(171, 21, 5, 4);

  // 3º Andar (topo)
  ctx.fillStyle = wallColor;
  ctx.fillRect(46, 6, 88, 20);
  ctx.fillStyle = wallShade;
  ctx.fillRect(124, 6, 10, 20);
  ctx.fillStyle = windowColor;
  ctx.fillRect(72, 12, 36, 6);

  // Telhado Superior
  ctx.fillStyle = roofDark;
  ctx.beginPath();
  ctx.moveTo(34, 8);
  ctx.lineTo(90, -18);
  ctx.lineTo(146, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = roofMain;
  ctx.beginPath();
  ctx.moveTo(42, 6);
  ctx.lineTo(90, -14);
  ctx.lineTo(138, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = roofHighlight;
  ctx.fillRect(87, -22, 6, 6);

  ctx.restore();
}

// Galhos de Cerejeira nos cantos da tela inicial (inspirado na referência RPG)
function drawSakuraCornerBranch(ctx, canvasWidth, flipX = false) {
  ctx.save();
  if (flipX) {
    ctx.translate(canvasWidth, 0);
    ctx.scale(-1, 1);
  }

  // Galho escuro pixelado
  ctx.fillStyle = '#1e1b2e';
  ctx.fillRect(0, 12, 150, 10);
  ctx.fillRect(60, 20, 120, 8);
  ctx.fillRect(130, 26, 75, 6);
  ctx.fillRect(30, 22, 10, 48);
  ctx.fillRect(95, 28, 8, 52);

  // Clusters de flores de cerejeira (rosa claro, médio e escuro)
  const clusters = [
    [22, 18], [52, 14], [86, 22], [122, 18], [160, 26], [195, 34],
    [35, 58], [68, 48], [102, 72], [140, 52], [15, 86], [80, 92],
  ];
  for (const [bx, by] of clusters) {
    ctx.fillStyle = '#9d174d';
    ctx.fillRect(bx - 12, by - 6, 24, 16);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(bx - 10, by - 10, 20, 16);
    ctx.fillRect(bx - 14, by - 4, 28, 10);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(bx - 6, by - 8, 10, 6);
    ctx.fillRect(bx + 2, by - 2, 6, 4);
  }

  ctx.restore();
}

// Desenha Árvore de Cerejeira (rosa) ou Ipê (amarelo/branco)
function drawTree(ctx, x, groundY, type = 'sakura') {
  // Tronco em pixel art
  ctx.fillStyle = '#5c3a21';
  ctx.fillRect(x - 6, groundY - 64, 12, 64);
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(x - 2, groundY - 64, 4, 64);
  // Galhos
  ctx.fillStyle = '#5c3a21';
  ctx.fillRect(x - 18, groundY - 56, 14, 6);
  ctx.fillRect(x + 4, groundY - 60, 14, 6);

  let mainColor, lightColor, darkColor;
  if (type === 'sakura') {
    mainColor = '#f472b6';
    lightColor = '#fbcfe8';
    darkColor = '#db2777';
  } else if (type === 'ipe-amarelo') {
    mainColor = '#facc15';
    lightColor = '#fef08a';
    darkColor = '#ca8a04';
  } else {
    // Ipê branco (como nas ruas de Assaí!)
    mainColor = '#f8fafc';
    lightColor = '#ffffff';
    darkColor = '#cbd5e1';
  }

  // Copa pixelada
  ctx.fillStyle = darkColor;
  ctx.fillRect(x - 36, groundY - 96, 72, 42);
  ctx.fillStyle = mainColor;
  ctx.fillRect(x - 32, groundY - 104, 64, 44);
  ctx.fillRect(x - 42, groundY - 88, 84, 28);
  ctx.fillStyle = lightColor;
  ctx.fillRect(x - 24, groundY - 108, 48, 16);
  ctx.fillRect(x - 34, groundY - 92, 20, 14);
  ctx.fillRect(x + 14, groundY - 90, 18, 12);
}

// Desenha Torii (parte de trás e parte da frente para o personagem passar POR BAIXO)
function drawToriiBack(ctx, x, groundY) {
  // Pilares laterais
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(x - 44, groundY - 110, 12, 110);
  ctx.fillRect(x + 32, groundY - 110, 12, 110);
  // Base dos pilares
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 48, groundY - 14, 20, 14);
  ctx.fillRect(x + 28, groundY - 14, 20, 14);
}

function drawToriiFront(ctx, x, groundY) {
  // Viga inferior (Nuki)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x - 56, groundY - 96, 112, 10);
  // Viga superior (Kasagi)
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x - 66, groundY - 122, 132, 14);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 68, groundY - 126, 136, 5);
  // Plaqueta central
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 10, groundY - 110, 20, 16);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x - 6, groundY - 106, 12, 8);
}
