import { Copy, CreditCard, Check } from 'lucide-react';
import { useState } from 'react';
import SectionHeader from '../ui/SectionHeader';

export default function SupportAccess() {
  const [copied, setCopied] = useState(false);
  const upiId = '8271915751@upi';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <section id="support" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeader 
          title="Support & Access"
          subtitle="Support this platform and unlock advanced modules. Secure UPI payments accepted."
        />

        <div className="glass-panel border border-accent-purple/30 rounded-xl p-8 md:p-12 backdrop-blur-xl bg-gradient-to-br from-accent-purple/10 via-bg-dark/50 to-accent-neon/10 relative overflow-hidden">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(138,43,226,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] animate-pulse-slow pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              <div className="text-6xl md:text-7xl animate-bounce-slow">
                💸
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-neon mb-2">
                  Empower Learning
                </h3>
                <p className="text-text-secondary text-sm md:text-base">
                  Your contribution helps maintain and expand this educational platform
                </p>
              </div>
            </div>

            {/* UPI Payment Card */}
            <div className="max-w-md mx-auto bg-bg-dark/50 border border-accent-neon/30 rounded-lg p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-accent-neon" />
                <span className="text-accent-neon font-bold text-lg">UPI Payment</span>
              </div>
              
              <div className="bg-surface-glass/50 border border-border-glass rounded-md p-4 mb-4">
                <div className="text-xs text-text-tertiary mb-1 uppercase tracking-wider">UPI ID</div>
                <div className="text-xl md:text-2xl font-mono text-text-primary break-all">
                  {upiId}
                </div>
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full group relative px-6 py-3 bg-accent-neon/10 border border-accent-neon text-accent-neon font-bold tracking-wide hover:bg-accent-neon hover:text-bg-dark transition-all duration-300 rounded-md flex items-center justify-center gap-2"
                aria-label="Copy UPI ID to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy UPI ID</span>
                  </>
                )}
                <div className="absolute inset-0 bg-accent-neon/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-text-tertiary">
                  🔒 Secure payment gateway • All contributions are voluntary
                </p>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
                <div className="text-2xl mb-2">🎓</div>
                <div className="text-sm text-text-primary font-semibold">Advanced Modules</div>
                <div className="text-xs text-text-tertiary mt-1">Deep-dive content</div>
              </div>
              <div className="text-center p-4 bg-accent-purple/5 border border-accent-purple/20 rounded-lg">
                <div className="text-2xl mb-2">🔧</div>
                <div className="text-sm text-text-primary font-semibold">Premium Tools</div>
                <div className="text-xs text-text-tertiary mt-1">Pro features</div>
              </div>
              <div className="text-center p-4 bg-accent-neon/5 border border-accent-neon/20 rounded-lg">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-sm text-text-primary font-semibold">Case Studies</div>
                <div className="text-xs text-text-tertiary mt-1">Real investigations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
