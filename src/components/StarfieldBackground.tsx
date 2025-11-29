import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate stars
    const generateStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 6000); // Increased density

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.6 + 0.4,
          speed: Math.random() * 0.08 + 0.02,
          twinkleSpeed: Math.random() * 0.05 + 0.02, // Faster twinkling
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };

    generateStars();

    // Animation
    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05; // Faster animation

      // Draw stars
      starsRef.current.forEach((star) => {
        // Enhanced twinkling effect with multiple sine waves
        const twinkle1 = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const twinkle2 = Math.sin(time * star.twinkleSpeed * 1.5 + star.twinkleOffset + Math.PI / 3);
        const twinkle3 = Math.cos(time * star.twinkleSpeed * 0.7 + star.twinkleOffset);
        
        // Combine multiple waves for complex twinkling
        const combinedTwinkle = (twinkle1 * 0.5 + twinkle2 * 0.3 + twinkle3 * 0.2);
        const twinkle = combinedTwinkle * 0.5 + 0.5; // Normalize to 0-1
        const opacity = star.opacity * twinkle;

        // Draw star with sharper points (4-pointed star effect)
        const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
          let rot = Math.PI / 2 * 3;
          let x = cx;
          let y = cy;
          const step = Math.PI / spikes;

          ctx.beginPath();
          ctx.moveTo(cx, cy - outerRadius);
          
          for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
          }
          
          ctx.lineTo(cx, cy - outerRadius);
          ctx.closePath();
        };

        // Draw the star shape (larger stars get sparkle effect)
        if (star.size > 1.8 && twinkle > 0.7) {
          // Draw sparkle for bright large stars
          ctx.save();
          drawStar(star.x, star.y, 4, star.size * 1.5, star.size * 0.5);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
          
          // Add extra bright center
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
          ctx.restore();
        } else {
          // Regular circular stars
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
        }

        // Add glow for larger stars with pulsing effect
        if (star.size > 1.5) {
          const glowIntensity = twinkle * 0.3;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 200, 255, ${glowIntensity})`;
          ctx.fill();
          
          // Additional inner glow
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 220, 255, ${opacity * 0.3})`;
          ctx.fill();
        }

        // Slow drift
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Stars Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.8 }}
      />

      {/* Moon */}
      <div className="fixed top-20 right-20 pointer-events-none z-0">
        <div className="relative w-32 h-32">
          {/* Moon glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-blue-200/20 via-blue-300/10 to-transparent blur-2xl scale-150" />
          
          {/* Moon body */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-2xl">
            {/* Craters */}
            <div className="absolute top-6 left-8 w-6 h-6 rounded-full bg-slate-500/30" />
            <div className="absolute top-12 right-10 w-4 h-4 rounded-full bg-slate-500/20" />
            <div className="absolute bottom-8 left-12 w-8 h-8 rounded-full bg-slate-500/25" />
            <div className="absolute top-16 left-6 w-3 h-3 rounded-full bg-slate-500/30" />
            
            {/* Shadow overlay for 3D effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-transparent via-transparent to-slate-900/30" />
          </div>

          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-200/10 scale-110" />
        </div>
      </div>
    </>
  );
}
