// ============================================================
// DashboardLayout.jsx
// Layout dùng chung cho tất cả trang dashboard (sidebar + main).
// Owner, Renter, Admin đều dùng component này.
// ============================================================

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'

/**
 * @param {Array}     navItems  - Danh sách menu: [{ to, icon, label }]
 * @param {ReactNode} children  - Nội dung trang bên phải
 */
export default function DashboardLayout({ navItems = [], children }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen pt-16">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-dark-2 border-r border-white/8 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">

        {/* Profile */}
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center font-bold shrink-0">
              {getInitials(user?.name || user?.email || 'U')}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name ?? user?.email}
              </p>
              <p className="text-xs text-primary capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4">
          {navItems.map((section, i) => (
            <div key={i} className="mb-2">
              {/* Section label (optional) */}
              {section.label && (
                <p className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {section.label}
                </p>
              )}
              {section.items.map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-2.5 text-sm transition-all border-l-2
                     ${isActive
                       ? 'text-primary border-primary bg-primary/8 font-medium'
                       : 'text-gray-400 border-transparent hover:text-white hover:bg-white/4'
                     }`
                  }
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/8">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            🚪 Đăng Xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
