import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  linkToHome?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  onClick,
}) => {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const subSizes = {
    sm: 'text-[8px]',
    md: 'text-[9.5px]',
    lg: 'text-[11px]',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 cursor-pointer select-none group ${className}`}
    >
      <img
        src="/duefox-logo.svg"
        alt="DueFox"
        className={`${iconSizes[size]} shrink-0 rounded-xl object-contain transition-transform duration-200 group-hover:scale-105`}
      />

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className={`font-black tracking-tight leading-none ${titleSizes[size]} text-slate-900`}>
          duefox<span className="text-[#FF5722]">.co</span>
        </div>
        {showSubtitle && (
          <span
            className={`font-bold tracking-[0.22em] text-slate-400 uppercase mt-0.5 ${subSizes[size]}`}
          >
            AUTOMATED INVOICE CHASER
          </span>
        )}
      </div>
    </div>
  );
};
