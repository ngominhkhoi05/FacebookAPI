# Facebook API Backend

Backend proxy trung gian tích hợp Facebook Graph API, xây dựng bằng Node.js + Express.

## Muc luc

- [Cai dat](#cai-dat)
- [Cau hinh Facebook](#cau-hinh-facebook)
- [Chay ung dung](#chay-ung-dung)
- [API Endpoints](#api-endpoints)
- [Xac thuc](#xac-thuc)
- [Cau truc project](#cau-truc-project)

---

## Cau hinh Facebook

### Buoc 1: Tao Facebook Page

1. Di den [facebook.com/pages/create](https://www.facebook.com/pages/create)
2. Chon loai Page phu hop (Business, Community, etc.)
3. Nhap thong tin Page va hoan tat

### Buoc 2: Tao Facebook App

1. Di den [developers.facebook.com](https://developers.facebook.com)
2. Dang nhap -> My Apps -> Create App
3. Chon App Type: **Business**
4. Nhap App Name va hoan tat
5. Trong App Dashboard, them product **Facebook Login** va **Webhooks**

### Buoc 3: Lay Page Access Token

1. Di den [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Chon App da tao o buoc 2
3. Quyen: `pages_manage_posts`, `pages_read_user_access`, `pages_manage_comments`
4. Nhan **Generate Access Token**
5. Nhap: `GET /me/accounts`
6. Lay `access_token` cua Page tu response

### Buoc 4: Cau hinh .env

Copy `.env.example` thanh `.env`:

```bash
cp .env.example .env
```

Dien day du cac gia tri:

```
FB_APP_ID=your_facebook_app_id
FB_APP_SECRET=your_facebook_app_secret
FB_PAGE_ID=your_facebook_page_id
FB_ACCESS_TOKEN=your_page_access_token

JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development

ADMINS=[{"email":"admin@example.com","password":"$2a$10$..."}]
```

De tao bcrypt hash cho password:

```bash
node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
```

---

## Cai dat

```bash
npm install
```

## Chay ung dung

**Development (nodemon):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Server chay tai `http://localhost:3000`.

---

## API Endpoints

### Xac thuc

| Method | Endpoint         | Mo ta            |
|--------|------------------|------------------|
| POST   | `/api/auth/login` | Dang nhap admin  |

**Request body:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "email": "admin@example.com", "role": "admin" }
  }
}
```

---

### Bai viet (Posts)

**GET /api/posts**

Lay danh sach bai viet cua Page.

Headers: `Authorization: Bearer <token>`

Query params: `?limit=10&after=<cursor>`

**POST /api/post**

Tao bai viet moi. **Chi admin.**

Headers: `Authorization: Bearer <token>`

Body:

```json
{
  "message": "Noi dung bai viet",
  "link": "https://example.com",
  "published": true
}
```

---

### Binh luan (Comments)

**GET /api/comments?post_id=xxx**

Headers: `Authorization: Bearer <token>`

Query params: `?post_id=xxx&limit=20&after=<cursor>`

**POST /api/comments/:commentId/reply**

Tra loi binh luan. **Chi admin.**

Body: `{ "message": "Noi dung tra loi" }`

**DELETE /api/comments/:commentId**

An binh luan. **Chi admin.**

---

## Ma loi

| Ma loi           | HTTP | Mo ta                              |
|-------------------|------|------------------------------------|
| TOKEN_EXPIRED     | 401  | Facebook token het han             |
| TOKEN_INVALID     | 401  | Facebook token khong hop le         |
| VALIDATION_ERROR  | 400  | Du lieu dau vao khong hop le       |
| UNAUTHORIZED      | 401  | Chua xac thuc / Token khong hop le |
| FORBIDDEN         | 403  | Khong co quyen thuc hien hanh dong |
| NOT_FOUND         | 404  | Khong tim thay tai nguyen           |
| FB_RATE_LIMIT     | 429  | Facebook API rate limit            |
| FB_SERVICE_UNAVAILABLE | 503 | Facebook API tam ngung       |
| INTERNAL_ERROR    | 500  | Loi server noi bo                  |

---

## Cau truc project

```
src/
  config/
    index.js       # Cau hinh tu .env
    logger.js      # Winston logger
  controllers/
    auth.controller.js
    facebook.controller.js
  middleware/
    auth.middleware.js     # Xac thuc JWT
    role.middleware.js     # Kiem tra quyen admin
    error.middleware.js     # Xu ly loi tap trung
    requestLogger.js       # Log request/response
  routes/
    auth.routes.js
    facebook.routes.js
  services/
    facebook.service.js    # Goi Facebook Graph API + retry
    token.service.js       # Quan ly access token
  utils/
    apiResponse.js        # Wrapper response chuan hoa
    errorCodes.js          # Bang ma loi
    retry.js               # Retry policy exponential backoff
  app.js
  server.js
```

---

## Logs

Log duoc ghi ra:

- `logs/app.log` — Tat ca log (info, warn, error)
- `logs/error.log` — Chi error

Dinh dang log: `[timestamp] [LEVEL] [action] [duration_ms] [status] message`
