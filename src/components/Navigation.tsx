import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

const navItems = [
  { id: 'hero', label: 'Home' },
  { id: 'topics', label: 'Modules' },
  { id: 'tools', label: 'Arsenal' },
  { id: 'cases', label: 'Case Studies' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'support', label: 'Support' },
];

export default function Navigation() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detect active section
      const sections = navItems.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'glass-panel shadow-glass-lg' : 'bg-transparent'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-xl font-bold text-gradient-cyan glow-text focus:outline-none"
              aria-label="Digital Forensics - Go to home"
            >
              Digital Forensics
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex space-x-1">
              {navItems.slice(1).map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={clsx(
                    'px-4 py-4 text-sm font-medium transition-all duration-300 relative',
                    'hover:text-accent-neon focus:outline-none focus:ring-2 focus:ring-accent-neon/50 rounded-sm',
                    activeSection === item.id
                      ? 'text-accent-neon'
                      : 'text-text-secondary'
                  )}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                >
                  <span className="relative">
                    {item.label}
                    {activeSection === item.id && (
                      <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-accent-neon" style={{ bottom: '-4px' }} />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="glass-button p-2"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-border-glass">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
            {navItems.slice(1).map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={clsx(
                  'block w-full text-left px-3 py-2 text-base font-medium transition-all duration-300',
                  'hover:text-accent-neon hover:bg-surface-glass-hover rounded-md',
                  activeSection === item.id ? 'text-accent-neon bg-surface-glass-hover' : 'text-text-secondary'
                )}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
