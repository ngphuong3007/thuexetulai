# Thuê xe tự lái - Backend (Node.js + Express + MongoDB)

Quick start:

1. Cài dependencies (nếu chưa cài):

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken cors morgan
npm install -D nodemon
```

2. Tạo file `.env` dựa trên `.env.example` và chỉnh `MONGO_URI`.

Ví dụ `MONGO_URI` cho MongoDB Atlas:

```env
MONGO_URI=mongodb+srv://<db_user>:<db_password>@cluster0.lvntdot.mongodb.net/rental?retryWrites=true&w=majority&appName=Cluster0
```

Lưu ý: nếu mật khẩu có ký tự đặc biệt như `@`, `#`, `%` thì cần URL encode (ví dụ `@` -> `%40`).

3. Chạy server (dev):

```bash
npx nodemon src/index.js
```

Deploy checklist (MongoDB Atlas):
- Set env `MONGO_URI` on hosting platform (Render/Railway/VPS), do not hardcode in source.
- Set env `JWT_SECRET` with a strong secret.
- Set env `PORT` if your hosting requires a fixed/assigned port.
- Ensure Atlas Network Access allows your hosting egress IP (or temporarily `0.0.0.0/0` while testing).
- Ensure Atlas Database Access user/password are correct and password is URL-encoded when needed.

Run command for production:

```bash
npm start
```

Endpoints cơ bản:
- `POST /api/auth/register` - đăng ký
- `POST /api/auth/login` - đăng nhập
- `GET /api/cars` - danh sách xe
- `POST /api/cars` - thêm xe (yêu cầu token)
- `POST /api/bookings` - tạo booking (yêu cầu token)
