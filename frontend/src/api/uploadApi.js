// ============================================================
// uploadApi.js
// Upload ảnh lên server (dùng cho xe, avatar...)
// ============================================================

import axiosClient from './axiosClient'

/**
 * Upload 1 hoặc nhiều ảnh.
 * @param {File[]} files - Mảng file ảnh
 * @param {string} folder - Tên folder lưu (vd: 'cars', 'avatars')
 * @returns {{ urls: string[] }}
 */
export function uploadImages(files, folder = 'cars') {
  const fd = new FormData()
  files.forEach((f) => fd.append('images', f))
  fd.append('folder', folder)

  return axiosClient.post('/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
