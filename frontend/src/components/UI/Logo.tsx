import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showText = true }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/fruitque-logo.svg" 
        alt="FruitQue Logo" 
        className={`${sizeClasses[size]} object-contain`}
        onError={(e) => {
          // Fallback to gradient circle if logo image fails to load
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-green-500 to-emerald-600 rounded-full items-center justify-center text-white font-bold text-sm hidden`}>
        🍎
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-gray-900`}>
          FruitQue
        </span>      )}
    </div>
  );
};

export default Logo;
