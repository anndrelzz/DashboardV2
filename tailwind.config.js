/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        red:     { DEFAULT: '#E8000D', dark: '#9B0009', hover: '#FF1A24' },
        surface: { DEFAULT: '#111111', 2: '#181818', 3: '#222222' },
        muted:   'rgba(255,255,255,0.45)',
        dim:     'rgba(255,255,255,0.2)',
      },
      fontFamily: {
        bebas:  ['"Bebas Neue"', 'sans-serif'],
        barlow: ['Barlow', 'sans-serif'],
        cond:   ['"Barlow Condensed"', 'sans-serif'],
      },
      keyframes: {
        'fade-in':   { from: { opacity: '0' },                                   to: { opacity: '1' } },
        'slide-up':  { from: { opacity: '0', transform: 'translateY(24px)' },    to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in':  { from: { opacity: '0', transform: 'translateX(-20px)' },   to: { opacity: '1', transform: 'translateX(0)' } },
        'scale-in':  { from: { opacity: '0', transform: 'scale(0.85)' },         to: { opacity: '1', transform: 'scale(1)' } },
        'celeb-in':  { from: { opacity: '0', transform: 'scale(0.9) translateY(30px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)' } },
        'celeb-out': { from: { opacity: '1', transform: 'scale(1)' },             to: { opacity: '0', transform: 'scale(0.95)' } },
        'spin':      { to: { transform: 'rotate(360deg)' } },
        'bar-grow':  { from: { width: '0%' } },
        'float':     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'value-pop': { '0%': { transform: 'scale(0.5)', opacity: '0' }, '70%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        'fade-in':   'fade-in .4s ease forwards',
        'slide-up':  'slide-up .5s ease forwards',
        'slide-in':  'slide-in .4s ease forwards',
        'scale-in':  'scale-in .4s cubic-bezier(.34,1.56,.64,1) forwards',
        'celeb-in':  'celeb-in .6s cubic-bezier(.34,1.2,.64,1) forwards',
        'celeb-out': 'celeb-out .35s ease forwards',
        'spin':      'spin .7s linear infinite',
        'float':     'float 3s ease-in-out infinite',
        'value-pop': 'value-pop .6s cubic-bezier(.34,1.56,.64,1) forwards',
      },
      backgroundImage: {
        'red-grad':     'linear-gradient(135deg, #9B0009 0%, #E8000D 100%)',
        'dark-grad':    'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
        'surface-grad': 'linear-gradient(180deg, #141414 0%, #0e0e0e 100%)',
      },
    },
  },
  plugins: [],
}
