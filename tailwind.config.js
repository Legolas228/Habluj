/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core System Colors
        background: 'var(--color-background)', // warm-50
        foreground: 'var(--color-foreground)', // gray-800
        border: 'var(--color-border)', // gray-200
        input: 'var(--color-input)', // white
        ring: 'var(--color-ring)', // orange-700
        
        // Card & Surface Colors
        card: {
          DEFAULT: 'var(--color-card)', // stone-100
          foreground: 'var(--color-card-foreground)' // gray-800
        },
        popover: {
          DEFAULT: 'var(--color-popover)', // white
          foreground: 'var(--color-popover-foreground)' // gray-800
        },
        
        // Muted Colors
        muted: {
          DEFAULT: 'var(--color-muted)', // stone-100
          foreground: 'var(--color-muted-foreground)' // gray-600
        },
        
        // Brand Primary Colors
        primary: {
          DEFAULT: 'var(--color-primary)', // orange-700
          foreground: 'var(--color-primary-foreground)' // white
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', // blue-700
          foreground: 'var(--color-secondary-foreground)' // white
        },
        
        // Accent Colors
        accent: {
          DEFAULT: 'var(--color-accent)', // yellow-400
          foreground: 'var(--color-accent-foreground)' // gray-800
        },
        
        // State Colors
        success: {
          DEFAULT: 'var(--color-success)', // green-700
          foreground: 'var(--color-success-foreground)' // white
        },
        warning: {
          DEFAULT: 'var(--color-warning)', // amber-600
          foreground: 'var(--color-warning-foreground)' // white
        },
        error: {
          DEFAULT: 'var(--color-error)', // red-600
          foreground: 'var(--color-error-foreground)' // white
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', // red-600
          foreground: 'var(--color-destructive-foreground)' // white
        },
        
        // Brand Specific Colors
        'brand-slovak': 'var(--color-brand-slovak)', // blue-700
        'brand-spanish': 'var(--color-brand-spanish)', // orange-600
        'conversion-accent': 'var(--color-conversion-accent)', // orange-500
        'trust-builder': 'var(--color-trust-builder)', // green-600
        'cta': 'var(--color-cta)' // red-500
      },
      fontFamily: {
        'headlines': ['Inter', 'sans-serif'],
        'body': ['Source Sans Pro', 'sans-serif'],
        'accent': ['Crimson Text', 'serif'],
        'sans': ['Source Sans Pro', 'sans-serif'],
        'serif': ['Crimson Text', 'serif']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.6rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.2' }]
      },
      spacing: {
        'xs': '8px',
        'sm': '13px',
        'md': '21px',
        'lg': '34px',
        'xl': '55px'
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px'
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'warm': '0 4px 20px rgba(210, 105, 30, 0.15)',
        'cultural': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'authority': '0 0 20px rgba(11, 78, 162, 0.3)',
        'authority-hover': '0 0 30px rgba(11, 78, 162, 0.5)'
      },
      animation: {
        'bridge-flow': 'bridge-flow 2.5s ease-in-out infinite',
        'milestone-reveal': 'milestone-reveal 0.6s ease-out forwards',
        'text-reveal': 'text-reveal 1.2s ease-out forwards',
        'pulse-urgent': 'pulse-urgent 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out'
      },
      keyframes: {
        'bridge-flow': {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' }
        },
        'milestone-reveal': {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' }
        },
        'text-reveal': {
          'from': { clipPath: 'inset(0 100% 0 0)' },
          'to': { clipPath: 'inset(0 0 0 0)' }
        },
        'pulse-urgent': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' }
        },
        'fadeIn': {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        'slideUp': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'scaleIn': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' }
        }
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'cultural': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transitionDuration: {
        'fast': '300ms',
        'medium': '400ms',
        'slow': '600ms',
        'cultural': '2500ms'
      },
      backdropBlur: {
        'xs': '2px'
      },
      backgroundImage: {
        'gradient-cultural': 'linear-gradient(135deg, var(--color-brand-slovak) 0%, var(--color-primary) 50%, var(--color-brand-spanish) 100%)',
        'gradient-warm': 'linear-gradient(135deg, var(--color-background) 0%, var(--color-card) 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate')
  ]
}
