// ============================================================
// BulletinBoardPage.jsx
// Bảng tin công khai: người dùng đăng bài cần thuê / cho thuê xe.
// ============================================================

import { useState, useEffect } from 'react'
import toast            from 'react-hot-toast'
import Navbar           from '../components/layout/Navbar'
import Footer           from '../components/layout/Footer'
import LoadingSpinner   from '../components/common/LoadingSpinner'
import EmptyState       from '../components/common/EmptyState'
import { getPosts, createPost } from '../api/postsApi'
import { useAuth }      from '../context/AuthContext'
import { formatDate }   from '../utils/formatters'
import { CITIES, POST_TYPE_LABEL } from '../utils/constants'

export default function BulletinBoardPage() {
  const { isAuthenticated } = useAuth()

  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState({ postType: '', location: '' })
  const [showForm, setShowForm] = useState(false)

  // Form tạo bài đăng mới
  const [form, setForm]       = useState({ postType: 'rent_request', title: '', content: '', location: '', budgetPerDay: '' })
  const [submitting, setSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null) // State lưu file ảnh đã chọn
  function loadPosts() {
    const params = {}
    if (filter.postType) params.postType = filter.postType
    if (filter.location) params.location = filter.location

    getPosts(params)
      .then(({ data }) => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadPosts() }, [filter])

  function handleFormChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.content) {
      toast.error('Vui lòng điền tiêu đề và nội dung')
      return
    }
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đăng bài')
      return
    }

    setSubmitting(true)
    try {
      await createPost({
        ...form,
        budgetPerDay: form.budgetPerDay ? Number(form.budgetPerDay) : undefined,
      })
      toast.success('Đăng bài thành công! Chờ admin duyệt.')
      setShowForm(false)
      setForm({ postType: 'rent_request', title: '', content: '', location: '', budgetPerDay: '' })
      setForm({ postType: 'rent_request', title: '', content: '', location: '', budgetPerDay: '' })
      setSelectedImage(null)
      setSelectedImage(null) // <--- Dán thêm dòng này vào đây (Dòng 66)

    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Đăng bài thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto px-5 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl tracking-wide">
              BẢNG TIN <span className="text-primary">THUÊ XE</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Đăng bài cần thuê hoặc cho thuê xe</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary btn"
          >
            {showForm ? '✕ Đóng' : '+ Đăng Bài'}
          </button>
        </div>

        {/* Form tạo bài (ẩn/hiện) */}
        {showForm && (
          <div className="card p-6 mb-8">
            <h2 className="font-bold text-white mb-5">Tạo Bài Đăng Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Loại Bài</label>
                  <select name="postType" value={form.postType} onChange={handleFormChange} className="input">
                    <option value="rent_request">Cần Thuê Xe</option>
                    <option value="car_offer">Cho Thuê Xe</option>
                  </select>
                </div>
                <div>
                  <label className="label">Địa Điểm</label>
                  <select name="location" value={form.location} onChange={handleFormChange} className="input">
                    <option value="">Chọn tỉnh/thành</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Tiêu Đề</label>
                <input name="title" value={form.title} onChange={handleFormChange} placeholder="VD: Cần thuê xe 7 chỗ từ ngày 5-8/6" className="input" />
              </div>

              <div>
                <label className="label">Nội Dung</label>
                <textarea name="content" value={form.content} onChange={handleFormChange} rows={3} placeholder="Mô tả chi tiết yêu cầu hoặc xe cho thuê..." className="input" />
              </div>

              {form.postType === 'rent_request' && (
                <div>
                  <label className="label">Ngân Sách / Ngày (VNĐ)</label>
                  <input type="number" name="budgetPerDay" value={form.budgetPerDay} onChange={handleFormChange} placeholder="900000" className="input" />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-800 mt-4">
                {/* Nút Đăng Bài chính */}
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn-primary btn"
                >
                  {submitting ? 'Đang đăng...' : '📤 Đăng Bài'}
                </button>

                {/* Nút Upload Ảnh */}
                <label className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-gray-700 text-gray-300 rounded-lg cursor-pointer hover:bg-[#333] hover:border-primary hover:text-white transition-all">
                  <span className="text-lg">📷</span>
                  <span className="text-sm">Thêm ảnh</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                  />
                </label>

                {/* Nút Hủy */}
                <button 
                  type="button" 
                  onClick={() => { setShowForm(false); setSelectedImage(null); }} 
                  className="btn-outline btn"
                >
                  Hủy
                </button>

                {/* Hiển thị trạng thái ảnh đã chọn */}
                {selectedImage && (
                  <div className="w-full text-xs text-emerald-400 mt-2 italic flex items-center gap-1">
                    <span>✅ Đã chọn: {selectedImage.name}</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        
        )}

        {/* Bộ lọc */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={filter.postType}
            onChange={(e) => setFilter((p) => ({ ...p, postType: e.target.value }))}
            className="input w-auto"
          >
            <option value="">Tất cả loại</option>
            <option value="rent_request">Cần Thuê</option>
            <option value="car_offer">Cho Thuê</option>
          </select>
          <select
            value={filter.location}
            onChange={(e) => setFilter((p) => ({ ...p, location: e.target.value }))}
            className="input w-auto"
          >
            <option value="">Tất cả địa điểm</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Danh sách bài */}
        {loading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <EmptyState icon="📋" title="Chưa có bài đăng nào" message="Hãy là người đăng đầu tiên!" />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="card p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Type badge */}
                    <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      post.postType === 'rent_request'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      {POST_TYPE_LABEL[post.postType] ?? post.postType}
                    </span>

                    <h3 className="font-semibold text-white mt-2 mb-1">{post.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{post.content}</p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {post.location && <span>📍 {post.location}</span>}
                      {post.budgetPerDay && <span>💰 ~{(post.budgetPerDay/1000).toFixed(0)}K/ngày</span>}
                      <span>🕐 {formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  {post.contactPhone && (
                    <a
                      href={`tel:${post.contactPhone}`}
                      className="btn-outline btn btn-sm shrink-0"
                    >
                      📞 Liên Hệ
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
