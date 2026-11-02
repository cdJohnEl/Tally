import { ArrowRight, Bell } from 'lucide-react'

interface ReminderBannerProps {
  onOpenReminderModal: () => void
}

export default function ReminderBanner({ onOpenReminderModal }: ReminderBannerProps) {
  return (
    <div className="habit-reminder-card">
      <div className="reminder-text-col">
        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950 uppercase tracking-wide">
          <Bell size={13} className="text-orange-700" />
          <span>Daily Routine Alert</span>
        </div>
        <h3 className="reminder-title">Set the reminder</h3>
        <p className="reminder-desc">
          Never miss your morning routine! Set a reminder to stay on track
        </p>
        <button
          type="button"
          onClick={onOpenReminderModal}
          className="reminder-cta-btn"
          aria-label="Set routine reminder now"
        >
          <span>Set Now</span>
          <ArrowRight size={14} strokeWidth={2.6} className="reminder-btn-arrow" />
        </button>
      </div>

      <div className="reminder-illustration-col" aria-hidden="true">
        {/* Playful ringing bell with vibration sound waves */}
        <div className="bell-art-container">
          <svg
            width="86"
            height="86"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="bell-svg"
          >
            {/* Left Sound Waves */}
            <path
              d="M18 40 C14 46 14 54 18 60"
              stroke="#84cc16"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M26 34 C20 44 20 56 26 66"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Right Sound Waves */}
            <path
              d="M82 40 C86 46 86 54 82 60"
              stroke="#84cc16"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M74 34 C80 44 80 56 74 66"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Clapper drop */}
            <circle cx="50" cy="74" r="6" fill="#c2410c" />

            {/* Bell Body */}
            <path
              d="M50 18 C38 18 34 32 34 52 C34 60 26 66 26 68 C26 70 28 72 32 72 L68 72 C72 72 74 70 74 68 C74 66 66 60 66 52 C66 32 62 18 50 18 Z"
              fill="#fb923c"
            />

            {/* Bell Inner Shadow / Accent */}
            <path
              d="M50 20 C40 20 37 32 37 52 C37 59 31 65 29 67 L71 67 C69 65 63 59 63 52 C63 32 60 20 50 20 Z"
              fill="#f97316"
            />

            {/* Bell top ring */}
            <path
              d="M45 18 C45 15 47 12 50 12 C53 12 55 15 55 18"
              stroke="#ea580c"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Bottom edge highlight */}
            <path
              d="M30 68 Q50 72 70 68"
              stroke="#ea580c"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
