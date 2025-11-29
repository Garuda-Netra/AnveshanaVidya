import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export default function SectionHeader({ 
  title, 
  subtitle, 
  align = 'left', 
  className 
}: SectionHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={clsx(
        'mb-12',
        {
          'text-left': align === 'left',
          'text-center': align === 'center',
          'text-right': align === 'right',
        },
        className
      )}
    >
      <div className={clsx(
        'inline-block',
        {
          'mx-0': align === 'left',
          'mx-auto': align === 'center',
          'ml-auto': align === 'right',
        }
      )}>
        <h2 className="heading-secondary mb-0 py-4 md:py-4 px-0 whitespace-nowrap">
          {title}
        </h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full h-[2px] bg-gradient-to-r from-accent-cyan via-accent-neon to-accent-purple origin-left"
          style={{ marginTop: '4px', boxShadow: '0 0 8px rgba(57, 255, 20, 0.6)' }}
        />
      </div>
      {subtitle && (
        <p className="text-lg text-text-secondary max-w-3xl leading-relaxed mt-6">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
