/**
 * Catalyst Focus Audio - Pure Web Audio API Soundscape Engine
 * 100% procedural, offline-first synthesis for zero-download ambient generation.
 */

// Ensure single global sound engine across HMR reloads
declare global {
  interface Window {
    __CATALYST_SOUND_ENGINE__?: AudioEngine
  }
}

class AudioEngine {
  public ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private activeNodes: Map<string, { gain: GainNode; stop: () => void }> = new Map()
  private fadeInterval: number | null = null
  private currentMasterVolumePercent: number = 80

  constructor() {
    if (typeof window !== 'undefined') {
      const existing = window.__CATALYST_SOUND_ENGINE__
      if (existing && existing !== this) {
        try {
          existing.stopAll()
          if (existing.ctx) {
            void existing.ctx.close()
          }
        } catch {}
      }
      window.__CATALYST_SOUND_ENGINE__ = this
    }
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioContextClass()

      this.masterGain = this.ctx.createGain()
      const gainValue = Math.max(0, Math.min(1, this.currentMasterVolumePercent / 100))
      this.masterGain.gain.setValueAtTime(gainValue, this.ctx.currentTime)

      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 64
      this.analyser.smoothingTimeConstant = 0.85

      this.masterGain.connect(this.analyser)
      this.analyser.connect(this.ctx.destination)
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }

    if (this.masterGain) {
      const gainValue = Math.max(0, Math.min(1, this.currentMasterVolumePercent / 100))
      this.masterGain.gain.setValueAtTime(gainValue, this.ctx.currentTime)
    }

    return this.ctx
  }

  // Generate 5-second White Noise Buffer
  private createWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 5
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  // Generate 5-second Pink Noise Buffer (-3dB/octave using Kellet's filter)
  private createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 5
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
    return buffer
  }

  // Generate 5-second Brown Noise Buffer (-6dB/octave leaky integrator)
  private createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 5
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      output[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = output[i]
      output[i] *= 3.2 // Level compensation
    }
    return buffer
  }

  // Generate Campfire Pop & Crackle Buffer
  private createCampfireCrackleBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 6
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      // Occasional random sharp crackles
      if (Math.random() < 0.0006) {
        const amplitude = 0.3 + Math.random() * 0.6
        output[i] = (Math.random() > 0.5 ? 1 : -1) * amplitude
        // Quick decay
        if (i + 1 < bufferSize) output[i + 1] = output[i] * -0.5
        if (i + 2 < bufferSize) output[i + 2] = output[i] * 0.2
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.015
      }
    }
    return buffer
  }

  public setMasterVolume(volPercent: number): void {
    this.currentMasterVolumePercent = volPercent
    if (!this.masterGain || !this.ctx) return
    const gainValue = Math.max(0, Math.min(1, volPercent / 100))
    this.masterGain.gain.setValueAtTime(gainValue, this.ctx.currentTime)
  }

  public setTrackVolume(trackId: string, volPercent: number): void {
    const track = this.activeNodes.get(trackId)
    if (!track || !this.ctx) return
    const gainValue = Math.max(0, Math.min(1, volPercent / 100))
    track.gain.gain.setTargetAtTime(gainValue, this.ctx.currentTime, 0.04)
  }

  public playTrack(trackId: string, initialVolPercent: number): void {
    this.stopTrack(trackId)
    const ctx = this.getContext()

    const trackGain = ctx.createGain()
    const targetGain = Math.max(0, Math.min(1, initialVolPercent / 100))
    trackGain.gain.setValueAtTime(0, ctx.currentTime)
    trackGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.08)
    trackGain.connect(this.masterGain!)

    let stopFn: () => void = () => {}

    switch (trackId) {
      case 'white-noise': {
        const src = ctx.createBufferSource()
        src.buffer = this.createWhiteNoiseBuffer(ctx)
        src.loop = true
        src.connect(trackGain)
        src.start(0)
        stopFn = () => {
          try {
            src.stop()
            src.disconnect()
          } catch {}
        }
        break
      }

      case 'pink-noise': {
        const src = ctx.createBufferSource()
        src.buffer = this.createPinkNoiseBuffer(ctx)
        src.loop = true
        src.connect(trackGain)
        src.start(0)
        stopFn = () => {
          try {
            src.stop()
            src.disconnect()
          } catch {}
        }
        break
      }

      case 'brown-noise': {
        const src = ctx.createBufferSource()
        src.buffer = this.createBrownNoiseBuffer(ctx)
        src.loop = true
        src.connect(trackGain)
        src.start(0)
        stopFn = () => {
          try {
            src.stop()
            src.disconnect()
          } catch {}
        }
        break
      }

      case 'binaural': {
        // Binaural Alpha beat (Left: 216Hz, Right: 226Hz -> 10Hz Alpha beat)
        const oscL = ctx.createOscillator()
        const oscR = ctx.createOscillator()
        oscL.type = 'sine'
        oscR.type = 'sine'
        oscL.frequency.setValueAtTime(216, ctx.currentTime)
        oscR.frequency.setValueAtTime(226, ctx.currentTime)

        const panL = ctx.createStereoPanner ? ctx.createStereoPanner() : null
        const panR = ctx.createStereoPanner ? ctx.createStereoPanner() : null

        if (panL && panR) {
          panL.pan.setValueAtTime(-0.85, ctx.currentTime)
          panR.pan.setValueAtTime(0.85, ctx.currentTime)
          oscL.connect(panL)
          oscR.connect(panR)
          panL.connect(trackGain)
          panR.connect(trackGain)
        } else {
          oscL.connect(trackGain)
          oscR.connect(trackGain)
        }

        oscL.start(0)
        oscR.start(0)
        stopFn = () => {
          try {
            oscL.stop()
            oscR.stop()
            oscL.disconnect()
            oscR.disconnect()
          } catch {}
        }
        break
      }

      case 'rain': {
        // Filtered pink noise + high pass drops
        const pinkSrc = ctx.createBufferSource()
        pinkSrc.buffer = this.createPinkNoiseBuffer(ctx)
        pinkSrc.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(1400, ctx.currentTime)
        filter.Q.setValueAtTime(0.8, ctx.currentTime)

        pinkSrc.connect(filter)
        filter.connect(trackGain)
        pinkSrc.start(0)

        stopFn = () => {
          try {
            pinkSrc.stop()
            pinkSrc.disconnect()
          } catch {}
        }
        break
      }

      case 'thunder': {
        // Sub low-frequency rumble
        const brownSrc = ctx.createBufferSource()
        brownSrc.buffer = this.createBrownNoiseBuffer(ctx)
        brownSrc.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(95, ctx.currentTime)

        // Slow pulsing LFO
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime)
        lfoGain.gain.setValueAtTime(35, ctx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(filter.frequency)

        brownSrc.connect(filter)
        filter.connect(trackGain)

        brownSrc.start(0)
        lfo.start(0)

        stopFn = () => {
          try {
            brownSrc.stop()
            lfo.stop()
            brownSrc.disconnect()
            lfo.disconnect()
          } catch {}
        }
        break
      }

      case 'forest': {
        // Forest wind: Pink noise modulated with slow organic breath LFO
        const pinkSrc = ctx.createBufferSource()
        pinkSrc.buffer = this.createPinkNoiseBuffer(ctx)
        pinkSrc.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(450, ctx.currentTime)

        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime)
        lfoGain.gain.setValueAtTime(300, ctx.currentTime)

        lfo.connect(lfoGain)
        lfoGain.connect(filter.frequency)

        pinkSrc.connect(filter)
        filter.connect(trackGain)

        pinkSrc.start(0)
        lfo.start(0)

        stopFn = () => {
          try {
            pinkSrc.stop()
            lfo.stop()
            pinkSrc.disconnect()
            lfo.disconnect()
          } catch {}
        }
        break
      }

      case 'campfire': {
        // Low warm rumble + crackle generator
        const brownSrc = ctx.createBufferSource()
        brownSrc.buffer = this.createBrownNoiseBuffer(ctx)
        brownSrc.loop = true
        const lowFilter = ctx.createBiquadFilter()
        lowFilter.type = 'lowpass'
        lowFilter.frequency.setValueAtTime(280, ctx.currentTime)
        brownSrc.connect(lowFilter)
        lowFilter.connect(trackGain)

        const crackleSrc = ctx.createBufferSource()
        crackleSrc.buffer = this.createCampfireCrackleBuffer(ctx)
        crackleSrc.loop = true
        const highFilter = ctx.createBiquadFilter()
        highFilter.type = 'highpass'
        highFilter.frequency.setValueAtTime(1600, ctx.currentTime)
        crackleSrc.connect(highFilter)
        highFilter.connect(trackGain)

        brownSrc.start(0)
        crackleSrc.start(0)

        stopFn = () => {
          try {
            brownSrc.stop()
            crackleSrc.stop()
            brownSrc.disconnect()
            crackleSrc.disconnect()
          } catch {}
        }
        break
      }

      case 'coffee-shop': {
        // Warm shaped murmur bands
        const pinkSrc = ctx.createBufferSource()
        pinkSrc.buffer = this.createPinkNoiseBuffer(ctx)
        pinkSrc.loop = true

        const filter1 = ctx.createBiquadFilter()
        filter1.type = 'bandpass'
        filter1.frequency.setValueAtTime(650, ctx.currentTime)
        filter1.Q.setValueAtTime(1.5, ctx.currentTime)

        const filter2 = ctx.createBiquadFilter()
        filter2.type = 'lowpass'
        filter2.frequency.setValueAtTime(1800, ctx.currentTime)

        pinkSrc.connect(filter1)
        filter1.connect(filter2)
        filter2.connect(trackGain)

        pinkSrc.start(0)
        stopFn = () => {
          try {
            pinkSrc.stop()
            pinkSrc.disconnect()
          } catch {}
        }
        break
      }

      case 'library': {
        // Deep quiet room tone
        const brownSrc = ctx.createBufferSource()
        brownSrc.buffer = this.createBrownNoiseBuffer(ctx)
        brownSrc.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(140, ctx.currentTime)

        brownSrc.connect(filter)
        filter.connect(trackGain)
        brownSrc.start(0)

        stopFn = () => {
          try {
            brownSrc.stop()
            brownSrc.disconnect()
          } catch {}
        }
        break
      }

      case 'office': {
        // Subtle air circulation tone
        const pinkSrc = ctx.createBufferSource()
        pinkSrc.buffer = this.createPinkNoiseBuffer(ctx)
        pinkSrc.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(420, ctx.currentTime)
        filter.Q.setValueAtTime(2.0, ctx.currentTime)

        pinkSrc.connect(filter)
        filter.connect(trackGain)
        pinkSrc.start(0)

        stopFn = () => {
          try {
            pinkSrc.stop()
            pinkSrc.disconnect()
          } catch {}
        }
        break
      }

      default: {
        // Default clean pink noise
        const src = ctx.createBufferSource()
        src.buffer = this.createPinkNoiseBuffer(ctx)
        src.loop = true
        src.connect(trackGain)
        src.start(0)
        stopFn = () => {
          try {
            src.stop()
            src.disconnect()
          } catch {}
        }
      }
    }

    this.activeNodes.set(trackId, {
      gain: trackGain,
      stop: stopFn,
    })
  }

  public isTrackActive(trackId: string): boolean {
    return this.activeNodes.has(trackId)
  }

  public pause(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }

    // 1. Immediately mute master gain
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime)
      } catch {}
    }

    // 2. Suspend AudioContext to guarantee zero hardware audio output
    if (this.ctx && this.ctx.state === 'running') {
      try {
        void this.ctx.suspend()
      } catch {}
    }
  }

  public resume(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume()
      }
      if (this.masterGain) {
        try {
          const gainValue = Math.max(0, Math.min(1, this.currentMasterVolumePercent / 100))
          this.masterGain.gain.setValueAtTime(gainValue, this.ctx.currentTime)
        } catch {}
      }
    }
  }

  public stopTrack(trackId: string): void {
    const track = this.activeNodes.get(trackId)
    if (!track) return

    // Immediately remove from active map to prevent race conditions
    this.activeNodes.delete(trackId)

    try {
      track.stop()
    } catch {}
    try {
      track.gain.disconnect()
    } catch {}
  }

  public stopAll(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }

    // 1. Immediately mute master gain
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime)
      } catch {}
    }

    // 2. Stop and disconnect every track node
    this.activeNodes.forEach((track) => {
      try {
        track.stop()
      } catch {}
      try {
        track.gain.disconnect()
      } catch {}
    })
    this.activeNodes.clear()

    // 3. Suspend context
    if (this.ctx && this.ctx.state === 'running') {
      try {
        void this.ctx.suspend()
      } catch {}
    }
  }

  public startFadeout(durationSec: number, onComplete?: () => void): void {
    if (!this.masterGain || !this.ctx) {
      onComplete?.()
      return
    }

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }

    const startTime = this.ctx.currentTime
    const startGain = this.masterGain.gain.value
    this.masterGain.gain.setValueAtTime(startGain, startTime)
    this.masterGain.gain.linearRampToValueAtTime(0, startTime + durationSec)

    setTimeout(() => {
      this.stopAll()
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime)
      }
      onComplete?.()
    }, durationSec * 1000 + 100)
  }

  public getAudioEnergy(): number {
    if (!this.analyser) return 0
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i]
    }
    return sum / (data.length * 255)
  }

  public playTimerChime(): void {
    const ctx = this.getContext()
    const now = ctx.currentTime

    // Warm peaceful singing bowl chime
    const playBell = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.25, start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(start)
      osc.stop(start + duration + 0.1)
    }

    playBell(528, now, 1.8) // Solfeggio frequency 528Hz (Transformation/Peace)
    playBell(792, now + 0.35, 2.2)
  }
}

export const soundEngine = new AudioEngine()
