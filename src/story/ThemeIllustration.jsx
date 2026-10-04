// Vector decor kept from v2: procedural fallback when a scene still is missing.
export function ThemeIllustration({ themeId }) {
  switch (themeId) {
    case 'cafe':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden="true">
          <rect width="420" height="240" rx="24" fill="#f7e0c1" />
          <circle cx="340" cy="50" r="28" fill="#f4c97a" />
          <rect x="55" y="65" width="310" height="145" rx="12" fill="#7a4a2b" />
          <path d="M45 65h330l-20 35H65Z" fill="#7fe0b3" />
          <rect x="80" y="115" width="140" height="75" rx="8" fill="#fff4e6" />
          <rect x="250" y="115" width="80" height="95" rx="8" fill="#f2b89b" />
          <circle cx="313" cy="160" r="4" fill="#4a2c1d" />
          <path d="M117 142h55v17a24 24 0 0 1-55 0Z" fill="#7a4a2b" />
          <path d="M172 146h8a10 10 0 0 1 0 20h-9M133 135q-10-10 0-19m17 19q-10-10 0-19" fill="none" stroke="#7a4a2b" strokeWidth="5" strokeLinecap="round" />
          <path d="M35 212h350" stroke="#4a2c1d" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )
    case 'boxing':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="ringBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7e0c1" />
              <stop offset="100%" stopColor="#f1b793" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#ringBg)" />
          <rect x="40" y="70" width="340" height="130" rx="16" fill="#1e1e1e" />
          <rect x="60" y="90" width="300" height="90" rx="12" fill="#f5efe7" />
          <rect x="60" y="110" width="300" height="6" fill="#d65b4a" />
          <rect x="60" y="130" width="300" height="6" fill="#d65b4a" />
          <rect x="60" y="150" width="300" height="6" fill="#d65b4a" />
          <circle cx="150" cy="120" r="26" fill="#d65b4a" />
          <circle cx="270" cy="120" r="26" fill="#d65b4a" />
          <rect x="135" y="140" width="30" height="22" rx="8" fill="#b24336" />
          <rect x="255" y="140" width="30" height="22" rx="8" fill="#b24336" />
          <text x="210" y="60" textAnchor="middle" fontSize="18" fill="#1f1a16" fontFamily="'Bebas Neue', sans-serif">
            BLACK CORNER
          </text>
        </svg>
      )
    case 'football':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="fieldBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dff4d7" />
              <stop offset="100%" stopColor="#a9d88f" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#fieldBg)" />
          <rect x="40" y="60" width="340" height="140" rx="16" fill="#2f7d32" />
          <rect x="60" y="80" width="300" height="100" rx="12" fill="#3fa44a" />
          <rect x="200" y="80" width="2" height="100" fill="#e7f6e5" />
          <circle cx="200" cy="130" r="20" fill="none" stroke="#e7f6e5" strokeWidth="2" />
          <rect x="70" y="110" width="24" height="40" fill="none" stroke="#e7f6e5" strokeWidth="2" />
          <rect x="326" y="110" width="24" height="40" fill="none" stroke="#e7f6e5" strokeWidth="2" />
          <circle cx="320" cy="180" r="16" fill="#f2f2f2" />
          <circle cx="320" cy="180" r="6" fill="#2f7d32" />
          <text x="210" y="52" textAnchor="middle" fontSize="18" fill="#1f1a16" fontFamily="'Bebas Neue', sans-serif">
            ATLAS FC
          </text>
        </svg>
      )
    case 'cosmetic':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="cosmoBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fce4ec" />
              <stop offset="100%" stopColor="#f8c9da" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#cosmoBg)" />
          <rect x="70" y="80" width="90" height="100" rx="18" fill="#ffffff" />
          <rect x="90" y="60" width="50" height="30" rx="12" fill="#f2b7c8" />
          <rect x="190" y="70" width="70" height="110" rx="16" fill="#fff8fb" />
          <rect x="205" y="50" width="40" height="24" rx="8" fill="#f09fb6" />
          <rect x="280" y="90" width="70" height="90" rx="20" fill="#ffffff" />
          <rect x="295" y="70" width="40" height="26" rx="10" fill="#f2b7c8" />
          <circle cx="320" cy="170" r="18" fill="#f5b0c5" />
          <text x="210" y="46" textAnchor="middle" fontSize="18" fill="#5a2b3a" fontFamily="'Bebas Neue', sans-serif">
            AURA SKIN
          </text>
        </svg>
      )
    case 'fashion':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="fashionBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f3e7ff" />
              <stop offset="100%" stopColor="#d7c3f7" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#fashionBg)" />
          <rect x="170" y="70" width="80" height="120" rx="30" fill="#f5f1ff" />
          <rect x="185" y="50" width="50" height="30" rx="12" fill="#c4a8f2" />
          <rect x="90" y="110" width="50" height="90" rx="18" fill="#b18be6" />
          <rect x="280" y="110" width="60" height="90" rx="18" fill="#b18be6" />
          <path d="M90 90 L130 90 L150 110" stroke="#5d3c88" strokeWidth="4" fill="none" />
          <path d="M330 90 L290 90 L270 110" stroke="#5d3c88" strokeWidth="4" fill="none" />
          <text x="210" y="46" textAnchor="middle" fontSize="18" fill="#3c2b52" fontFamily="'Bebas Neue', sans-serif">
            ATELIER VELVET
          </text>
        </svg>
      )
    case 'art':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="mediaBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dff1ff" />
              <stop offset="100%" stopColor="#b8dcff" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#mediaBg)" />
          <rect x="80" y="70" width="200" height="120" rx="18" fill="#1f2a44" />
          <rect x="100" y="90" width="160" height="80" rx="10" fill="#32466d" />
          <polygon points="165,105 200,130 165,155" fill="#f1f6ff" />
          <rect x="290" y="90" width="40" height="80" rx="12" fill="#1f2a44" />
          <circle cx="310" cy="80" r="18" fill="#f4b86a" />
          <text x="210" y="46" textAnchor="middle" fontSize="18" fill="#1f2a44" fontFamily="'Bebas Neue', sans-serif">
            PULSE LAB
          </text>
        </svg>
      )
    default:
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="cafeSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7d9b2" />
              <stop offset="100%" stopColor="#f2b89b" />
            </linearGradient>
            <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d7f0ff" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#cafeSky)" />
          <rect x="40" y="60" width="340" height="150" rx="20" fill="#39281d" />
          <rect x="55" y="78" width="310" height="110" rx="16" fill="#f5efe7" />
          <rect x="70" y="90" width="120" height="85" rx="10" fill="url(#glass)" />
          <rect x="205" y="90" width="140" height="85" rx="10" fill="url(#glass)" />
          <rect x="55" y="160" width="310" height="20" rx="8" fill="#c8965c" />
          <rect x="150" y="40" width="120" height="35" rx="10" fill="#111" />
          <text x="210" y="64" textAnchor="middle" fontSize="18" fill="#f8d8a8" fontFamily="'Bebas Neue', sans-serif">
            STARBUCK
          </text>
          <circle cx="90" cy="200" r="18" fill="#b36b3c" />
          <circle cx="330" cy="200" r="18" fill="#b36b3c" />
          <rect x="85" y="190" width="10" height="25" rx="5" fill="#6b3c1e" />
          <rect x="325" y="190" width="10" height="25" rx="5" fill="#6b3c1e" />
        </svg>
      )
  }
}

