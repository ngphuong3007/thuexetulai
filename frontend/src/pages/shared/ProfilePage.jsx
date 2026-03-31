// ============================================================
// ProfilePage.jsx
// Trang hồ sơ dùng chung cho cả 3 role.
// Hiển thị thông tin từ JWT và cho phép đăng xuất.
// ============================================================

import { useNavigate }  from 'react-router-dom'
import DashboardLayout  from '../../components/layout/DashboardLayout'
import { useAuth }      from '../../context/AuthContext'
import { getInitials }  from '../../utils/formatters'
import { ROLES }        from '../../utils/constants'

// Nav items tương ứng với từng role
import { OWNER_NAV }  from '../owner/OwnerDashboard'
import { ADMIN_NAV }  from '../admin/AdminDashboard'

const RENTER_NAV = [
  {
    label: 'Tổng Quan',
    items: [
      { to: '/dashboard',          icon: '📊', label: 'Tổng Quan'     },
      { to: '/dashboard/bookings', icon: '🗓️', label: 'Chuyến Của Tôi' },
    ],
  },
  {
    label: 'Tài Khoản',
    items: [
      { to: '/dashboard/profile', icon: '👤', label: 'Hồ Sơ'      },
      { to: '/search',            icon: '🔍', label: 'Tìm Xe Mới' },
    ],
  },
]

export default function ProfilePage() {
  const { user, logout, isAdmin, isOwner } = useAuth()
  const navigate = useNavigate()

  // Chọn nav đúng theo role
  const navItems = isAdmin ? ADMIN_NAV : isOwner ? OWNER_NAV : RENTER_NAV

  const roleLabel = {
    [ROLES.ADMIN]: 'Quản Trị Viên',
    [ROLES.OWNER]: 'Chủ Xe',
    [ROLES.USER]:  'Người Thuê Xe',
  }[user?.role] ?? user?.role

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <DashboardLayout navItems={navItems}>

      <div className="max-w-lg">
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-wide">HỒ SƠ CÁ NHÂN</h1>
          <p className="text-gray-400 text-sm mt-1">
            Thông tin tài khoản của bạn
          </p>
        </div>

        {/* Avatar + tên */}
        <div className="card p-6 flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center font-bold text-2xl shrink-0">
            {getInitials(user?.name || user?.email || 'U')}
          </div>
          <div>
            <p className="font-bold text-white text-lg">
              {user?.name ?? 'Chưa cập nhật tên'}
            </p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="text-xs font-bold text-primary uppercase tracking-wide mt-1 inline-block">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="card p-6 space-y-4 mb-6">
          <h2 className="font-bold text-white">Thông Tin Tài Khoản</h2>

          {[
            { label: 'ID Tài Khoản', value: user?.id  ?? '—' },
            { label: 'Email',        value: user?.email ?? '—' },
            { label: 'Role',         value: roleLabel },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
              <span className="text-sm text-gray-400">{label}</span>
              <span className="text-sm font-medium text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* Ghi chú */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
          <p className="text-blue-400 text-sm">
            💡 Tính năng chỉnh sửa hồ sơ (tên, số điện thoại, ảnh đại diện) sẽ
            được bổ sung khi backend cung cấp API cập nhật thông tin người dùng.
          </p>
        </div>

        {/* Đăng xuất */}
        <button
          onClick={handleLogout}
          className="btn-danger btn w-full py-3"
        >
          🚪 Đăng Xuất Khỏi Tài Khoản
        </button>
      </div>
    </DashboardLayout>
  )
}
