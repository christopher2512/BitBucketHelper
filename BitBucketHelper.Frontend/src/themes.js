// Theme catalog. Each theme maps to a [data-theme="..."] block in index.css.
// `swatch` holds representative colors used by the small preview widget.
export const THEMES = [
  {
    id: 'light',
    name: 'Light',
    swatch: { bg: '#f1f5f9', surface: '#ffffff', primary: '#2563eb', text: '#0f172a' },
  },
  {
    id: 'dark',
    name: 'Dark',
    swatch: { bg: '#0f172a', surface: '#1e293b', primary: '#3b82f6', text: '#f1f5f9' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    swatch: { bg: '#e0f2fe', surface: '#f0f9ff', primary: '#0284c7', text: '#0c4a6e' },
  },
  {
    id: 'forest',
    name: 'Forest',
    swatch: { bg: '#ecfdf5', surface: '#f0fdf4', primary: '#059669', text: '#064e3b' },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    swatch: { bg: '#fff7ed', surface: '#fffbeb', primary: '#ea580c', text: '#7c2d12' },
  },
  {
    id: 'slate',
    name: 'Slate',
    swatch: { bg: '#f4f4f5', surface: '#fafafa', primary: '#475569', text: '#27272a' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    swatch: { bg: '#020617', surface: '#111827', primary: '#6366f1', text: '#e5e7eb' },
  },
]

export const getTheme = (id) => THEMES.find((t) => t.id === id) || THEMES[0]
