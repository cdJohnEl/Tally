import { useState, useEffect } from 'react'
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning,
  CloudFog,
  MapPin,
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
        console.warn('Weather widget load error:', err)
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
        console.warn('Geolocation denied or timed out:', err)
        setGeoStatus('denied')
        // Fallback default coordinates (New York or London based on timezone)
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
    if (code === 0) return <Sun size={32} className="text-amber-400 animate-spin-slow" />
    if (code >= 1 && code <= 3) return <Cloud size={32} className="text-sky-300" />
    if (code === 45 || code === 48) return <CloudFog size={32} className="text-slate-300" />
    if (code >= 51 && code <= 65) return <CloudRain size={32} className="text-blue-400" />
    if (code >= 71 && code <= 77) return <Snowflake size={32} className="text-cyan-200" />
    if (code >= 80 && code <= 82) return <CloudRain size={32} className="text-blue-500" />
    if (code >= 95) return <CloudLightning size={32} className="text-yellow-400" />
    return <Sun size={32} className="text-amber-400" />
  }

  return (
    <div className="catalyst-weather-widget">
      <div className="widget-header">
        <div className="location-tag">
          <MapPin size={13} className="text-emerald-400" />
          <span className="location-name">{weather.city}</span>
          {geoStatus === 'granted' && <span className="live-dot" title="Live GPS" />}
        </div>
        <div className="widget-actions">
          <button
            type="button"
            onClick={toggleUnit}
            className="temp-unit-toggle"
            title="Toggle °C / °F"
          >
            °{weather.tempUnit}
          </button>
          <button
            type="button"
            onClick={requestGeolocation}
            className={`refresh-btn ${weather.loading ? 'animate-spin' : ''}`}
            title="Refresh weather"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div className="widget-body">
        <div className="temp-display">
          <span className="temp-number">{weather.temperature}°</span>
          <span className="condition-text">{weather.condition}</span>
        </div>
        <div className="weather-icon-box">{renderWeatherIcon()}</div>
      </div>

      <div className="widget-footer">
        <div className="sub-stat">
          <span>Humidity</span>
          <strong>{weather.humidity}%</strong>
        </div>
        <div className="sub-stat-divider" />
        <div className="sub-stat">
          <span>Wind</span>
          <strong>{weather.windSpeed} km/h</strong>
        </div>
        <div className="sub-stat-divider" />
        <div className="sub-stat">
          <span>Sensor</span>
          <strong>{geoStatus === 'granted' ? 'GPS Live' : 'Network'}</strong>
        </div>
      </div>
    </div>
  )
}
