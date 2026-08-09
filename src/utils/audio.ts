// Web Audio API Synthesizer for WordMaster sound effects & background music

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private bgMusicEnabled: boolean = false;
  private volume: number = 0.7; // 0.0 to 1.0
  private bgOscillators: OscillatorNode[] = [];
  private bgGain: GainNode | null = null;
  private isBgPlaying: boolean = false;

  constructor() {
    // AudioContext will initialize on first user interaction
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.isBgPlaying) {
      this.stopBgMusic();
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume / 100));
    if (this.bgGain && this.ctx) {
      this.bgGain.gain.setTargetAtTime(this.volume * 0.08, this.ctx.currentTime, 0.1);
    }
  }

  public setBgMusicEnabled(enabled: boolean) {
    this.bgMusicEnabled = enabled;
    if (enabled && this.enabled) {
      this.startBgMusic();
    } else {
      this.stopBgMusic();
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Gentle procedural ambient synth chord pad for background music
  public startBgMusic() {
    if (this.isBgPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.isBgPlaying = true;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.08, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      // Relaxing ambient triad chords (Cmaj9 / Am9 drone)
      const freqs = [130.81, 164.81, 196.0, 246.94]; // C3, E3, G3, B3

      this.bgOscillators = freqs.map((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(filter);
        osc.start();
        return osc;
      });

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      this.bgGain = masterGain;
    } catch (e) {
      this.isBgPlaying = false;
    }
  }

  public stopBgMusic() {
    this.bgOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.bgOscillators = [];
    this.isBgPlaying = false;
    this.bgGain = null;
  }

  // Soft key click on typing
  public playKeyPress() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      // Ignore audio glitches
    }
  }

  // Key delete click
  public playDelete() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }

  // Tile reveal chime (pitch varies slightly by index 0..5)
  public playTileReveal(
    index: number = 0,
    status: 'correct' | 'present' | 'absent' | 'empty' | 'tbd' = 'absent'
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      let baseFreq = 400 + index * 80;
      if (status === 'correct') baseFreq += 300;
      else if (status === 'present') baseFreq += 150;

      osc.type = status === 'correct' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // Error shake buzz
  public playError() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.15 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  // Victory fanfare (ascending 4-note chord)
  public playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.15 * this.volume, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.4);
      });
    } catch (e) {}
  }

  // Defeat sound (descending minor chord)
  public playDefeat() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [440, 415.3, 392, 349.23]; // A4, Ab4, G4, F4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.5);
      });
    } catch (e) {}
  }
}

export const soundFx = new SoundEngine();
