import { useState, ReactNode } from 'react';
import { clsx } from 'clsx';

interface AccordionItemProps {
  id: string;
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ id, title, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className={clsx(
          'w-full flex items-center justify-between p-4 text-left transition-all duration-300',
          'bg-surface-glass border border-border-glass rounded-lg hover:bg-surface-glass-hover',
          isOpen && 'rounded-b-none border-b-0 bg-surface-glass-hover'
        )}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
      >
        <span className="font-medium text-text-primary">{title}</span>
        <svg
          className={clsx(
            'w-5 h-5 text-accent-neon transition-transform duration-300',
            isOpen ? 'transform rotate-180' : ''
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        id={`accordion-content-${id}`}
        className={clsx(
          'overflow-hidden transition-all duration-300 ease-in-out border-x border-b border-border-glass rounded-b-lg bg-bg-dark/30',
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-4 text-text-secondary">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: {
    id: string;
    title: string;
    content: ReactNode;
  }[];
  allowMultiple?: boolean;
  className?: string;
}

export default function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={className}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          title={item.title}
          isOpen={openItems.has(item.id)}
          onToggle={() => handleToggle(item.id)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
