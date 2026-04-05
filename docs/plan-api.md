# API Plan — NestJS Backend

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | NestJS (modular monolith) |
| Database | PostgreSQL |
| ORM / migrations | Prisma |
| Auth | JWT (access + refresh tokens) |
| API style | REST, documented with Swagger/OpenAPI |
| Runtime | Node.js |

Start as a modular monolith inside `apps/api`. Do not split into microservices until organizational scaling or independent deploy cadence genuinely requires it. Each NestJS module is a natural future split point if that day comes.

---

## Step 1 — Database Setup (do this first)

Set up Prisma and PostgreSQL **before** building any feature module. Doing it later forces you to retrofit migrations into already-written code.

```bash
# from workspace root
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

This creates:
- `apps/api/prisma/schema.prisma`
- `.env` entry `DATABASE_URL`

Add `DATABASE_URL` to your local `.env` (already gitignored):

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/nexo_dev"
```

After defining each model, generate migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Core Schema Tables

```
users
roles
user_roles
vendors
vendor_users
categories
locations
location_schedules
products
product_categories
location_products
bookings
booking_items
orders
order_items
notifications
```

**Key modeling rule:**
- `bookings` stores reservation details (date, time, guests, location, status).
- `orders` references `booking_id` when the customer adds items during booking.
- These are separate aggregates — a booking can exist without an order; an order always references a booking.

---

## Step 2 — Auth Module (build before any protected route)

All endpoints should be protected by default. Use a global `JwtAuthGuard` and opt-out for public routes.

### Packages

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcrypt
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt
```

### Guards and decorators to create

| Name | Purpose |
|------|---------|
| `JwtAuthGuard` | Validates access token on every request |
| `RolesGuard` | Checks role from JWT payload against `@Roles()` decorator |
| `@Roles(...roles)` | Decorator to annotate which roles can access an endpoint |
| `@Public()` | Decorator to skip `JwtAuthGuard` on login/register routes |

### Token strategy

- **Access token**: short-lived (15 min), signed with `JWT_SECRET`
- **Refresh token**: long-lived (7 days), stored hashed in the DB, rotated on use
- Payload shape: `{ sub: userId, role: UserRole, vendorId?: string }`

### RBAC model

| Role | Access |
|------|--------|
| `user` | Client-app (customer) API only — not admin routes |
| `vendor` | Admin app endpoints scoped to their own data |
| `admin` | All endpoints, full data access |

Vendor data scoping: when role is `vendor`, all queries are filtered by `vendorId` extracted from the JWT payload. The API never trusts a `vendorId` from the request body.

---

## Step 3 — Domain Modules

Build in this order (each depends on the previous):

### 1. `auth`
- `POST /api/auth/register`
- `POST /api/auth/login` → returns access + refresh tokens
- `POST /api/auth/refresh` → rotates refresh token
- `POST /api/auth/logout`

### 2. `users`
- `GET /api/users/me` → own profile
- `PATCH /api/users/me` → update profile
- `GET /api/users` → admin only, list all users

### 3. `roles`
- Managed internally; no public endpoint needed at MVP
- Admin endpoint to assign role: `PATCH /api/users/:id/role`

### 4. `vendors`
- `POST /api/vendors` → admin creates vendor
- `GET /api/vendors` → public list
- `GET /api/vendors/:id`
- `PATCH /api/vendors/:id` → admin or owning vendor

### 5. `categories`
- `GET /api/categories` → public
- CRUD for admin only
- Values: restaurant, cafe, barber, football-field, wedding-hall, home-service, vendor-store

### 6. `locations`
- Belongs to a vendor and category
- `GET /api/locations` → public (with filters: category, city, nearby)
- CRUD for admin + vendor (vendor scoped to own locations)

### 7. `schedules`
- `GET /api/locations/:id/schedules`
- CRUD for admin + vendor
- Fields: working days, time slots, closed dates, holidays, max capacity per slot

### 8. `products`
- Belongs to vendor, assignable to locations
- `GET /api/locations/:id/products` → public
- CRUD for admin + vendor

### 9. `bookings`
- `POST /api/bookings` → authenticated users
- `GET /api/bookings/my` → own bookings
- `PATCH /api/bookings/:id/status` → vendor or admin
- Capacity check: slot must have remaining capacity before confirming

### 10. `orders`
- Created together with or separately from a booking
- `POST /api/orders` → references `bookingId`
- `GET /api/orders/my`
- `PATCH /api/orders/:id/status` → vendor or admin

### 11. `notifications`
- `GET /api/notifications` → own notifications
- `PATCH /api/notifications/:id/read`
- Created server-side when booking/order status changes

---

## Delivery Phases (Backend)

### Phase 1 — Foundation
- Prisma + PostgreSQL setup
- Auth module (login, register, JWT, guards)
- Users and roles modules
- Seed script with default roles

### Phase 2 — Marketplace Data
- Categories, vendors, locations, schedules modules
- Admin endpoints to create and manage the marketplace

### Phase 3 — Booking Engine
- Products module
- Bookings module with capacity enforcement
- Order creation linked to booking

### Phase 4 — Operations
- Notifications module
- Reporting endpoints (totals, revenue per vendor)
- Payment integration (add after flow is stable)

---

## Script Cleanup

`package.json` currently has:

```json
"start:api":      "nx serve api",
"start:api:3333": "cross-env PORT=3333 nx serve api"
```

`start:api:3333` is redundant — `main.ts` already defaults to **3333**. Keep:

```json
"start:api":      "nx serve api",
"start:api:3000": "cross-env PORT=3000 nx serve api"
```

`start:api:3000` is the only override worth keeping for cases where port 3000 is specifically needed.

---

## First End-to-End Slice

Build this slice first to validate the full stack before building broad admin features:

1. Login with each role (user, vendor, admin)
2. Admin creates category → vendor → location → schedule
3. Admin/vendor creates products for the location
4. Customer (via client-app) views location details and available slots
5. Customer creates a booking
6. Customer optionally adds items → order is created linked to booking
7. Admin/vendor views bookings and orders in the console

This slice touches auth, RBAC, every core table, and the full booking+order flow.
