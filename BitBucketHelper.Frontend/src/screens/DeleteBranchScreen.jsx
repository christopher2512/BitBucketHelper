import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import BranchSelect from '../components/BranchSelect.jsx'
import CheckboxList from '../components/CheckboxList.jsx'
import ResultSummary from '../components/ResultSummary.jsx'
import { useConfig } from '../hooks/useConfig.js'
import { deleteBranches } from '../api/client.js'
import { filterFeatureBranches } from '../utils/branches.js'

export default function DeleteBranchScreen() {
  const { spks, reposBySpk, branches, loading, error } = useConfig()

  const [spk, setSpk] = useState('')
  const [selectedRepos, setSelectedRepos] = useState([])
  const [branchName, setBranchName] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    setSelectedRepos([])
  }, [spk])

  const repos = reposBySpk[spk] || []
  const repoItems = repos.map((r) => ({ key: r.repoSlug, label: r.repoName || r.repoSlug }))

  const canDelete = spk && selectedRepos.length > 0 && branchName && confirm && !busy

  const handleDelete = async () => {
    setBusy(true)
    setErrMsg('')
    setResults([])
    try {
      const res = await deleteBranches({
        spk,
        repoSlugs: selectedRepos,
        branchName,
      })
      setResults(res.results || [])
      setConfirm(false)
    } catch (e) {
      const detail = e?.response?.data || e?.message || 'Failed to delete branches.'
      setErrMsg(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="flex h-full items-center justify-center text-muted">Loading…</div>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Delete Feature Branch"
        subtitle="Delete a feature branch across multiple repositories mapped to an SPK."
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
          <label className="label">Branch to Delete</label>
          <BranchSelect branches={filterFeatureBranches(branches)} value={branchName} onChange={setBranchName} placeholder="Select or type a feature branch to delete…" />
          <p className="mt-1 text-xs text-muted">Protected branches (main, master, develop, release, etc.) are hidden.</p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-red-500"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
          />
          I understand this will permanently delete the branch in all selected repositories.
        </label>

        <div className="flex justify-end">
          <button className="btn-danger" disabled={!canDelete} onClick={handleDelete}>
            {busy ? 'Deleting…' : 'Delete Branch'}
          </button>
        </div>
      </section>

      {results.length > 0 && (
        <ResultSummary results={results} title="Branch Deletion Summary" />
      )}
    </div>
  )
}
