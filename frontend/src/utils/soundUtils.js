// soundUtils.js - Custom sounds for Face Scanner

const playTone = (freq, type, duration) => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export const sounds = {
  // 1. Face Success-ah scan aana intha sound (High pitch)
  playSuccess: () => playTone(880, 'sine', 0.5),

  // 2. Timeout or Error vandha intha sound (Low pitch)
  playError: () => playTone(220, 'square', 0.8),

  // 3. Scan start aagum podhu oru chinna beep
  playStart: () => playTone(440, 'sine', 0.2),

  // 4. Models load aagi mudinja udanae
  playReady: () => playTone(660, 'triangle', 0.3),
};