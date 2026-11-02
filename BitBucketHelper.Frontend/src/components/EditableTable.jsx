import { useState } from 'react'

// A table whose rows become editable on double-click.
// Props:
//   columns: [{ key, label, placeholder, type }]
//   rows: array of row objects
//   onChange: (rows) => void
//   addButtons: [{ label, onAdd }]   — buttons that append an editable row
export default function EditableTable({ columns, rows, onChange, addButtons = [] }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [draft, setDraft] = useState({})

  const startEdit = (index) => {
    setEditingIndex(index)
    setDraft({ ...rows[index] })
  }

  const addRow = (defaults = {}) => {
    const blank = columns.reduce((acc, c) => ({ ...acc, [c.key]: '' }), {})
    const newRow = { ...blank, ...defaults }
    const next = [...rows, newRow]
    onChange(next)
    setEditingIndex(next.length - 1)
    setDraft(newRow)
  }

  const commit = (index) => {
    const next = [...rows]
    next[index] = { ...draft }
    onChange(next)
    setEditingIndex(null)
  }

  const remove = (index) => {
    const next = rows.filter((_, i) => i !== index)
    onChange(next)
    if (editingIndex === index) setEditingIndex(null)
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1)
  }

  const updateField = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  return (
    <div>
      {addButtons.length > 0 && (
        <div className="mb-3 flex gap-2">
          {addButtons.map((b) => (
            <button
              key={b.label}
              type="button"
              className="btn-secondary"
              onClick={() => addRow(b.defaults || {})}
            >
              + {b.label}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-muted">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2 font-medium">{c.label}</th>
              ))}
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-4 text-center text-muted">
                  No rows yet. Use the button above to add one.
                </td>
              </tr>
            )}
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-t border-line"
                onDoubleClick={() => startEdit(idx)}
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2">
                    {editingIndex === idx ? (
                      <input
                        type={c.type || 'text'}
                        className="input py-1"
                        value={draft[c.key] ?? ''}
                        placeholder={c.placeholder}
                        autoFocus={c.autoFocus}
                        onChange={(e) => updateField(c.key, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commit(idx)
                          if (e.key === 'Escape') setEditingIndex(null)
                        }}
                      />
                    ) : (
                      <span className="block min-h-[1.5rem]">{row[c.key] || <span className="text-muted">—</span>}</span>
                    )}
                  </td>
                ))}
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    {editingIndex === idx ? (
                      <button
                        type="button"
                        className="btn-primary px-2 py-1 text-xs"
                        onClick={() => commit(idx)}
                        title="Save"
                      >
                        ✓
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary px-2 py-1 text-xs"
                        onClick={() => startEdit(idx)}
                        title="Edit"
                      >
                        ✎
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-danger px-2 py-1 text-xs"
                      onClick={() => remove(idx)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1 text-xs text-muted">Tip: double-click a row to edit it.</p>
    </div>
  )
}
