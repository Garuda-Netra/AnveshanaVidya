import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'neon' | 'warning' | 'success';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-surface-glass text-text-secondary border border-border-glass',
    outline: 'bg-transparent text-text-primary border border-text-secondary',
    neon: 'bg-accent-neon/10 text-accent-neon border border-accent-neon/50 shadow-neon',
    warning: 'bg-accent-warning/10 text-accent-warning border border-accent-warning/50',
    success: 'bg-green-500/10 text-green-400 border border-green-500/50',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
