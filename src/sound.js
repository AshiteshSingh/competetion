// Web Audio API procedural sound synthesizer (zero external dependencies)
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playScoreUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.04);

      gain.gain.setValueAtTime(0.001, now + index * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.2, now + index * 0.04 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.04);
      osc.stop(now + index * 0.04 + 0.25);
    });
  }

  playLeaderChange() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major triumphant chord

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);

      gain.gain.setValueAtTime(0.001, now + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.25, now + index * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.5);
    });
  }

  playCelebration() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880.00],
      [659.25, 830.61, 987.77],
      [783.99, 987.77, 1174.66]
    ];

    chords.forEach((chord, chordIdx) => {
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + chordIdx * 0.12);

        gain.gain.setValueAtTime(0.001, now + chordIdx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.18, now + chordIdx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + chordIdx * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + chordIdx * 0.12);
        osc.stop(now + chordIdx * 0.12 + 0.4);
      });
    });
  }
}

export const soundFX = new SoundFX();
