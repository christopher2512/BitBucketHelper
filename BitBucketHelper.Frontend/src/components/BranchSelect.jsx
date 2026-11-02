import { useState, useRef, useEffect } from 'react'

// A searchable, editable combo box for selecting (or typing) a branch name.
export default function BranchSelect({ branches = [], value, onChange, placeholder = 'Select or type a branch…' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const ref = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        // Commit any typed value that isn't already the value.
        if (query !== value) onChange(query)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [query, value, onChange])

  const filtered = branches.filter((b) =>
    b.toLowerCase().includes(query.toLowerCase()),
  )

  const showDropdown = open && filtered.length > 0

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        className="input"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          onChange(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setOpen(false)
            onChange(query)
          }
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {showDropdown && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-line bg-surface shadow-lg">
          {filtered.slice(0, 50).map((b) => (
            <li
              key={b}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-surface-2"
              onMouseDown={(e) => {
                e.preventDefault()
                setQuery(b)
                onChange(b)
                setOpen(false)
              }}
            >
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
