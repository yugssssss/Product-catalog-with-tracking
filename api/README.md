# Product Catalog API

Full-stack REST API with real-time order updates.  
**Stack:** Node.js · Express · MongoDB · Redis · Socket.io · JWT

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env

# 3. Make sure MongoDB and Redis are running, then:
npm run dev
```

Server starts at `http://localhost:3000`

---

## Project Structure

```
src/
├── config/
│   ├── database.js      # Mongoose connection
│   ├── redis.js         # ioredis client (graceful fallback if unavailable)
│   └── socket.js        # Socket.io setup + JWT auth middleware
├── controllers/
│   ├── authController.js
│   ├── orderController.js
│   └── productController.js
├── middleware/
│   ├── auth.js          # authenticate + authorize
│   ├── errorHandler.js  # global error handler + 404
│   └── validate.js      # express-validator result handler
├── models/
│   ├── Order.js
│   ├── Product.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   └── productRoutes.js
├── utils/
│   ├── cache.js         # Redis get/set/delPattern helpers
│   ├── jwt.js           # token generation & verification
│   └── response.js      # ok() / fail() response helpers
└── server.js            # Entry point
test-client/
└── index.html           # Browser-based Socket.io demo
```

---

## API Reference

### Auth — `/api/v1/auth`

| Method | Endpoint      | Auth | Body |
|--------|---------------|------|------|
| POST   | `/register`   | —    | `{ name, email, password }` |
| POST   | `/login`      | —    | `{ email, password }` |
| POST   | `/refresh`    | —    | `{ refreshToken }` |
| POST   | `/logout`     | ✅   | `{ refreshToken }` |
| GET    | `/me`         | ✅   | — |

**Login / Register response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "Alice", "email": "alice@x.com", "role": "user" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### Products — `/api/v1/products`

| Method | Endpoint   | Auth          | Notes |
|--------|------------|---------------|-------|
| GET    | `/`        | —             | Public, cached 60 s |
| GET    | `/:id`     | —             | Public |
| POST   | `/`        | Admin only    | Create product |
| PUT    | `/:id`     | Admin only    | Full update |
| DELETE | `/:id`     | Admin only    | Soft delete |

**GET / Query parameters:**

| Param      | Type   | Example              | Description |
|------------|--------|----------------------|-------------|
| `page`     | int    | `?page=2`            | Default: 1 |
| `limit`    | int    | `?limit=20`          | Max 100 |
| `search`   | string | `?search=laptop`     | Name or category |
| `category` | string | `?category=electronics` | Exact category |
| `minPrice` | float  | `?minPrice=10`       | Price ≥ value |
| `maxPrice` | float  | `?maxPrice=500`      | Price ≤ value |
| `sort`     | string | `?sort=-price`       | price / -price / name / createdAt / stock |

**Product body:**
```json
{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling over-ear headphones",
  "price": 149.99,
  "category": "electronics",
  "stock": 50,
  "images": ["https://example.com/img.jpg"]
}
```

---

### Orders — `/api/v1/orders`

All routes require a valid `Authorization: Bearer <token>` header.

| Method | Endpoint        | Role      | Notes |
|--------|-----------------|-----------|-------|
| POST   | `/`             | User      | Place order |
| GET    | `/`             | User/Admin | Users see own; admins see all |
| GET    | `/:id`          | User/Admin | Users can only get own orders |
| PATCH  | `/:id/status`   | Admin only | Triggers real-time socket event |

**Place order body:**
```json
{
  "items": [
    { "productId": "64abc...", "quantity": 2 },
    { "productId": "64def...", "quantity": 1 }
  ]
}
```

**Update status body:**
```json
{ "status": "confirmed" }
```

Valid statuses: `pending` → `confirmed` → `shipped` → `delivered`

---

## Redis Caching

- `GET /api/v1/products` responses are cached with a **60-second TTL**.
- Cache key encodes all query params (page, limit, search, category, price range, sort).
- Cache is **invalidated automatically** (pattern `products:*`) on any create / update / delete.
- If Redis is unavailable the API continues to function without caching.

---

## Real-Time Updates (Socket.io)

### Connect
```js
const socket = io('http://localhost:3000', {
  auth: { token: '<accessToken>' }
});
```
Each authenticated user is automatically joined to their private room `user:<userId>`.

### Events

| Event                  | Direction      | Payload |
|------------------------|----------------|---------|
| `connected`            | Server → Client | Welcome message + room |
| `order:statusUpdated`  | Server → Client | `{ orderId, previousStatus, newStatus, updatedAt, message }` |

### How it works
1. Admin calls `PATCH /api/v1/orders/:id/status`
2. Server updates order in MongoDB
3. Server emits `order:statusUpdated` to room `user:<orderOwnerId>`
4. Only the order owner receives the event — other users are unaffected

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "status": "fail",
  "message": "Human-readable description",
  "errors": [
    { "field": "price", "message": "Price must be ≥ 0" }
  ]
}
```

| Status | Meaning |
|--------|---------|
| 400    | Bad request / invalid input |
| 401    | Unauthenticated |
| 403    | Forbidden (wrong role) |
| 404    | Resource not found |
| 409    | Conflict (duplicate / insufficient stock) |
| 422    | Validation failed |
| 500    | Internal server error |

---

## Test Client

Open `test-client/index.html` directly in a browser (no build step needed).

**Workflow:**
1. Enter your API URL (default: `http://localhost:3000/api/v1`)
2. Register or log in → access token is saved automatically
3. Click **Connect Socket** → see the green connected indicator
4. Paste a Product ID and place an order
5. Open a second browser tab, log in as admin, paste the order ID and change its status
6. Watch the **🔔 order:statusUpdated** event appear in real time in the first tab
