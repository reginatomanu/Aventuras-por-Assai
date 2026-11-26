'use strict';
// Aventuras por Assaí — motor principal
// Resolução nativa 384x216: todos os sprites e cenários na mesma densidade de pixels.

const W = 384, H = 216, GY = 184;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const $ = (id) => document.getElementById(id);
const wrapper = $('game-wrapper');

// ================= Persistência =================
function loadJSON(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem storage */ } }

const DEFAULT_SETTINGS = { lang: 'pt', music: 50, sfx: 70, hud: 'normal', touch: 'auto', ctrlSize: 'large', ctrlOpacity: 85, leftHanded: false };
let settings = { ...DEFAULT_SETTINGS, ...loadJSON('assai_settings', {}) };
let achievements = loadJSON('assai_ach', {});
let bestStars = loadJSON('assai_stars', {});

// ================= Integração com app externo =================
// O app hospedeiro pode chamar:
//   AventurasAssai.setPlayer({ id, name })
//   AventurasAssai.setRankingProvider({ submit(entry): Promise, fetchTop(n): Promise<entry[]> })
//   AventurasAssai.onGameEnd = (resultado) => {...}
//   AventurasAssai.onAchievement = (id) => {...}
let hostPlayer = null;
const localRanking = {
  async submit(entry) {
    const list = loadJSON('assai_ranking', []);
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    saveJSON('assai_ranking', list.slice(0, 50));
    return true;
  },
  async fetchTop(n = 10) { return loadJSON('assai_ranking', []).slice(0, n); },
};
let rankingProvider = localRanking;
window.AventurasAssai = {
  setPlayer(p) { hostPlayer = p && p.name ? p : null; refreshNameRow(); },
  setRankingProvider(p) { rankingProvider = p || localRanking; },
  onGameEnd: null,
  onAchievement: null,
  getAchievements: () => ({ ...achievements }),
};

// ================= Fases =================
const P = (x, y, w, mx = 0, my = 0, sp = 0) => ({ x, y, w, mx, my, sp });
const XY = (arr) => arr.map(([x, y]) => ({ x, y }));
const EN = (arr) => arr.map(([x, min, max, vx]) => ({ x, min, max, vx }));
const TREE_TYPES = ['sakura', 'ipe-branco', 'ipe-amarelo'];
const treesEvery = (from, to, step, offset = 0) => {
  const out = [];
  let i = offset;
  for (let x = from; x < to; x += step) out.push({ x, type: TREE_TYPES[i++ % 3] });
  return out;
};

const STAGES = {
  1: {
    code: '1-1', key: 'stage1', theme: 'day', width: 1240, goalX: 1180, par: 75, next: 2, sign: true,
    platforms: [P(150, 154, 44), P(230, 128, 44), P(330, 150, 40, 26, 0, 0.025), P(460, 128, 44), P(560, 150, 40, 0, 16, 0.03),
      P(680, 126, 44), P(800, 150, 40, 24, 0, 0.03), P(930, 128, 44), P(1040, 152, 44)],
    lanterns: XY([[167, 102], [247, 76], [477, 76], [620, 131], [697, 74], [880, 131], [947, 76], [1057, 100]]),
    enemies: EN([[260, 200, 320, -0.55], [420, 380, 520, 0.6], [640, 600, 760, -0.65], [860, 820, 980, 0.65], [1040, 990, 1120, -0.7]]),
    flowers: XY([[100, 172], [172, 140], [188, 140], [252, 114], [350, 136], [420, 172], [482, 114], [540, 172], [582, 134], [702, 112],
      [760, 172], [822, 136], [952, 114], [1062, 138], [1140, 172]]),
    toriis: [110, 760],
    trees: treesEvery(40, 1150, 72),
    decor: [],
  },
  2: {
    code: '1-2', key: 'stage2', theme: 'sunset', width: 1340, goalX: 1280, par: 85, next: 3, lake: true,
    platforms: [P(140, 152, 40), P(220, 128, 40, 24, 0, 0.03), P(330, 104, 40), P(430, 146, 40, 0, 20, 0.035), P(540, 122, 40),
      P(640, 146, 40, 30, 0, 0.032), P(770, 120, 40, 0, 18, 0.04), P(880, 146, 40), P(980, 124, 40, 26, 0, 0.035),
      P(1100, 140, 36, 0, 36, 0.028), P(1170, 70, 40)],
    lanterns: XY([[155, 100], [235, 76], [345, 52], [555, 70], [785, 50], [895, 94], [1060, 131]]),
    enemies: EN([[200, 160, 300, -0.7], [400, 330, 500, 0.75], [600, 560, 700, -0.8], [760, 720, 860, 0.8], [960, 900, 1060, -0.85], [1150, 1080, 1240, 0.85]]),
    flowers: XY([[100, 172], [160, 138], [240, 114], [350, 90], [366, 90], [450, 132], [470, 172], [560, 108], [660, 132], [700, 172],
      [790, 106], [900, 132], [1000, 110], [1120, 120], [1190, 56], [1240, 172]]),
    toriis: [80, 620],
    trees: treesEvery(50, 1260, 130, 1),
    secret: { x: 1190, y: 70 },
    decor: [],
  },
  3: {
    code: '1-3', key: 'stage3', theme: 'night', width: 1460, goalX: 1380, par: 100, next: 'end', castle: true,
    platforms: [P(130, 150, 36), P(210, 126, 36, 22, 0, 0.035), P(310, 104, 36), P(400, 142, 36, 0, 22, 0.04), P(500, 118, 36, 30, 0, 0.038),
      P(620, 96, 36), P(720, 140, 36, 0, 26, 0.042), P(820, 116, 36), P(920, 140, 36, 32, 0, 0.04), P(1040, 118, 36, 0, 20, 0.045),
      P(1140, 100, 36), P(1230, 146, 36, 20, 0, 0.04)],
    lanterns: XY([[143, 98], [323, 52], [455, 131], [633, 44], [735, 60], [833, 64], [1005, 131], [1153, 48]]),
    enemies: EN([[180, 150, 290, -0.8], [360, 300, 440, 0.85], [560, 480, 640, -0.9], [700, 660, 800, 0.9], [880, 840, 980, -0.95],
      [1080, 1020, 1160, 0.95], [1240, 1190, 1310, -1]]),
    flowers: XY([[90, 172], [146, 136], [228, 112], [326, 90], [416, 128], [470, 172], [518, 104], [636, 82], [736, 126], [836, 102],
      [938, 126], [1056, 104], [1156, 86], [1248, 132], [1300, 172]]),
    toriis: [90, 560, 1100],
    trees: treesEvery(40, 1240, 95, 2),
    decor: [{ t: 'toro', x: 300 }, { t: 'toro', x: 680 }, { t: 'toro', x: 980 }, { t: 'toro', x: 1290 }],
  },
  S: {
    code: '★', key: 'stageS', theme: 'secret', width: 900, goalX: 840, par: 45, next: 3, golden: true,
    platforms: [P(120, 150, 60), P(220, 124, 60, 20, 0, 0.03), P(340, 100, 60), P(460, 124, 60, 0, 16, 0.03), P(580, 100, 60), P(700, 140, 60)],
    lanterns: XY([[145, 98], [365, 48], [605, 48], [725, 88]]),
    enemies: EN([[300, 250, 420, 0.6], [520, 480, 640, -0.6], [760, 700, 820, 0.6]]),
    flowers: (() => {
      const f = [];
      for (let x = 60; x < 820; x += 22) f.push([x, 172]);
      [[120, 150, 60], [340, 100, 60], [580, 100, 60], [700, 140, 60]].forEach(([px, py, pw]) => { for (let i = 8; i < pw; i += 14) f.push([px + i, py - 12]); });
      return XY(f);
    })(),
    toriis: [60],
    trees: [{ x: 90, type: 'sakura' }, { x: 250, type: 'ipe-rosa' }, { x: 420, type: 'sakura' }, { x: 560, type: 'ipe-rosa' }, { x: 690, type: 'sakura' }],
    decor: [],
  },
};

const THEMES = {
  day: { sky: ['#2f7fe0', '#3f8eea', '#55a0f2', '#6eb2f7', '#8ac3fa', '#a7d4fc'], hillFar: '#7cc47f', hillNear: '#4fae5a', bush: '#3d9a4c',
    grass: '#3fa34d', grassL: '#6cc46a', dirt: '#a0612f', dirtL: '#c08050', dirtD: '#7a4520', music: 'day', petals: 18, clouds: '#ffffff', cloudsS: '#d6e9fb' },
  sunset: { sky: ['#2b2d6e', '#4b2f86', '#8a3a8f', '#c94f7c', '#f07a5a', '#fbb04a'], hillFar: '#7b3f6e', hillNear: '#3f6b3a', bush: '#2f5a30',
    grass: '#3f7d3a', grassL: '#6aa055', dirt: '#8a4a2a', dirtL: '#a8643a', dirtD: '#5e3018', music: 'sunset', petals: 22, clouds: '#ffc9a8', cloudsS: '#e79a86' },
  night: { sky: ['#060b1f', '#0a1430', '#0e1d44', '#132757', '#18316a', '#1d3b7c'], hillFar: '#1c2a4a', hillNear: '#183a2c', bush: '#123024',
    grass: '#1f5a36', grassL: '#2f7a48', dirt: '#5a3418', dirtL: '#74462a', dirtD: '#3b210f', music: 'night', petals: 16 },
  secret: { sky: ['#3b1d4f', '#5b2a6e', '#83388a', '#b04c9c', '#d86fae', '#f5a3c7'], hillFar: '#9d4c8e', hillNear: '#5e8a4a', bush: '#4c7a3e',
    grass: '#55964a', grassL: '#86c26a', dirt: '#8b4a5a', dirtL: '#a8687a', dirtD: '#5e2f3e', music: 'secret', petals: 40 },
};

// ================= Estado =================
let state = 'menu'; // menu | intro | playing | paused | result | won | gameover
let selectedCharacter = 'male';
let stageId = 1, cfg = STAGES[1], theme = THEMES.day;
let player, camX = 0, frame = 0;
let platforms = [], lanterns = [], enemies = [], flowers = [], particles = [], popups = [], petals = [];
let score = 0, lives = 3, sakuraCount = 0, totalStars = 0, totalFrames = 0;
let secretFound = false, tookDamage = false, nextStageId = 2, scoreSaved = false;
let st = {};
const keys = {};
let jumpHeld = false, jumpBuffer = 0, coyote = 0;
let typewriterTimer = null, bannerTimer = null, pausedFrom = null, settingsReturn = null;

const GRAV = 0.22, MAXFALL = 5.2, SPEED = 1.75, ACC = 0.3, JUMP = -5.25, JUMP_CUT = -2;

const STARS_BG = Array.from({ length: 70 }, (_, i) => ({ x: (i * 137 + 11) % W, y: 4 + ((i * 89) % 120), big: i % 7 === 0, ph: i * 0.7 }));

// ================= Configurações =================
function updateTouchControlSize() {
  const mc = $('mobile-controls');
  if (!mc) return;
  const sizeKey = settings.ctrlSize || 'large';
  mc.dataset.ctrlSize = sizeKey;
  const factor = { normal: 0.11, large: 0.145, huge: 0.18 }[sizeKey] || 0.145;
  const baseW = wrapper.clientWidth || window.innerWidth || 800;
  const px = Math.round(Math.max(58, Math.min(180, baseW * factor)));
  const jumpPx = Math.round(px * 1.15);
  mc.style.setProperty('--ctrl-size', px + 'px');
  [$('btn-left'), $('btn-right'), $('btn-down')].forEach((b) => {
    if (!b) return;
    b.style.width = px + 'px';
    b.style.height = px + 'px';
    b.style.fontSize = Math.round(px * 0.44) + 'px';
  });
  const jb = $('btn-jump');
  if (jb) {
    jb.style.width = jumpPx + 'px';
    jb.style.height = jumpPx + 'px';
    jb.style.fontSize = Math.round(jumpPx * 0.44) + 'px';
  }
}
window.addEventListener('resize', updateTouchControlSize);
window.addEventListener('orientationchange', () => setTimeout(updateTouchControlSize, 120));

function applySettings() {
  LANG = settings.lang;
  applyI18n();
  Audio8.setVolumes(settings.music / 100, settings.sfx / 100);
  wrapper.dataset.hud = settings.hud;
  updateTouchControlSize();
  $('mobile-controls').style.opacity = settings.ctrlOpacity / 100;
  $('mobile-controls').classList.toggle('left-handed', !!settings.leftHanded);
  $('set-lang').value = settings.lang;
  $('set-music').value = settings.music; $('set-music-val').textContent = settings.music + '%';
  $('set-sfx').value = settings.sfx; $('set-sfx-val').textContent = settings.sfx + '%';
  $('set-hud').value = settings.hud;
  $('set-touch').value = settings.touch;
  $('set-ctrl-size').value = settings.ctrlSize;
  $('set-ctrl-opacity').value = settings.ctrlOpacity; $('set-ctrl-opacity-val').textContent = settings.ctrlOpacity + '%';
  $('set-left').checked = !!settings.leftHanded;
  saveJSON('assai_settings', settings);
  updateMobileControls();
  if (state === 'intro') $('dialogue-text').textContent = t('dialogue_' + selectedCharacter);
}

function bindSetting(id, key, transform = (v) => v, evt = 'input') {
  $(id).addEventListener(evt, (e) => {
    settings[key] = transform(e.target.type === 'checkbox' ? e.target.checked : e.target.value);
    applySettings();
  });
}
bindSetting('set-lang', 'lang', String, 'change');
bindSetting('set-music', 'music', Number);
bindSetting('set-sfx', 'sfx', Number);
bindSetting('set-hud', 'hud', String, 'change');
bindSetting('set-touch', 'touch', String, 'change');
bindSetting('set-ctrl-size', 'ctrlSize', String, 'change');
bindSetting('set-ctrl-opacity', 'ctrlOpacity', Number);
bindSetting('set-left', 'leftHanded', Boolean, 'change');
$('set-sfx').addEventListener('change', () => Audio8.sfx.coin());

$('btn-fullscreen').addEventListener('click', () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el);
    if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
  } else if (document.exitFullscreen) document.exitFullscreen();
});

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
function updateMobileControls() {
  const show = state === 'playing' && (settings.touch === 'always' || (settings.touch === 'auto' && isTouchDevice()));
  $('mobile-controls').classList.toggle('hidden', !show);
  if (show) updateTouchControlSize();
}

// ================= Entrada =================
const GAME_KEYS = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
window.addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (GAME_KEYS.includes(e.code)) e.preventDefault();
  if (state === 'intro' && (e.code === 'Space' || e.code === 'Enter')) closeIntro();
  else if (state === 'menu' && e.code === 'Enter' && !anyModalOpen()) startGame();
  else if ((e.code === 'KeyP' || e.code === 'Escape') && (state === 'playing' || state === 'paused')) togglePause();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

function bindTouch(btn, code) {
  const on = (e) => { e.preventDefault(); keys[code] = true; btn.classList.add('pressed'); if (btn.setPointerCapture && e.pointerId != null) try { btn.setPointerCapture(e.pointerId); } catch (_) {} };
  const off = (e) => { e.preventDefault(); keys[code] = false; btn.classList.remove('pressed'); };
  btn.addEventListener('pointerdown', on);
  btn.addEventListener('pointerup', off);
  btn.addEventListener('pointercancel', off);
  btn.addEventListener('lostpointercapture', off);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}
bindTouch($('btn-left'), 'ArrowLeft');
bindTouch($('btn-right'), 'ArrowRight');
bindTouch($('btn-jump'), 'Space');
if ($('btn-down')) bindTouch($('btn-down'), 'ArrowDown');

// Desbloqueia áudio no primeiro toque/clique
const unlockAudio = () => {
  Audio8.ensure();
  if (state === 'menu') Audio8.playMusic('title');
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
};
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing') togglePause(); });

// ================= Menu / UI =================
function selectChar(c) {
  selectedCharacter = c;
  $('select-male').classList.toggle('selected', c === 'male');
  $('select-female').classList.toggle('selected', c === 'female');
  Audio8.sfx.select();
}
$('select-male').addEventListener('click', () => selectChar('male'));
$('select-female').addEventListener('click', () => selectChar('female'));
$('btn-start').addEventListener('click', () => startGame());
$('btn-dialogue-ok').addEventListener('click', closeIntro);
$('btn-result-continue').addEventListener('click', continueAfterResult);
$('btn-restart').addEventListener('click', () => { $('end-screen').classList.add('hidden'); startGame(false); });
$('btn-menu').addEventListener('click', goToMenu);
$('btn-quit').addEventListener('click', goToMenu);
$('btn-pause').addEventListener('click', togglePause);
$('btn-resume').addEventListener('click', togglePause);
$('btn-pause-settings').addEventListener('click', () => { $('pause-modal').classList.add('hidden'); openModal('settings-modal', 'pause-modal'); });
$('btn-open-settings').addEventListener('click', () => openModal('settings-modal'));
$('btn-open-ranking').addEventListener('click', () => { renderRanking($('ranking-list'), 10); openModal('ranking-modal'); });
$('btn-open-achievements').addEventListener('click', () => { renderAchievements(); openModal('achievements-modal'); });
document.querySelectorAll('.close-modal').forEach((b) => b.addEventListener('click', () => {
  const m = b.closest('.overlay');
  m.classList.add('hidden');
  if (settingsReturn && m.id === 'settings-modal') { $(settingsReturn).classList.remove('hidden'); settingsReturn = null; }
}));
$('btn-save-score').addEventListener('click', saveScore);

function openModal(id, returnTo = null) {
  settingsReturn = returnTo;
  $(id).classList.remove('hidden');
  Audio8.sfx.select();
}
function anyModalOpen() {
  return ['settings-modal', 'ranking-modal', 'achievements-modal'].some((id) => !$(id).classList.contains('hidden'));
}

function toast(html) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  $('toast-area').appendChild(el);
  setTimeout(() => el.remove(), 3100);
}

const LUCIDE_SVGS = {
  flame: '<svg class="lucide lucide-flame" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  bug: '<svg class="lucide lucide-bug" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>',
  landmark: '<svg class="lucide lucide-landmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>',
  star: '<svg class="lucide lucide-star" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  heart: '<svg class="lucide lucide-heart" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  lock: '<svg class="lucide lucide-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  medal: '<svg class="lucide lucide-medal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/></svg>',
};
const lucideSvg = (name) => LUCIDE_SVGS[name] || LUCIDE_SVGS.medal;

const ACH_LIST = [
  { id: 'lanterns', icon: 'flame' }, { id: 'enemies', icon: 'bug' }, { id: 'secret', icon: 'landmark' },
  { id: 'stars', icon: 'star' }, { id: 'nohit', icon: 'heart' },
];
function unlock(id) {
  if (achievements[id]) return;
  achievements[id] = Date.now();
  saveJSON('assai_ach', achievements);
  const a = ACH_LIST.find((x) => x.id === id);
  setTimeout(() => {
    toast(`${lucideSvg(a ? a.icon : 'medal')} <b>${t('ach_unlocked')}</b> ${t('ach_' + id)}`);
    Audio8.sfx.achievement();
  }, 350);
  if (typeof window.AventurasAssai.onAchievement === 'function') window.AventurasAssai.onAchievement(id);
}

function renderAchievements() {
  $('achievements-list').innerHTML = ACH_LIST.map((a) => `
    <li class="${achievements[a.id] ? 'on' : ''}">
      <span class="ach-icon">${lucideSvg(achievements[a.id] ? a.icon : 'lock')}</span>
      <div><div class="ach-name">${t('ach_' + a.id)}</div><div class="ach-desc">${t('ach_' + a.id + '_d')}</div></div>
    </li>`).join('');
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function renderRanking(el, n, highlight) {
  let list = [];
  try { list = await rankingProvider.fetchTop(n); } catch (e) { list = []; }
  if (!list || !list.length) { el.innerHTML = `<li class="empty">${t('ranking_empty')}</li>`; return; }
  el.innerHTML = list.map((r) => `
    <li class="${highlight && r.date === highlight ? 'me' : ''}">
      <span>${esc(r.name)}</span><span>${String(r.score).padStart(6, '0')}</span><span class="rk-stars">${r.stars || 0} ${lucideSvg('star')}</span>
    </li>`).join('');
}

function refreshNameRow() {
  const hasHost = !!hostPlayer;
  $('name-row').classList.toggle('hidden', hasHost || scoreSaved);
  $('host-player').classList.toggle('hidden', !hasHost);
  if (hasHost) $('host-player').textContent = `${t('playing_as')}: ${hostPlayer.name}`;
}

async function saveScore() {
  if (scoreSaved) return;
  const name = (hostPlayer && hostPlayer.name) || $('player-name').value.trim() || t('player');
  const entry = {
    playerId: hostPlayer ? hostPlayer.id : null, name, score, stars: totalStars,
    character: selectedCharacter === 'male' ? 'Sora' : 'Riku',
    timeSeconds: Math.round(totalFrames / 60), won: state === 'won', date: new Date().toISOString(),
  };
  try { await rankingProvider.submit(entry); } catch (e) { /* falha silenciosa */ }
  scoreSaved = true;
  $('save-msg').classList.remove('hidden');
  refreshNameRow();
  renderRanking($('end-ranking'), 5, entry.date);
}

function heartsHTML() {
  let h = '';
  for (let i = 0; i < 3; i++) h += heartSVG(i < lives);
  return h;
}

let hudCache = {};
function setHud(id, val) { if (hudCache[id] !== val) { hudCache[id] = val; $(id).innerHTML = val; } }
function fmtTime(frames) {
  const s = Math.floor(frames / 60);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}
function updateHUD() {
  setHud('hud-hearts', heartsHTML());
  setHud('hud-score', String(score).padStart(6, '0'));
  setHud('hud-coins', 'x' + String(sakuraCount).padStart(2, '0'));
  setHud('hud-time', fmtTime(st.frames || 0));
  setHud('hud-world', cfg.code);
}

function showBanner() {
  if (bannerTimer) clearTimeout(bannerTimer);
  $('stage-banner-sub').textContent = `${t('stage_word')} ${cfg.code}`;
  $('stage-banner-title').textContent = t(cfg.key);
  $('stage-banner').classList.remove('hidden');
  bannerTimer = setTimeout(() => $('stage-banner').classList.add('hidden'), 2200);
}

// ================= Fluxo do jogo =================
function initPetals() {
  petals = Array.from({ length: theme.petals }, () => ({
    x: Math.random() * W, y: Math.random() * H, vx: -0.15 - Math.random() * 0.25, vy: 0.25 + Math.random() * 0.35,
    c: Math.random() > 0.3 ? '#fbcfe8' : (Math.random() > 0.5 ? '#ffffff' : '#ffe27a'), s: Math.random() > 0.7 ? 2 : 1,
  }));
}

function loadStage(id) {
  stageId = id;
  cfg = STAGES[id];
  theme = THEMES[cfg.theme];
  platforms = cfg.platforms.map((p) => ({ ...p, h: 6, bx: p.x, by: p.y, dx: 0, dy: 0 }));
  lanterns = cfg.lanterns.map((l) => ({ ...l, w: 12, h: 16, lit: false, golden: !!cfg.golden }));
  enemies = cfg.enemies.map((e) => ({ ...e, y: GY - 10, w: 14, h: 10, dead: false, squash: 0 }));
  flowers = cfg.flowers.map((f) => ({ ...f, got: false }));
  particles = []; popups = [];
  player = { x: 70, y: GY - 26, w: 14, h: 26, vx: 0, vy: 0, onGround: true, facing: 1, inv: 0, standOn: null, dropTimer: 0, walkDist: 0 };
  camX = 0;
  st = { frames: 0, score: 0, lanterns: 0, enemies: 0, flowers: 0 };
  cfg.maxBase = lanterns.length * (cfg.golden ? 500 : 300) + enemies.length * 400 + flowers.length * 50;
  initPetals();
  Audio8.playMusic(theme.music);
  hudCache = {};
  updateHUD();
}

function startGame(withIntro = true) {
  Audio8.ensure();
  score = 0; lives = 3; sakuraCount = 0; totalStars = 0; totalFrames = 0;
  secretFound = false; tookDamage = false; scoreSaved = false;
  loadStage(1);
  $('menu-screen').classList.add('hidden');
  $('hud').classList.remove('hidden');
  if (withIntro) {
    state = 'intro';
    showIntro();
  } else {
    state = 'playing';
    showBanner();
  }
  updateMobileControls();
}

function showIntro() {
  const isSora = selectedCharacter === 'male';
  $('dialogue-speaker').textContent = isSora ? 'SORA' : 'RIKU';
  $('dialogue-avatar-img').src = isSora ? 'assets/portrait-sora.png?v=12' : 'assets/portrait-riku.png?v=12';
  const full = t('dialogue_' + selectedCharacter);
  $('dialogue-text').textContent = '';
  $('dialogue-box').classList.remove('hidden');
  Audio8.sfx.talk();
  if (typewriterTimer) clearInterval(typewriterTimer);
  let i = 0;
  typewriterTimer = setInterval(() => {
    i++;
    $('dialogue-text').textContent = full.slice(0, i);
    if (i % 4 === 0) Audio8.sfx.select && null;
    if (i >= full.length) { clearInterval(typewriterTimer); typewriterTimer = null; }
  }, 22);
}

function closeIntro() {
  if (state !== 'intro') return;
  if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
  $('dialogue-box').classList.add('hidden');
  state = 'playing';
  keys.Space = false; jumpHeld = true;
  updateMobileControls();
  showBanner();
}

function togglePause() {
  if (state === 'playing') {
    state = 'paused';
    $('pause-modal').classList.remove('hidden');
    Audio8.stopMusic();
  } else if (state === 'paused') {
    state = 'playing';
    $('pause-modal').classList.add('hidden');
    $('settings-modal').classList.add('hidden');
    settingsReturn = null;
    Audio8.playMusic(theme.music);
  }
  updateMobileControls();
}

function goToMenu() {
  ['end-screen', 'pause-modal', 'result-screen', 'dialogue-box', 'stage-banner', 'hud', 'settings-modal'].forEach((id) => $(id).classList.add('hidden'));
  $('menu-screen').classList.remove('hidden');
  state = 'menu';
  theme = THEMES.night;
  initPetals();
  Audio8.playMusic('title');
  updateMobileControls();
}

function completeStage(viaSecret) {
  state = 'result';
  updateMobileControls();
  Audio8.stopMusic();
  Audio8.sfx.stageClear();
  const secs = st.frames / 60;
  const timeBonus = viaSecret ? 0 : Math.max(0, Math.floor((cfg.par - secs) * 20));
  score += timeBonus + 300;
  let stars = 1;
  if (secs <= cfg.par) stars++;
  if (st.score >= cfg.maxBase * 0.6) stars++;
  totalStars += stars;
  bestStars[stageId] = Math.max(bestStars[stageId] || 0, stars);
  saveJSON('assai_stars', bestStars);
  if (stars === 3) unlock('stars');
  nextStageId = stageId === 2 && viaSecret ? 'S' : cfg.next;

  $('result-title').textContent = viaSecret ? t('secret_found') : t('result_title');
  $('result-stage').textContent = `${t('stage_word')} ${cfg.code} · ${t(cfg.key)}`;
  const starEls = $('result-stars').querySelectorAll('span');
  starEls.forEach((s) => s.classList.remove('on'));
  starEls.forEach((s, i) => { if (i < stars) setTimeout(() => { s.classList.add('on'); Audio8.sfx.coin(); }, 400 + i * 420); });
  const rows = [
    [t('r_time'), `${fmtTime(st.frames)} <small>(${t('r_par')} ${fmtTime(cfg.par * 60)})</small>`],
    [t('r_lanterns'), `${st.lanterns}/${lanterns.length}`],
    [t('r_enemies'), `${st.enemies}/${enemies.length}`],
    [t('r_flowers'), `${st.flowers}/${flowers.length}`],
    [t('r_score'), Math.max(0, st.score)],
    [t('r_timebonus'), '+' + timeBonus],
  ];
  $('result-stats').innerHTML = rows.map(([k, v]) => `<span>${k}</span><span class="v">${v}</span>`).join('');
  $('result-screen').classList.remove('hidden');
  updateHUD();
}

function continueAfterResult() {
  $('result-screen').classList.add('hidden');
  if (nextStageId === 'end') { endGame(true); return; }
  loadStage(nextStageId);
  state = 'playing';
  keys.Space = false; jumpHeld = true;
  updateMobileControls();
  showBanner();
}

function endGame(won) {
  state = won ? 'won' : 'gameover';
  updateMobileControls();
  Audio8.stopMusic();
  if (won) { Audio8.sfx.win(); if (!tookDamage) unlock('nohit'); } else Audio8.sfx.gameover();
  const name = selectedCharacter === 'male' ? 'Sora' : 'Riku';
  $('end-title').textContent = won ? t('victory') : t('gameover');
  $('end-message').textContent = t(won ? 'end_win' : 'end_lose', { name });
  $('final-score-val').textContent = score;
  $('final-stars-val').innerHTML = `${totalStars} ${lucideSvg('star')}`;
  $('save-msg').classList.add('hidden');
  refreshNameRow();
  renderRanking($('end-ranking'), 5);
  $('end-screen').classList.remove('hidden');
  if (hostPlayer) saveScore();
  if (typeof window.AventurasAssai.onGameEnd === 'function') {
    window.AventurasAssai.onGameEnd({
      playerId: hostPlayer ? hostPlayer.id : null, score, stars: totalStars, won,
      character: name, timeSeconds: Math.round(totalFrames / 60), achievements: { ...achievements }, secretFound,
    });
  }
}

// ================= Pontuação e efeitos =================
function addScore(n, x, y, color) {
  score = Math.max(0, score + n);
  st.score += n;
  popups.push({ x, y, text: (n > 0 ? '+' : '') + n, life: 50, color: color || (n > 0 ? '#ffd84d' : '#ff5d5d') });
}

function burst(cx, cy, count, colors, speed = 1.4) {
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const v = 0.4 + Math.random() * speed;
    particles.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.4, life: 30 + Math.random() * 30, max: 60, c: colors[i % colors.length], s: Math.random() > 0.6 ? 2 : 1, up: true });
  }
}

function hitLantern(l) {
  if (l.lit) {
    burst(l.x + 5, l.y + 8, 6, ['#fff', '#ffd84d']);
    return;
  }
  l.lit = true;
  st.lanterns++;
  addScore(l.golden ? 500 : 300, l.x + 5, l.y - 4);
  Audio8.sfx.lantern();
  burst(l.x + 5, l.y + 8, 22, ['#ffffff', '#fff1a8', '#ffd84d', '#fb923c', '#fda4af'], 2.2);
  if (lanterns.every((x) => x.lit)) {
    score += 500; st.score += 500;
    toast(`${lucideSvg('flame')} ${t('toast_lanterns')}`);
    unlock('lanterns');
    if (cfg.secret && !secretFound) {
      toast(`${lucideSvg('landmark')} ${t('toast_secret_unlocked')}`);
      Audio8.sfx.secret();
      burst(cfg.secret.x, cfg.secret.y - 14, 24, ['#ffd84d', '#ffffff', '#f472b6'], 2.2);
    }
  }
}

function hurt(e) {
  lives--;
  tookDamage = true;
  addScore(-150, player.x + 6, player.y - 4);
  Audio8.sfx.hurt();
  player.inv = 100;
  player.vy = -3;
  player.vx = (player.x + 6 < e.x + 7 ? -1 : 1) * 2.4;
  burst(player.x + 6, player.y + 8, 10, ['#ff5d5d', '#ffffff']);
  updateHUD();
  if (lives <= 0) { updateHUD(); setTimeout(() => endGame(false), 400); state = 'gameover'; }
}

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const isSecretUnlocked = () => !!(cfg.secret && !secretFound && lanterns.length > 0 && lanterns.every((x) => x.lit));

// ================= Atualização =================
function updatePetals() {
  for (const p of petals) {
    p.x += p.vx + Math.sin((frame + p.y) * 0.03) * 0.15;
    p.y += p.vy;
    if (p.y > H) { p.y = -2; p.x = Math.random() * (W + 40); }
    if (p.x < -4) p.x = W + 2;
  }
}

function update() {
  frame++;
  updatePetals();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy += p.up ? -0.02 : 0.08;
    if (--p.life <= 0) particles.splice(i, 1);
  }
  for (let i = popups.length - 1; i >= 0; i--) { popups[i].y -= 0.4; if (--popups[i].life <= 0) popups.splice(i, 1); }
  if (state !== 'playing') return;

  st.frames++;
  totalFrames++;

  // Entrada
  const left = keys.ArrowLeft || keys.KeyA, right = keys.ArrowRight || keys.KeyD;
  const downNow = !!(keys.ArrowDown || keys.KeyS);
  const jumpNow = !!(keys.Space || keys.ArrowUp || keys.KeyW);

  // Descer da plataforma ao apertar Seta para Baixo ou S
  if (downNow && player.onGround && player.standOn) {
    player.dropTimer = 14;
    player.onGround = false;
    player.standOn = null;
    player.y += 2;
    player.vy = 1.2;
    coyote = 0;
  }
  if (player.dropTimer > 0) player.dropTimer--;
  if (jumpNow && !jumpHeld) jumpBuffer = 7;
  jumpHeld = jumpNow;
  if (jumpBuffer > 0) jumpBuffer--;

  if (right && !left) { player.vx = Math.min(SPEED, player.vx + ACC); player.facing = 1; }
  else if (left && !right) { player.vx = Math.max(-SPEED, player.vx - ACC); player.facing = -1; }
  else { player.vx *= 0.7; if (Math.abs(player.vx) < 0.05) player.vx = 0; }

  coyote = player.onGround ? 6 : Math.max(0, coyote - 1);
  if (jumpBuffer > 0 && coyote > 0) {
    player.vy = JUMP; player.onGround = false; coyote = 0; jumpBuffer = 0; player.standOn = null;
    Audio8.sfx.jump();
  }
  if (!jumpNow && player.vy < JUMP_CUT) player.vy = JUMP_CUT;
  player.vy = Math.min(MAXFALL, player.vy + GRAV);

  // Plataformas móveis
  for (const p of platforms) {
    const ox = p.x, oy = p.y;
    if (p.mx) p.x = p.bx + Math.sin(frame * p.sp) * p.mx;
    if (p.my) p.y = p.by + Math.sin(frame * p.sp) * p.my;
    p.dx = p.x - ox; p.dy = p.y - oy;
  }

  const prevBottom = player.y + player.h, prevTop = player.y;
  const wasOn = player.standOn;
  if (wasOn) player.x += wasOn.dx;
  player.x += player.vx;
  player.x = Math.max(0, Math.min(cfg.width - player.w, player.x));
  player.y += player.vy;
  player.onGround = false;
  player.standOn = null;

  if (player.y + player.h >= GY) { player.y = GY - player.h; player.vy = 0; player.onGround = true; }

  if (player.dropTimer === 0) {
    for (const p of platforms) {
      const hOver = player.x + player.w > p.x + 1 && player.x < p.x + p.w - 1;
      if (!hOver || player.vy < 0) continue;
      const landed = prevBottom <= p.y - p.dy + 2 && player.y + player.h >= p.y;
      const stuck = wasOn === p && player.y + player.h >= p.y - 3;
      if (landed || stuck) {
        player.y = p.y - player.h; player.vy = 0; player.onGround = true; player.standOn = p;
      }
    }
  }

  // Acumula distancia caminhada para sincronizar os passos com o deslocamento real no chao
  if (player.onGround && Math.abs(player.vx) > 0.15) {
    player.walkDist += Math.abs(player.vx);
  } else if (player.onGround) {
    player.walkDist = 0;
  }

  // Lanternas: bater a cabeça acende!
  for (const l of lanterns) {
    if (!overlap(player, l)) continue;
    if (player.vy < 0 && prevTop >= l.y + l.h - 3) { player.y = l.y + l.h; player.vy = 0.6; hitLantern(l); }
    else if (player.vy >= 0 && prevBottom <= l.y + 3) { player.y = l.y - player.h; player.vy = 0; player.onGround = true; }
  }

  // Flores de sakura
  for (const f of flowers) {
    if (f.got) continue;
    if (Math.abs(player.x + 7 - f.x) < 10 && Math.abs(player.y + 13 - f.y) < 15) {
      f.got = true; sakuraCount++; st.flowers++;
      addScore(50, f.x, f.y - 6, '#fbcfe8');
      Audio8.sfx.coin();
      burst(f.x, f.y, 6, ['#fbcfe8', '#f472b6']);
    }
  }

  // Bichinhos
  if (player.inv > 0) player.inv--;
  for (const e of enemies) {
    if (e.dead) { if (e.squash > 0) e.squash--; continue; }
    e.x += e.vx;
    if (e.x <= e.min) { e.x = e.min; e.vx = Math.abs(e.vx); }
    if (e.x + e.w >= e.max) { e.x = e.max - e.w; e.vx = -Math.abs(e.vx); }
    if (!overlap(player, e)) continue;
    if (player.vy > 0 && prevBottom <= e.y + 4) {
      e.dead = true; e.squash = 40; st.enemies++;
      player.vy = jumpNow ? -4.6 : -3.4;
      addScore(400, e.x + 7, e.y - 6);
      Audio8.sfx.stomp();
      burst(e.x + 7, e.y + 4, 10, ['#ffffff', '#f5b301', '#dc2626']);
      if (enemies.every((x) => x.dead)) {
        score += 500; st.score += 500;
        toast(`${lucideSvg('bug')} ${t('toast_enemies')}`);
        unlock('enemies');
      }
    } else if (player.inv === 0) {
      hurt(e);
      if (state !== 'playing') return;
    }
  }

  // Fase secreta (só aparece depois de acender todas as lanternas da fase)
  if (isSecretUnlocked()) {
    const s = cfg.secret;
    if (overlap(player, { x: s.x - 11, y: s.y - 28, w: 22, h: 28 })) {
      secretFound = true;
      Audio8.sfx.secret();
      unlock('secret');
      burst(s.x, s.y - 14, 30, ['#ffd84d', '#ffffff', '#f472b6'], 2.4);
      completeStage(true);
      return;
    }
  }

  // Câmera
  const target = player.x + 6 - W * 0.4;
  camX += (target - camX) * 0.18;
  camX = Math.max(0, Math.min(cfg.width - W, camX));

  if (frame % 6 === 0) updateHUD();

  // Objetivo
  if (player.x + player.w / 2 >= cfg.goalX) completeStage(false);
}

// ================= Desenho do cenário =================
function bandedSky(colors, bottom = GY) {
  const bh = Math.ceil(bottom / colors.length);
  colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * bh, W, bh + 1); });
}

function drawStars() {
  for (const s of STARS_BG) {
    const a = 0.45 + Math.sin(frame * 0.05 + s.ph) * 0.45;
    ctx.fillStyle = `rgba(254,249,195,${a.toFixed(2)})`;
    ctx.fillRect(s.x, s.y, 1, 1);
    if (s.big) { ctx.fillRect(s.x - 1, s.y, 3, 1); ctx.fillRect(s.x, s.y - 1, 1, 3); }
  }
}

function drawMoon(x, y, col = '#fef3c7') {
  ctx.fillStyle = 'rgba(254,243,199,0.12)';
  pxCircle(ctx, x, y, 17, 'rgba(254,243,199,0.10)');
  pxCircle(ctx, x, y, 14, 'rgba(254,243,199,0.12)');
  pxCircle(ctx, x, y, 11, col);
  ctx.fillStyle = '#e8dcae'; ctx.fillRect(x - 5, y - 3, 3, 2); ctx.fillRect(x + 2, y + 2, 4, 3); ctx.fillRect(x - 2, y + 5, 2, 2);
}

const CLOUDS = [[20, 22], [120, 12], [210, 30], [300, 16], [400, 26]];
function drawClouds(off) {
  for (const [cx, cy] of CLOUDS) {
    const x = Math.floor((((cx - off) % 480) + 480) % 480) - 48;
    ctx.fillStyle = theme.cloudsS; ctx.fillRect(x, cy + 7, 26, 2);
    ctx.fillStyle = theme.clouds; ctx.fillRect(x, cy + 3, 26, 4); ctx.fillRect(x + 4, cy, 12, 4); ctx.fillRect(x + 13, cy - 2, 9, 5);
  }
}

const CITY = [
  { x: 0, w: 22, h: 20, t: 'house' }, { x: 24, w: 14, h: 34, t: 'bld' }, { x: 40, w: 26, h: 16, t: 'house' }, { x: 70, w: 8, h: 46, t: 'tower' },
  { x: 82, w: 30, h: 18, t: 'house' }, { x: 114, w: 18, h: 28, t: 'bld' }, { x: 136, w: 6, h: 22, t: 'palm' }, { x: 146, w: 28, h: 15, t: 'house' },
  { x: 178, w: 16, h: 40, t: 'bld' }, { x: 198, w: 24, h: 18, t: 'house' }, { x: 226, w: 12, h: 32, t: 'water' }, { x: 242, w: 26, h: 16, t: 'house' },
  { x: 272, w: 18, h: 26, t: 'bld' }, { x: 294, w: 6, h: 20, t: 'palm' }, { x: 304, w: 30, h: 17, t: 'house' }, { x: 338, w: 16, h: 36, t: 'bld' },
  { x: 358, w: 26, h: 15, t: 'house' },
];
const CITY_COL = {
  day: { wall: '#e6edf5', wall2: '#cfdbe8', roof: '#d9825b', bld: '#c3d0de', win: '#8aa4c0', tower: '#9aa8b8', palm: '#5e9a6a' },
  sunset: { wall: '#e7b7a6', wall2: '#d39b8f', roof: '#a8463a', bld: '#c48f93', win: '#7a4a6a', tower: '#8a5a6e', palm: '#4b5e3a' },
  night: { wall: '#24325a', wall2: '#1e2a4c', roof: '#2b1f3a', bld: '#1b2647', win: '#fcd34d', tower: '#34436a', palm: '#15302a' },
  secret: { wall: '#e9b8d2', wall2: '#d49cbc', roof: '#9d3f6e', bld: '#cf9ec0', win: '#fff1a8', tower: '#a06a92', palm: '#6b4a6a' },
};
function drawCity(off, baseY, th) {
  const c = CITY_COL[th];
  const night = th === 'night';
  const o = ((off % 384) + 384) % 384;
  for (const rep of [-384, 0]) {
    for (const b of CITY) {
      const x = Math.floor(b.x + rep + o);
      if (x > W || x + b.w < 0) continue;
      const top = baseY - b.h;
      if (b.t === 'house') {
        ctx.fillStyle = c.wall; ctx.fillRect(x, top + 4, b.w, b.h - 4);
        ctx.fillStyle = c.roof; ctx.fillRect(x - 1, top + 1, b.w + 2, 3); ctx.fillRect(x + 1, top, b.w - 2, 1);
        ctx.fillStyle = c.win;
        for (let wx = 3; wx < b.w - 3; wx += 6) if (!night || (b.x + wx) % 3) ctx.fillRect(x + wx, top + 7, 2, 2);
      } else if (b.t === 'bld') {
        ctx.fillStyle = c.bld; ctx.fillRect(x, top, b.w, b.h);
        ctx.fillStyle = c.wall2; ctx.fillRect(x + b.w - 2, top, 2, b.h);
        ctx.fillStyle = c.win;
        for (let wy = 3; wy < b.h - 3; wy += 5) for (let wx = 2; wx < b.w - 3; wx += 4) if (!night || (wx * 3 + wy + b.x) % 5 < 3) ctx.fillRect(x + wx, top + wy, 2, 2);
      } else if (b.t === 'tower') {
        ctx.fillStyle = c.tower; ctx.fillRect(x + 1, top, 1, b.h); ctx.fillRect(x + 6, top, 1, b.h);
        for (let k = 0; k < b.h; k += 5) ctx.fillRect(x + 1, top + k, 6, 1);
        ctx.fillStyle = Math.floor(frame / 30) % 2 ? '#ef4444' : '#7f1d1d'; ctx.fillRect(x + 3, top - 2, 2, 2);
      } else if (b.t === 'water') {
        ctx.fillStyle = c.tower; ctx.fillRect(x + 5, top + 8, 2, b.h - 8); ctx.fillRect(x + 2, top + 16, 8, 1);
        ctx.fillStyle = c.bld; ctx.fillRect(x, top, 12, 8); ctx.fillStyle = c.wall2; ctx.fillRect(x, top + 6, 12, 2);
      } else if (b.t === 'palm') {
        ctx.fillStyle = c.tower; ctx.fillRect(x + 3, top + 3, 1, b.h - 3);
        ctx.fillStyle = c.palm; ctx.fillRect(x, top + 1, 7, 2); ctx.fillRect(x + 1, top, 5, 1); ctx.fillRect(x - 1, top + 3, 2, 1); ctx.fillRect(x + 6, top + 3, 2, 1);
      }
    }
  }
}

function drawHills(scroll, base, amp, k, color, phase = 0) {
  ctx.fillStyle = color;
  for (let x = 0; x < W; x += 2) {
    const wx = x + scroll;
    const h = Math.floor(base + Math.sin(wx * k + phase) * amp + Math.sin(wx * k * 2.3 + phase * 2) * amp * 0.4);
    ctx.fillRect(x, GY - h, 2, h);
  }
}

function drawBushes(scroll, color) {
  const o = ((scroll % 64) + 64) % 64;
  ctx.fillStyle = color;
  for (let x = -o - 64; x < W + 64; x += 64) {
    ctx.fillRect(x, GY - 5, 22, 5); ctx.fillRect(x + 3, GY - 8, 15, 3); ctx.fillRect(x + 7, GY - 10, 7, 2);
    ctx.fillRect(x + 34, GY - 4, 14, 4); ctx.fillRect(x + 37, GY - 6, 8, 2);
  }
}

// Laguinho do Parque Ikeda: Torii iluminado na água e reflexos (sem ponte)
function drawLake(cam) {
  const top = 152;
  const bands = ['#6b4f9e', '#53418f', '#3f3480', '#2e2a6e'];
  const bh = Math.ceil((GY - top) / bands.length);
  bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, top + i * bh, W, bh); });

  // margem arborizada ao fundo com paralaxe própria
  const bankOff = -((cam * 0.38) % 24);
  ctx.fillStyle = '#253d24'; ctx.fillRect(0, top - 2, W, 2);
  ctx.fillStyle = '#345630';
  for (let x = Math.floor(bankOff) - 24; x < W + 24; x += 12) {
    ctx.fillRect(x, top - 5, 8, 3);
    ctx.fillRect(x + 2, top - 7, 4, 2);
  }

  const o = -((cam * 0.48) % 384);
  for (const rep of [0, 384]) {
    const base = Math.floor(o + rep);
    // Torii vermelho no lago
    const tx = base + 140;
    if (tx > -60 && tx < W + 60) {
      const glow = ctx.createRadialGradient(tx, top - 6, 2, tx, top - 6, 36);
      glow.addColorStop(0, 'rgba(255,90,60,0.48)'); glow.addColorStop(1, 'rgba(255,90,60,0)');
      ctx.fillStyle = glow; ctx.fillRect(tx - 36, top - 42, 72, 74);
      ctx.fillStyle = '#ff3b2f'; ctx.fillRect(tx - 10, top - 24, 2, 28); ctx.fillRect(tx + 8, top - 24, 2, 28);
      ctx.fillRect(tx - 12, top - 19, 24, 2);
      ctx.fillStyle = '#ff6a3d'; ctx.fillRect(tx - 15, top - 26, 30, 3);
      ctx.fillStyle = '#7f1d1d'; ctx.fillRect(tx - 16, top - 27, 3, 1); ctx.fillRect(tx + 13, top - 27, 3, 1);
      // luzinhas na água em volta do torii
      ctx.fillStyle = '#ffd1a1';
      for (let i = -3; i <= 3; i++) ctx.fillRect(tx + i * 7, top + 2 + (i % 2), 1, 1);
      // reflexo tremulando
      for (let r = 0; r < 12; r++) {
        const wave = Math.round(Math.sin(frame * 0.1 + r) * 1.5);
        ctx.fillStyle = `rgba(255,80,60,${(0.52 - r * 0.036).toFixed(2)})`;
        ctx.fillRect(tx - 12 + wave, top + 4 + r * 2, 24 - r, 1);
      }
    }
  }
  // brilho da superfície com paralaxe mais rápida na água próxima
  ctx.fillStyle = 'rgba(255,200,220,0.35)';
  for (let i = 0; i < 20; i++) {
    const layerSpeed = 0.5 + (i % 4) * 0.08;
    const x = Math.floor((((i * 41 - cam * layerSpeed + frame * 0.25) % (W + 24)) + (W + 24)) % (W + 24)) - 12;
    ctx.fillRect(x, top + 4 + (i % 7) * 4, 6 + (i % 3), 1);
  }
}

function drawMidTrees(scroll, color) {
  const o = ((scroll % 88) + 88) % 88;
  ctx.fillStyle = color;
  for (let x = -o - 88; x < W + 88; x += 88) {
    ctx.fillRect(x + 10, GY - 18, 2, 18);
    ctx.fillRect(x + 4, GY - 27, 14, 10);
    ctx.fillRect(x + 7, GY - 30, 8, 3);
    ctx.fillRect(x + 54, GY - 14, 2, 14);
    ctx.fillRect(x + 49, GY - 22, 12, 9);
  }
}

function drawForegroundGrass(scroll) {
  const o = ((scroll % 56) + 56) % 56;
  ctx.fillStyle = theme.bush;
  for (let x = -o - 56; x < W + 56; x += 56) {
    ctx.fillRect(x + 4, H - 5, 2, 5);
    ctx.fillRect(x + 7, H - 7, 2, 7);
    ctx.fillRect(x + 10, H - 4, 2, 4);
    ctx.fillRect(x + 34, H - 6, 2, 6);
    ctx.fillRect(x + 37, H - 4, 2, 4);
  }
}

function drawBackground() {
  const th = cfg.theme;
  bandedSky(theme.sky);
  if (th === 'night' || th === 'secret') {
    drawStars();
    drawMoon(Math.round(334 - camX * 0.025), 34, th === 'secret' ? '#ffe4f1' : '#fef3c7');
  }
  if (th === 'day') {
    const sx = Math.round(334 - camX * 0.025);
    pxCircle(ctx, sx, 30, 13, '#ffe58a'); pxCircle(ctx, sx, 30, 10, '#fff6c4');
  }
  if (th === 'sunset') {
    const sx = Math.round(308 - camX * 0.03);
    pxCircle(ctx, sx, 140, 24, '#ffb36b'); pxCircle(ctx, sx, 140, 19, '#ffd88a');
  }
  if (theme.clouds) {
    drawClouds(camX * 0.06 + frame * 0.04);
    drawClouds(camX * 0.14 + frame * 0.08 + 180);
  }
  // Camadas de paralaxe progressivas (do mais distante ao mais próximo)
  drawHills(camX * 0.11, 34, 9, 0.014, theme.hillFar, 0.5);
  drawCity(-camX * 0.22, 158, th);
  drawHills(camX * 0.34, 20, 6, 0.024, theme.hillFar, 2.2);
  if (cfg.lake) {
    drawLake(camX);
  } else {
    drawHills(camX * 0.48, 12, 5, 0.036, theme.hillNear, 3.6);
    drawMidTrees(camX * 0.60, theme.bush);
    drawBushes(camX * 0.76, theme.bush);
  }
}

function drawGround(cam) {
  const x0 = Math.floor(cam);
  ctx.fillStyle = theme.dirt; ctx.fillRect(x0, GY + 3, W + 1, H - GY);
  ctx.fillStyle = theme.dirtD; ctx.fillRect(x0, GY + 3, W + 1, 1);
  ctx.fillStyle = theme.grass; ctx.fillRect(x0, GY, W + 1, 3);
  for (let x = Math.floor(x0 / 4) * 4; x < x0 + W + 4; x += 4) {
    ctx.fillStyle = theme.grassL; ctx.fillRect(x, GY - 1, 1, 1); ctx.fillRect(x + 2, GY, 1, 1);
  }
  for (let x = Math.floor(x0 / 16) * 16; x < x0 + W + 16; x += 16) {
    const h = Math.abs((x * 7919) % 97);
    ctx.fillStyle = theme.dirtL; ctx.fillRect(x + (h % 12), GY + 8 + (h % 14), 2, 1);
    ctx.fillStyle = theme.dirtD; ctx.fillRect(x + ((h * 3) % 14), GY + 18 + (h % 8), 1, 1);
    ctx.fillStyle = theme.dirtL; ctx.fillRect(x + ((h * 5) % 15), GY + 26 - (h % 5), 1, 1);
  }
}

function drawPlatform(p) {
  const x = Math.round(p.x), y = Math.round(p.y);
  const moving = p.mx || p.my;
  if (moving) {
    ctx.fillStyle = '#0055a4'; ctx.fillRect(x, y, p.w, 6);
    ctx.fillStyle = '#f5b301'; ctx.fillRect(x, y, p.w, 2);
    ctx.fillStyle = '#002a5c'; ctx.fillRect(x, y + 5, p.w, 1);
    ctx.fillStyle = '#ffd84d'; for (let i = 3; i < p.w - 2; i += 8) ctx.fillRect(x + i, y + 3, 2, 1);
  } else {
    ctx.fillStyle = '#9a5a2c'; ctx.fillRect(x, y, p.w, 6);
    ctx.fillStyle = '#d2955a'; ctx.fillRect(x, y, p.w, 1);
    ctx.fillStyle = '#6b3a1a'; ctx.fillRect(x, y + 5, p.w, 1);
    for (let i = 6; i < p.w; i += 7) ctx.fillRect(x + i, y + 1, 1, 4);
    ctx.fillStyle = '#4a7c3a'; ctx.fillRect(x + 1, y - 1, 3, 1); ctx.fillRect(x + p.w - 5, y - 1, 3, 1);
  }
}

function drawLantern(l) {
  if (l.lit && frame % 14 === 0) {
    particles.push({ x: l.x + 3 + Math.random() * 6, y: l.y + 6, vx: (Math.random() - 0.5) * 0.2, vy: -0.3, life: 30, max: 30, c: Math.random() > 0.5 ? '#fff1a8' : '#ffffff', s: 1, up: true });
  }
  drawJapaneseLantern(ctx, l.x, l.y, l.lit, frame, l.golden);
}

function drawGoalPortal(x) {
  const r = 30 + Math.sin(frame * 0.08) * 3;
  const g = ctx.createRadialGradient(x, GY - 20, 2, x, GY - 20, r);
  g.addColorStop(0, 'rgba(255,216,77,0.55)'); g.addColorStop(1, 'rgba(255,216,77,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r, GY - 20 - r, r * 2, r * 2);
  drawToriiBack(ctx, x, GY);
  const next = stageId === 'S' ? '1-3' : stageId === 1 ? '1-2' : '1-3';
  const label = `${t('stage_word')} ${next} >`;
  const w = pixelTextWidth(label) + 6;
  ctx.fillStyle = '#002a5c'; ctx.fillRect(x - w / 2, GY - 58, w, 11);
  ctx.fillStyle = '#f5b301'; ctx.fillRect(x - w / 2, GY - 58, w, 1); ctx.fillRect(x - w / 2, GY - 48, w, 1);
  drawPixelText(ctx, label, x - w / 2 + 3, GY - 55, '#ffd84d');
}

function drawSecretTorii(s) {
  const x = s.x, gy = s.y;
  for (let i = 0; i < 3; i++) {
    const a = frame * 0.05 + i * 2.1;
    ctx.fillStyle = '#fff1a8';
    ctx.fillRect(Math.round(x + Math.cos(a) * 14), Math.round(gy - 14 + Math.sin(a) * 10), 1, 1);
  }
  ctx.fillStyle = '#f5b301'; ctx.fillRect(x - 9, gy - 24, 2, 24); ctx.fillRect(x + 7, gy - 24, 2, 24); ctx.fillRect(x - 10, gy - 19, 20, 1);
  ctx.fillStyle = '#ffd84d'; ctx.fillRect(x - 12, gy - 26, 24, 2);
  ctx.fillStyle = '#7a5800'; ctx.fillRect(x - 13, gy - 27, 26, 1);
  drawPixelText(ctx, '?', x - 1, gy - 15, '#ffffff');
}

function drawSign() {
  const x = 22;
  ctx.fillStyle = '#6b3a1a'; ctx.fillRect(x + 4, GY - 20, 2, 20); ctx.fillRect(x + 40, GY - 20, 2, 20);
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(x, GY - 30, 46, 16);
  ctx.fillStyle = '#9a5a2c'; ctx.fillRect(x, GY - 30, 46, 1); ctx.fillRect(x, GY - 15, 46, 1); ctx.fillRect(x, GY - 30, 1, 16); ctx.fillRect(x + 45, GY - 30, 1, 16);
  const l1 = t('sign1'), l2 = t('sign2');
  drawPixelText(ctx, l1, x + 23 - pixelTextWidth(l1) / 2, GY - 27, '#0055a4');
  drawPixelText(ctx, l2, x + 23 - pixelTextWidth(l2) / 2, GY - 21, '#c81e1e');
}

function drawPlayer() {
  if (player.inv > 0 && Math.floor(frame / 4) % 2 === 0) return;
  let anim = 'idle';
  let idx = 0;
  let yOffset = 0;
  if (player.inv > 65) {
    anim = 'hurt';
  } else if (!player.onGround) {
    if (player.vy < 0) {
      anim = 'jump';
      idx = Math.floor(frame / 10);
    } else {
      anim = 'fall';
    }
  } else if (Math.abs(player.vx) > 0.15) {
    anim = Math.abs(player.vx) > 1.35 ? 'run' : 'walk';
    // Passo sincronizado com a distancia real caminhada + leve balanço vertical natural
    idx = Math.floor(player.walkDist / 6) % 4;
    if (idx === 1 || idx === 3) yOffset = -1;
  } else {
    // Parado: um único quadro estável + respiração suave de 1px (sem trocar de quadro = sem bug visual)
    yOffset = Math.floor(frame / 34) % 2 === 0 ? 0 : 1;
  }
  drawChibiFrame(ctx, selectedCharacter, anim, idx, player.x + player.w / 2, player.y + player.h + 1, player.facing < 0, yOffset);
}

function drawWorld() {
  drawBackground();
  const cam = Math.round(camX);
  ctx.save();
  ctx.translate(-cam, 0);

  for (const tr of cfg.trees) if (tr.x > cam - 30 && tr.x < cam + W + 30) drawTree(ctx, tr.x, GY, tr.type);
  for (const d of cfg.decor) if (d.t === 'toro') drawPixelMatrix(ctx, TORO, d.x, GY - 12, false, cfg.theme === 'night' ? null : TORO_OFF);
  if (cfg.sign) drawSign();
  for (const tx of cfg.toriis) drawToriiBack(ctx, tx, GY);

  drawGround(cam);

  if (cfg.castle) drawCastle(ctx, cfg.goalX - 50, GY, true, frame);
  else drawGoalPortal(cfg.goalX);
  if (isSecretUnlocked()) drawSecretTorii(cfg.secret);

  for (const p of platforms) drawPlatform(p);
  for (const l of lanterns) drawLantern(l);

  for (const f of flowers) {
    if (f.got) continue;
    const bob = Math.round(Math.sin(frame * 0.1 + f.x) * 1.5);
    drawPixelMatrix(ctx, FLOWER, f.x - 3, f.y - 3 + bob);
  }

  const bugMap = cfg.theme === 'night' ? BUG_NIGHT : cfg.theme === 'sunset' ? BUG_SUNSET : null;
  for (const e of enemies) {
    if (e.dead) { if (e.squash > 0) drawPixelMatrix(ctx, BUG_SQUASH, e.x, e.y + 6, false, bugMap); continue; }
    drawPixelMatrix(ctx, Math.floor(frame / 10) % 2 ? BUG_A : BUG_B, e.x, e.y, e.vx > 0, bugMap);
  }

  drawPlayer();

  for (const tx of cfg.toriis) drawToriiFront(ctx, tx, GY);
  if (!cfg.castle) drawToriiFront(ctx, cfg.goalX, GY);

  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.c;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
  }
  ctx.globalAlpha = 1;
  for (const p of popups) {
    ctx.globalAlpha = Math.min(1, p.life / 20);
    drawPixelText(ctx, p.text, p.x - pixelTextWidth(p.text) / 2, p.y, p.color, '#000');
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  drawForegroundGrass(camX * 1.22);
  drawPetals();
}

function drawPetals() {
  for (const p of petals) { ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); }
}

// ================= Tela inicial =================
function drawNightCloudCluster(cx, cy, w) {
  ctx.fillStyle = '#1b2c5e';
  ctx.fillRect(cx - w / 2, cy, w, 6);
  pxCircle(ctx, cx - w * 0.25, cy, 7, '#1b2c5e');
  pxCircle(ctx, cx + w * 0.15, cy - 2, 9, '#1b2c5e');
  ctx.fillStyle = '#263c7a';
  ctx.fillRect(cx - w / 2 + 2, cy - 1, w - 4, 4);
  pxCircle(ctx, cx - w * 0.22, cy - 1, 5, '#263c7a');
  pxCircle(ctx, cx + w * 0.15, cy - 3, 7, '#263c7a');
}

function drawMenu() {
  theme = THEMES.night;
  bandedSky(THEMES.night.sky);
  drawStars();
  drawMoon(302, 34);

  // Nuvens noturnas estilizadas em tons de azul-índigo
  drawNightCloudCluster(56, 68, 72);
  drawNightCloudCluster(112, 84, 54);
  drawNightCloudCluster(324, 62, 68);
  drawNightCloudCluster(280, 82, 48);

  // Cidade de Assaí iluminada ao fundo (estática)
  drawCity(0, 166, 'night');
  drawCity(190, 160, 'night');

  // Colinas distantes suaves
  ctx.fillStyle = '#16233f';
  for (let x = 0; x < W; x += 2) { const h = Math.floor(12 + Math.sin(x * 0.03) * 4); ctx.fillRect(x, GY - h, 2, h); }

  // Morro central do Castelo Japonês com gramado no topo e talude de terra sombreado
  const cx = 192;
  for (let x = 82; x <= 302; x++) {
    const d = Math.abs(x - cx);
    let top;
    if (d <= 62) top = 148;
    else top = 148 + Math.floor(((d - 62) / 48) * (GY - 148));
    if (top >= GY) continue;
    // Grama verde no topo da rampa/platô
    ctx.fillStyle = '#47a358'; ctx.fillRect(x, top, 1, 2);
    ctx.fillStyle = '#2c7a3e'; ctx.fillRect(x, top + 2, 1, 2);
    // Talude de terra marrom texturizada
    ctx.fillStyle = '#523420'; ctx.fillRect(x, top + 4, 1, GY - top - 4);
    if (x % 4 === 0) { ctx.fillStyle = '#6b452b'; ctx.fillRect(x, top + 7 + (x % 9), 2, 2); }
    if (x % 6 === 0) { ctx.fillStyle = '#3b2415'; ctx.fillRect(x, top + 12 + (x % 7), 2, 2); }
  }

  // Escadarias laterais de pedra subindo o morro (esquerda e direita, como na referência!)
  for (let i = 0; i < 18; i++) {
    const sy = 148 + i * 2;
    const lx = 128 - Math.floor(i * 2.5);
    const rx = 252 + Math.floor(i * 2.5);
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(lx, sy, 6, 1); ctx.fillRect(rx, sy, 6, 1);
    ctx.fillStyle = '#475569'; ctx.fillRect(lx, sy + 1, 6, 1); ctx.fillRect(rx, sy + 1, 6, 1);
  }

  // Castelo Japonês de Assaí iluminado no topo do morro
  drawCastle(ctx, cx - 50, 148, true, frame);

  // Chão principal com grama rica e terra texturizada
  ctx.fillStyle = '#47a358'; ctx.fillRect(0, GY, W, 2);
  ctx.fillStyle = '#2c7a3e'; ctx.fillRect(0, GY + 2, W, 2);
  ctx.fillStyle = '#422817'; ctx.fillRect(0, GY + 4, W, H - GY - 4);
  ctx.fillStyle = '#68c26e';
  for (let x = 0; x < W; x += 5) ctx.fillRect(x, GY - 1, 2, 1);
  for (let x = 4; x < W; x += 14) {
    ctx.fillStyle = '#593720'; ctx.fillRect(x, GY + 8 + (x % 11), 3, 2);
    ctx.fillStyle = '#2e1b0f'; ctx.fillRect(x + 6, GY + 15 + (x % 9), 2, 2);
  }

  // Árvores e Torii posicionados exatamente como na composição de referência
  drawTree(ctx, 36, GY, 'sakura');
  drawTree(ctx, 82, GY, 'ipe-branco');
  drawToriiBack(ctx, 314, GY);
  drawToriiFront(ctx, 314, GY);
  drawTree(ctx, 358, GY, 'ipe-amarelo');

  // Galhos de cerejeira nos cantos superiores e pétalas caindo
  drawSakuraBranch(ctx, W, false);
  drawSakuraBranch(ctx, W, true);
  drawPetals();
}

// ================= Loop =================
function draw() {
  ctx.save();
  ctx.scale(2, 2);
  ctx.imageSmoothingEnabled = false;
  if (state === 'menu') drawMenu();
  else drawWorld();
  ctx.restore();
}

let last = performance.now(), acc = 0;
const STEP = 1000 / 60;
function loop(now) {
  acc += Math.min(100, now - last);
  last = now;
  while (acc >= STEP) { update(); acc -= STEP; }
  draw();
  requestAnimationFrame(loop);
}

applySettings();
theme = THEMES.night;
initPetals();
requestAnimationFrame(loop);
