import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { getMyBookings } from '../../api/bookingsApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { CITIES } from '../../utils/constants'

const NAV_ITEMS = [
  {
    label: 'Tổng Quan',
    items: [
      { to: '/dashboard', icon: '📊', label: 'Tổng Quan' },
      { to: '/dashboard/bookings', icon: '🗓️', label: 'Chuyến Của Tôi' },
    ],
  },
  {
    label: 'Tài Khoản',
    items: [
      { to: '/dashboard/profile', icon: '👤', label: 'Hồ Sơ' },
      { to: '/search', icon: '🔍', label: 'Tìm Xe Mới' },
    ],
  },
]

export default function RenterDashboard() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Form tìm kiếm nhanh
  const [city, setCity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    getMyBookings()
      .then(({ data }) => setBookings(data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    spent: bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0),
  }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('location', city)
    navigate(`/search${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS}>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl tracking-wide">TỔNG QUAN</h1>
        <p className="text-gray-400 text-sm mt-1">Xem tất cả hoạt động thuê xe của bạn</p>
      </div>

      {/* ══════════════════════════════════════
          THANH TÌM KIẾM NHANH
      ══════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,57,14,0.15) 0%, rgba(28,31,39,0.8) 100%)',
        border: '1px solid rgba(232,57,14,0.25)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>🚗</span>
          <div>
            <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '16px', margin: 0 }}>
              Tìm Xe Thuê Ngay
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
              Hàng trăm xe chất lượng đang chờ bạn
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            {/* Thành phố */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                📍 Địa Điểm
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                style={{ width: '100%', background: '#1E2129', border: '1px solid rgba(255,255,255,0.12)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">Chọn thành phố</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Ngày nhận */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                📅 Ngày Nhận Xe
              </label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setStartDate(e.target.value)}
                style={{ width: '100%', background: '#1E2129', border: '1px solid rgba(255,255,255,0.12)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Ngày trả */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                📅 Ngày Trả Xe
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || new Date().toISOString().split('T')[0]}
                onChange={e => setEndDate(e.target.value)}
                style={{ width: '100%', background: '#1E2129', border: '1px solid rgba(255,255,255,0.12)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Nút tìm */}
            <button
              type="submit"
              style={{ padding: '10px 24px', background: '#E8390E', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap', height: '42px' }}
            >
              🔍 Tìm Xe
            </button>
          </div>
        </form>

        {/* Quick links */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Tìm nhanh:</span>
          {['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Đà Lạt'].map(c => (
            <button
              key={c}
              onClick={() => { setCity(c); navigate(`/search?location=${encodeURIComponent(c)}`) }}
              style={{ fontSize: '12px', color: '#E8390E', background: 'rgba(232,57,14,0.1)', border: '1px solid rgba(232,57,14,0.2)', borderRadius: '100px', padding: '3px 10px', cursor: 'pointer' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng Chuyến', value: stats.total, color: '#E8390E' },
          { label: 'Đang Thuê', value: stats.active, color: '#FBBF24' },
          { label: 'Hoàn Thành', value: stats.completed, color: '#34D399' },
          { label: 'Tổng Chi Tiêu', value: formatCurrency(stats.spent), color: '#60A5FA' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '8px' }}>
              {label}
            </p>
            <p style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '2rem', color, lineHeight: 1 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Chuyến gần đây */}
      <div className="card p-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: '700', color: '#fff', fontSize: '16px', margin: 0 }}>Chuyến Gần Đây</h2>
          <Link to="/dashboard/bookings" style={{ color: '#E8390E', fontSize: '14px', textDecoration: 'none' }}>
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Đang tải chuyến đi..." />
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6B7280' }}>
            <p style={{ fontSize: '40px', opacity: 0.2, marginBottom: '12px' }}>🚗</p>
            <p style={{ marginBottom: '16px' }}>Bạn chưa có chuyến thuê xe nào</p>
            <Link to="/search"
              style={{ display: 'inline-block', padding: '8px 20px', background: '#E8390E', color: '#fff', borderRadius: '8px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
              Tìm Xe Ngay
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Xe', 'Nhận Xe', 'Trả Xe', 'Tổng Tiền', 'Trạng Thái'].map(h => (
                    <th key={h} style={{ textAlign: 'left', paddingBottom: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', fontWeight: '700', paddingRight: '16px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px 12px 0', fontWeight: '600', color: '#fff' }}>
                      {b.car?.make} {b.car?.model}
                    </td>
                    <td style={{ padding: '12px 16px 12px 0', color: '#9CA3AF' }}>{formatDate(b.startDate)}</td>
                    <td style={{ padding: '12px 16px 12px 0', color: '#9CA3AF' }}>{formatDate(b.endDate)}</td>
                    <td style={{ padding: '12px 16px 12px 0', color: '#E8390E', fontWeight: '600' }}>{formatCurrency(b.totalPrice)}</td>
                    <td style={{ padding: '12px 0' }}><StatusBadge status={b.status} /></td>
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