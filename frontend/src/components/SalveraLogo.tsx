import React from 'react';

interface SalveraLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  variant?: 'dark' | 'light';
}

export const SalveraLogo: React.FC<SalveraLogoProps> = ({ 
  size = 32, 
  className = '', 
  showWordmark = false,
  variant = 'dark'
}) => {
  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center space-x-2.5 ${className}`}>
      {/* Precision Geometric Financial-Career Mark */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 36 36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        {/* Subtle Container Shield / Pill with gentle rounded corners */}
        <rect 
          width="36" 
          height="36" 
          rx="8" 
          fill="#172B2A" 
        />
        
        {/* Subtle grid reference lines */}
        <line x1="6" y1="29" x2="30" y2="29" stroke="#254240" strokeWidth="1" strokeLinecap="round" />

        {/* Financial Tier Bar 1 - Foundation */}
        <rect 
          x="7.5" 
          y="20" 
          width="4.5" 
          height="9" 
          rx="1" 
          fill="#648C7A" 
        />

        {/* Financial Tier Bar 2 - Progression */}
        <rect 
          x="14" 
          y="15" 
          width="4.5" 
          height="14" 
          rx="1" 
          fill="#D5B66D" 
        />

        {/* Financial Tier Bar 3 - Peak Potential */}
        <rect 
          x="20.5" 
          y="9" 
          width="4.5" 
          height="20" 
          rx="1" 
          fill="#F3EFE6" 
        />

        {/* Career Growth Trajectory Vector (Ascending Burnished Copper Beam) */}
        <path 
          d="M6 24.5L12 18L18.5 21L27.5 9.5" 
          stroke="#B66B45" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Directional Arrow Apex (Precision Arrow Head at [27.5, 9.5]) */}
        <path 
          d="M23.5 9.5H27.5V13.5" 
          stroke="#B66B45" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Dynamic Growth Focal Point Accent Node */}
        <circle 
          cx="12" 
          cy="18" 
          r="1.2" 
          fill="#FFFFFF" 
        />
      </svg>

      {/* Refined Typography Wordmark & Brand Descriptor */}
      {showWordmark && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center space-x-1.5">
            <span className={`text-base font-extrabold tracking-wider ${isDark ? 'text-[#172B2A]' : 'text-white'}`}>
              SALVERA
            </span>
          </div>
          <span className={`text-[10px] tracking-tight font-medium mt-0.5 ${isDark ? 'text-[#707B75]' : 'text-[#D9DDD5]'}`}>
            Career & Financial Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
