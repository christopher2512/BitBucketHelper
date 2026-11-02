import { useState } from 'react'
import { copyToClipboard } from '../utils/clipboard'

// Renders a batch operation result as a table with per-row and "copy all" link actions.
export default function ResultSummary({ results = [], title = 'Summary' }) {
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedRow, setCopiedRow] = useState(null)

  const links = results
    .map((r) => r.link)
    .filter(Boolean)

  const handleCopyAll = async () => {
    const ok = await copyToClipboard(links.join('\n'))
    if (ok) {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    }
  }

  const handleCopyRow = async (link, idx) => {
    const ok = await copyToClipboard(link)
    if (ok) {
      setCopiedRow(idx)
      setTimeout(() => setCopiedRow(null), 2000)
    }
  }

  if (!results.length) return null

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {links.length > 0 && (
          <button className="btn-secondary text-xs" onClick={handleCopyAll}>
            {copiedAll ? '✓ Copied' : '📋 Copy All Links'}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Repository</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Message</th>
              <th className="px-4 py-2 font-medium">Link</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={idx} className="border-t border-line">
                <td className="px-4 py-2">{r.repoName || r.repoSlug}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.success
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {r.success ? 'Success' : 'Failed'}
                  </span>
                </td>
                <td className="px-4 py-2 max-w-md break-words">{r.message}</td>
                <td className="px-4 py-2">
                  {r.link ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={r.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline hover:opacity-80"
                      >
                        Open
                      </a>
                      <button
                        className="btn-secondary px-2 py-1 text-xs"
                        onClick={() => handleCopyRow(r.link, idx)}
                        title="Copy link"
                      >
                        {copiedRow === idx ? '✓' : '📋'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
