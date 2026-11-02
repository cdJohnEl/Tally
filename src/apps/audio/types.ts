export type SoundCategory = 'nature' | 'environment' | 'synth'

export interface SoundTrackDef {
  id: string
  name: string
  description: string
  category: SoundCategory
  accentColor: string
  defaultVolume: number // 0 to 100
}

export interface SoundTrackState {
  id: string
  isPlaying: boolean
  volume: number // 0 to 100
}

export interface SoundscapePreset {
  id: string
  name: string
  isCustom?: boolean
  description?: string
  tracks: Record<string, number> // trackId -> volume (0-100)
}
