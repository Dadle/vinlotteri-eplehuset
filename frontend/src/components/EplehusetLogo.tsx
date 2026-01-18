interface EplehusetLogoProps {
  className?: string;
  showIcon?: boolean;
}

function EplehusetLogo({ className = '', showIcon = true }: EplehusetLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showIcon && (
        <div className="relative">
          {/* Apple-inspired icon with blue gradient */}
          <svg className="w-9 h-9" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0071e3" />
                <stop offset="100%" stopColor="#0058b3" />
              </linearGradient>
            </defs>
            {/* Apple shape */}
            <path
              d="M20 6C20 6 17 4 14 6C11 8 10 11 10 14C10 17 11 20 13 23C15 26 17 28 20 28C23 28 25 26 27 23C29 20 30 17 30 14C30 11 29 8 26 6C23 4 20 6 20 6Z"
              fill="url(#logoGradient)"
              className="dark:fill-white"
            />
            {/* Leaf */}
            <path
              d="M20 6C20 6 21 3 24 2C24 2 23 5 20 6Z"
              fill="url(#logoGradient)"
              className="dark:fill-white"
            />
            {/* Highlight */}
            <ellipse
              cx="15"
              cy="14"
              rx="3"
              ry="4"
              className="fill-white/30 dark:fill-white/10"
            />
          </svg>
        </div>
      )}
      
      {/* Wordmark with blue accent */}
      <span className="text-[22px] font-semibold tracking-tight lowercase">
        <span className="text-apple-black dark:text-white">eple</span>
        <span className="text-blue-500">huset</span>
      </span>
    </div>
  );
}

export default EplehusetLogo;
