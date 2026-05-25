import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Surinaamse vlag-kleuren als basis (groen + rood + wit + geel)
        sdp: {
          groen: '#377E3F',
          rood: '#C8102E',
          geel: '#FECB00',
          wit:  '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
