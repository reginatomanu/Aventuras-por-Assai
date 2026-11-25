// Áudio 8-bit — trilha sonora procedural + efeitos (canais separados)
const Audio8 = (() => {
  let ctx = null, master, musicGain, sfxGain;
  let musicVol = 0.5, sfxVol = 0.7;
  let track = null, step = 0, nextTime = 0, timer = null;
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      sfxGain = ctx.createGain();
      musicGain.connect(master);
      sfxGain.connect(master);
      apply();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function apply() {
    if (!ctx) return;
    musicGain.gain.value = musicVol * 0.55;
    sfxGain.gain.value = sfxVol;
  }

  function setVolumes(m, s) { musicVol = m; sfxVol = s; apply(); }

  function note(freq, start, dur, type, vol, dest) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(dest);
    o.start(start);
    o.stop(start + dur + 0.03);
  }

  function blip(freqs, gap, dur, type = 'square', vol = 0.12) {
    if (!ensure() || sfxVol <= 0) return;
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => note(f, t0 + i * gap, dur, type, vol, sfxGain));
  }

  const sfx = {
    jump: () => blip([392, 587], 0.05, 0.1, 'square', 0.09),
    coin: () => blip([988, 1319], 0.06, 0.12, 'square', 0.09),
    lantern: () => blip([659, 880, 1319, 1760], 0.05, 0.18, 'triangle', 0.18),
    stomp: () => blip([300, 150], 0.05, 0.1, 'sawtooth', 0.1),
    hurt: () => blip([220, 110], 0.1, 0.24, 'sawtooth', 0.12),
    talk: () => blip([540, 680], 0.06, 0.08, 'square', 0.08),
    select: () => blip([660, 880], 0.04, 0.07, 'square', 0.08),
    stageClear: () => blip([523, 659, 784, 1047], 0.1, 0.2, 'square', 0.1),
    win: () => blip([523, 659, 784, 1047, 1319, 1568], 0.11, 0.24, 'square', 0.1),
    achievement: () => blip([784, 988, 1175, 1568], 0.08, 0.22, 'triangle', 0.16),
    secret: () => blip([392, 494, 587, 784, 988, 1175], 0.07, 0.2, 'triangle', 0.16),
    gameover: () => blip([392, 330, 262, 196], 0.16, 0.32, 'triangle', 0.16),
  };

  // Trilhas em escala pentatônica japonesa (yo / in)
  const TRACKS = {
    title: {
      bpm: 92, lead: 'triangle',
      melody: [74, 0, 76, 0, 79, 0, 76, 74, 71, 0, 74, 0, 76, 0, 0, 0, 79, 0, 81, 0, 83, 0, 81, 79, 76, 0, 74, 0, 76, 0, 0, 0],
      bass: [50, 0, 0, 0, 57, 0, 0, 0, 55, 0, 0, 0, 57, 0, 0, 0, 52, 0, 0, 0, 59, 0, 0, 0, 57, 0, 0, 0, 50, 0, 0, 0],
    },
    day: {
      bpm: 138, lead: 'square',
      melody: [74, 76, 79, 81, 79, 76, 74, 0, 76, 79, 81, 83, 81, 0, 79, 0, 86, 0, 83, 81, 79, 0, 76, 0, 74, 76, 79, 76, 74, 0, 0, 0],
      bass: [50, 0, 57, 0, 50, 0, 57, 0, 55, 0, 62, 0, 55, 0, 62, 0, 52, 0, 59, 0, 52, 0, 59, 0, 57, 0, 64, 0, 50, 0, 57, 0],
    },
    sunset: {
      bpm: 118, lead: 'square',
      melody: [79, 0, 81, 0, 83, 86, 83, 81, 79, 0, 76, 0, 74, 0, 76, 0, 79, 81, 83, 0, 86, 0, 88, 86, 83, 0, 81, 0, 79, 0, 0, 0],
      bass: [43, 0, 50, 0, 43, 0, 50, 0, 40, 0, 47, 0, 40, 0, 47, 0, 45, 0, 52, 0, 45, 0, 52, 0, 38, 0, 45, 0, 43, 0, 50, 0],
    },
    night: {
      bpm: 104, lead: 'triangle',
      melody: [76, 0, 77, 0, 81, 0, 83, 0, 84, 0, 83, 81, 77, 0, 76, 0, 72, 0, 76, 0, 77, 0, 81, 0, 77, 0, 76, 0, 0, 0, 0, 0],
      bass: [52, 0, 0, 0, 53, 0, 0, 0, 57, 0, 0, 0, 53, 0, 0, 0, 48, 0, 0, 0, 52, 0, 0, 0, 53, 0, 0, 0, 52, 0, 0, 0],
    },
    secret: {
      bpm: 150, lead: 'square',
      melody: [84, 88, 91, 88, 84, 88, 91, 96, 93, 91, 88, 91, 93, 0, 0, 0, 84, 86, 88, 91, 93, 91, 88, 86, 84, 0, 79, 0, 84, 0, 0, 0],
      bass: [48, 0, 55, 0, 48, 0, 55, 0, 53, 0, 60, 0, 53, 0, 60, 0, 45, 0, 52, 0, 45, 0, 52, 0, 43, 0, 50, 0, 48, 0, 55, 0],
    },
  };

  function schedule() {
    if (!track || !ctx) return;
    const spb = 60 / track.bpm / 2;
    while (nextTime < ctx.currentTime + 0.15) {
      const i = step % track.melody.length;
      const m = track.melody[i];
      if (m) note(midi(m), nextTime, spb * 0.9, track.lead, 0.07, musicGain);
      const b = track.bass[i % track.bass.length];
      if (b) note(midi(b), nextTime, spb * 1.8, 'triangle', 0.15, musicGain);
      step++;
      nextTime += spb;
    }
  }

  function playMusic(name) {
    if (!ensure()) return;
    if (track === TRACKS[name] && timer) return;
    stopMusic();
    track = TRACKS[name] || null;
    if (!track) return;
    step = 0;
    nextTime = ctx.currentTime + 0.06;
    timer = setInterval(schedule, 25);
  }

  function stopMusic() {
    if (timer) clearInterval(timer);
    timer = null;
    track = null;
  }

  return { ensure, setVolumes, sfx, playMusic, stopMusic };
})();
