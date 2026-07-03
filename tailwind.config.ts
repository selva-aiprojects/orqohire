import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:         '#0B132B',
        'navy-light': '#16223D',
        coral:        '#0EA5E9',
        'coral-hover':'#0284C7',
        cyan:         '#06B6D4',
        aqua:         '#00D2FF',
        light:        '#F8FAFC',
        surface:      '#FFFFFF',
        border:       '#E2E8F0',
        muted:        '#64748B',
        'muted-dark': '#334155',
        success:      '#10B981',
        warning:      '#F59E0B',
        error:        '#EF4444',
        info:         '#0EA5E9',
        indigo:       '#3B82F6',
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        btn:  '10px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 2px 10px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        cardHover: '0 12px 30px rgba(15, 23, 42, 0.08), 0 4px 6px rgba(15, 23, 42, 0.04)',
        sidebar: '4px 0 24px rgba(15, 23, 42, 0.08)',
        glow: '0 0 25px rgba(255, 90, 54, 0.35)',
      },
    },
  },
  plugins: [],
}
export default config
