import React from 'react';

interface DueFoxLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const DueFoxLogo: React.FC<DueFoxLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-sm rounded-xl',
    lg: 'w-11 h-11 text-base rounded-2xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* DueFox Electric Orange Rounded Icon with Fox Mark */}
      <div
        className={`${iconSizes[size]} bg-[#FF5722] text-white flex items-center justify-center shadow-sm shrink-0`}
        style={{
          boxShadow: '0 2px 8px rgba(255, 87, 34, 0.28)',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* Stylized fox face with geometric ears and invoice chase arrow */}
          <path d="M4 8l3-5 5 3 5-3 3 5-8 13L4 8z" fill="white" fillOpacity="0.18" />
          <path d="M7 3l2.5 3.5h5L17 3" />
          <path d="M4 8l8 13 8-13" />
          <path d="M9 11l3 3 3-3" strokeWidth="2" />
        </svg>
      </div>

      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-baseline">
          <span className={`font-bold tracking-tight text-[#0F172A] ${textSizes[size]}`}>
            duefox<span className="text-[#FF5722]">.co</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] tracking-[0.16em] uppercase font-semibold text-slate-400">
            AUTOMATED INVOICE CHASER
          </span>
        )}
      </div>
    </div>
  );
};
