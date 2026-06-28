/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep brand greens
        forest: '#13241c', // darkest — nav, headers
        pine: '#1c3a2e', // dominant brand ink
        'pine-2': '#274d3c', // hover / lighter pine
        sage: '#7a8567', // muted secondary, quiet metadata
        'sage-2': '#9aa489', // lighter sage
        // Neutrals — warm paper + ink
        ink: '#1a1c18', // near-black text
        'ink-2': '#454a40', // secondary text
        paper: '#f3efe5', // bone surface (app bg)
        'paper-2': '#ebe6d8', // slightly deeper panel fill
        'paper-3': '#e2dccb', // hairline-tinted fill
        line: '#d4cdb8', // hairline border on paper
        'line-2': '#c4bba2', // stronger hairline
        // Single non-green accent — clay/ochre (alerts, peak, primary action)
        clay: '#bd5e2e',
        'clay-2': '#a64f24',
        'clay-soft': '#f0e0d0',
        // Status dots
        ok: '#3f7a4f',
        warn: '#bd5e2e',
        idle: '#7a8567',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Spline Sans Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0',
        DEFAULT: '2px',
        sm: '2px',
        md: '4px',
        lg: '4px',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
}
