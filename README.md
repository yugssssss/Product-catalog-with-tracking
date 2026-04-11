# ShopFlow — Product Catalog & Order Management API

A production-structured REST API built with **Node.js**, **Express**, **MongoDB**, **Redis**, and **Socket.io**, paired with a **React** frontend using **Zustand** for state management. Covers product catalog management, JWT authentication, order flow with stock validation, Redis caching, and real-time order status updates via WebSocket.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoint Reference](#api-endpoint-reference)
  - [Auth](#auth)
  - [Products](#products)
  - [Orders](#orders)
- [WebSocket Events](#websocket-events)
- [Architectural Decisions](#architectural-decisions)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js + Express | HTTP server, routing, middleware |
| Database | MongoDB + Mongoose | Primary data store |
| Cache | Redis (ioredis) | Product listing cache |
| Auth | JWT (access + refresh) | Stateless authentication |
| Real-time | Socket.io | Live order status push to users |
| Validation | express-validator | Request body and query validation |
| Frontend | React 18 + Vite | UI |
| State | Zustand | Global state — auth, products, orders, notifications |

---

## Project Structure

```
api/
├── src/
│   ├── config/
│   │   ├── database.js        # Mongoose connection
│   │   ├── redis.js           # ioredis client with graceful fallback
│   │   └── socket.js          # Socket.io init + JWT auth middleware
│   ├── controllers/
│   │   ├── authController.js  # Register, login, refresh, logout, me
│   │   ├── productController.js # CRUD + Redis cache logic
│   │   └── orderController.js # Place order, fetch, status update + socket emit
│   ├── middleware/
│   │   ├── auth.js            # authenticate + authorize(role) middleware
│   │   ├── errorHandler.js    # Global error handler + 404
│   │   └── validate.js        # express-validator result handler
│   ├── models/
│   │   ├── User.js            # bcrypt hashing, comparePassword method
│   │   ├── Product.js         # Text index, price index, soft delete
│   │   └── Order.js           # Compound index, status history
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── utils/
│   │   ├── cache.js           # Redis get/set/delPattern helpers
│   │   ├── jwt.js             # generateTokenPair, verify helpers
│   │   └── response.js        # ok() / fail() consistent response helpers
│   └── server.js              # Entry point
├── test-client/
│   └── index.html             # Browser Socket.io demo (no build needed)
├── .env.example
└── package.json

frontend/
├── src/
│   ├── components/            # Navbar, UI primitives, ProtectedRoute
│   ├── hooks/
│   │   └── useSocket.jsx      # Socket.io event binding
│   ├── pages/                 # Shop, Orders, Admin pages, Auth
│   ├── store/
│   │   ├── authStore.js       # Login, register, logout, token persistence
│   │   ├── productStore.js    # Product list, filters, CRUD actions
│   │   ├── orderStore.js      # Orders + realtimeUpdateStatus()
│   │   └── notificationStore.js # Socket event history for navbar bell
│   └── utils/
│       ├── api.js             # Axios instance + auto token refresh interceptor
│       └── socket.js          # Socket.io client singleton
├── index.html
└── vite.config.js
```

---

## Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB — local install or [Atlas free tier](https://www.mongodb.com/atlas)
- Redis — local install or [Redis Cloud free tier](https://redis.io/try-free) *(optional — app works without it)*

---

### 1. Install backend dependencies

```bash
cd api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your MongoDB URI and JWT secrets at minimum — see the [Environment Variables](#environment-variables) section below.

### 3. Start the backend

```bash
npm run dev
```

Expected output:
```
✅ MongoDB: <your-cluster-host>
✅ Redis connected
🚀  API   →  http://localhost:3000/api/v1
📡  WS    →  ws://localhost:3000
```

If Redis is not configured, you will see `⚠️ Redis unavailable — caching disabled` instead. The API continues to work normally.

### 4. Start the frontend

Open a second terminal:

```bash
cd api/frontend
npm install
npm run dev
```

Open `http://localhost:5173`

### 5. Create an admin user

Register an account through the UI, then promote it to admin via MongoDB shell or Atlas browser:

```js
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### 6. Test real-time updates (Socket.io demo)

Open `test-client/index.html` directly in a browser — no build step needed. Log in as a user in one tab, connect the socket, place an order, then log in as admin in a second tab and update the order status. The first tab receives the event in real time.

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB — required
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/product-catalog?appName=<name>

# JWT — change these to long random strings
JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Redis — optional, leave defaults for local Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=60

# CORS
CLIENT_URL=http://localhost:5173
```

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | **Yes** | Full MongoDB connection string including database name |
| `JWT_ACCESS_SECRET` | **Yes** | Secret key for signing access tokens — make it long and random |
| `JWT_REFRESH_SECRET` | **Yes** | Secret key for signing refresh tokens — must differ from access secret |
| `JWT_ACCESS_EXPIRES` | No | Access token lifetime — default `15m` |
| `JWT_REFRESH_EXPIRES` | No | Refresh token lifetime — default `7d` |
| `PORT` | No | Server port — default `3000` |
| `REDIS_HOST` | No | Redis host — default `localhost` |
| `REDIS_PORT` | No | Redis port — default `6379` |
| `REDIS_PASSWORD` | No | Redis password — leave blank for local Redis with no auth |
| `REDIS_TTL` | No | Product cache TTL in seconds — default `60` |
| `CLIENT_URL` | No | Allowed CORS origin — default `*` |

---

## API Endpoint Reference

**Base URL:** `http://localhost:3000/api/v1`

All request bodies must be `Content-Type: application/json`.
Protected routes (marked 🔒) require:
```
Authorization: Bearer <accessToken>
```

### Consistent Response Format

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { },
  "meta": { }
}
```

**Error:**
```json
{
  "success": false,
  "status": "fail",
  "message": "Human-readable description",
  "errors": [{ "field": "price", "message": "Price must be >= 0" }]
}
```

| Code | Meaning |
|---|---|
| `400` | Bad request |
| `401` | Missing, expired, or invalid token |
| `403` | Authenticated but insufficient role |
| `404` | Resource not found |
| `409` | Conflict — duplicate email, or insufficient stock |
| `422` | Validation failed — see `errors` array for field details |
| `500` | Internal server error |

---

### Auth

#### `POST /auth/register`
Register a new user.

```json
// Body
{ "name": "Alice", "email": "alice@example.com", "password": "secret123" }

// Response 201
{
  "data": {
    "user": { "id": "...", "name": "Alice", "email": "alice@example.com", "role": "user" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### `POST /auth/login`
Log in with existing credentials. Returns same shape as register.

```json
// Body
{ "email": "alice@example.com", "password": "secret123" }
```

#### `POST /auth/refresh`
Exchange a refresh token for a new token pair. Token is rotated on each use.

```json
// Body
{ "refreshToken": "eyJ..." }

// Response 200
{ "data": { "accessToken": "eyJ...", "refreshToken": "eyJ..." } }
```

#### `POST /auth/logout` 🔒
Invalidates the provided refresh token server-side.

```json
// Body
{ "refreshToken": "eyJ..." }
```

#### `GET /auth/me` 🔒
Returns the currently authenticated user's profile.

---

### Products

Read endpoints are public. Write endpoints require **admin** role.

#### `GET /products`
Paginated, filterable product list. **Cached in Redis for 60 seconds.**
Response includes `"cached": true` when served from cache.

| Query Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `12` | Results per page (max 100) |
| `search` | string | — | Searches name and category (case-insensitive) |
| `category` | string | — | Exact category match |
| `minPrice` | number | — | Price >= value |
| `maxPrice` | number | — | Price <= value |
| `sort` | string | `-createdAt` | `price`, `-price`, `name`, `-name`, `createdAt`, `-createdAt`, `stock`, `-stock` |

```json
// Response 200
{
  "data": [{ "_id": "...", "name": "...", "price": 999, "category": "electronics", "stock": 42, "images": [] }],
  "meta": { "total": 84, "page": 1, "limit": 12, "totalPages": 7, "hasNextPage": true, "hasPrevPage": false },
  "cached": false
}
```

#### `GET /products/:id`
Single product by ID.

#### `POST /products` 🔒 Admin
Create a product. **Invalidates product cache.**

```json
// Body
{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling, 30hr battery",
  "price": 2499,
  "category": "electronics",
  "stock": 50,
  "images": ["https://example.com/img.jpg"]
}
// Response 201
```

#### `PUT /products/:id` 🔒 Admin
Full product update. Same body shape as POST. **Cache invalidated.**

#### `DELETE /products/:id` 🔒 Admin
Soft-deletes the product (`isActive: false`). Product disappears from listings but order history is preserved. **Cache invalidated.**

---

### Orders

All order routes require authentication. 🔒

#### `POST /orders`
Place a new order. Validates stock for every item before deducting.

```json
// Body
{
  "items": [
    { "productId": "64abc...", "quantity": 2 },
    { "productId": "64def...", "quantity": 1 }
  ]
}

// Response 201
{
  "data": {
    "_id": "...",
    "items": [{ "name": "Wireless Headphones", "price": 2499, "quantity": 2 }],
    "totalAmount": 4998,
    "status": "pending",
    "statusHistory": [{ "status": "pending", "updatedAt": "..." }]
  }
}
```

Possible errors:
- `404` — product not found or inactive
- `409` — insufficient stock (message shows available vs requested quantity)

#### `GET /orders`
- Users see only their own orders
- Admins see all orders across all users

| Query Param | Description |
|---|---|
| `page` | Page number |
| `limit` | Results per page (max 50) |
| `status` | Filter by `pending`, `confirmed`, `shipped`, or `delivered` |

#### `GET /orders/:id`
Single order. Users can only fetch their own — admins can fetch any.

#### `PATCH /orders/:id/status` 🔒 Admin only
Update order status. **Emits `order:statusUpdated` via Socket.io to the order owner in real time.**

```json
// Body
{ "status": "confirmed" }

// Valid transitions
pending → confirmed → shipped → delivered
```

---

## WebSocket Events

Connect with the access token as authentication:

```js
const socket = io('http://localhost:3000', {
  auth: { token: '<accessToken>' }
});
```

Every user automatically joins their private room `user:<userId>` on connect. No manual room join is needed.

| Event | Direction | When |
|---|---|---|
| `connected` | Server → Client | Immediately after successful connection |
| `order:statusUpdated` | Server → Client | When an admin updates this user's order |

#### `order:statusUpdated` payload

```json
{
  "orderId": "64abc...",
  "previousStatus": "pending",
  "newStatus": "confirmed",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "message": "Your order #64abc... is now confirmed."
}
```

Only the order owner receives this event. All other connected users are unaffected.

---

## Architectural Decisions

### Two-token JWT strategy
Access tokens expire in 15 minutes to limit the damage if one is stolen. Refresh tokens last 7 days and are stored in the database, which allows server-side invalidation on logout or suspicious activity. Tokens are rotated on every refresh call and each user is capped at 5 active refresh tokens — preventing unbounded accumulation across many devices.

### Soft delete for products
Products are never hard-deleted. Setting `isActive: false` hides them from all catalog queries while preserving every order document that references them. Hard-deleting a product would break the line items of any existing order — soft delete avoids that entirely at the cost of a small amount of extra storage.

### Redis cache with pattern invalidation
The `GET /products` endpoint is the most frequently hit route and is expensive to compute when filters, pagination, and sorting are involved. Each unique combination of query parameters gets its own cache key and a 60-second TTL. On any write operation, all product cache keys are wiped at once using a Redis key pattern (`products:*`). This is simpler and safer than surgical per-key invalidation, which would require tracking which cached pages contain any given product.

### Socket.io room-per-user model
Each authenticated socket connection joins a room named `user:<userId>`. When an admin updates an order, the server emits the event directly to that specific room rather than broadcasting globally. This guarantees that users only ever receive events about their own orders, with no filtering needed on the client side.

### Compound index on orders
```js
orderSchema.index({ user: 1, createdAt: -1 });
```
The single most common order query is always "get this user's orders, sorted newest first." A compound index on both fields satisfies the filter and the sort from the same index lookup — no in-memory sort step needed. A separate index on each field individually would not achieve this.

### Graceful Redis fallback
All Redis operations are wrapped in try/catch with silent failure. If Redis is unavailable at startup or crashes mid-session, the app logs a warning and continues serving requests — just without caching. A Redis outage degrades response times but does not take down the API.
