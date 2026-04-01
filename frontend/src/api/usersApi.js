// ============================================================
// usersApi.js
<<<<<<< HEAD
// API liên quan đến quản lý thông tin người dùng
=======
// API quản lý người dùng (profile, admin CRUD users)
>>>>>>> e12d25ea12f0291f526872e4ee85e47fdfff22a2
// ============================================================

import axiosClient from './axiosClient'

<<<<<<< HEAD
/**
 * Lấy thông tin hồ sơ của người dùng hiện tại
 * @returns {Promise} User profile data
 */
export function getMyProfile() {
  return axiosClient.get('/auth/me')
}

/**
 * Cập nhật thông tin hồ sơ của người dùng hiện tại
 * @param {Object|FormData} data - Có thể là object hoặc FormData (nếu upload ảnh)
 * @returns {Promise} Updated user profile data
 */
export function updateMyProfile(data) {
  return axiosClient.put('/auth/me', data)
}

/**
 * Đổi mật khẩu
 * @param {{ currentPassword: string, newPassword: string }} data
 * @returns {Promise}
 */
export function changePassword(data) {
  return axiosClient.patch('/auth/change-password', data)
=======
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
>>>>>>> e12d25ea12f0291f526872e4ee85e47fdfff22a2
}
