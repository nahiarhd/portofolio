/**
 * Procedural Web Audio Sound & Generative Ambient Drone Engine.
 *
 * Synthesizes subtle tactile UI micro-sounds and an evolving ambient soundscape
 * directly via the Web Audio API without external audio files (.mp3/.wav).
 * Zero asset payload, zero network latency.
 *
 * Muted by default to respect browser autoplay policies and visitor preference.
 */

type SoundType = "tick" | "scroll" | "blip" | "decrypt" | "pulse";

let audioCtx: AudioContext | null = null;
let soundEnabled = false;
const listeners = new Set<(enabled: boolean) => void>();

// Ambient Generative Drone Nodes
interface AmbientDrone {
  oscillators: OscillatorNode[];
  masterGain: GainNode;
  filter: BiquadFilterNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
}

let activeDrone: AmbientDrone | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

function startAmbientDrone(): void {
  if (!soundEnabled || activeDrone || typeof window === "undefined") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;

    // Master drone gain with smooth fade-in
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, t);
    masterGain.gain.exponentialRampToValueAtTime(0.022, t + 2.5);

    // Warm resonant lowpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, t);
    filter.Q.setValueAtTime(2.2, t);

    // Ethereal chord frequencies (D2, A2, F3)
    const freqs = [73.42, 110.0, 174.61];
    const oscillators: OscillatorNode[] = [];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, t);

      // Subtle detune for lush chorus thickness
      osc.detune.setValueAtTime((idx - 1) * 4, t);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.33, t);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start(t);
      oscillators.push(osc);
    });

    // Slow LFO for organic breathing filter movement (0.06 Hz)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.06, t);
    lfoGain.gain.setValueAtTime(60, t);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(t);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    activeDrone = {
      oscillators,
      masterGain,
      filter,
      lfo,
      lfoGain,
    };
  } catch {
    // Ignore audio initialization errors
  }
}

function stopAmbientDrone(): void {
  if (!activeDrone || !audioCtx) return;
  try {
    const t = audioCtx.currentTime;
    const drone = activeDrone;
    activeDrone = null;

    drone.masterGain.gain.setValueAtTime(drone.masterGain.gain.value, t);
    drone.masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    setTimeout(() => {
      drone.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Already stopped
        }
      });
      try {
        drone.lfo.stop();
        drone.lfo.disconnect();
      } catch {
        // Already stopped
      }
    }, 1300);
  } catch {
    activeDrone = null;
  }
}

/**
 * Dynamically shift the ambient drone's harmonic brightness as the user scrolls.
 */
export function updateAmbientScroll(progress: number): void {
  if (!activeDrone || !audioCtx) return;
  try {
    const targetFreq = 260 + progress * 240; // 260Hz -> 500Hz
    activeDrone.filter.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.4);
  } catch {
    // Ignore
  }
}

export function getSoundSnapshot(): boolean {
  if (typeof window !== "undefined" && !soundEnabled) {
    const stored = localStorage.getItem("sound_enabled");
    soundEnabled = stored === "true";
  }
  return soundEnabled;
}

export function getServerSoundSnapshot(): boolean {
  return false;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (typeof window !== "undefined") {
    localStorage.setItem("sound_enabled", String(enabled));
    if (enabled) {
      getAudioContext();
      startAmbientDrone();
    } else {
      stopAmbientDrone();
    }
  }
  listeners.forEach((fn) => fn(enabled));
}

export function toggleSound(): boolean {
  setSoundEnabled(!soundEnabled);
  if (soundEnabled) {
    playSound("blip");
  }
  return soundEnabled;
}

export function subscribeSound(fn: (enabled: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Play a synthesized micro-sound. Zero-alloc when sound is muted.
 */
export function playSound(type: SoundType): void {
  if (!soundEnabled || typeof window === "undefined") return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;

  try {
    switch (type) {
      case "tick": {
        // Ultra-short tactile click (8ms)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.008);

        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.008);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.008);
        break;
      }

      case "scroll": {
        // Subtle micro-haptic scroll click (4ms)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.004);

        gain.gain.setValueAtTime(0.018, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.004);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.004);
        break;
      }

      case "blip": {
        // Futuristic digital blip for chat streaming & tool calls (45ms)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.035);

        gain.gain.setValueAtTime(0.03, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.045);
        break;
      }

      case "decrypt": {
        // Cyber decryption character shuffle static (25ms)
        const bufferSize = Math.floor(ctx.sampleRate * 0.025);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(3200, t);
        filter.Q.setValueAtTime(4, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.025, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(t);
        break;
      }

      case "pulse": {
        // Deep sub-bass pulse on route/clearance transition (120ms)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);

        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }
    }
  } catch {
    // Ignore audio scheduling exceptions
  }
}
