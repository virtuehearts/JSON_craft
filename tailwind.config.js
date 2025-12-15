/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        chrome: '#1f2937',
        accent: '#00e0b8'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
};
