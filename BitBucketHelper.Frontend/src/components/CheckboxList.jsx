// A titled group of checkboxes with select-all / clear helpers.
// items: [{ key, label }]  | selected: [key]  | onChange: ([key]) => void
export default function CheckboxList({ items = [], selected, onChange, title }) {
  const allSelected = items.length > 0 && items.every((i) => selected.includes(i.key))
  const toggle = (key) => {
    if (selected.includes(key)) onChange(selected.filter((k) => k !== key))
    else onChange([...selected, key])
  }
  const toggleAll = () => {
    if (allSelected) onChange([])
    else onChange(items.map((i) => i.key))
  }

  return (
    <div>
      {title && (
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium">{title}</h4>
          <button type="button" className="text-xs text-primary hover:underline" onClick={toggleAll}>
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 && <p className="text-sm text-muted">No items available.</p>}
        {items.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2"
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--c-primary)]"
              checked={selected.includes(item.key)}
              onChange={() => toggle(item.key)}
            />
            <span className="truncate">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
