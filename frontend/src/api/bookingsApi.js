// ============================================================
// bookingsApi.js
// Tất cả API liên quan đến đặt xe.
// ============================================================

import axiosClient from './axiosClient'

/**
 * Tạo đơn đặt xe mới (protected).
 * @param {{ carId, startDate, endDate }} data
 * @returns booking object (có totalPrice)
 */
export function createBooking(data) {
  return axiosClient.post('/bookings', data)
}

/**
 * Lấy danh sách đơn đặt xe của user đang đăng nhập (protected).
 * Trả về danh sách có populate thông tin xe.
 */
export function getMyBookings() {
  return axiosClient.get('/bookings')
}
