// ============================================================
// usersApi.js
// API liên quan đến quản lý thông tin người dùng
// ============================================================

import axiosClient from './axiosClient'

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
}
