import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export default function GlassPanel({ 
  children, 
  className, 
  hoverEffect = false,
  onClick 
}: GlassPanelProps) {
  return (
    <div
      className={clsx(
        'glass-panel',
        hoverEffect && 'hover:bg-surface-glass-hover hover:shadow-glass-lg transition-all duration-300',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}
