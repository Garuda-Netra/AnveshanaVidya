import { ArrowDown } from 'lucide-react';
import { Suspense, lazy, useState, useEffect } from 'react';
import slokas from '../../data/slokas.json';

const Scene = lazy(() => import('../3d/Scene'));

export default function Hero() {
  const [currentSloka, setCurrentSloka] = useState(() => {
    const randomIndex = Math.floor(Math.random() * slokas.length);
    return slokas[randomIndex];
  });

  useEffect(() => {
    // Rotate śloka every 8 seconds
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * slokas.length);
      setCurrentSloka(slokas[randomIndex]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const scrollToTopics = () => {
    const topicsSection = document.getElementById('topics');
    if (topicsSection) {
      topicsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-neon/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-[120px]" />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-6 inline-block">
          <span className="px-3 py-1 rounded-full border border-accent-neon/30 bg-accent-neon/10 text-accent-neon text-sm font-mono tracking-wider">
            SYSTEM_READY
          </span>
        </div>

        {/* Sanskrit Śloka Banner */}
        <div className="mb-8 glass-panel border border-accent-cyan/30 rounded-lg p-6 backdrop-blur-xl bg-gradient-to-r from-accent-cyan/5 via-accent-purple/5 to-accent-neon/5 transition-all duration-500 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="text-5xl md:text-6xl" role="img" aria-label={currentSloka.symbolMeaning}>
              {currentSloka.symbol}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-neon mb-2 tracking-wide" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}>
                {currentSloka.devanagari}
              </div>
              <div className="text-sm md:text-base text-accent-cyan/80 italic mb-1">
                {currentSloka.transliteration}
              </div>
              <div className="text-xs md:text-sm text-text-secondary">
                {currentSloka.english}
              </div>
            </div>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white tracking-tight bg-gradient-to-r from-white via-accent-cyan to-accent-neon bg-clip-text text-transparent animate-pulse-slow">
          DIGITAL FORENSICS
        </h1>
        
        <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
          Uncover the truth hidden in the data. Master the art of cyber investigation with advanced tools and techniques.
        </p>
        
        <button
          onClick={scrollToTopics}
          className="group relative px-8 py-4 bg-accent-neon/10 border border-accent-neon text-accent-neon font-bold tracking-widest hover:bg-accent-neon hover:text-bg-dark transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2">
            START INVESTIGATION
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-accent-neon/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none z-0" />
    </section>
  );
}
