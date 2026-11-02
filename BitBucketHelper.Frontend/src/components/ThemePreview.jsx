// Small swatch strip that previews a theme's representative colors.
export default function ThemePreview({ swatch, size = 'md' }) {
  if (!swatch) return null
  const dim = size === 'sm' ? 'h-5' : 'h-8'
  return (
    <span
      className={`inline-flex ${dim} overflow-hidden rounded-md border border-line`}
      title="Theme preview"
    >
      <span style={{ backgroundColor: swatch.bg }} className="w-3" />
      <span style={{ backgroundColor: swatch.surface }} className="w-3" />
      <span style={{ backgroundColor: swatch.primary }} className="w-3" />
      <span style={{ backgroundColor: swatch.text }} className="w-2" />
    </span>
  )
}
