# API Endpoints - Thuê xe tự lái (Backend)

Base URL: `http://localhost:5000/api`

## Auth

- POST `/auth/register`
  - Body: `{ "name":"Nguyen A", "email":"a@example.com", "password":"secret", "role":"user|owner" }`
  - Response: `{ "token": "<jwt>" }`

- POST `/auth/login`
  - Body: `{ "email":"a@example.com", "password":"secret" }`
  - Response: `{ "token": "<jwt>" }`

Notes: send header `Authorization: Bearer <token>` for protected routes.

## Cars

- GET `/cars`
  - List all cars. Public (dùng cho Trang danh sách xe).

- GET `/cars/me/my-cars` (protected)
  - Role: owner, admin
  - Dữ liệu cho Trang quản lý xe của owner (My Cars).

- GET `/cars/:id`
  - Get single car detail.

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
      "title":"Can thue xe 7 cho",
      "content":"Can xe tu 5 den 8, gia hop ly",
      "location":"Da Nang",
      "budgetPerDay":900000
    }
    ```
  - Hoặc bài cho thuê xe:
    ```json
    {
      "postType":"car_offer",
      "title":"Cho thue Honda City",
      "content":"Xe dep, bao duong day du",
      "location":"Ha Noi",
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
  - Body optional: `{ "reviewNote": "Noi dung hop le" }`

- PATCH `/posts/admin/:id/reject` (protected)
  - Role: admin
  - Body optional: `{ "reviewNote": "Thieu thong tin" }`

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

## Errors

- 400: Bad request / validation error.
- 401: Unauthorized (missing/invalid token).
- 404: Resource not found.

## Next steps (recommended)
- Thêm validation cho body (ví dụ `express-validator`).
- Thêm middleware role-based (admin) để hạn chế tạo/xóa xe.
- Thêm pagination và filter cho danh sách `GET /cars`.
- Thêm upload ảnh (multer + storage) và thanh toán (Stripe/VNPay) khi cần.
