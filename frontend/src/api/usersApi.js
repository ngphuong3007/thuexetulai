// ============================================================
// usersApi.js
// API quản lý người dùng (profile, admin CRUD users)
// ============================================================

import axiosClient from './axiosClient'

/** Lấy thông tin profile của user đang đăng nhập */
export function getMyProfile() {
  return axiosClient.get('/users/me')
}

/**
 * Cập nhật profile (tên, phone, avatar)
 * @param {FormData|object} data
 */
export function updateMyProfile(data) {
  // Nếu có file ảnh thì dùng FormData
  const isFormData = data instanceof FormData
  return axiosClient.put('/users/me', data, {
    headers: isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' },
  })
}

// ── Admin only ────────────────────────────────────────────────

/** Lấy tất cả users (admin) */
export function getAllUsers() {
  return axiosClient.get('/users')
}

/** Lấy chi tiết 1 user (admin) */
export function getUserById(id) {
  return axiosClient.get(`/users/${id}`)
}

/** Cập nhật user (admin) */
export function updateUser(id, data) {
  return axiosClient.put(`/users/${id}`, data)
}

/** Xóa user (admin) */
export function deleteUser(id) {
  return axiosClient.delete(`/users/${id}`)
}

/** Khóa / mở khóa tài khoản (admin) */
export function toggleUserStatus(id, active) {
  return axiosClient.patch(`/users/${id}/status`, { active })
}
