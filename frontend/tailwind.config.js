module.exports = {
  content: [
    './src/**/*.{html,svelte,ts,js}',
    './app/**/*.{html,svelte,ts,js}',
    './example/**/*.{html,svelte,ts,js}',
    './src/routes/**/*.{svelte,ts,js}',
    './src/lib/components/**/*.{svelte,ts,js}',
    './e2e/**/*.ts'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--md-sys-color-primary)',
        'on-primary': 'var(--md-sys-color-on-primary)',
        surface: 'var(--md-sys-color-surface)',
        'on-surface': 'var(--md-sys-color-on-surface)',
        'surface-variant': 'var(--md-sys-color-surface-variant)',
        'on-surface-variant': 'var(--md-sys-color-on-surface-variant)',
        outline: 'var(--md-sys-color-outline)',
        'button-start': 'var(--button-gradient-start)',
        'button-end': 'var(--button-gradient-end)',
        'input-bg': 'var(--input-bg-color)'
      },
      borderRadius: {
        'card': '1.5rem',
        'pill': '9999px',
        '3xl': '2rem'
      },
      boxShadow: {
        'glass-lg': '0 10px 30px 0 rgba(16,24,40,0.06)',
        'card': '0 4px 6px rgba(0,0,0,0.05)',
        'glow-primary': '0 6px 24px 0 rgba(59, 53, 179, 0.12)'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ]
};