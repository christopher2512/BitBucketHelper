import { useEffect, useRef, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import ThemePreview from '../components/ThemePreview.jsx'
import EditableTable from '../components/EditableTable.jsx'
import SpkRepoMappingEditor from '../components/SpkRepoMappingEditor.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { THEMES } from '../themes.js'
import {
  getUserConfig, saveUserConfig,
  getRepoConfig, saveRepoConfig,
  getBranchList, saveBranchList,
} from '../api/client.js'

export default function ConfigureScreen() {
  const { theme, setTheme } = useTheme()
  const [userConfig, setUserConfig] = useState({ userId: '', bitbucketToken: '', bitbucketBaseUrl: '', theme: 'light' })
  const [repoConfig, setRepoConfig] = useState({ spkRepoMappings: [], reviewers: [] })
  const [branchList, setBranchList] = useState([])
  const [showToken, setShowToken] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })

  // Refs into the editable tables so a section Save can flush an in-progress row edit.
  const spkTableRef = useRef(null)
  const reviewerTableRef = useRef(null)

  // ---- Load all configs on mount ----
  useEffect(() => {
    Promise.all([getUserConfig(), getRepoConfig(), getBranchList()])
      .then(([u, r, b]) => {
        setUserConfig(u || { userId: '', bitbucketToken: '', bitbucketBaseUrl: '', theme: 'light' })
        setRepoConfig(r || { spkRepoMappings: [], reviewers: [] })
        setBranchList(b?.branches || [])
      })
      .catch(() => setMsg({ type: 'error', text: 'Failed to load configuration from the backend.' }))
      .finally(() => setLoading(false))
  }, [])

  const flash = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 3000)
  }

  // ---- User config save ----
  const saveUser = async () => {
    try {
      await saveUserConfig(userConfig)
      flash('success', 'User configuration saved.')
    } catch {
      flash('error', 'Failed to save user configuration.')
    }
  }

  // ---- SPK / Repo mapping save (flushes any in-progress row edit first) ----
  const saveSpkRepoMapping = async () => {
    const committed = spkTableRef.current?.commitPendingEdit() ?? repoConfig.spkRepoMappings
    const configToSave = { ...repoConfig, spkRepoMappings: committed }
    setRepoConfig(configToSave)
    try {
      await saveRepoConfig(configToSave)
      flash('success', 'SPK / Repo mapping saved.')
    } catch {
      flash('error', 'Failed to save SPK / Repo mapping.')
    }
  }

  // ---- Reviewers save (flushes any in-progress row edit first) ----
  const saveReviewers = async () => {
    const committed = reviewerTableRef.current?.commitPendingEdit() ?? repoConfig.reviewers
    const configToSave = { ...repoConfig, reviewers: committed }
    setRepoConfig(configToSave)
    try {
      await saveRepoConfig(configToSave)
      flash('success', 'Reviewers saved.')
    } catch {
      flash('error', 'Failed to save reviewers.')
    }
  }

  // ---- Branch list save ----
  const saveBranches = async () => {
    try {
      const branches = branchList
        .filter((b) => b.trim() !== '')
      await saveBranchList(branches)
      flash('success', 'Branch list saved.')
    } catch {
      flash('error', 'Failed to save branch list.')
    }
  }

  // ---- Theme change ----
  const onThemeChange = (id) => {
    setTheme(id)
    setUserConfig((c) => ({ ...c, theme: id }))
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center text-muted">Loading configuration…</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Configure" subtitle="User credentials, repository mappings, branches, and reviewers." />

      {msg.text && (
        <div
          className={`rounded-md px-4 py-2 text-sm ${
            msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* ---------- User credentials & theme ---------- */}
      <section className="card p-5">
        <h3 className="mb-4 text-sm font-semibold">User Configuration</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">User Id</label>
            <input
              className="input"
              value={userConfig.userId}
              onChange={(e) => setUserConfig({ ...userConfig, userId: e.target.value })}
              placeholder="your.bitbucket.username"
            />
          </div>
          <div>
            <label className="label">Bitbucket Base URL</label>
            <input
              className="input"
              value={userConfig.bitbucketBaseUrl}
              onChange={(e) => setUserConfig({ ...userConfig, bitbucketBaseUrl: e.target.value })}
              placeholder="https://bitbucket.yourcompany.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Bitbucket Token</label>
            <div className="flex gap-2">
              <input
                className="input"
                type={showToken ? 'text' : 'password'}
                value={userConfig.bitbucketToken}
                onChange={(e) => setUserConfig({ ...userConfig, bitbucketToken: e.target.value })}
                placeholder="••••••••••••••••"
              />
              <button
                type="button"
                className="btn-secondary whitespace-nowrap"
                onClick={() => setShowToken((s) => !s)}
              >
                {showToken ? '🙈 Hide' : '👁 Show'}
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="label">Theme</label>
            <div className="flex items-center gap-3">
              <select
                className="input max-w-xs"
                value={theme}
                onChange={(e) => onThemeChange(e.target.value)}
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ThemePreview swatch={THEMES.find((t) => t.id === theme)?.swatch} />
              <span className="text-sm text-muted">Preview</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary" onClick={saveUser}>Save User Configuration</button>
        </div>
      </section>

      {/* ---------- SPK / Repo mapping ---------- */}
      <section className="card p-5">
        <h3 className="mb-4 text-sm font-semibold">SPK / Repo Mapping</h3>
        <SpkRepoMappingEditor
          ref={spkTableRef}
          mappings={repoConfig.spkRepoMappings}
          onChange={(rows) => setRepoConfig((c) => ({ ...c, spkRepoMappings: rows }))}
        />
        <div className="mt-4 flex justify-end">
          <button className="btn-primary" onClick={saveSpkRepoMapping}>Save SPK / Repo Mapping</button>
        </div>
      </section>

      {/* ---------- Branch list ---------- */}
      <section className="card p-5">
        <h3 className="mb-4 text-sm font-semibold">Branch List</h3>
        <label className="label">Branches (one per line)</label>
        <textarea
          className="input min-h-[140px] font-mono"
          value={branchList.join('\n')}
          onChange={(e) => setBranchList(e.target.value.split('\n'))}
          placeholder={'main\ndevelop\nrelease/1.0'}
        />
        <div className="mt-4 flex justify-end">
          <button className="btn-primary" onClick={saveBranches}>Save Branch List</button>
        </div>
      </section>

      {/* ---------- Reviewers ---------- */}
      <section className="card p-5">
        <h3 className="mb-4 text-sm font-semibold">Reviewers</h3>
        <EditableTable
          ref={reviewerTableRef}
          columns={[
            { key: 'name', label: 'Name', placeholder: 'Jane Doe', autoFocus: true },
            { key: 'id', label: 'Id', placeholder: 'bitbucket-user-id' },
          ]}
          rows={repoConfig.reviewers}
          onChange={(rows) => setRepoConfig((c) => ({ ...c, reviewers: rows }))}
          addButtons={[{ label: 'Add Reviewer', defaults: {} }]}
        />
        <div className="mt-4 flex justify-end">
          <button className="btn-primary" onClick={saveReviewers}>Save Reviewers</button>
        </div>
      </section>
    </div>
  )
}
