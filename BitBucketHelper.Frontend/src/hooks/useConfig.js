import { useEffect, useMemo, useState } from 'react'
import { getRepoConfig, getBranchList } from '../api/client.js'

// Loads the shared config (repo mappings, reviewers, branch list) once and
// derives the unique SPK list and a per-SPK repository lookup.
export function useConfig() {
  const [repoConfig, setRepoConfig] = useState({ spkRepoMappings: [], reviewers: [] })
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = async () => {
    setError('')
    try {
      const [r, b] = await Promise.all([getRepoConfig(), getBranchList()])
      setRepoConfig(r || { spkRepoMappings: [], reviewers: [] })
      setBranches(b?.branches || [])
    } catch (e) {
      setError('Failed to load configuration. Make sure the backend is running and configure SPK mappings first.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const spks = useMemo(
    () => [...new Set(repoConfig.spkRepoMappings.map((m) => m.spk).filter(Boolean))],
    [repoConfig],
  )

  const reposBySpk = useMemo(() => {
    const map = {}
    for (const m of repoConfig.spkRepoMappings) {
      if (!m.spk) continue
      if (!map[m.spk]) map[m.spk] = []
      map[m.spk].push(m)
    }
    return map
  }, [repoConfig])

  return {
    spks,
    reposBySpk,
    reviewers: repoConfig.reviewers || [],
    branches,
    loading,
    error,
    reload,
  }
}
