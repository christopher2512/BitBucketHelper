import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import BranchSelect from '../components/BranchSelect.jsx'
import CheckboxList from '../components/CheckboxList.jsx'
import ResultSummary from '../components/ResultSummary.jsx'
import { useConfig } from '../hooks/useConfig.js'
import { createBranches } from '../api/client.js'

export default function CreateBranchScreen() {
  const { spks, reposBySpk, branches, loading, error } = useConfig()

  const [spk, setSpk] = useState('')
  const [selectedRepos, setSelectedRepos] = useState([])
  const [fromBranch, setFromBranch] = useState('')
  const [newBranchName, setNewBranchName] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    setSelectedRepos([])
  }, [spk])

  const repos = reposBySpk[spk] || []
  const repoItems = repos.map((r) => ({ key: r.repoSlug, label: r.repoName || r.repoSlug }))

  const canCreate = spk && selectedRepos.length > 0 && fromBranch && newBranchName && !busy

  const handleCreate = async () => {
    setBusy(true)
    setErrMsg('')
    setResults([])
    try {
      const res = await createBranches({
        spk,
        repoSlugs: selectedRepos,
        fromBranch,
        newBranchName,
      })
      setResults(res.results || [])
    } catch (e) {
      const detail = e?.response?.data || e?.message || 'Failed to create branches.'
      setErrMsg(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="flex h-full items-center justify-center text-muted">Loading…</div>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Create Branch"
        subtitle="Create a new branch across multiple repositories mapped to an SPK."
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">Source Branch (branch from)</label>
            <BranchSelect branches={branches} value={fromBranch} onChange={setFromBranch} />
          </div>
          <div>
            <label className="label">New Branch Name</label>
            <input
              className="input"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="feature/my-new-branch"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn-primary" disabled={!canCreate} onClick={handleCreate}>
            {busy ? 'Creating…' : 'Create Branch'}
          </button>
        </div>
      </section>

      {results.length > 0 && (
        <ResultSummary results={results} title="Branch Creation Summary" />
      )}
    </div>
  )
}
