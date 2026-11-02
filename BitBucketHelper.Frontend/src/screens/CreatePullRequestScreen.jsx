import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import BranchSelect from '../components/BranchSelect.jsx'
import CheckboxList from '../components/CheckboxList.jsx'
import ResultSummary from '../components/ResultSummary.jsx'
import { useConfig } from '../hooks/useConfig.js'
import { createPullRequests } from '../api/client.js'

export default function CreatePullRequestScreen() {
  const { spks, reposBySpk, reviewers, branches, loading, error } = useConfig()

  const [spk, setSpk] = useState('')
  const [selectedRepos, setSelectedRepos] = useState([])
  const [selectedReviewers, setSelectedReviewers] = useState([])
  const [fromBranch, setFromBranch] = useState('')
  const [toBranch, setToBranch] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  // Reset repo selection when SPK changes.
  useEffect(() => {
    setSelectedRepos([])
  }, [spk])

  const repos = reposBySpk[spk] || []
  const repoItems = repos.map((r) => ({ key: r.repoSlug, label: r.repoName || r.repoSlug }))
  const reviewerItems = reviewers.map((r) => ({ key: r.id, label: `${r.name} (${r.id})` }))

  const canCreate =
    spk &&
    selectedRepos.length > 0 &&
    fromBranch &&
    toBranch &&
    !busy

  const handleCreate = async () => {
    setBusy(true)
    setErrMsg('')
    setResults([])
    try {
      const res = await createPullRequests({
        spk,
        repoSlugs: selectedRepos,
        fromBranch,
        toBranch,
        title,
        description,
        reviewerIds: selectedReviewers,
      })
      setResults(res.results || [])
    } catch (e) {
      const detail = e?.response?.data || e?.message || 'Failed to create pull requests.'
      setErrMsg(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="flex h-full items-center justify-center text-muted">Loading…</div>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Create Pull Requests"
        subtitle="Create a pull request across multiple repositories mapped to an SPK."
      />

      {error && <div className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</div>}
      {errMsg && <div className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{errMsg}</div>}

      <section className="card p-5 space-y-5">
        {/* SPK */}
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

        {/* Repos */}
        <CheckboxList
          title={`Repositories (${repos.length})`}
          items={repoItems}
          selected={selectedRepos}
          onChange={setSelectedRepos}
        />

        {/* Branches */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">Source Branch (from)</label>
            <BranchSelect branches={branches} value={fromBranch} onChange={setFromBranch} />
          </div>
          <div>
            <label className="label">Target Branch (to)</label>
            <BranchSelect branches={branches} value={toBranch} onChange={setToBranch} />
          </div>
        </div>

        {/* Title / description */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label">Title (optional)</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Defaults to: <source> -> <target>"
            />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              className="input min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pull request description…"
            />
          </div>
        </div>

        {/* Reviewers */}
        <CheckboxList
          title={`Reviewers (${reviewers.length})`}
          items={reviewerItems}
          selected={selectedReviewers}
          onChange={setSelectedReviewers}
        />

        <div className="flex justify-end">
          <button className="btn-primary" disabled={!canCreate} onClick={handleCreate}>
            {busy ? 'Creating…' : 'Create Pull Request'}
          </button>
        </div>
      </section>

      {results.length > 0 && (
        <ResultSummary results={results} title="Pull Request Summary" />
      )}
    </div>
  )
}
