import type { WallpaperOption } from './types'

export const WALLPAPER_PRESETS: WallpaperOption[] = [
  {
    id: 'nebula',
    name: 'Nebula Midnight',
    type: 'gradient',
    value: 'radial-gradient(ellipse at top, #2e1065 0%, #0f172a 60%, #030712 100%)',
    textColor: 'light',
    accentColor: '#c084fc',
    preview: 'linear-gradient(135deg, #2e1065, #0f172a, #030712)',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Minimal',
    type: 'gradient',
    value: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
    textColor: 'light',
    accentColor: '#e4e4e7',
    preview: 'linear-gradient(180deg, #27272a, #09090b)',
  },
  {
    id: 'tally-paper',
    name: 'Paper & Ink (Classic)',
    type: 'gradient',
    value: 'radial-gradient(900px 480px at 12% -8%, rgba(51, 102, 73, 0.12), transparent 62%), radial-gradient(760px 440px at 108% 6%, rgba(179, 117, 23, 0.1), transparent 62%), #f1eee8',
    textColor: 'dark',
    accentColor: '#336649',
    preview: 'linear-gradient(135deg, #e7e2d8, #f1eee8, #ddd8cb)',
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Mesh',
    type: 'gradient',
    value: 'radial-gradient(at 0% 0%, #1e1b4b 0px, transparent 50%), radial-gradient(at 100% 100%, #064e3b 0px, transparent 50%), #020617',
    textColor: 'light',
    accentColor: '#34d399',
    preview: 'linear-gradient(135deg, #1e1b4b, #020617, #064e3b)',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Horizon',
    type: 'gradient',
    value: 'radial-gradient(ellipse at bottom, #831843 0%, #4c0519 35%, #0f172a 100%)',
    textColor: 'light',
    accentColor: '#fb7185',
    preview: 'linear-gradient(180deg, #0f172a, #4c0519, #831843)',
  },
  {
    id: 'pacific-depths',
    name: 'Pacific Azure',
    type: 'gradient',
    value: 'radial-gradient(circle at top right, #0369a1 0%, #0f172a 70%, #020617 100%)',
    textColor: 'light',
    accentColor: '#38bdf8',
    preview: 'linear-gradient(135deg, #0369a1, #0f172a, #020617)',
  },
  {
    id: 'boreal-forest',
    name: 'Boreal Mist',
    type: 'gradient',
    value: 'linear-gradient(180deg, #064e3b 0%, #022c22 40%, #020617 100%)',
    textColor: 'light',
    accentColor: '#4ade80',
    preview: 'linear-gradient(180deg, #064e3b, #022c22, #020617)',
  },
]

const WALLPAPER_STORAGE_KEY = 'catalyst_active_wallpaper'

export function getSavedWallpaper(): WallpaperOption {
  try {
    const saved = localStorage.getItem(WALLPAPER_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && parsed.value) return parsed
    }
  } catch (err) {
    console.error(err)
  }
  return WALLPAPER_PRESETS[0] // default to Nebula
}

export function saveWallpaper(wallpaper: WallpaperOption) {
  try {
    localStorage.setItem(WALLPAPER_STORAGE_KEY, JSON.stringify(wallpaper))
  } catch (err) {
    console.error(err)
  }
}
