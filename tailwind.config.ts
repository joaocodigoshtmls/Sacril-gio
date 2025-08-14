import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0070f3',
          dark: '#0051a8',
        },
        secondary: {
          DEFAULT: '#7928ca',
          dark: '#4c1980',
        },
      },
    },
  },
  plugins: [],
};

export default config;
