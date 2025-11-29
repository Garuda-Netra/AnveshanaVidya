import { ReactNode, useState } from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      <div
        role="tooltip"
        className={clsx(
          'absolute z-50 px-3 py-2 text-xs font-medium text-bg-dark bg-accent-neon rounded shadow-neon pointer-events-none transition-opacity duration-200 whitespace-nowrap',
          positionClasses[position],
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {content}
        {/* Arrow */}
        <div
          className={clsx(
            'absolute w-2 h-2 bg-accent-neon transform rotate-45',
            position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
            position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
            position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
            position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
          )}
        />
      </div>
    </div>
  );
}
