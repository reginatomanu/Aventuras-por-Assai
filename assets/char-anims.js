// Sprite sheet pixel art nitida com ciclo de caminhada de 4 tempos
const CHAR_ANIMS = {
  male: {
    idle: [{ x: 0, y: 0, w: 18, h: 29 }],
    walk: [{ x: 20, y: 0, w: 18, h: 29 }, { x: 40, y: 0, w: 18, h: 29 }, { x: 60, y: 0, w: 18, h: 29 }, { x: 80, y: 0, w: 18, h: 29 }],
    run: [{ x: 100, y: 0, w: 18, h: 29 }, { x: 120, y: 0, w: 18, h: 29 }, { x: 140, y: 0, w: 18, h: 29 }, { x: 160, y: 0, w: 18, h: 29 }],
    jump: [{ x: 180, y: 1, w: 17, h: 28 }],
    fall: [{ x: 199, y: 3, w: 20, h: 26 }],
    hurt: [{ x: 221, y: 0, w: 19, h: 29 }],
  },
  female: {
    idle: [{ x: 242, y: 2, w: 21, h: 27 }],
    walk: [{ x: 265, y: 2, w: 20, h: 27 }, { x: 287, y: 2, w: 20, h: 27 }, { x: 309, y: 2, w: 20, h: 27 }, { x: 331, y: 2, w: 20, h: 27 }],
    run: [{ x: 353, y: 2, w: 20, h: 27 }, { x: 375, y: 2, w: 20, h: 27 }, { x: 397, y: 2, w: 20, h: 27 }, { x: 419, y: 2, w: 20, h: 27 }],
    jump: [{ x: 441, y: 0, w: 22, h: 29 }],
    fall: [{ x: 465, y: 1, w: 21, h: 28 }],
    hurt: [{ x: 488, y: 2, w: 23, h: 27 }],
  },
};
