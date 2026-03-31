// ============================================================
// axiosClient.js
// Instance Axios dùng chung cho toàn bộ app.
// - Tự động thêm base URL
// - Tự động đính kèm JWT token vào header
// - Xử lý lỗi 401 (hết hạn token) → redirect về login
// ============================================================

import axios from 'axios'
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request Interceptor ──────────────────────────────────────
// Trước mỗi request, lấy token từ localStorage và gắn vào header.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response Interceptor ─────────────────────────────────────
// Nếu server trả về 401 (token hết hạn/sai), xóa token và về trang login.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      // Chuyển về trang login mà không reload toàn trang
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient
