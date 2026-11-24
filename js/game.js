// Motor do Jogo 2D "Made In Assaí" — 3 Fases + Lanternas Japonesas + RPG Intro

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// UI Elements
const menuScreen = document.getElementById('menu-screen');
const endScreen = document.getElementById('end-screen');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueSpeaker = document.getElementById('dialogue-speaker');
const dialogueText = document.getElementById('dialogue-text');
const dialogueAvatarImg = document.getElementById('dialogue-avatar-img');
const btnDialogueOk = document.getElementById('btn-dialogue-ok');
const stageBanner = document.getElementById('stage-banner');
const stageBannerSub = document.getElementById('stage-banner-sub');
const stageBannerTitle = document.getElementById('stage-banner-title');
const hud = document.getElementById('hud');
const hudScore = document.getElementById('hud-score');
const hudCoins = document.getElementById('hud-coins');
const hudWorld = document.getElementById('hud-world');
const hudLives = document.getElementById('hud-lives');
const endTitle = document.getElementById('end-title');
const endMessage = document.getElementById('end-message');
const finalScoreVal = document.getElementById('final-score-val');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const btnMenu = document.getElementById('btn-menu');
const btnMute = document.getElementById('btn-mute');
const selectMale = document.getElementById('select-male');
const selectFemale = document.getElementById('select-female');
const mobileControls = document.getElementById('mobile-controls');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnJump = document.getElementById('btn-jump');

const isTouchDevice = () =>
  'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 900;

function bindTouchControl(btn, keyCode) {
  if (!btn) return;
  const press = (e) => {
    e.preventDefault();
    keys[keyCode] = true;
    btn.classList.add('pressed');
  };
  const release = (e) => {
    e.preventDefault();
    keys[keyCode] = false;
    btn.classList.remove('pressed');
  };
  btn.addEventListener('pointerdown', press);
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointerleave', release);
  btn.addEventListener('pointercancel', release);
}

bindTouchControl(btnLeft, 'ArrowLeft');
bindTouchControl(btnRight, 'ArrowRight');
bindTouchControl(btnJump, 'Space');

function updateMobileControlsVisibility() {
  if (!mobileControls) return;
  if (gameState === 'playing' && isTouchDevice()) {
    mobileControls.classList.remove('hidden');
  } else {
    mobileControls.classList.add('hidden');
  }
}
window.addEventListener('resize', updateMobileControlsVisibility);

// Estado do jogo
let selectedCharacter = 'male'; // 'male' = Sora, 'female' = Riku
let gameState = 'menu'; // 'menu', 'intro', 'playing', 'won', 'gameover'
let currentStage = 1; // 1, 2 ou 3
let isMuted = false;
let animFrameId = null;
let typewriterTimer = null;
let stageBannerTimeout = null;

// Áudio retrô (Web Audio API)
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playTone(freq, duration, type = 'square', volume = 0.08) {
  if (isMuted) return;
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

const sfx = {
  jump: () => {
    playTone(320, 0.08, 'square');
    setTimeout(() => playTone(520, 0.12, 'square'), 50);
  },
  coin: () => {
    playTone(987, 0.07, 'square');
    setTimeout(() => playTone(1318, 0.15, 'square'), 65);
  },
  lantern: () => {
    playTone(659, 0.08, 'triangle', 0.12);
    setTimeout(() => playTone(880, 0.1, 'triangle', 0.12), 55);
    setTimeout(() => playTone(1318, 0.18, 'sine', 0.11), 115);
  },
  stomp: () => {
    playTone(220, 0.08, 'sawtooth');
    setTimeout(() => playTone(140, 0.1, 'sawtooth'), 50);
  },
  hurt: () => {
    playTone(180, 0.15, 'sawtooth');
    setTimeout(() => playTone(110, 0.25, 'sawtooth'), 120);
  },
  talk: () => {
    playTone(540, 0.06, 'square');
    setTimeout(() => playTone(680, 0.08, 'square'), 60);
  },
  stageClear: () => {
    const notes = [523, 659, 784];
    notes.forEach((n, i) => setTimeout(() => playTone(n, 0.14, 'square'), i * 100));
  },
  win: () => {
    const notes = [523, 659, 784, 1046, 1318];
    notes.forEach((n, i) => setTimeout(() => playTone(n, 0.18, 'square'), i * 110));
  },
};

// Controles
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
  if (gameState === 'intro' && (e.code === 'Space' || e.code === 'Enter')) {
    closeIntroDialogue();
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Seleção de Personagem (Sora e Riku)
selectMale.addEventListener('click', () => {
  selectedCharacter = 'male';
  selectMale.classList.add('selected');
  selectFemale.classList.remove('selected');
  playTone(660, 0.06);
});

selectFemale.addEventListener('click', () => {
  selectedCharacter = 'female';
  selectFemale.classList.add('selected');
  selectMale.classList.remove('selected');
  playTone(740, 0.06);
});

btnMute.addEventListener('click', () => {
  isMuted = !isMuted;
  btnMute.textContent = isMuted ? '🔇' : '🔊';
});

btnStart.addEventListener('click', () => startGame(true));
btnRestart.addEventListener('click', () => startGame(false));
btnDialogueOk.addEventListener('click', closeIntroDialogue);

btnMenu.addEventListener('click', () => {
  endScreen.classList.add('hidden');
  dialogueBox.classList.add('hidden');
  stageBanner.classList.add('hidden');
  hud.classList.add('hidden');
  menuScreen.classList.remove('hidden');
  gameState = 'menu';
  updateMobileControlsVisibility();
});

// Constantes do mundo
const GRAVITY = 0.55;
const GROUND_Y = 460;

// Estrelas fixas para a Tela Inicial e Fase 3 (Noite)
const STARS = Array.from({ length: 65 }, (_, i) => ({
  x: (i * 137) % 960,
  y: 18 + ((i * 89) % 240),
  size: i % 5 === 0 ? 3 : 2,
  phase: i * 0.7,
}));

// Definição das 3 Fases de Assaí
const STAGES = {
  1: {
    code: '1-1',
    name: 'AVENIDA DOS IPÊS',
    theme: 'day',
    worldWidth: 2800,
    goalX: 2560,
    hasCastle: false,
    platforms: [
      { x: 400, y: 360, w: 120, h: 24 },
      { x: 640, y: 290, w: 125, h: 24 },
      { x: 1000, y: 345, w: 130, h: 24, moveX: 70, speed: 0.03 },
      { x: 1420, y: 295, w: 130, h: 24 },
      { x: 1760, y: 340, w: 120, h: 24, moveY: 45, speed: 0.035 },
      { x: 2140, y: 290, w: 130, h: 24 },
    ],
    lanterns: [
      { x: 450, y: 235, w: 32, h: 36, lit: false },
      { x: 695, y: 175, w: 32, h: 36, lit: false },
      { x: 1085, y: 230, w: 32, h: 36, lit: false },
      { x: 1500, y: 180, w: 32, h: 36, lit: false },
      { x: 1945, y: 235, w: 32, h: 36, lit: false },
    ],
    collectibles: [
      { x: 300, y: 410 }, { x: 445, y: 320 }, { x: 485, y: 320 },
      { x: 685, y: 255 }, { x: 730, y: 255 }, { x: 920, y: 410 },
      { x: 1070, y: 310 }, { x: 1120, y: 310 }, { x: 1495, y: 260 },
      { x: 1930, y: 315 }, { x: 2255, y: 255 }, { x: 2420, y: 410 },
    ],
    enemies: [
      { x: 560, vx: -1.7, minX: 450, maxX: 780 },
      { x: 960, vx: 1.8, minX: 840, maxX: 1120 },
      { x: 1260, vx: -1.9, minX: 1100, maxX: 1450 },
      { x: 1720, vx: 1.8, minX: 1560, maxX: 1920 },
      { x: 2150, vx: -2.0, minX: 2000, maxX: 2400 },
    ],
    toriis: [250, 1320],
    trees: [
      { x: 150, type: 'sakura' }, { x: 370, type: 'ipe-branco' },
      { x: 610, type: 'ipe-amarelo' }, { x: 860, type: 'sakura' },
      { x: 1040, type: 'ipe-branco' }, { x: 1230, type: 'sakura' },
      { x: 1540, type: 'ipe-amarelo' }, { x: 1800, type: 'ipe-branco' },
      { x: 2100, type: 'sakura' }, { x: 2380, type: 'ipe-amarelo' },
    ],
  },
  2: {
    code: '1-2',
    name: 'PARQUE IKEDA',
    theme: 'sunset',
    hasLake: true,
    worldWidth: 3000,
    goalX: 2740,
    hasCastle: false,
    platforms: [
      { x: 360, y: 360, w: 115, h: 24 },
      { x: 560, y: 290, w: 115, h: 24, moveX: 65, speed: 0.032 },
      { x: 800, y: 235, w: 120, h: 24 },
      { x: 1100, y: 345, w: 120, h: 24, moveY: 50, speed: 0.038 },
      { x: 1380, y: 270, w: 125, h: 24 },
      { x: 1700, y: 335, w: 130, h: 24, moveX: 85, speed: 0.035 },
      { x: 2040, y: 265, w: 125, h: 24, moveY: 45, speed: 0.04 },
      { x: 2350, y: 330, w: 135, h: 24 },
    ],
    lanterns: [
      { x: 405, y: 240, w: 32, h: 36, lit: false },
      { x: 830, y: 120, w: 32, h: 36, lit: false },
      { x: 1175, y: 225, w: 32, h: 36, lit: false },
      { x: 1430, y: 155, w: 32, h: 36, lit: false },
      { x: 1805, y: 220, w: 32, h: 36, lit: false },
      { x: 2095, y: 150, w: 32, h: 36, lit: false },
    ],
    collectibles: [
      { x: 280, y: 410 }, { x: 405, y: 320 }, { x: 605, y: 245 },
      { x: 830, y: 195 }, { x: 1170, y: 305 }, { x: 1430, y: 230 },
      { x: 1790, y: 300 }, { x: 1840, y: 300 }, { x: 2095, y: 225 },
      { x: 2405, y: 290 }, { x: 2600, y: 410 },
    ],
    enemies: [
      { x: 520, vx: -1.8, minX: 400, maxX: 720 },
      { x: 980, vx: 1.9, minX: 880, maxX: 1220 },
      { x: 1560, vx: -2.0, minX: 1420, maxX: 1780 },
      { x: 2000, vx: -2.1, minX: 1880, maxX: 2240 },
      { x: 2460, vx: -2.0, minX: 2320, maxX: 2640 },
    ],
    toriis: [220, 1020, 1940],
    trees: [
      { x: 140, type: 'ipe-amarelo' }, { x: 460, type: 'sakura' },
      { x: 740, type: 'ipe-branco' }, { x: 1180, type: 'sakura' },
      { x: 1480, type: 'ipe-amarelo' }, { x: 1760, type: 'sakura' },
      { x: 2140, type: 'ipe-branco' }, { x: 2480, type: 'sakura' },
    ],
  },
  3: {
    code: '1-3',
    name: 'RUMO AO CASTELO JAPONÊS',
    theme: 'night',
    worldWidth: 3300,
    goalX: 2980,
    hasCastle: true, // SOMENTE no final da 3ª fase aparece o Castelo Japonês!
    platforms: [
      { x: 340, y: 365, w: 110, h: 24 },
      { x: 550, y: 290, w: 110, h: 24, moveX: 70, speed: 0.038 },
      { x: 820, y: 345, w: 115, h: 24, moveY: 50, speed: 0.04 },
      { x: 1080, y: 265, w: 120, h: 24 },
      { x: 1350, y: 340, w: 120, h: 24, moveX: 85, speed: 0.042 },
      { x: 1640, y: 260, w: 115, h: 24 },
      { x: 1900, y: 335, w: 125, h: 24, moveY: 55, speed: 0.042 },
      { x: 2200, y: 270, w: 120, h: 24, moveX: 80, speed: 0.04 },
      { x: 2520, y: 345, w: 125, h: 24 },
    ],
    lanterns: [
      { x: 385, y: 245, w: 32, h: 36, lit: false },
      { x: 605, y: 170, w: 32, h: 36, lit: false },
      { x: 870, y: 225, w: 32, h: 36, lit: false },
      { x: 1130, y: 150, w: 32, h: 36, lit: false },
      { x: 1415, y: 220, w: 32, h: 36, lit: false },
      { x: 1690, y: 145, w: 32, h: 36, lit: false },
      { x: 1980, y: 220, w: 32, h: 36, lit: false },
      { x: 2275, y: 155, w: 32, h: 36, lit: false },
      { x: 2575, y: 225, w: 32, h: 36, lit: false },
    ],
    collectibles: [
      { x: 260, y: 410 }, { x: 385, y: 325 }, { x: 605, y: 250 },
      { x: 870, y: 305 }, { x: 1130, y: 225 }, { x: 1415, y: 300 },
      { x: 1690, y: 220 }, { x: 1980, y: 300 }, { x: 2275, y: 230 },
      { x: 2575, y: 305 }, { x: 2780, y: 410 }, { x: 2840, y: 410 },
    ],
    enemies: [
      { x: 480, vx: -2.2, minX: 360, maxX: 720 },
      { x: 860, vx: 2.3, minX: 740, maxX: 1120 },
      { x: 1280, vx: -2.4, minX: 1140, maxX: 1520 },
      { x: 1680, vx: 2.3, minX: 1540, maxX: 1920 },
      { x: 2080, vx: -2.5, minX: 1920, maxX: 2340 },
      { x: 2480, vx: 2.4, minX: 2340, maxX: 2720 },
      { x: 2780, vx: -2.3, minX: 2640, maxX: 2920 },
    ],
    toriis: [230, 1260, 2760],
    trees: [
      { x: 130, type: 'sakura' }, { x: 440, type: 'ipe-branco' },
      { x: 760, type: 'sakura' }, { x: 1120, type: 'ipe-amarelo' },
      { x: 1520, type: 'sakura' }, { x: 1860, type: 'ipe-branco' },
      { x: 2260, type: 'sakura' }, { x: 2620, type: 'ipe-amarelo' },
    ],
  },
};

let player, cameraX = 0, score = 0, coins = 0, lives = 3, frameCount = 0;
let worldWidth = 2800;
let goalX = 2560;
let platforms = [];
let lanterns = [];
let collectibles = [];
let enemies = [];
let toriis = [];
let trees = [];
let petals = [];
let lightParticles = [];

function spawnLanternLights(cx, cy, count = 18) {
  const colors = ['#ffffff', '#fef08a', '#facc15', '#fb923c', '#fda4af'];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const speed = 1.4 + Math.random() * 3.2;
    lightParticles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      life: 35 + Math.floor(Math.random() * 30),
      maxLife: 65,
      size: Math.random() > 0.4 ? 4 : 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function showStageBanner(code, name) {
  if (stageBannerTimeout) clearTimeout(stageBannerTimeout);
  stageBannerSub.textContent = `FASE ${code}`;
  stageBannerTitle.textContent = name;
  stageBanner.classList.remove('hidden');
  stageBannerTimeout = setTimeout(() => {
    stageBanner.classList.add('hidden');
  }, 2200);
}

function loadStage(stageNum, resetStats = false) {
  currentStage = stageNum;
  const cfg = STAGES[stageNum];
  worldWidth = cfg.worldWidth;
  goalX = cfg.goalX;
  cameraX = 0;
  lightParticles = [];

  if (resetStats) {
    score = 0;
    coins = 0;
    lives = 3;
  }

  player = {
    x: 80,
    y: GROUND_Y - 58,
    w: 44,
    h: 58,
    vx: 0,
    vy: 0,
    speed: 4.6,
    jumpForce: -12.8,
    onGround: false,
    facingRight: true,
    invincibleTimer: 0,
  };

  platforms = cfg.platforms.map((p) => ({
    ...p,
    baseX: p.x,
    baseY: p.y,
    dx: 0,
    dy: 0,
  }));
  lanterns = cfg.lanterns.map((l) => ({ ...l, lit: false }));
  collectibles = cfg.collectibles.map((c) => ({ ...c, collected: false }));
  enemies = cfg.enemies.map((e) => ({
    ...e,
    y: GROUND_Y - 30,
    w: 36,
    h: 30,
    alive: true,
  }));
  toriis = [...cfg.toriis];
  trees = cfg.trees.map((t) => ({ ...t }));

  if (petals.length === 0) {
    petals = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: -0.4 - Math.random() * 0.6,
      vy: 0.7 + Math.random() * 1.0,
      color: Math.random() > 0.35 ? '#fbcfe8' : '#fef08a',
      size: Math.random() > 0.5 ? 4 : 3,
    }));
  }

  updateHUD();
}

function updateHUD() {
  hudScore.textContent = String(score).padStart(5, '0');
  hudCoins.textContent = 'x' + String(coins).padStart(2, '0');
  hudWorld.textContent = STAGES[currentStage].code;
  hudLives.textContent = 'x' + String(lives).padStart(2, '0');
}

function showIntroDialogue() {
  const isSora = selectedCharacter === 'male';
  dialogueSpeaker.textContent = isSora ? 'SORA' : 'RIKU';
  dialogueSpeaker.style.background = isSora ? '#1d4ed8' : '#be185d';
  dialogueAvatarImg.src = isSora ? 'assets/portrait-sora.png' : 'assets/portrait-riku.png';

  const fullText = isSora
    ? 'Ei, você aí do outro lado da tela! Eu sou o Sora! Preciso atravessar 3 regiões de Assaí para chegar ao Castelo Japonês. Pode me ajudar nessa aventura?'
    : 'Oi, você aí olhando pra tela! Eu sou a Riku! Preciso da sua ajuda para atravessar as 3 fases por Assaí e chegar ao Castelo Japonês. Vamos juntos?';

  dialogueText.textContent = '';
  dialogueBox.classList.remove('hidden');
  sfx.talk();

  if (typewriterTimer) clearInterval(typewriterTimer);
  let idx = 0;
  typewriterTimer = setInterval(() => {
    idx++;
    dialogueText.textContent = fullText.slice(0, idx);
    if (idx >= fullText.length) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }
  }, 24);
}

function closeIntroDialogue() {
  if (gameState !== 'intro') return;
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
  dialogueBox.classList.add('hidden');
  gameState = 'playing';
  updateMobileControlsVisibility();
  playTone(784, 0.08);
  showStageBanner(STAGES[1].code, STAGES[1].name);
}

function startGame(withIntro = true) {
  loadStage(1, true);
  menuScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  hud.classList.remove('hidden');

  if (withIntro) {
    gameState = 'intro';
    updateMobileControlsVisibility();
    showIntroDialogue();
  } else {
    dialogueBox.classList.add('hidden');
    gameState = 'playing';
    updateMobileControlsVisibility();
    showStageBanner(STAGES[1].code, STAGES[1].name);
  }
}

function endGame(won) {
  const charName = selectedCharacter === 'male' ? 'Sora' : 'Riku';
  gameState = won ? 'won' : 'gameover';
  updateMobileControlsVisibility();
  stageBanner.classList.add('hidden');
  if (won) {
    sfx.win();
    endTitle.textContent = 'VITÓRIA!';
    endMessage.textContent = `Incrível! Você guiou ${charName} pelas 3 fases até o Castelo Japonês de Assaí!`;
  } else {
    endTitle.textContent = 'FIM DE JOGO';
    endMessage.textContent = `Não desista! Tente novamente ajudar ${charName} a chegar ao Castelo Japonês!`;
  }
  finalScoreVal.textContent = score;
  endScreen.classList.remove('hidden');
}

function updatePetals() {
  for (const pt of petals) {
    pt.x += pt.vx;
    pt.y += pt.vy;
    if (pt.y > GROUND_Y) {
      pt.y = -10;
      pt.x = Math.random() * canvas.width;
    }
    if (pt.x < 0) pt.x = canvas.width;
  }
}

function updateLightParticles() {
  for (let i = lightParticles.length - 1; i >= 0; i--) {
    const p = lightParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy -= 0.03; // Sobe suavemente como vaga-lume / luz mágica
    p.vx *= 0.97;
    p.life--;
    if (p.life <= 0) {
      lightParticles.splice(i, 1);
    }
  }

  // Lanternas já acesas soltam pequenas faíscas de luz continuamente
  if (frameCount % 16 === 0) {
    for (const l of lanterns) {
      if (l.lit) {
        lightParticles.push({
          x: l.x + l.w / 2 + (Math.random() - 0.5) * 18,
          y: l.y + 12 + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.6 - Math.random() * 0.7,
          life: 28,
          maxLife: 28,
          size: 3,
          color: Math.random() > 0.5 ? '#fef08a' : '#ffffff',
        });
      }
    }
  }
}

function update() {
  frameCount++;
  updatePetals();

  if (gameState !== 'playing') return;

  updateLightParticles();

  // Movimento horizontal
  if (keys['ArrowRight'] || keys['KeyD']) {
    player.vx = player.speed;
    player.facingRight = true;
  } else if (keys['ArrowLeft'] || keys['KeyA']) {
    player.vx = -player.speed;
    player.facingRight = false;
  } else {
    player.vx *= 0.75;
    if (Math.abs(player.vx) < 0.2) player.vx = 0;
  }

  // Pulo
  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.onGround) {
    player.vy = player.jumpForce;
    player.onGround = false;
    sfx.jump();
  }

  // Gravidade
  player.vy += GRAVITY;
  if (player.vy > 14) player.vy = 14;

  // Atualiza X
  player.x += player.vx;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > worldWidth) player.x = worldWidth - player.w;

  // Atualiza Y
  player.y += player.vy;
  player.onGround = false;

  // Colisão com o chão
  if (player.y + player.h >= GROUND_Y) {
    player.y = GROUND_Y - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  // Atualiza plataformas móveis
  for (const p of platforms) {
    const prevX = p.x;
    const prevY = p.y;
    if (p.moveX) {
      p.x = p.baseX + Math.sin(frameCount * (p.speed || 0.03)) * p.moveX;
    }
    if (p.moveY) {
      p.y = p.baseY + Math.sin(frameCount * (p.speed || 0.035)) * p.moveY;
    }
    p.dx = p.x - prevX;
    p.dy = p.y - prevY;
  }

  // Colisão com plataformas (acompanha plataformas móveis)
  for (const p of platforms) {
    if (
      player.vy >= 0 &&
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h >= p.y - 4 &&
      player.y + player.h <= p.y + p.h + 12
    ) {
      player.y = p.y - player.h;
      player.x += p.dx;
      player.vy = 0;
      player.onGround = true;
    }
  }

  // Colisão com Lanternas Japonesas (ao bater a cabeça, acende e solta luzes!)
  for (const l of lanterns) {
    if (
      player.x + player.w > l.x &&
      player.x < l.x + l.w &&
      player.y < l.y + l.h &&
      player.y + player.h > l.y
    ) {
      if (player.vy < 0 && player.y > l.y + l.h * 0.45) {
        player.y = l.y + l.h;
        player.vy = 1.5;
        if (!l.lit) {
          l.lit = true;
          coins++;
          score += 150;
          sfx.lantern();
          spawnLanternLights(l.x + l.w / 2, l.y + l.h / 2, 22);
          updateHUD();
        } else {
          // Mesmo já acesa, solta um punhado extra de faíscas se bater de novo
          spawnLanternLights(l.x + l.w / 2, l.y + l.h / 2, 8);
          playTone(880, 0.06, 'sine', 0.06);
        }
      } else if (player.vy >= 0 && player.y + player.h <= l.y + 14) {
        player.y = l.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    }
  }

  // Coletáveis (Flores de Sakura)
  for (const c of collectibles) {
    if (!c.collected) {
      const dx = player.x + player.w / 2 - c.x;
      const dy = player.y + player.h / 2 - c.y;
      if (Math.hypot(dx, dy) < 30) {
        c.collected = true;
        coins++;
        score += 50;
        sfx.coin();
        updateHUD();
      }
    }
  }

  // Inimigos
  if (player.invincibleTimer > 0) player.invincibleTimer--;

  for (const e of enemies) {
    if (!e.alive) continue;
    e.x += e.vx;
    if (e.x <= e.minX || e.x + e.w >= e.maxX) e.vx *= -1;

    if (
      player.x + player.w > e.x &&
      player.x < e.x + e.w &&
      player.y + player.h > e.y &&
      player.y < e.y + e.h
    ) {
      if (player.vy > 0 && player.y + player.h - player.vy <= e.y + 14) {
        e.alive = false;
        player.vy = -9;
        score += 200;
        sfx.stomp();
        updateHUD();
      } else if (player.invincibleTimer === 0) {
        lives--;
        sfx.hurt();
        updateHUD();
        if (lives <= 0) {
          endGame(false);
          return;
        }
        player.invincibleTimer = 90;
        player.vy = -7;
      }
    }
  }

  // Câmera
  cameraX = player.x - canvas.width * 0.35;
  if (cameraX < 0) cameraX = 0;
  if (cameraX > worldWidth - canvas.width) cameraX = worldWidth - canvas.width;

  // Fim de cada fase
  if (player.x >= goalX) {
    if (currentStage < 3) {
      score += 300;
      sfx.stageClear();
      loadStage(currentStage + 1, false);
      showStageBanner(STAGES[currentStage].code, STAGES[currentStage].name);
    } else {
      score += 1000;
      updateHUD();
      endGame(true);
    }
  }
}

// Céu noturno com lua cheia e estrelas (usado na Tela Inicial e na Fase 3)
function drawNightSkyAndMoon() {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGrad.addColorStop(0, '#091128');
  skyGrad.addColorStop(0.55, '#172a56');
  skyGrad.addColorStop(1, '#1e3a6d');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Estrelas piscando
  for (const st of STARS) {
    const alpha = 0.45 + Math.sin(frameCount * 0.05 + st.phase) * 0.45;
    ctx.fillStyle = `rgba(254, 249, 195, ${alpha.toFixed(2)})`;
    ctx.fillRect(st.x, st.y, st.size, st.size);
  }

  // Lua Cheia brilhando no canto superior direito
  const moonX = 810;
  const moonY = 92;
  const halo = ctx.createRadialGradient(moonX, moonY, 18, moonX, moonY, 84);
  halo.addColorStop(0, 'rgba(254, 249, 195, 0.45)');
  halo.addColorStop(1, 'rgba(254, 249, 195, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 84, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef9c3';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(moonX - 12, moonY - 8, 8, 6);
  ctx.fillRect(moonX + 6, moonY + 4, 10, 8);
}

// Cenário da Tela Inicial Estilo RPG Noturno com o Castelo Japonês real de Assaí
function drawMenuBackground() {
  drawNightSkyAndMoon();

  // Silhueta das colinas noturnas
  ctx.fillStyle = '#0f2147';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 40);
  ctx.quadraticCurveTo(220, 310, 480, 380);
  ctx.quadraticCurveTo(740, 290, 960, GROUND_Y + 40);
  ctx.fill();

  // Castelo Japonês real de Assaí imponente no fundo da tela inicial!
  drawJapaneseCastle(ctx, 290, 220, 2.05, true);

  // Galhos de cerejeira nos cantos superiores (inspirado na referência!)
  drawSakuraCornerBranch(ctx, canvas.width, false);
  drawSakuraCornerBranch(ctx, canvas.width, true);

  // Pétalas caindo
  for (const pt of petals) {
    ctx.fillStyle = pt.color;
    ctx.fillRect(Math.floor(pt.x), Math.floor(pt.y), pt.size, pt.size);
  }
}

// Portal Torii de transição entre Fase 1->2 e Fase 2->3
function drawStageGoalPortal(ctx, x, groundY, stageNum) {
  // Brilho mágico atrás do portal
  const pulse = 1 + Math.sin(frameCount * 0.1) * 0.1;
  const grad = ctx.createRadialGradient(x, groundY - 60, 10, x, groundY - 60, 75 * pulse);
  grad.addColorStop(0, 'rgba(250, 204, 21, 0.55)');
  grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, groundY - 60, 75 * pulse, 0, Math.PI * 2);
  ctx.fill();

  drawToriiBack(ctx, x, groundY);
  drawToriiFront(ctx, x, groundY);

  // Plaquinha indicando próxima fase
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 46, groundY - 154, 92, 22);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 46, groundY - 154, 92, 22);
  ctx.fillStyle = '#fef08a';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText(`FASE 1-${stageNum + 1} >`, x - 40, groundY - 140);
}

// Laguinho de fundo do Parque Ikeda (Assaí) — inspirado na foto real com ponte e Torii iluminado
function drawParqueIkedaLake() {
  const lakeTop = 378;
  const lakeHeight = GROUND_Y - lakeTop;
  const parallax = -(cameraX * 0.12) % 960;

  // Água do lago com gradiente refletindo o pôr do sol
  const waterGrad = ctx.createLinearGradient(0, lakeTop, 0, GROUND_Y);
  waterGrad.addColorStop(0, '#312e81');
  waterGrad.addColorStop(0.5, '#1e3a5f');
  waterGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, lakeTop, canvas.width, lakeHeight);

  // Ponte de Assaí sobre o lago (lado direito do lago)
  const bridgeX = 480 + parallax * 0.6;
  ctx.fillStyle = '#475569';
  ctx.fillRect(bridgeX, lakeTop - 16, 420, 6);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(bridgeX, lakeTop - 18, 420, 2);
  for (let px = 0; px < 420; px += 38) {
    // Pilastras da ponte
    ctx.fillStyle = '#334155';
    ctx.fillRect(bridgeX + px, lakeTop - 10, 6, 22);
    // Luzinhas refletidas na água
    ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.fillRect(bridgeX + px + 1, lakeTop - 15, 4, 3);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
    ctx.fillRect(bridgeX + px, lakeTop + 4, 6, 18);
  }

  // Torii Vermelho Iluminado no meio do Lago (cartão-postal do Parque Ikeda!)
  const toriiX = 330 + parallax * 0.6;
  const glow = ctx.createRadialGradient(toriiX, lakeTop - 12, 6, toriiX, lakeTop - 12, 72);
  glow.addColorStop(0, 'rgba(255, 87, 34, 0.65)');
  glow.addColorStop(1, 'rgba(255, 87, 34, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(toriiX, lakeTop - 12, 72, 0, Math.PI * 2);
  ctx.fill();

  // Estrutura do Torii no lago
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(toriiX - 24, lakeTop - 52, 7, 56);
  ctx.fillRect(toriiX + 17, lakeTop - 52, 7, 56);
  ctx.fillRect(toriiX - 34, lakeTop - 44, 68, 6);
  ctx.fillStyle = '#ff5722';
  ctx.fillRect(toriiX - 40, lakeTop - 58, 80, 9);

  // Reflexo vermelho tremulando na água
  for (let ry = 0; ry < 46; ry += 5) {
    const wave = Math.sin(frameCount * 0.08 + ry * 0.4) * 5;
    const alpha = Math.max(0.08, 0.55 - ry * 0.01);
    ctx.fillStyle = `rgba(255, 69, 58, ${alpha.toFixed(2)})`;
    ctx.fillRect(toriiX - 26 + wave, lakeTop + 4 + ry, 52 - ry * 0.4, 3);
  }

  // Ondinhas suaves na superfície do lago
  ctx.fillStyle = 'rgba(254, 215, 170, 0.28)';
  for (let i = 0; i < 16; i++) {
    const wx = ((i * 85 + frameCount * 0.4) % (canvas.width + 60)) - 30;
    const wy = lakeTop + 8 + (i % 5) * 14;
    ctx.fillRect(Math.floor(wx), wy, 26, 2);
  }
}

function draw() {
  if (gameState === 'menu') {
    drawMenuBackground();
    return;
  }

  const stageCfg = STAGES[currentStage];
  const isNight = stageCfg.theme === 'night';
  const isSunset = stageCfg.theme === 'sunset';

  // Céu de acordo com a fase (1: Dia, 2: Entardecer, 3: Noite)
  if (isNight) {
    drawNightSkyAndMoon();
  } else if (isSunset) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#312e81');
    skyGrad.addColorStop(0.45, '#db2777');
    skyGrad.addColorStop(0.85, '#fb923c');
    skyGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sol poente no horizonte
    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.beginPath();
    ctx.arc(760, 320, 48, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Nuvens (dia e entardecer)
  if (!isNight) {
    ctx.fillStyle = isSunset ? 'rgba(254, 215, 170, 0.65)' : 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 6; i++) {
      const cx = ((i * 260 - cameraX * 0.2) % (canvas.width + 200)) - 100;
      const cy = 65 + (i % 3) * 35;
      ctx.fillRect(cx, cy, 70, 20);
      ctx.fillRect(cx + 15, cy - 12, 40, 14);
    }
  }

  // Colinas distantes (SEM Castelo Japonês no meio do percurso!)
  ctx.fillStyle = isNight ? '#1e293b' : isSunset ? '#7c2d12' : '#86efac';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.quadraticCurveTo(260, 330, 560, GROUND_Y);
  ctx.quadraticCurveTo(800, 310, 1020, GROUND_Y);
  ctx.fill();

  ctx.fillStyle = isNight ? '#14532d' : isSunset ? '#166534' : '#4ade80';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.quadraticCurveTo(180, 360, 420, GROUND_Y);
  ctx.quadraticCurveTo(720, 340, 960, GROUND_Y);
  ctx.fill();

  // Laguinho do Parque Ikeda ao fundo na Fase 2
  if (stageCfg.hasLake) {
    drawParqueIkedaLake();
  }

  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  // Árvores de Cerejeira e Ipê
  for (const t of trees) {
    drawTree(ctx, t.x, GROUND_Y, t.type);
  }

  // Placa de Boas-vindas a Assaí no início da Fase 1
  if (currentStage === 1) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(42, GROUND_Y - 56, 8, 56);
    ctx.fillRect(118, GROUND_Y - 56, 8, 56);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(30, GROUND_Y - 78, 108, 34);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, GROUND_Y - 78, 108, 34);
    ctx.fillStyle = '#1e293b';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('BEM-VINDO', 44, GROUND_Y - 62);
    ctx.fillText('A ASSAÍ!', 50, GROUND_Y - 50);
  }

  // Toriis (parte de trás antes do jogador)
  for (const tx of toriis) {
    drawToriiBack(ctx, tx, GROUND_Y);
  }

  // Chão + grama
  ctx.fillStyle = isNight ? '#15803d' : '#16a34a';
  ctx.fillRect(0, GROUND_Y, worldWidth, 16);
  ctx.fillStyle = isNight ? '#451a03' : '#92400e';
  ctx.fillRect(0, GROUND_Y + 16, worldWidth, canvas.height - GROUND_Y - 16);
  ctx.fillStyle = isNight ? '#291509' : '#78350f';
  for (let gx = 0; gx < worldWidth; gx += 32) {
    ctx.fillRect(gx, GROUND_Y + 24, 28, 14);
    ctx.fillRect(gx + 16, GROUND_Y + 46, 28, 14);
  }

  // Plataformas (com detalhe dourado nas plataformas móveis)
  for (const p of platforms) {
    const isMoving = Boolean(p.moveX || p.moveY);
    ctx.fillStyle = isMoving ? '#9a3412' : isNight ? '#78350f' : '#b45309';
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.w, p.h);
    ctx.fillStyle = isMoving ? '#facc15' : isNight ? '#15803d' : '#16a34a';
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.w, 6);
    if (isMoving) {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(Math.floor(p.x) + 4, Math.floor(p.y) + 10, 6, 6);
      ctx.fillRect(Math.floor(p.x + p.w) - 10, Math.floor(p.y) + 10, 6, 6);
    }
  }

  // Lanternas Japonesas (acendem e brilham ao bater a cabeça!)
  for (const l of lanterns) {
    drawJapaneseLantern(ctx, l.x, l.y, l.w, l.h, l.lit, frameCount);
  }

  // Partículas de luz das lanternas
  for (const lp of lightParticles) {
    const alpha = Math.max(0, lp.life / lp.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = lp.color;
    ctx.fillRect(Math.floor(lp.x), Math.floor(lp.y), lp.size, lp.size);
  }
  ctx.globalAlpha = 1;

  // Coletáveis (Flores de Sakura)
  for (const c of collectibles) {
    if (c.collected) continue;
    const bob = Math.sin(frameCount * 0.1 + c.x) * 3;
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(c.x - 8, c.y - 8 + bob, 16, 16);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(c.x - 3, c.y - 3 + bob, 6, 6);
  }

  // Inimigos
  for (const e of enemies) {
    if (!e.alive) continue;
    const mat = Math.floor(frameCount / 12) % 2 === 0 ? ENEMY_1 : ENEMY_2;
    drawPixelMatrix(ctx, mat, e.x, e.y, 3, e.vx > 0);
  }

  // Objetivo da Fase:
  // Fases 1 e 2 -> Portal Torii para a próxima fase
  // Fase 3 -> Castelo Japonês de Assaí iluminado!
  if (stageCfg.hasCastle) {
    drawJapaneseCastle(ctx, goalX + 20, GROUND_Y - 134, 1.05, true);
  } else {
    drawStageGoalPortal(ctx, goalX + 40, GROUND_Y, currentStage);
  }

  // Jogador (Sora ou Riku)
  if (player.invincibleTimer === 0 || Math.floor(frameCount / 4) % 2 === 0) {
    let sprite;
    if (!player.onGround) {
      sprite = selectedCharacter === 'male' ? SORA_JUMP : RIKU_JUMP;
    } else if (Math.abs(player.vx) > 0.5 && Math.floor(frameCount / 8) % 2 === 0) {
      sprite = selectedCharacter === 'male' ? SORA_WALK : RIKU_WALK;
    } else {
      sprite = selectedCharacter === 'male' ? SORA_IDLE : RIKU_IDLE;
    }
    drawPixelMatrix(ctx, sprite, player.x - 2, player.y - 2, 3, !player.facingRight);
  }

  // Toriis (parte da frente por cima do jogador!)
  for (const tx of toriis) {
    drawToriiFront(ctx, tx, GROUND_Y);
  }

  ctx.restore();

  // Pétalas de cerejeira e ipê na tela
  for (const pt of petals) {
    ctx.fillStyle = pt.color;
    ctx.fillRect(Math.floor(pt.x), Math.floor(pt.y), pt.size, pt.size);
  }
}

function gameLoop() {
  update();
  draw();
  animFrameId = requestAnimationFrame(gameLoop);
}

// Inicialização
loadStage(1, true);
gameLoop();
