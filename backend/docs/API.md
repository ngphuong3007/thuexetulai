# API Endpoints - Thuê xe tự lái (Backend)

Base URL: `http://localhost:5000/api`

## Auth

- POST `/auth/register`
  - Body: `{ "name":"Nguyen A", "email":"a@example.com", "password":"secret", "role":"user|owner" }`
  - Response: `{ "token": "<jwt>" }`

- POST `/auth/login`
  - Body: `{ "email":"a@example.com", "password":"secret" }`
  - Response: `{ "token": "<jwt>" }`

- GET `/auth/me` (protected)
  - Lấy thông tin hồ sơ user hiện tại.

- PUT `/auth/me` (protected)
  - Cập nhật hồ sơ user hiện tại.
  - Hỗ trợ `JSON` hoặc `form-data` (để upload avatar).
  - Fields: `name`, `phone`, `address`, `avatar(file)`

- PATCH `/auth/change-password` (protected)
  - Body example:
    ```json
    {
      "currentPassword": "old_password",
      "newPassword": "new_password_123"
    }
    ```

Notes: send header `Authorization: Bearer <token>` for protected routes.

## Cars

- GET `/cars`
  - List all cars. Public (dùng cho Trang danh sách xe).

- GET `/cars/me/my-cars` (protected)
  - Role: owner, admin
  - Dữ liệu cho Trang quản lý xe của owner (My Cars).

- GET `/cars/:id`
  - Get single car detail.
  - Bao gồm `avgRating`, `reviewCount`, `latestReviews`.

- POST `/cars` (protected)
  - Role: admin, owner
  - Hỗ trợ `form-data` để upload ảnh với key `images` (nhiều file).
  - Fields form-data example: `make, model, year, plate, pricePerDay, available, location, images(file)`
  - Response: created car object.

- PUT `/cars/:id/with-images` (protected)
  - Role: admin, owner (owner chỉ sửa xe của chính mình)
  - Hỗ trợ `form-data` cập nhật thông tin và thay ảnh xe.

- PUT `/cars/:id` (protected)
  - Role: admin, owner (owner chỉ sửa xe của chính mình)
  - JSON update thông tin xe (không upload file).

- DELETE `/cars/:id` (protected)
  - Role: admin, owner (owner chỉ xóa xe của chính mình)
  - Xóa xe.

## Bulletin Board (Posts)

- GET `/posts`
  - Public feed cho Trang bảng tin thuê xe.
  - Chỉ trả bài đã duyệt: `status=approved` và `active=true`.
  - Hỗ trợ query: `postType`, `location`

- POST `/posts` (protected)
  - Role: user, owner, admin
  - Khi tạo mới: `status=pending` (phải qua admin duyệt mới lên feed công khai)
  - Body example:
    ```json
    {
      "postType":"rent_request",
      "title":"Cần thuê xe 5 chỗ",
      "content":"Cần xe từ 5 - 7 chỗ",
      "location":"Đà Nẵng",
      "budgetPerDay":900000
    }
    ```
  - Hoặc bài cho thuê xe:
    ```json
    {
      "postType":"car_offer",
      "title":"Cho thuê xe",
      "content":"Xe dep, bao duong day du",
      "location":"Hà Nội",
      "contactPhone":"0900000000",
      "car":"<carId>"
    }
    ```

- GET `/posts/me/list` (protected)
  - Danh sách bài đăng của user hiện tại.

- PUT `/posts/:id` (protected)
  - Chủ bài đăng hoặc admin được sửa.

- DELETE `/posts/:id` (protected)
  - Chủ bài đăng hoặc admin được xóa.

- GET `/posts/admin/pending` (protected)
  - Role: admin
  - Danh sách bài chờ duyệt.

- PATCH `/posts/admin/:id/approve` (protected)
  - Role: admin
  - Body optional: `{ "reviewNote": "Nội dụng hợp lệ" }`

- PATCH `/posts/admin/:id/reject` (protected)
  - Role: admin
  - Body optional: `{ "reviewNote": "Thiếu thông tin" }`

## Bookings

- POST `/bookings` (protected)
  - Body example:
    ```json
    {
      "carId":"<carId>",
      "startDate":"2026-04-01",
      "endDate":"2026-04-03"
    }
    ```
  - Response: created booking (includes `totalPrice`).

- GET `/bookings` (protected)
  - Returns bookings for the authenticated user (populated `car`).

## Reviews (Comments + Stars)

- GET `/reviews/car/:carId`
  - Public.
  - Lấy danh sách bình luận + đánh giá sao của xe.

- POST `/reviews/car/:carId` (protected)
  - Mỗi user chỉ được review 1 lần cho 1 xe.
  - Body example:
    ```json
    {
      "rating": 5,
      "comment": "Xe rất tốt"
    }
    ```

- PUT `/reviews/:id` (protected)
  - Chủ review hoặc admin được sửa.

- DELETE `/reviews/:id` (protected)
  - Chủ review hoặc admin được xóa.

## Errors

- 400: Bad request / validation error.
- 401: Unauthorized (missing/invalid token).
- 404: Resource not found.

## Next steps (recommended)
- Thêm validation cho body (ví dụ `express-validator`).
- Thêm middleware role-based (admin) để hạn chế tạo/xóa xe.
- Thêm pagination và filter cho danh sách `GET /cars`.
- Thêm upload ảnh (multer + storage) và thanh toán (Stripe/VNPay) khi cần.
