// ============================================================
// ManageCarsPage.jsx
// Admin xem và xóa tất cả xe trong hệ thống.
// ============================================================

import { useState, useEffect } from 'react'
import toast            from 'react-hot-toast'
import DashboardLayout  from '../../components/layout/DashboardLayout'
import LoadingSpinner   from '../../components/common/LoadingSpinner'
import EmptyState       from '../../components/common/EmptyState'
import { getAllCars, deleteCar } from '../../api/carsApi'
import { formatCurrency }        from '../../utils/formatters'
import { ADMIN_NAV }             from './AdminDashboard'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'

export default function ManageCarsPage() {
  const [cars, setCars]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllCars()
      .then(({ data }) => setCars(data))
      .catch(() => setCars([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id, name) {
    if (!window.confirm(`Xóa xe "${name}"?`)) return
    try {
      await deleteCar(id)
      toast.success('Đã xóa xe')
      setCars((p) => p.filter((c) => c._id !== id))
    } catch {
      toast.error('Xóa thất bại')
    }
  }

  const filtered = cars.filter((c) =>
    `${c.make} ${c.model} ${c.plate}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout navItems={ADMIN_NAV}>

      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl tracking-wide">QUẢN LÝ XE</h1>
          <p className="text-gray-400 text-sm mt-1">{cars.length} xe trong hệ thống</p>
        </div>
        <input
          type="text"
          placeholder="Tìm theo tên, biển số..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-64"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🚗" title="Không có xe nào" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/8">
              <tr>
                {['Xe', 'Biển Số', 'Giá/Ngày', 'Địa Điểm', 'Trạng Thái', 'Hành Động'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-wide text-gray-400 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((car) => (
                <tr key={car._id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={car.images?.[0] ?? PLACEHOLDER}
                        alt=""
                        className="w-12 h-8 object-cover rounded-lg shrink-0"
                        onError={(e) => { e.target.src = PLACEHOLDER }}
                      />
                      <span className="font-medium text-white">{car.make} {car.model} {car.year}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{car.plate}</td>
                  <td className="py-3 px-4 text-primary font-semibold">{formatCurrency(car.pricePerDay)}</td>
                  <td className="py-3 px-4 text-gray-400">{car.location ?? '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      car.available ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'
                    }`}>
                      {car.available ? 'Còn Trống' : 'Đang Thuê'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(car._id, `${car.make} ${car.model}`)}
                      className="btn-danger btn btn-sm"
                    >
                      🗑️ Xóa
                    </button>
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
