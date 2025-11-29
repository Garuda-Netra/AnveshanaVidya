import { useState, ReactNode } from 'react';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex space-x-2 border-b border-border-glass mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 text-sm font-medium transition-all duration-300 whitespace-nowrap relative',
              'hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-neon/30 rounded-t-lg',
              activeTab === tab.id
                ? 'text-accent-neon bg-surface-glass/30'
                : 'text-text-secondary hover:bg-surface-glass/20'
            )}
            style={{ paddingTop: '16px', paddingBottom: '16px' }}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            <span className="relative inline-block">
              {tab.label}
              {activeTab === tab.id && (
                <span 
                  className="absolute left-0 right-0 h-0.5 bg-accent-neon shadow-[0_0_8px_rgba(57,255,20,0.6)]"
                  style={{ bottom: '-4px' }}
                />
              )}
            </span>
          </button>
        ))}
      </div>
      
      <div className="min-h-[200px]">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            hidden={activeTab !== tab.id}
            className={clsx(
              'animate-fade-in',
              activeTab === tab.id ? 'block' : 'hidden'
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
