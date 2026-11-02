import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/configure', label: 'Configure', icon: '⚙️' },
  { to: '/pull-request', label: 'Create Pull Request', icon: '🔀' },
  { to: '/create-branch', label: 'Create Branch', icon: '🌿' },
  { to: '/clone', label: 'Clone Repos', icon: '⬇️' },
  { to: '/delete-branch', label: 'Delete Branch', icon: '🗑️' },
]

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-shrink-0 flex-col bg-surface border-r border-line">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-line">
        <span className="text-2xl">🪣</span>
        <div>
          <h1 className="text-base font-semibold leading-tight">BitBucket Helper</h1>
          <p className="text-xs text-muted">Multi-repo operations</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'text-content hover:bg-surface-2'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 text-xs text-muted border-t border-line">
        BitBucket Helper v1.0
      </div>
    </aside>
  )
}
