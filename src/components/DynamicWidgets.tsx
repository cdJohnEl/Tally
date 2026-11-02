import { useState, useEffect } from 'react'

export default function DynamicWidgets() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(time)
  const fullDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(time)

  return (
    <div className="tally-paper-widget clock-dispatch">
      <div className="widget-row-top">
        <span className="dispatch-tag">CHRONOMETER</span>
        <span className="mono-subtext">LOCAL TIME</span>
      </div>

      <div className="clock-main">
        <div className="clock-digits-group">
          <span className="clock-time-val">
            {displayHours}:{minutes}
          </span>
          <div className="clock-sec-ampm">
            <span className="clock-ampm-text">{ampm}</span>
            <span className="clock-sec-text">:{seconds}</span>
          </div>
        </div>
      </div>

      <div className="widget-footer-line">
        <span className="clock-date-str">
          {weekday}, {fullDate}
        </span>
      </div>
    </div>
  )
}
