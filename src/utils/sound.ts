// レトロなゲームボーイ風シンセサウンドをWeb Audioで生成

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. 軽いクリック音
export function playClick() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Web Audio blocked or unsupported
  }
}

// 2. 召喚成功時のキラキラ音
export function playSummon() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // アルペジオ
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.2);
    });
  } catch (e) {}
}

// 3. レーザースキャン中の連続ピーピー音
export function playScanTick(progress: number) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sawtooth";
    // 進行度に応じて徐々にピッチが高くなる
    const freq = 400 + progress * 8;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

// 4. ボス被弾時の爆発ノイズ音
export function playDamage() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // 低音の歪んだ減衰
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    
    // バンドパスフィルタ
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.4);
    
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(now + 0.4);
    
    // サブアタックの高音
    const hitOsc = ctx.createOscillator();
    const hitGain = ctx.createGain();
    hitOsc.type = "square";
    hitOsc.frequency.setValueAtTime(100, now);
    hitOsc.frequency.exponentialRampToValueAtTime(10, now + 0.2);
    hitGain.gain.setValueAtTime(0.1, now);
    hitGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    hitOsc.connect(hitGain);
    hitGain.connect(ctx.destination);
    hitOsc.start();
    hitOsc.stop(now + 0.2);
    
  } catch (e) {}
}

// 5. コインのチャリンチャリン音
export function playCoins() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // 2和音でのコイン音
    [987.77, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.04, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  } catch (e) {}
}

// 6. クーポン引き換え時の誇らしげなラッパ
export function playRewardTrumpet() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // ド・ミ・ソ・ドのファンファーレ
    const melody = [523.25, 659.25, 783.99, 1046.50];
    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.35);
    });
  } catch (e) {}
}
