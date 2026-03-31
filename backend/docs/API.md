# API Endpoints - Thuê xe tự lái (Backend)

Base URL: `http://localhost:5000/api`

## Auth

- POST `/auth/register`
  - Body: `{ "name":"Nguyen A", "email":"a@example.com", "password":"secret" }`
  - Response: `{ "token": "<jwt>" }`

- POST `/auth/login`
  - Body: `{ "email":"a@example.com", "password":"secret" }`
  - Response: `{ "token": "<jwt>" }`

Notes: send header `Authorization: Bearer <token>` for protected routes.

## Cars

- GET `/cars`
  - List all cars. Public.

- GET `/cars/:id`
  - Get single car detail.

- POST `/cars` (protected)
  - Body example:
    ```json
    {
      "make":"Toyota",
      "model":"Vios",
      "year":2020,
      "plate":"30A-12345",
      "pricePerDay":500000,
      "available":true,
      "images":["url1","url2"],
      "location":"Hà Nội"
    }
    ```
  - Response: created car object.

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
