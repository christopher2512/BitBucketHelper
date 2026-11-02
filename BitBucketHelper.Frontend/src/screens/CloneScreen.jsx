import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import CheckboxList from '../components/CheckboxList.jsx'
import ResultSummary from '../components/ResultSummary.jsx'
import { useConfig } from '../hooks/useConfig.js'
import { cloneRepos } from '../api/client.js'

export default function CloneScreen() {
  const { spks, reposBySpk, loading, error } = useConfig()

  const [spk, setSpk] = useState('')
  const [selectedRepos, setSelectedRepos] = useState([])
  const [localPath, setLocalPath] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    setSelectedRepos([])
  }, [spk])

  const repos = reposBySpk[spk] || []
  const repoItems = repos.map((r) => ({ key: r.repoSlug, label: r.repoName || r.repoSlug }))

  const canClone = spk && selectedRepos.length > 0 && localPath && !busy

  const handleClone = async () => {
    setBusy(true)
    setErrMsg('')
    setResults([])
    try {
      const res = await cloneRepos({
        spk,
        repoSlugs: selectedRepos,
        localPath,
      })
      setResults(res.results || [])
    } catch (e) {
      const detail = e?.response?.data || e?.message || 'Failed to clone repositories.'
      setErrMsg(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="flex h-full items-center justify-center text-muted">Loading…</div>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Clone Repos to Local Folder"
        subtitle="Clone all selected repositories for an SPK into a destination folder."
      />

      {error && <div className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</div>}
      {errMsg && <div className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{errMsg}</div>}

      <section className="card p-5 space-y-5">
        <div>
          <label className="label">SPK</label>
          <select
            className="input max-w-xs"
            value={spk}
            onChange={(e) => setSpk(e.target.value)}
          >
            <option value="">Select an SPK…</option>
            {spks.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <CheckboxList
          title={`Repositories (${repos.length})`}
          items={repoItems}
          selected={selectedRepos}
          onChange={setSelectedRepos}
        />

        <div>
          <label className="label">Local Destination Folder</label>
          <input
            className="input"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            placeholder="D:\Repos\MySPK"
          />
          <p className="mt-1 text-xs text-muted">
            Each repo is cloned into its own subfolder under this path. The folder must already exist.
          </p>
        </div>

        <div className="flex justify-end">
          <button className="btn-primary" disabled={!canClone} onClick={handleClone}>
            {busy ? 'Cloning…' : 'Clone Repositories'}
          </button>
        </div>
      </section>

      {results.length > 0 && (
        <ResultSummary results={results} title="Clone Summary" />
      )}
    </div>
  )
}
