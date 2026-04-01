import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getMyBookings } from '../../api/bookingsApi'
import { getInitials, formatCurrency, formatDate } from '../../utils/formatters'
import { ROLES } from '../../utils/constants'
import { OWNER_NAV } from '../owner/OwnerDashboard'
import { ADMIN_NAV } from '../admin/AdminDashboard'

const RENTER_NAV = [
  { label: 'Tổng Quan', items: [
    { to: '/dashboard',          icon: '📊', label: 'Tổng Quan'      },
    { to: '/dashboard/bookings', icon: '🗓️', label: 'Chuyến Của Tôi' },
  ]},
  { label: 'Tài Khoản', items: [
    { to: '/dashboard/profile', icon: '👤', label: 'Hồ Sơ' },
    { to: '/search',            icon: '🔍', label: 'Tìm Xe Mới' },
  ]},
]

const TABS = [
  { key: 'info',     icon: '👤', label: 'Thông Tin'  },
  { key: 'security', icon: '🔒', label: 'Bảo Mật'   },
  { key: 'activity', icon: '📋', label: 'Hoạt Động' },
]

const PLACEHOLDER_CAR = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'

export default function ProfilePage() {
  const { user, logout, isAdmin, isOwner } = useAuth()
  const navigate = useNavigate()
  const fileRef  = useRef()

  const navItems = isAdmin ? ADMIN_NAV : isOwner ? OWNER_NAV : RENTER_NAV

  const [activeTab, setActiveTab]         = useState('info')
  const [bookings,  setBookings]          = useState([])
  const [bookingLoading, setBookingLoading] = useState(false)
  const [saving,    setSaving]            = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const [infoForm, setInfoForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: '',
    dob:     '',
    gender:  '',
  })
  const [secForm, setSecForm] = useState({
    newPassword: '', confirmPassword: '',
  })

  useEffect(() => {
    if (activeTab === 'activity' && bookings.length === 0) {
      setBookingLoading(true)
      getMyBookings()
        .then(({ data }) => setBookings(data || []))
        .catch(() => setBookings([]))
        .finally(() => setBookingLoading(false))
    }
  }, [activeTab])

  function handleInfoChange(e) {
    setInfoForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }
  function handleSecChange(e) {
    setSecForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }
  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSaveInfo(e) {
    e.preventDefault()
    if (!infoForm.name.trim()) { toast.error('Vui lòng nhập họ tên'); return }
    setSaving(true)
    try {
      const stored = JSON.parse(localStorage.getItem('d2car_user') || '{}')
      stored.name  = infoForm.name
      stored.phone = infoForm.phone
      localStorage.setItem('d2car_user', JSON.stringify(stored))
      toast.success('Cập nhật thông tin thành công! ✅')
    } catch {
      toast.error('Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveSecurity(e) {
    e.preventDefault()
    if (!secForm.newPassword) { toast.error('Vui lòng nhập mật khẩu mới'); return }
    if (secForm.newPassword.length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); return }
    if (secForm.newPassword !== secForm.confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return }
    toast.success('Đổi mật khẩu thành công! 🔒')
    setSecForm({ newPassword: '', confirmPassword: '' })
  }

  const roleLabel = {
    [ROLES.ADMIN]: 'Quản Trị Viên',
    [ROLES.OWNER]: 'Chủ Xe',
    [ROLES.USER]:  'Người Thuê Xe',
  }[user?.role] ?? user?.role ?? ''

  const roleColor = {
    [ROLES.ADMIN]: '#FBBF24',
    [ROLES.OWNER]: '#60A5FA',
    [ROLES.USER]:  '#E8390E',
  }[user?.role] ?? '#E8390E'

  const displayName   = infoForm.name || user?.email || 'Người dùng'
  const currentAvatar = avatarPreview || null

  const stats = {
    total:     bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    active:    bookings.filter(b => b.status === 'active').length,
    spent:     bookings.reduce((s, b) => s + (b.totalPrice ?? 0), 0),
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-3xl">

        {/* Banner */}
        <div className="card overflow-hidden mb-6">
          <div style={{ height:'96px', background:'linear-gradient(to right, #E8390E, #1C1F27)' }} />
          <div style={{ padding:'0 24px 20px', position:'relative' }}>
            <div style={{ position:'relative', display:'inline-block', marginTop:'-40px', marginBottom:'12px' }}>
              <div style={{ width:'80px', height:'80px', borderRadius:'50%', border:'4px solid #1E2129', overflow:'hidden', background:'#E8390E', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {currentAvatar
                  ? <img src={currentAvatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontSize:'28px', fontWeight:'700', color:'#fff' }}>{getInitials(displayName)}</span>
                }
              </div>
              <button onClick={() => fileRef.current.click()}
                style={{ position:'absolute', bottom:0, right:0, width:'24px', height:'24px', borderRadius:'50%', background:'#E8390E', border:'2px solid #1E2129', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'11px' }}>
                ✏️
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display:'none' }} />
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
              <div>
                <p style={{ fontSize:'20px', fontWeight:'700', color:'#fff' }}>{displayName}</p>
                <p style={{ fontSize:'14px', color:'#9CA3AF' }}>{user?.email}</p>
                <span style={{ fontSize:'11px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.05em', color: roleColor }}>{roleLabel}</span>
              </div>
              <button onClick={() => { logout(); navigate('/') }}
                style={{ padding:'8px 16px', borderRadius:'8px', border:'1px solid rgba(248,113,113,0.3)', background:'transparent', color:'#F87171', cursor:'pointer', fontSize:'13px', fontWeight:'600' }}>
                🚪 Đăng Xuất
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'4px', padding:'4px', background:'#252931', borderRadius:'12px', marginBottom:'24px' }}>
          {TABS.map(({ key, icon, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'10px', fontSize:'14px', fontWeight:'600', borderRadius:'8px', border:'none', cursor:'pointer', transition:'all 0.2s', background: activeTab === key ? '#E8390E' : 'transparent', color: activeTab === key ? '#fff' : '#9CA3AF' }}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>

        {/* TAB: THÔNG TIN */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="space-y-5">
            {avatarPreview && (
              <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', background:'rgba(232,57,14,0.1)', border:'1px solid rgba(232,57,14,0.3)', borderRadius:'12px' }}>
                <img src={avatarPreview} alt="" style={{ width:'48px', height:'48px', borderRadius:'50%', objectFit:'cover' }} />
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'14px', fontWeight:'600', color:'#fff', margin:0 }}>Ảnh đại diện mới</p>
                  <p style={{ fontSize:'12px', color:'#9CA3AF', margin:0 }}>Nhấn "Lưu thay đổi" để cập nhật</p>
                </div>
                <button type="button" onClick={() => setAvatarPreview(null)} style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', fontSize:'18px' }}>✕</button>
              </div>
            )}

            <div className="card p-6 space-y-4">
              <h3 style={{ fontWeight:'700', color:'#fff', marginBottom:'8px' }}>Thông Tin Cá Nhân</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <div>
                  <label className="label">Họ Và Tên *</label>
                  <input name="name" value={infoForm.name} onChange={handleInfoChange} placeholder="Nguyễn Văn A" className="input" required />
                </div>
                <div>
                  <label className="label">Số Điện Thoại</label>
                  <input name="phone" value={infoForm.phone} onChange={handleInfoChange} placeholder="0901234567" className="input" />
                </div>
                <div>
                  <label className="label">Ngày Sinh</label>
                  <input name="dob" value={infoForm.dob} onChange={handleInfoChange} type="date" className="input" />
                </div>
                <div>
                  <label className="label">Giới Tính</label>
                  <select name="gender" value={infoForm.gender} onChange={handleInfoChange} className="input">
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Địa Chỉ</label>
                <input name="address" value={infoForm.address} onChange={handleInfoChange} placeholder="123 Đường ABC, Quận 1, TP.HCM" className="input" />
              </div>
              <div>
                <label className="label">Email</label>
                <input value={user?.email ?? ''} disabled className="input" style={{ opacity:0.5, cursor:'not-allowed' }} />
                <p style={{ fontSize:'11px', color:'#6B7280', marginTop:'4px' }}>Email không thể thay đổi</p>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary btn" style={{ padding:'12px 32px' }}>
              {saving ? '⏳ Đang lưu...' : '💾 Lưu Thay Đổi'}
            </button>
          </form>
        )}

        {/* TAB: BẢO MẬT */}
        {activeTab === 'security' && (
          <div className="space-y-5">
            <form onSubmit={handleSaveSecurity} className="card p-6 space-y-4">
              <h3 style={{ fontWeight:'700', color:'#fff' }}>Đổi Mật Khẩu</h3>
              <div>
                <label className="label">Mật Khẩu Mới</label>
                <input type="password" name="newPassword" value={secForm.newPassword} onChange={handleSecChange} placeholder="Tối thiểu 6 ký tự" className="input" />
              </div>
              <div>
                <label className="label">Xác Nhận Mật Khẩu</label>
                <input type="password" name="confirmPassword" value={secForm.confirmPassword} onChange={handleSecChange} placeholder="Nhập lại mật khẩu mới" className="input" />
                {secForm.confirmPassword && secForm.newPassword !== secForm.confirmPassword && (
                  <p style={{ color:'#F87171', fontSize:'12px', marginTop:'4px' }}>⚠️ Mật khẩu không khớp</p>
                )}
                {secForm.confirmPassword && secForm.newPassword === secForm.confirmPassword && secForm.newPassword && (
                  <p style={{ color:'#34D399', fontSize:'12px', marginTop:'4px' }}>✅ Mật khẩu khớp</p>
                )}
              </div>
              <button type="submit" disabled={saving} className="btn-primary btn">🔒 Đổi Mật Khẩu</button>
            </form>

            <div className="card p-6">
              <h3 style={{ fontWeight:'700', color:'#fff', marginBottom:'16px' }}>Thông Tin Tài Khoản</h3>
              {[
                { label: 'Trạng thái',     value: '✅ Đang hoạt động', color: '#34D399' },
                { label: 'Loại tài khoản', value: roleLabel,            color: roleColor },
                { label: 'Email',          value: user?.email ?? '—',   color: '#D1D5DB' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize:'14px', color:'#9CA3AF' }}>{label}</span>
                  <span style={{ fontSize:'14px', fontWeight:'500', color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: HOẠT ĐỘNG */}
        {activeTab === 'activity' && (
          <div className="space-y-5">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px' }}>
              {[
                { label:'Tổng Đơn',   value: stats.total,                 color:'#E8390E' },
                { label:'Hoàn Thành', value: stats.completed,             color:'#34D399' },
                { label:'Đang Thuê',  value: stats.active,                color:'#FBBF24' },
                { label:'Tổng Chi',   value: formatCurrency(stats.spent), color:'#60A5FA' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-4" style={{ textAlign:'center' }}>
                  <p style={{ fontSize:'22px', fontWeight:'700', color }}>{value}</p>
                  <p style={{ fontSize:'12px', color:'#6B7280', marginTop:'4px' }}>{label}</p>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <h3 style={{ fontWeight:'700', color:'#fff' }}>Lịch Sử Đặt Xe</h3>
                <Link to="/dashboard/bookings" style={{ color:'#E8390E', fontSize:'13px' }}>Xem tất cả →</Link>
              </div>

              {bookingLoading ? (
                <p style={{ textAlign:'center', padding:'40px', color:'#6B7280' }}>Đang tải...</p>
              ) : bookings.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px' }}>
                  <p style={{ fontSize:'36px', opacity:0.2 }}>🚗</p>
                  <p style={{ color:'#6B7280', fontSize:'14px', marginTop:'8px' }}>Chưa có chuyến thuê xe nào</p>
                  <Link to="/search" className="btn-primary btn btn-sm" style={{ marginTop:'12px', display:'inline-flex' }}>Tìm Xe Ngay</Link>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {bookings.slice(0, 5).map(b => (
                    <div key={b._id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px', background:'#252931', borderRadius:'10px' }}>
                      <img
                        src={b.car?.images?.[0] ?? PLACEHOLDER_CAR}
                        alt=""
                        style={{ width:'60px', height:'40px', objectFit:'cover', borderRadius:'8px', flexShrink:0 }}
                        onError={e => { e.target.src = PLACEHOLDER_CAR }}
                      />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:'600', color:'#fff', fontSize:'14px', margin:0 }}>{b.car?.make} {b.car?.model}</p>
                        <p style={{ color:'#9CA3AF', fontSize:'12px', margin:0 }}>{formatDate(b.startDate)} → {formatDate(b.endDate)}</p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ color:'#E8390E', fontWeight:'700', fontSize:'14px', margin:0 }}>{formatCurrency(b.totalPrice)}</p>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}