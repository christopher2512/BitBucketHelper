/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic colors backed by CSS variables so themes can swap at runtime.
        app: 'var(--c-bg)',
        surface: 'var(--c-surface)',
        'surface-2': 'var(--c-surface-2)',
        line: 'var(--c-border)',
        content: 'var(--c-text)',
        muted: 'var(--c-text-muted)',
        primary: 'var(--c-primary)',
        'on-primary': 'var(--c-primary-text)',
        accent: 'var(--c-accent)',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
