import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ConfigureScreen from './screens/ConfigureScreen.jsx'
import CreatePullRequestScreen from './screens/CreatePullRequestScreen.jsx'
import CreateBranchScreen from './screens/CreateBranchScreen.jsx'
import CloneScreen from './screens/CloneScreen.jsx'
import DeleteBranchScreen from './screens/DeleteBranchScreen.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/configure" replace />} />
        <Route path="/configure" element={<ConfigureScreen />} />
        <Route path="/pull-request" element={<CreatePullRequestScreen />} />
        <Route path="/create-branch" element={<CreateBranchScreen />} />
        <Route path="/clone" element={<CloneScreen />} />
        <Route path="/delete-branch" element={<DeleteBranchScreen />} />
      </Route>
    </Routes>
  )
}
