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
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
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
      {/* DueFox Icon */}
      <div
        className={`${iconSizes[size]} bg-[#FF5722] flex items-center justify-center shadow-xs text-white transition-transform group-hover:scale-105 duration-200 shrink-0`}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
        >
          {/* Stylized Fox Head / Invoice Fold */}
          <path
            d="M6 8.5C6 7.11929 7.11929 6 8.5 6H19.5C20.8807 6 22 7.11929 22 8.5V20C22 21.1046 21.1046 22 20 22H8C6.89543 22 6 21.1046 6 20V8.5Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
          {/* Inner Fox Ears & Invoice Cut */}
          <path
            d="M9 10L14 15L19 10"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 18H18"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M14 15V21"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

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
