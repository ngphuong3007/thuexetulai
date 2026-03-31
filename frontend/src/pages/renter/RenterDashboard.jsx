// ============================================================
// RenterDashboard.jsx
// Trang tổng quan của người thuê xe.
// ============================================================

import { useState, useEffect } from 'react'
import { Link }            from 'react-router-dom'
import DashboardLayout     from '../../components/layout/DashboardLayout'
import LoadingSpinner      from '../../components/common/LoadingSpinner'
import StatusBadge         from '../../components/common/StatusBadge'
import { getMyBookings }   from '../../api/bookingsApi'
import { formatCurrency, formatDate } from '../../utils/formatters'

// Menu sidebar cho người thuê xe
const NAV_ITEMS = [
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
      { to: '/dashboard/profile',  icon: '👤', label: 'Hồ Sơ'         },
      { to: '/search',             icon: '🔍', label: 'Tìm Xe Mới'    },
    ],
  },
]

export default function RenterDashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getMyBookings()
      .then(({ data }) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  // Thống kê nhanh
  const stats = {
    total:     bookings.length,
    active:    bookings.filter((b) => b.status === 'active').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    spent:     bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0),
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS}>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide">TỔNG QUAN</h1>
        <p className="text-gray-400 text-sm mt-1">Xem tất cả hoạt động thuê xe của bạn</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng Chuyến',   value: stats.total,                  color: 'text-primary' },
          { label: 'Đang Thuê',      value: stats.active,                 color: 'text-yellow-400' },
          { label: 'Hoàn Thành',    value: stats.completed,              color: 'text-emerald-400' },
          { label: 'Tổng Chi Tiêu', value: formatCurrency(stats.spent),  color: 'text-primary' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">{label}</p>
            <p className={`font-display text-3xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Chuyến gần đây */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">Chuyến Gần Đây</h2>
          <Link to="/dashboard/bookings" className="text-primary text-sm hover:underline">
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Đang tải chuyến đi..." />
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3 opacity-30">🚗</p>
            <p>Bạn chưa có chuyến thuê xe nào</p>
            <Link to="/search" className="btn-primary btn btn-sm mt-4 inline-flex">
              Tìm Xe Ngay
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Xe', 'Nhận Xe', 'Trả Xe', 'Tổng Tiền', 'Trạng Thái'].map((h) => (
                    <th key={h} className="text-left pb-3 text-xs uppercase tracking-wide text-gray-400 font-semibold pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b._id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="py-3 pr-4 font-medium text-white">
                      {b.car?.make} {b.car?.model}
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{formatDate(b.startDate)}</td>
                    <td className="py-3 pr-4 text-gray-400">{formatDate(b.endDate)}</td>
                    <td className="py-3 pr-4 text-primary font-semibold">{formatCurrency(b.totalPrice)}</td>
                    <td className="py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
