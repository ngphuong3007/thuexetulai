import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LoadingSpinner  from '../../components/common/LoadingSpinner'
import StatusBadge     from '../../components/common/StatusBadge'
import { getMyBookings } from '../../api/bookingsApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { CITIES } from '../../utils/constants'

const NAV_ITEMS = [
  {
    label: 'Tổng Quan',
    items: [
      { to: '/dashboard',          icon: '📊', label: 'Tổng Quan'      },
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

export default function RenterDashboard() {
  const navigate = useNavigate()
  const [bookings,  setBookings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [city,      setCity]      = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')

  useEffect(() => {
    getMyBookings()
      .then(({ data }) => setBookings(data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total:     bookings.length,
    active:    bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    spent:     bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0),
  }

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('location', city)
    navigate(`/search${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS}>

      {/* ── Breadcrumb + Header ── */}
      <div style={{ marginBottom: '24px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '13px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8390E'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
          >
            🏠 Trang Chủ
          </button>
          <span style={{ color: '#374151' }}>›</span>
          <span style={{ color: '#E8390E', fontWeight: '600' }}>Tổng Quan</span>
        </div>

        {/* Nút back + Tiêu đề */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: '#1E2129', border: '1px solid rgba(255,255,255,0.1)',
              color: '#9CA3AF', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8390E'; e.currentTarget.style.color = '#E8390E' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#9CA3AF' }}
            title="Quay lại"
          >
            ←
          </button>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '2rem', letterSpacing: '2px', color: '#fff', margin: 0 }}>
              TỔNG QUAN
            </h1>
            <p style={{ color: '#6B7280', fontSize: '13px', margin: 0, marginTop: '2px' }}>
              Xem tất cả hoạt động thuê xe của bạn
            </p>
          </div>
        </div>
      </div>

      {/* ── Thanh tìm kiếm nhanh ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(232,57,14,0.15) 0%, rgba(28,31,39,0.9) 100%)',
        border: '1px solid rgba(232,57,14,0.25)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        {/* Tiêu đề search box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <span style={{ fontSize: '22px' }}>🚗</span>
          <div>
            <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: 0 }}>
              Tìm Xe Thuê Ngay
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>
              Hàng trăm xe chất lượng đang chờ bạn
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                📍 Địa Điểm
              </label>
              <select value={city} onChange={e => setCity(e.target.value)}
                style={{ width: '100%', background: '#111318', border: '1px solid rgba(255,255,255,0.12)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                <option value="">Chọn thành phố</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                📅 Ngày Nhận Xe
              </label>
              <input type="date" value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setStartDate(e.target.value)}
                style={{ width: '100%', background: '#111318', border: '1px solid rgba(255,255,255,0.12)', color: '#F3F4F6', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                📅 Ngày Trả Xe
              </label>
              <input type="date" value={endDate}
                min={startDate || new Date().toISOString