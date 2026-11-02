import type { SoundTrackDef } from './types'

export const SOUND_TRACKS: SoundTrackDef[] = [
  // Nature
  {
    id: 'rain',
    name: 'Rain on Glass',
    description: 'Gentle raindrops falling steadily on glass',
    category: 'nature',
    accentColor: '#38bdf8', // sky
    defaultVolume: 60,
  },
  {
    id: 'thunder',
    name: 'Rolling Thunder',
    description: 'Subtle low-frequency distant storm rumble',
    category: 'nature',
    accentColor: '#818cf8', // indigo
    defaultVolume: 45,
  },
  {
    id: 'forest',
    name: 'Forest Wind',
    description: 'Soft pine breeze and swaying woodland canopy',
    category: 'nature',
    accentColor: '#34d399', // emerald
    defaultVolume: 50,
  },
  {
    id: 'campfire',
    name: 'Campfire Embers',
    description: 'Warm glowing hearth with organic wood pops',
    category: 'nature',
    accentColor: '#fb923c', // orange
    defaultVolume: 65,
  },

  // Environment
  {
    id: 'coffee-shop',
    name: 'Coffee Shop',
    description: 'Subdued cafe murmur and gentle acoustic air',
    category: 'environment',
    accentColor: '#f59e0b', // amber
    defaultVolume: 40,
  },
  {
    id: 'library',
    name: 'Quiet Library',
    description: 'Contemplative room tone with subtle page rustle',
    category: 'environment',
    accentColor: '#a78bfa', // purple
    defaultVolume: 55,
  },
  {
    id: 'office',
    name: 'Calm Workspace',
    description: 'Smooth HVAC airflow and steady focus hum',
    category: 'environment',
    accentColor: '#94a3b8', // slate
    defaultVolume: 45,
  },

  // Synthesized Noise & Beats
  {
    id: 'brown-noise',
    name: 'Brown Noise',
    description: 'Deep, low-pitched rumble like a distant ocean',
    category: 'synth',
    accentColor: '#c084fc', // violet
    defaultVolume: 70,
  },
  {
    id: 'pink-noise',
    name: 'Pink Noise',
    description: 'Balanced power spectrum resembling a smooth waterfall',
    category: 'synth',
    accentColor: '#f472b6', // pink
    defaultVolume: 50,
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    description: 'Uniform energy across all frequencies to mask chatter',
    category: 'synth',
    accentColor: '#e2e8f0', // zinc
    defaultVolume: 40,
  },
  {
    id: 'binaural',
    name: 'Alpha Binaural (10Hz)',
    description: 'Stereo detuned carrier waves for flow-state focus',
    category: 'synth',
    accentColor: '#2dd4bf', // teal
    defaultVolume: 55,
  },
]
