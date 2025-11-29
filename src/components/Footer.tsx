import { useState } from 'react';
import { Linkedin, Github, ExternalLink } from 'lucide-react';
import slokas from '../data/slokas.json';

export default function Footer() {
  const [reducedMotion, setReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Use the first śloka as permanent signature
  const signatureSloka = slokas[0];

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    
    if (newValue) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
  };

  return (
    <footer className="relative z-10 glass-panel mt-24" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Sanskrit Śloka Signature */}
        <div className="mb-8 p-6 bg-gradient-to-r from-accent-cyan/5 via-accent-purple/5 to-accent-neon/5 border border-accent-cyan/20 rounded-lg backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="text-4xl" role="img" aria-label={signatureSloka.symbolMeaning}>
              {signatureSloka.symbol}
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-neon mb-1" style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.3)' }}>
                {signatureSloka.devanagari}
              </div>
              <div className="text-sm text-accent-cyan/70 italic mb-1">
                {signatureSloka.transliteration}
              </div>
              <div className="text-xs text-text-tertiary">
                {signatureSloka.english}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-gradient-cyan mb-4">
              Digital Forensics Learning
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Comprehensive platform for learning digital forensics with interactive 3D
              visualizations, real-world case studies, and specialized tools.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#topics"
                  className="text-text-secondary hover:text-accent-neon transition-colors text-sm"
                >
                  Modules
                </a>
              </li>
              <li>
                <a
                  href="#tools"
                  className="text-text-secondary hover:text-accent-neon transition-colors text-sm"
                >
                  Tools & Resources
                </a>
              </li>
              <li>
                <a
                  href="#cases"
                  className="text-text-secondary hover:text-accent-neon transition-colors text-sm"
                >
                  Case Studies
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Connect */}
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-4">Contact & Connect</h3>
            <div className="space-y-3">
              <a
                href="https://www.linkedin.com/in/prince-kumar8/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-4 py-2 bg-accent-cyan/10 border border-accent-cyan/30 rounded-md hover:bg-accent-cyan/20 hover:border-accent-cyan hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-accent-cyan group-hover:scale-110 transition-transform" />
                <span className="text-sm text-text-secondary group-hover:text-accent-cyan transition-colors">
                  LinkedIn
                </span>
                <ExternalLink className="w-4 h-4 text-text-tertiary ml-auto group-hover:text-accent-cyan transition-colors" />
              </a>
              <a
                href="https://github.com/Garuda-Netra"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-4 py-2 bg-accent-purple/10 border border-accent-purple/30 rounded-md hover:bg-accent-purple/20 hover:border-accent-purple hover:shadow-[0_0_20px_rgba(138,43,226,0.3)] transition-all duration-300"
                aria-label="View GitHub Profile"
              >
                <Github className="w-5 h-5 text-accent-purple group-hover:scale-110 transition-transform" />
                <span className="text-sm text-text-secondary group-hover:text-accent-purple transition-colors">
                  GitHub
                </span>
                <ExternalLink className="w-4 h-4 text-text-tertiary ml-auto group-hover:text-accent-purple transition-colors" />
              </a>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-4">Accessibility</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={toggleReducedMotion}
                  className="w-5 h-5 rounded border-2 border-border-glass bg-surface-glass 
                           checked:bg-accent-neon checked:border-accent-neon
                           focus:ring-2 focus:ring-accent-neon focus:ring-offset-2 focus:ring-offset-bg-dark
                           transition-all cursor-pointer"
                  aria-label="Toggle reduced motion"
                  tabIndex={0}
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  Reduce motion
                </span>
              </label>
              <p className="text-xs text-text-tertiary">
                WCAG AA compliant · Keyboard navigable
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border-glass">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-text-tertiary text-sm">
              © {new Date().getFullYear()} Digital Forensics Learning Platform. Educational purposes only.
            </p>
            <div className="flex space-x-6">
              <a
                href="/"
                onClick={(e) => e.preventDefault()}
                className="text-text-tertiary hover:text-accent-neon text-sm transition-colors"
                aria-label="Privacy Policy"
              >
                Privacy
              </a>
              <a
                href="/"
                onClick={(e) => e.preventDefault()}
                className="text-text-tertiary hover:text-accent-neon text-sm transition-colors"
                aria-label="Terms of Service"
              >
                Terms
              </a>
              <a
                href="/"
                onClick={(e) => e.preventDefault()}
                className="text-text-tertiary hover:text-accent-neon text-sm transition-colors"
                aria-label="Contact Us"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
