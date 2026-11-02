export default function MascotAvatar() {
  return (
    <div className="habit-mascot-avatar" title="Routine Champion" aria-hidden="true">
      {/* Cute illustrated tiger sticker */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft background glow */}
        <circle cx="30" cy="30" r="28" fill="#fef3c7" stroke="#fde68a" strokeWidth="2" />

        {/* Tiger Ears */}
        <circle cx="16" cy="18" r="8" fill="#f97316" />
        <circle cx="16" cy="18" r="4.5" fill="#fef3c7" />
        <circle cx="44" cy="18" r="8" fill="#f97316" />
        <circle cx="44" cy="18" r="4.5" fill="#fef3c7" />

        {/* Tiger Face */}
        <circle cx="30" cy="32" r="19" fill="#fb923c" />

        {/* Cheeks */}
        <ellipse cx="20" cy="35" rx="5" ry="3.5" fill="#fdba74" />
        <ellipse cx="40" cy="35" rx="5" ry="3.5" fill="#fdba74" />

        {/* Muzzle */}
        <ellipse cx="30" cy="38" rx="8" ry="6" fill="#fffbeb" />

        {/* Nose */}
        <polygon points="27,35 33,35 30,38" fill="#7c2d12" />

        {/* Mouth */}
        <path d="M28 39 Q30 41 32 39" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />

        {/* Eyes */}
        <circle cx="23" cy="29" r="3" fill="#1e1b4b" />
        <circle cx="22" cy="28" r="1" fill="#ffffff" />
        <circle cx="37" cy="29" r="3" fill="#1e1b4b" />
        <circle cx="36" cy="28" r="1" fill="#ffffff" />

        {/* Forehead Stripes */}
        <path d="M30 18 L30 24" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
        <path d="M25 21 L28 23" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M35 21 L32 23" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />

        {/* Cheek Stripes */}
        <path d="M13 32 L17 33" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 36 L17 36" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M47 32 L43 33" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M46 36 L43 36" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  )
}
