import axios from 'axios'

const http = axios.create({
  // Relative path works both in dev (proxied by Vite) and prod (same origin).
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ---- Config ----
export const getUserConfig = () => http.get('/config/user').then((r) => r.data)
export const saveUserConfig = (config) => http.post('/config/user', config).then((r) => r.data)

export const getRepoConfig = () => http.get('/config/repo').then((r) => r.data)
export const saveRepoConfig = (config) => http.post('/config/repo', config).then((r) => r.data)

export const getBranchList = () => http.get('/config/branches').then((r) => r.data)
export const saveBranchList = (branches) => http.post('/config/branches', { branches }).then((r) => r.data)

// ---- Operations ----
export const createPullRequests = (payload) => http.post('/pullrequest', payload).then((r) => r.data)
export const createBranches = (payload) => http.post('/branch', payload).then((r) => r.data)
export const deleteBranches = (payload) => http.delete('/branch', { data: payload }).then((r) => r.data)
export const cloneRepos = (payload) => http.post('/clone', payload).then((r) => r.data)

export default http
