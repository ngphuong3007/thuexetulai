// ============================================================
// ProfilePage.jsx - Full profile with avatar upload
// ============================================================
import { useState, useEffect, useRef } from 'react'
import { useNavigate }   from 'react-router-dom'
import toast             from 'react-hot-toast'
import DashboardLayout   from '../../components/layout/DashboardLayout'
import LoadingSpinner    from '../../components/common/LoadingSpinner'
import { useAuth }       from '../../context/AuthContext'
import { getMyProfile, updateMyProfile } from '../../api/usersApi'
import { getInitials }   from '../../utils/formatters'
import { ROLES }         from '../../utils/constants'
import { OWNER_NAV }  from '../owner/OwnerDashboard'
import { ADMIN_NAV }  from '../admin/AdminDashboard'

const RENTER_NAV = [
  { label: 'Tổng Quan', items: [
    { to: '/dashboard',          icon: '📊', label: 'Tổng Quan'      },
    { to: '/dashboard/bookings', icon: '🗓️', label: 'Chuyến Của Tôi' },
  ]},
  { label: 'Tài Khoản', items: [
    { to: '/dashboard/profile', icon: '👤', label: 'Hồ Sơ'      },
    { to: '/search',            icon: '🔍', label: 'Tìm Xe Mới' },
  ]},
]

export default function ProfilePage() {
  const { user, logout, isAdmin, isOwner } = useAuth()
  const navigate  = useNavigate()
  const fileRef   = useRef()
  const navItems  = isAdmin ? ADMIN_NAV : isOwner ? OWNER_NAV : RENTER_NAV

  const [profile, setProfile]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [saving,  setSaving]            = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile,    setAvatarFile]    = useState(null)
  const [form, setForm] = useState({ name:'', phone:'', address:'', password:'' })

  useEffect(() => {
    getMyProfile()
      .then(({ data }) => {
        setProfile(data)
        setForm({ name: data.name??'', phone: data.phone??'', address: data.address??'', password:'' })
      })
      .catch(() => {
        setProfile({ name: user?.name, email: user?.email, role: user?.role })
        setForm({ name: user?.name??'', phone:'', address:'', password:'' })
      })
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })) }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      if (form.name)     fd.append('name',    form.name)
      if (form.phone)    fd.append('phone',   form.phone)
      if (form.address)  fd.append('address', form.address)
      if (form.password) fd.append('password',form.password)
      if (avatarFile)    fd.append('avatar',  avatarFile)
      await updateMyProfile(fd)
      toast.success('Cập nhật hồ sơ thành công! ✅')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Cập nhật thất bại')
    } finally { setSaving(false) }
  }

  const roleLabel = { [ROLES.ADMIN]:'Quản Trị Viên', [ROLES.OWNER]:'Chủ Xe', [ROLES.USER]:'Người Thuê Xe' }[user?.role] ?? user?.role
  const displayName = form.name || profile?.name || user?.email || 'Người dùng'
  const currentAvatar = avatarPreview || profile?.avatar || null

  if (loading) return <DashboardLayout navItems={navItems}><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-wide">HỒ SƠ CÁ NHÂN</h1>
          <p className="text-gray-400 text-sm mt-1">Cập nhật thông tin tài khoản của bạn</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar */}
          <div className="card p-6">
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-primary flex items-center justify-center">
                  {currentAvatar
                    ? <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold">{getInitials(displayName)}</span>
                  }
                </div>
                <button type="button" onClick={() => fileRef.current.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-sm hover:bg-primary-dark">
                  📷
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{displayName}</p>
                <p className="text-gray-400 text-sm">{profile?.email ?? user?.email}</p>
                <span className="inline-block mt-1 text-xs font-bold text-primary uppercase tracking-wide">{roleLabel}</span>
              </div>
            </div>
          </div>

          {/* Thông tin */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-white mb-2">Thông Tin Cá Nhân</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Họ Và Tên</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" className="input" />
              </div>
              <div>
                <label className="label">Số Điện Thoại</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="0901234567" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Địa Chỉ</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="123 Đường ABC, Quận 1, TP.HCM" className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input value={profile?.email ?? user?.email ?? ''} disabled className="input opacity-50 cursor-not-allowed" />
              <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
            </div>
          </div>

          {/* Đổi mật khẩu */}
          <div className="card p-6">
            <h2 className="font-bold text-white mb-4">Đổi Mật Khẩu</h2>
            <label className="label">Mật Khẩu Mới</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Để trống nếu không muốn đổi" className="input" />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary btn px-8 py-3">
              {saving ? 'Đang lưu...' : '💾 Lưu Thay Đổi'}
            </button>
            <button type="button" onClick={() => { logout(); navigate('/') }} className="btn-danger btn">
              🚪 Đăng Xuất
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
