/**
 * SCADA Audio Synthesizer for Power House Dispatch Console
 * Uses Web Audio API for zero-dependency, ultra-reliable audible alarms and switchgear sound effects.
 */

class DispatchAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeSirenOsc: OscillatorNode | null = null;
  private activeSirenGain: GainNode | null = null;
  private sirenIntervalId: number | null = null;

  constructor() {
    const savedMute = localStorage.getItem('gridpulse_sound_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    localStorage.setItem('gridpulse_sound_muted', muted ? 'true' : 'false');
    if (muted) {
      this.stopContinuousSiren();
    }
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  /**
   * High-voltage Breaker Trip/Close mechanical clack
   */
  public playBreakerSound(action: 'TRIP' | 'CLOSE') {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = action === 'TRIP' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(action === 'TRIP' ? 120 : 180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {
      // Audio playback errors silently handled
    }
  }

  /**
   * Warning alert chime (2 short pulsing beeps)
   */
  public playWarningChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const playBeep = (startTime: number, freq: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.13);
      };

      playBeep(now, 880);
      playBeep(now + 0.18, 880);
    } catch {
      // Audio playback errors handled
    }
  }

  /**
   * Play continuous or pulsing Critical SCADA alarm
   */
  public playCriticalAlarmPulse() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.linearRampToValueAtTime(750, now + 0.15);
      osc.frequency.linearRampToValueAtTime(950, now + 0.3);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Silent error handling
    }
  }

  /**
   * Start looping emergency siren for unacknowledged critical emergencies
   */
  public startContinuousSiren() {
    if (this.isMuted || this.sirenIntervalId !== null) return;
    this.playCriticalAlarmPulse();
    this.sirenIntervalId = window.setInterval(() => {
      if (this.isMuted) {
        this.stopContinuousSiren();
        return;
      }
      this.playCriticalAlarmPulse();
    }, 700);
  }

  public stopContinuousSiren() {
    if (this.sirenIntervalId !== null) {
      clearInterval(this.sirenIntervalId);
      this.sirenIntervalId = null;
    }
    if (this.activeSirenOsc) {
      try {
        this.activeSirenOsc.stop();
        this.activeSirenOsc.disconnect();
      } catch {
        // Ignored
      }
      this.activeSirenOsc = null;
      this.activeSirenGain = null;
    }
  }

  /**
   * Soft acknowledgment blip
   */
  public playAckChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Silent
    }
  }

  /**
   * System Restoration Chime: Ascending major arpeggio confirming full normal operation
   */
  public playRestorationChime() {
    this.stopContinuousSiren();
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.24);
      });
    } catch {
      // Silent
    }
  }
}

export const dispatchAudio = new DispatchAudioEngine();
