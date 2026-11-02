import { useState, useEffect } from 'react'
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning,
  CloudFog,
  RefreshCw,
} from 'lucide-react'
import { fetchCurrentWeather, detectCityFromTimezone } from '../lib/weather'
import type { WeatherData } from '../lib/types'

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    city: detectCityFromTimezone(),
    temperature: 20,
    tempUnit: 'C',
    weatherCode: 1,
    condition: 'Partly Cloudy',
    humidity: 55,
    windSpeed: 11,
    loading: true,
    error: null,
  })

  const [geoStatus, setGeoStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt')

  const loadWeather = (lat: number, lon: number, customCity?: string) => {
    setWeather((prev) => ({ ...prev, loading: true, error: null }))
    fetchCurrentWeather(lat, lon)
      .then((data) => {
        setWeather((prev) => ({
          ...prev,
          ...data,
          city: customCity || prev.city,
          loading: false,
          error: null,
        }))
      })
      .catch((err) => {
        console.warn('Weather load fallback:', err)
        setWeather((prev) => ({
          ...prev,
          loading: false,
          error: 'Using regional data',
        }))
      })
  }

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('denied')
      loadWeather(51.5074, -0.1278, 'London')
      return
    }

    setWeather((prev) => ({ ...prev, loading: true }))

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoStatus('granted')
        const { latitude, longitude } = pos.coords
        loadWeather(latitude, longitude, detectCityFromTimezone())
      },
      (err) => {
        console.warn('Geolocation unavailable:', err)
        setGeoStatus('denied')
        const isAmericas = Intl.DateTimeFormat().resolvedOptions().timeZone.includes('America')
        if (isAmericas) {
          loadWeather(40.7128, -74.006, 'New York')
        } else {
          loadWeather(51.5074, -0.1278, 'London')
        }
      },
      { timeout: 7000 },
    )
  }

  useEffect(() => {
    requestGeolocation()
  }, [])

  const toggleUnit = () => {
    setWeather((prev) => {
      const nextUnit = prev.tempUnit === 'C' ? 'F' : 'C'
      const nextTemp =
        nextUnit === 'F'
          ? Math.round((prev.temperature * 9) / 5 + 32)
          : Math.round(((prev.temperature - 32) * 5) / 9)
      return {
        ...prev,
        tempUnit: nextUnit,
        temperature: nextTemp,
      }
    })
  }

  const renderWeatherIcon = () => {
    const code = weather.weatherCode
    if (code === 0) return <Sun size={20} className="tally-weather-icon sun" />
    if (code >= 1 && code <= 3) return <Cloud size={20} className="tally-weather-icon cloud" />
    if (code === 45 || code === 48) return <CloudFog size={20} className="tally-weather-icon fog" />
    if (code >= 51 && code <= 65) return <CloudRain size={20} className="tally-weather-icon rain" />
    if (code >= 71 && code <= 77) return <Snowflake size={20} className="tally-weather-icon snow" />
    if (code >= 80 && code <= 82) return <CloudRain size={20} className="tally-weather-icon rain" />
    if (code >= 95) return <CloudLightning size={20} className="tally-weather-icon storm" />
    return <Sun size={20} className="tally-weather-icon sun" />
  }

  return (
    <div className="tally-paper-widget weather-dispatch">
      <div className="widget-row-top">
        <div className="flex items-center gap-2">
          <span className="dispatch-tag">ATMOSPHERE</span>
          <span className="location-text">
            {weather.city}
            {geoStatus === 'granted' && <span className="gps-live-dot" title="Live Geolocation" />}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleUnit}
            className="mono-chip-btn"
            title="Toggle °C / °F"
          >
            °{weather.tempUnit}
          </button>
          <button
            type="button"
            onClick={requestGeolocation}
            className={`mono-chip-btn ${weather.loading ? 'is-loading' : ''}`}
            title="Refresh weather"
          >
            <RefreshCw size={11} className={weather.loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="widget-row-main">
        <div className="temp-hero">
          <span className="temp-large">{weather.temperature}°</span>
          <div className="condition-wrap">
            <span className="condition-name">{weather.condition}</span>
            <span className="sensor-meta">
              {weather.humidity}% hum · {weather.windSpeed} km/h wind
            </span>
          </div>
        </div>
        <div className="weather-symbol">{renderWeatherIcon()}</div>
      </div>
    </div>
  )
}
