/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': 'var(--bg-dark)',
        'bg-darker': 'var(--bg-darker)',
        'surface-glass': 'var(--surface-glass)',
        'surface-glass-hover': 'var(--surface-glass-hover)',
        'surface-light': 'var(--surface-light)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'accent-neon': 'var(--accent-neon)',
        'accent-neon-dim': 'var(--accent-neon-dim)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-purple': 'var(--accent-purple)',
        'accent-warning': 'var(--accent-warning)',
        'border-glass': 'var(--border-glass)',
        'border-light': 'var(--border-light)',
      },
      backdropBlur: {
        'glass': '12px',
        'glass-strong': '24px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 255, 255, 0.1)',
        'glass-lg': '0 12px 48px 0 rgba(0, 255, 255, 0.15)',
        'neon': '0 0 20px rgba(0, 255, 255, 0.5)',
        'neon-strong': '0 0 40px rgba(0, 255, 255, 0.8)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 255, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
