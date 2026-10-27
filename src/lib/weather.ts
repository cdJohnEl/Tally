import type { WeatherData } from './types'

export function decodeWmoCode(code: number): { condition: string; icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog' } {
  if (code === 0) return { condition: 'Clear Sky', icon: 'sun' }
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy', icon: 'cloud' }
  if (code === 3) return { condition: 'Overcast', icon: 'cloud' }
  if (code === 45 || code === 48) return { condition: 'Fog & Mist', icon: 'fog' }
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', icon: 'rain' }
  if (code >= 61 && code <= 65) return { condition: 'Rain Showers', icon: 'rain' }
  if (code >= 71 && code <= 77) return { condition: 'Snowfall', icon: 'snow' }
  if (code >= 80 && code <= 82) return { condition: 'Heavy Rain', icon: 'rain' }
  if (code >= 95) return { condition: 'Thunderstorm', icon: 'storm' }
  return { condition: 'Fair Weather', icon: 'cloud' }
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<Partial<WeatherData>> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius`,
    )
    if (!res.ok) throw new Error('Weather API response error')
    const data = await res.json()
    const current = data.current
    const decoded = decodeWmoCode(current.weather_code)

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      weatherCode: current.weather_code,
      condition: decoded.condition,
      tempUnit: 'C',
    }
  } catch (err) {
    console.warn('Weather fetch failed, using fallback:', err)
    return {
      temperature: 21,
      humidity: 58,
      windSpeed: 12,
      weatherCode: 1,
      condition: 'Partly Cloudy',
      tempUnit: 'C',
    }
  }
}

export function detectCityFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const parts = tz.split('/')
    if (parts.length > 1) {
      return parts[1].replace(/_/g, ' ')
    }
    return tz
  } catch {
    return 'Local Area'
  }
}
