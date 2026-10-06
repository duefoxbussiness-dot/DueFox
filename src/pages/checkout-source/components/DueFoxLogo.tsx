import React from 'react';

interface DueFoxLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const DueFoxLogo: React.FC<DueFoxLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      <img
        src="/duefox-logo.svg"
        alt="DueFox"
        className={`${iconSizes[size]} shrink-0 rounded-xl object-contain`}
      />

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
