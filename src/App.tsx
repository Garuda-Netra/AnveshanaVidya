import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import Navigation from '@components/Navigation';
import Hero from '@components/sections/Hero';
import Footer from '@components/Footer';
import LoadingSpinner from '@components/LoadingSpinner';
import StarfieldBackground from '@components/StarfieldBackground';
import SectionHeader from '@components/ui/SectionHeader';
import { Volume2 } from 'lucide-react';

// Lazy load sections
const TopicsGrid = lazy(() => import('@components/sections/TopicsGrid'));
const ToolsShowcase = lazy(() => import('@components/sections/ToolsShowcase'));
const CaseStudies = lazy(() => import('@components/sections/CaseStudies'));
const SupportAccess = lazy(() => import('@components/sections/SupportAccess'));
const Chatbot = lazy(() => import('@components/Chatbot'));
const Terminal = lazy(() => import('@components/features/Terminal'));

function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);

  // Audio playback effect - plays once per session
  useEffect(() => {
    // Check if audio has already been played this session
    const hasPlayed = sessionStorage.getItem('audioPlayed');
    if (hasPlayed === 'true') {
      return;
    }

    // Create audio element
    const audio = new Audio('/DigitalFore_Aud.mp3');
    audio.volume = 0.5; // Set volume to 50% for better user experience
    audio.preload = 'auto';
    audioRef.current = audio;

    let autoplayAttempted = false;

    const attemptAutoplay = () => {
      if (autoplayAttempted) return;
      autoplayAttempted = true;

      audio.play()
        .then(() => {
          // Mark audio as played in sessionStorage
          sessionStorage.setItem('audioPlayed', 'true');
          console.log('Welcome audio played successfully');
          setShowAudioPrompt(false);
        })
        .catch((error) => {
          console.log('Autoplay prevented by browser:', error.message);
          // Only show prompt if autoplay fails AND user hasn't interacted yet
          // Give user interaction a chance to work first
          setTimeout(() => {
            if (sessionStorage.getItem('audioPlayed') !== 'true') {
              setShowAudioPrompt(true);
            }
          }, 2000);
        });
    };

    // Try to play audio after 1-1.5 seconds
    const audioTimer = setTimeout(attemptAutoplay, 1200);

    // Also try on first user interaction (this usually succeeds)
    const playOnInteraction = () => {
      if (sessionStorage.getItem('audioPlayed') !== 'true' && audioRef.current) {
        audioRef.current.play()
          .then(() => {
            sessionStorage.setItem('audioPlayed', 'true');
            console.log('Welcome audio played on user interaction');
            setShowAudioPrompt(false);
          })
          .catch((error) => {
            console.log('Failed to play on interaction:', error);
          });
      }
    };

    document.addEventListener('click', playOnInteraction, { once: true });
    document.addEventListener('keydown', playOnInteraction, { once: true });
    document.addEventListener('touchstart', playOnInteraction, { once: true });

    return () => {
      clearTimeout(audioTimer);
      document.removeEventListener('click', playOnInteraction);
      document.removeEventListener('keydown', playOnInteraction);
      document.removeEventListener('touchstart', playOnInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle manual audio playback from prompt
  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          sessionStorage.setItem('audioPlayed', 'true');
          setShowAudioPrompt(false);
        })
        .catch((error) => {
          console.error('Failed to play audio:', error);
        });
    }
  };

  // Handle dismissing audio prompt
  const handleDismissAudio = () => {
    sessionStorage.setItem('audioPlayed', 'true');
    setShowAudioPrompt(false);
  };

  useEffect(() => {
    // Disable browser scroll restoration to prevent jumping to previous position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Clear any hash fragments that might cause scroll jumps
    window.history.replaceState(null, '', window.location.pathname);
    
    // Force immediate scroll to top before any other operations
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Prevent any auto-focus that might trigger scroll
    if (document.activeElement && 'blur' in document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.5,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
    });

    lenisRef.current = lenis;
    
    // Expose Lenis instance globally for modal access
    window.__lenis = lenis;

    // Stop Lenis to prevent any auto-scroll during initialization
    lenis.stop();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Use requestAnimationFrame to ensure DOM is ready, then force scroll reset
    requestAnimationFrame(() => {
      // Force scroll to top with instant behavior
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      // Double-check after next frame to override any browser restoration
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        // Start Lenis after ensuring we're at the top
        setTimeout(() => {
          lenis.scrollTo(0, { immediate: true, force: true });
          lenis.start();
        }, 50);
      });
    });

    // Additional safety check after a short delay
    const safetyTimer = setTimeout(() => {
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0, { immediate: true, force: true });
        }
      }
    }, 200);

    return () => {
      clearTimeout(safetyTimer);
      lenis.destroy();
      window.__lenis = undefined;
      // Restore default scroll restoration on cleanup
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark relative overflow-x-hidden font-sans text-text-primary flex flex-col">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Starfield and Moon Background */}
        <StarfieldBackground />

        {/* Background gradient effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-neon/5 rounded-full blur-[100px]" />
        </div>

        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main id="main-content" className="relative z-10 flex-1 flex flex-col">
          <Hero />

          <Suspense fallback={<LoadingSpinner />}>
            <TopicsGrid />
            <ToolsShowcase />
            <CaseStudies />
            
            <section id="terminal" className="py-24 px-4 min-h-screen flex flex-col justify-center">
              <div className="container mx-auto">
                <SectionHeader 
                  title="COMMAND CENTER"
                  subtitle="Interactive forensic terminal with real command simulation and educational insights"
                  align="center"
                />
                <Terminal />
              </div>
            </section>

            <SupportAccess />
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />

        {/* Chatbot */}
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>

        {/* Audio Prompt */}
        {showAudioPrompt && (
          <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-br from-bg-dark/95 to-surface-light/95 backdrop-blur-xl border-2 border-accent-cyan/50 rounded-xl shadow-2xl p-6 max-w-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-full flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">Welcome Audio</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Would you like to play the welcome audio?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePlayAudio}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-bg-dark"
                    >
                      Play Audio
                    </button>
                    <button
                      onClick={handleDismissAudio}
                      className="px-4 py-2 bg-surface-light border border-border-light text-text-secondary rounded-lg font-medium hover:bg-surface-light/80 transition-colors focus:outline-none focus:ring-2 focus:ring-border-light focus:ring-offset-2 focus:ring-offset-bg-dark"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default App;
