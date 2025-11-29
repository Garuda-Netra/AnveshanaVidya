import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export default function Card({ 
  title, 
  subtitle, 
  children, 
  className, 
  footer,
  hoverEffect = true,
  onClick
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={clsx(className, onClick && 'cursor-pointer')}
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
      <GlassPanel 
        className="flex flex-col h-full overflow-hidden"
        hoverEffect={hoverEffect}
      >
        {(title || subtitle) && (
          <div className="p-6 border-b border-border-glass">
            {title && <h3 className="text-xl font-bold text-text-primary">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
          </div>
        )}
        
        <div className="flex-1 p-6">
          {children}
        </div>
        
        {footer && (
          <div className="p-4 bg-surface-glass border-t border-border-glass">
            {footer}
          </div>
        )}
      </GlassPanel>
    </motion.div>
  );
}
