class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Lowpass filter for warm, dark ambient sound
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(260, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Oscillator 1 - deep root note (55Hz / A1)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'triangle';
      this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);
      this.droneOsc1.connect(this.filter);
      this.droneOsc1.start();

      // Oscillator 2 - detuned 5th (82.4Hz / E2)
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(82.41, this.ctx.currentTime);
      this.droneOsc2.connect(this.filter);
      this.droneOsc2.start();
    } catch {
      // AudioContext not supported or restricted
    }
  }

  public toggleMute(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.08;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 1.2);
    }
    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playChime(freq = 520) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.85);
    } catch {
      // ignore
    }
  }

  public playPulse() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {
      // ignore
    }
  }
}

export const audioSystem = new AudioManager();
