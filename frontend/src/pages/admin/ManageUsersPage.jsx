// ============================================================
// ManageUsersPage.jsx
// Admin: xem, xóa, khóa/mở khóa tài khoản người dùng.
// ============================================================

import { useState, useEffect } from 'react'
import toast            from 'react-hot-toast'
import DashboardLayout  from '../../components/layout/DashboardLayout'
import LoadingSpinner   from '../../components/common/LoadingSpinner'
import EmptyState       from '../../components/common/EmptyState'
import { getAllUsers, deleteUser, toggleUserStatus } from '../../api/usersApi'
import { formatDate, getInitials } from '../../utils/formatters'
import { ADMIN_NAV }    from './AdminDashboard'

export default function ManageUsersPage() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    getAllUsers()
      .then(({ data }) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id, name) {
    if (!window.confirm(`Xóa tài khoản "${name}"? Hành động này không thể hoàn tác.`)) return
    try {
      await deleteUser(id)
      toast.success('Đã xóa tài khoản')
      setUsers(p => p.filter(u => u._id !== id))
    } catch {
      toast.error('Xóa thất bại')
    }
  }

  async function handleToggle(user) {
    try {
      await toggleUserStatus(user._id, !user.active)
      toast.success(`Đã ${user.active ? 'khóa' : 'mở khóa'} tài khoản`)
      setUsers(p => p.map(u => u._id === user._id ? { ...u, active: !u.active } : u))
    } catch {
      toast.error('Cập nhật thất bại')
    }
  }

  const ROLE_LABEL = { admin: '👑 Admin', owner: '🚗 Chủ Xe', user: '👤 Người Thuê' }

  const filtered = users.filter(u => {
    const matchSearch = `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter ? u.role === roleFilter : true
    return matchSearch && matchRole
  })

  return (
    <DashboardLayout navItems={ADMIN_NAV}>

      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide">QUẢN LÝ NGƯỜI DÙNG</h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} tài khoản trong hệ thống</p>
      </div>

      {/* Thanh tìm kiếm + lọc */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input flex-1 min-w-48"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="input w-44"
        >
          <option value="">Tất cả role</option>
          <option value="user">Người Thuê</option>
          <option value="owner">Chủ Xe</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" title="Không tìm thấy người dùng nào" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/8">
              <tr>
                {['Người Dùng', 'Role', 'Ngày Tạo', 'Trạng Thái', 'Hành Động'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-wide text-gray-400 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/2">
                  {/* Avatar + tên */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {u.avatar
                          ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          : getInitials(u.name || u.email)
                        }
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name || '—'}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4 text-gray-300 text-xs font-medium">
                    {ROLE_LABEL[u.role] ?? u.role}
                  </td>

                  {/* Ngày tạo */}
                  <td className="py-3 px-4 text-gray-400 text-xs">
                    {formatDate(u.createdAt)}
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      u.active !== false
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}>
                      {u.active !== false ? 'Hoạt Động' : 'Bị Khóa'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(u)}
                        className={`btn btn-sm ${u.active !== false ? 'btn-danger' : 'btn-success'}`}
                      >
                        {u.active !== false ? '🔒 Khóa' : '🔓 Mở'}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id, u.name || u.email)}
                        className="btn btn-sm btn-outline text-red-400 hover:border-red-400"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
