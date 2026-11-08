import { useMemo, useState, forwardRef, useImperativeHandle } from 'react'

// Collapsible, SPK-grouped editor for the flat spkRepoMappings list.
// Each SPK is a collapsible header; its repos are editable rows underneath.
// Exposes commitPendingEdit() via ref so the section Save can flush edits.
//
// Props:
//   mappings: array of { spk, projectKey, repoSlug, repoName }
//   onChange: (mappings) => void
const SpkRepoMappingEditor = forwardRef(function SpkRepoMappingEditor(
  { mappings, onChange },
  ref,
) {
  const [collapsed, setCollapsed] = useState(new Set())
  const [editingSpk, setEditingSpk] = useState(null) // old SPK name being edited
  const [spkDraft, setSpkDraft] = useState('')
  const [editingRepoIdx, setEditingRepoIdx] = useState(null)
  const [repoDraft, setRepoDraft] = useState({})

  // Group the flat list by SPK, preserving insertion order and row indices.
  const groups = useMemo(() => {
    const map = new Map()
    mappings.forEach((row, index) => {
      const key = row.spk || '(unnamed)'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push({ row, index })
    })
    return Array.from(map.entries()) // [[spk, [{row, index}, ...]], ...]
  }, [mappings])

  // ---- Imperative flush for the section Save button ----
  useImperativeHandle(ref, () => ({
    commitPendingEdit: () => {
      let result = mappings
      let changed = false

      if (editingSpk !== null) {
        const next = spkDraft.trim() || editingSpk
        if (next !== editingSpk) {
          result = result.map((m) => (m.spk === editingSpk ? { ...m, spk: next } : m))
          changed = true
        }
        setEditingSpk(null)
      }

      if (editingRepoIdx !== null) {
        const arr = [...result]
        arr[editingRepoIdx] = { ...repoDraft }
        result = arr
        changed = true
        setEditingRepoIdx(null)
      }

      if (changed) onChange(result)
      return result
    },
  }))

  // ---- Collapsing ----
  const toggleCollapse = (spk) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(spk)) next.delete(spk)
      else next.add(spk)
      return next
    })
  }

  // ---- SPK name editing ----
  const startEditSpk = (spk) => {
    setEditingSpk(spk)
    setSpkDraft(spk)
  }

  const commitSpk = (oldSpk) => {
    const next = spkDraft.trim() || oldSpk
    if (next !== oldSpk) {
      onChange(mappings.map((m) => (m.spk === oldSpk ? { ...m, spk: next } : m)))
    }
    setEditingSpk(null)
  }

  // ---- Repo row editing ----
  const startEditRepo = (idx) => {
    setEditingRepoIdx(idx)
    setRepoDraft({ ...mappings[idx] })
  }

  const commitRepo = (idx) => {
    const next = [...mappings]
    next[idx] = { ...repoDraft }
    onChange(next)
    setEditingRepoIdx(null)
  }

  const updateRepoField = (key, value) => setRepoDraft((d) => ({ ...d, [key]: value }))

  // ---- Add / delete ----
  const addSpk = () => {
    let name = 'New SPK'
    let n = 2
    while (mappings.some((m) => m.spk === name)) name = `New SPK ${n++}`
    const newRow = { spk: name, projectKey: '', repoSlug: '', repoName: '' }
    onChange([...mappings, newRow])
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.delete(name)
      return next
    })
    setEditingSpk(name)
    setSpkDraft(name)
    setEditingRepoIdx(mappings.length)
    setRepoDraft(newRow)
  }

  const addRepo = (spk) => {
    const newRow = { spk, projectKey: '', repoSlug: '', repoName: '' }
    onChange([...mappings, newRow])
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.delete(spk)
      return next
    })
    setEditingRepoIdx(mappings.length)
    setRepoDraft(newRow)
  }

  const deleteSpk = (spk) => {
    onChange(mappings.filter((m) => m.spk !== spk))
    if (editingSpk === spk) setEditingSpk(null)
  }

  const deleteRepo = (idx) => {
    onChange(mappings.filter((_, i) => i !== idx))
    if (editingRepoIdx === idx) setEditingRepoIdx(null)
    else if (editingRepoIdx !== null && editingRepoIdx > idx) setEditingRepoIdx(editingRepoIdx - 1)
  }

  const repoColumns = [
    { key: 'projectKey', label: 'Project Key', placeholder: 'PROJ', autoFocus: true },
    { key: 'repoSlug', label: 'Repo Slug', placeholder: 'repo-slug' },
    { key: 'repoName', label: 'Repo Name', placeholder: 'Display name' },
  ]

  return (
    <div>
      <div className="mb-3">
        <button type="button" className="btn-secondary" onClick={addSpk}>
          + Add SPK
        </button>
      </div>

      {groups.length === 0 && (
        <div className="rounded-md border border-line px-4 py-6 text-center text-sm text-muted">
          No SPK mappings yet. Click <span className="font-medium">+ Add SPK</span> to create a group.
        </div>
      )}

      {groups.map(([spk, rows]) => {
        const isCollapsed = collapsed.has(spk)
        return (
          <div key={spk} className="mb-3 overflow-hidden rounded-md border border-line">
            {/* ---- Group header ---- */}
            <div className="flex flex-wrap items-center gap-2 bg-surface-2 px-3 py-2.5">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-surface"
                onClick={() => toggleCollapse(spk)}
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? '▶' : '▼'}
              </button>

              {editingSpk === spk ? (
                <input
                  type="text"
                  className="input max-w-xs py-1"
                  value={spkDraft}
                  autoFocus
                  onChange={(e) => setSpkDraft(e.target.value)}
                  onBlur={() => commitSpk(spk)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitSpk(spk)
                    if (e.key === 'Escape') setEditingSpk(null)
                  }}
                />
              ) : (
                <span
                  className="cursor-pointer font-semibold"
                  onDoubleClick={() => startEditSpk(spk)}
                  title="Double-click to rename"
                >
                  {spk}
                </span>
              )}

              <span className="text-xs text-muted">({rows.length} repo{rows.length !== 1 ? 's' : ''})</span>

              <div className="ml-auto flex gap-1">
                <button
                  type="button"
                  className="btn-secondary px-2 py-1 text-xs"
                  onClick={() => addRepo(spk)}
                  title="Add repo to this SPK"
                >
                  + Add Repo
                </button>
                <button
                  type="button"
                  className="btn-danger px-2 py-1 text-xs"
                  onClick={() => deleteSpk(spk)}
                  title="Delete this SPK and all its repos"
                >
                  🗑 SPK
                </button>
              </div>
            </div>

            {/* ---- Group body (repos) ---- */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-left text-muted">
                    <tr>
                      {repoColumns.map((c) => (
                        <th key={c.key} className="px-3 py-2 font-medium">{c.label}</th>
                      ))}
                      <th className="px-3 py-2 font-medium text-right">Row</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ row, index }) => (
                      <tr
                        key={index}
                        className="border-t border-line"
                        onDoubleClick={() => startEditRepo(index)}
                      >
                        {repoColumns.map((c) => (
                          <td key={c.key} className="px-3 py-2">
                            {editingRepoIdx === index ? (
                              <input
                                type="text"
                                className="input py-1"
                                value={repoDraft[c.key] ?? ''}
                                placeholder={c.placeholder}
                                autoFocus={c.autoFocus}
                                onChange={(e) => updateRepoField(c.key, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitRepo(index)
                                  if (e.key === 'Escape') setEditingRepoIdx(null)
                                }}
                              />
                            ) : (
                              <span className="block min-h-[1.5rem]">
                                {row[c.key] || <span className="text-muted">—</span>}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            {editingRepoIdx === index ? (
                              <button
                                type="button"
                                className="btn-primary px-2 py-1 text-xs"
                                onClick={() => commitRepo(index)}
                                title="Save row"
                              >
                                ✓
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-secondary px-2 py-1 text-xs"
                                onClick={() => startEditRepo(index)}
                                title="Edit row"
                              >
                                ✎
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-danger px-2 py-1 text-xs"
                              onClick={() => deleteRepo(index)}
                              title="Delete row"
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
            )}
          </div>
        )
      })}

      <p className="mt-1 text-xs text-muted">
        Tip: double-click an SPK name to rename it, double-click a row to edit it. Use + Add Repo
        inside a group. Click the section's Save button to persist all mappings to disk.
      </p>
    </div>
  )
})

export default SpkRepoMappingEditor
