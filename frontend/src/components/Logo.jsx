export function Logo({ showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 60 80"
        fill="none"
        className="h-12 w-12 flex-shrink-0"
        aria-hidden="true"
      >
        {/* Carré de base */}
        <rect x="8" y="30" width="44" height="44" rx="6" fill="#FF5722" />

        {/* Flèche stylisée */}
        <g>
          {/* Courbe gauche */}
          <path
            d="M 20 50 Q 22 35 30 32 Q 35 30 38 35"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Courbe droite */}
          <path
            d="M 40 50 Q 42 35 50 32 Q 55 30 52 35"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pointe de flèche */}
          <path
            d="M 30 15 L 35 28 L 25 28 Z"
            fill="white"
          />

          {/* Ligne centrale */}
          <line
            x1="30"
            y1="28"
            x2="30"
            y2="55"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Points décoratifs */}
        <circle cx="15" cy="68" r="2.5" fill="white" />
        <circle cx="22" cy="68" r="2.5" fill="white" />
        <circle cx="29" cy="68" r="2.5" fill="white" />
        <circle cx="36" cy="68" r="2.5" fill="white" />
        <circle cx="43" cy="68" r="2.5" fill="white" />
        <circle cx="50" cy="68" r="2.5" fill="white" />
      </svg>

      {showText && (
        <div>
          <p className="text-lg font-extrabold tracking-tight text-white">
            GUICHET
          </p>
          <p className="text-lg font-extrabold tracking-tight text-orange-400">
            DARK
          </p>
        </div>
      )}
    </div>
  );
}
