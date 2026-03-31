# Thuê xe tự lái - Backend (Node.js + Express + MongoDB)

Quick start:

1. Cài dependencies (nếu chưa cài):

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken cors morgan
npm install -D nodemon
```

2. Tạo file `.env` dựa trên `.env.example` và chỉnh `MONGO_URI`.

3. Chạy server (dev):

```bash
npx nodemon src/index.js
```

Endpoints cơ bản:
- `POST /api/auth/register` - đăng ký
- `POST /api/auth/login` - đăng nhập
- `GET /api/cars` - danh sách xe
- `POST /api/cars` - thêm xe (yêu cầu token)
- `POST /api/bookings` - tạo booking (yêu cầu token)
