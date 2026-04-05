# Admin App Plan — Angular SSR (Admin + Vendor Console)

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Angular (SSR enabled) |
| Styling | Tailwind CSS |
| Components | PrimeNG (Aura theme, same as client-app) |
| Mobile | None (no Capacitor; admin work is desktop/tablet) |
| State | Angular signals + services |
| HTTP | Angular `HttpClient` with auth interceptor |

The admin app is the **management console** used by both admins and vendors. It is a single deployed app; vendor mode is enforced through route guards and API-level data scoping, not a separate build.

---

## Role Access Matrix

| Feature | Admin | Vendor | Customer (role `user`) |
|---------|-------|--------|-------------|
| Dashboard (global stats) | Full | Own stats only | No access |
| Users management | Full | No access | No access |
| Vendors management | Full | Own profile only | No access |
| Categories | Full CRUD | Read only | No access |
| Locations | All locations | Own locations only | No access |
| Schedules | All schedules | Own schedules only | No access |
| Products / Menus | All products | Own products only | No access |
| Bookings | All bookings | Own location bookings | No access |
| Orders | All orders | Own location orders | No access |
| Payments / Revenue | Global | Own revenue only | No access |
| Settings | Full | No access | No access |

**Rule:** A normal user who navigates to the admin app URL is redirected to the client app. A vendor can log in but can only reach vendor-scoped sections.

---

## Screens and Routes

### Admin routes (full access)

```
/dashboard                → Global stats (bookings, orders, revenue, active vendors)
/users                    → List, filter, view, assign roles
/vendors                  → List, create, edit, deactivate
/categories               → CRUD
/locations                → List all locations, create, edit
/locations/:id/schedules  → Schedule management for a location
/products                 → All products, filter by vendor
/bookings                 → All bookings, filter/status
/orders                   → All orders, filter/status
/payments                 → Revenue breakdown
/settings                 → App config
```

### Vendor panel routes (filtered by JWT vendorId)

```
/vendor/store             → Own location/store details
/vendor/products          → Own products
/vendor/schedule          → Own schedule
/vendor/bookings          → Bookings for own locations
/vendor/orders            → Orders for own locations
/vendor/revenue           → Own revenue
```

Vendor sees the same components, but every API call returns only data owned by their `vendorId`.

---

## Lib Structure

Feature code lives in `libs/admin/` — not directly inside `apps/admin-app/src/app`.

### Libs to create (in build order)

| Lib | Import path | Purpose |
|-----|-------------|---------|
| `libs/admin/data-access` | `@nexo/admin/data-access` | HTTP services for all admin API calls, shared admin guards |
| `libs/admin/feature-dashboard` | `@nexo/admin/feature-dashboard` | Stats cards, charts, activity feed |
| `libs/admin/feature-locations` | `@nexo/admin/feature-locations` | Location list, create/edit form, schedule management |
| `libs/admin/feature-products` | `@nexo/admin/feature-products` | Product/menu list, create/edit, assign to locations |
| `libs/admin/feature-bookings` | `@nexo/admin/feature-bookings` | Booking list, status updates, detail view |
| `libs/admin/feature-users` | `@nexo/admin/feature-users` | User list, role assignment (admin only) |

### Generate a lib

```bash
npx nx g @nx/angular:library \
  --name=data-access \
  --directory=libs/admin/data-access \
  --importPath=@nexo/admin/data-access \
  --buildable=false \
  --style=css
```

---

## App Shell (`apps/admin-app`)

The app shell defines the layout (sidebar + top nav) and lazy-loads feature modules by route.

```typescript
// apps/admin-app/src/app/app.routes.ts
export const appRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadChildren: () => import('@nexo/admin/feature-dashboard').then(m => m.ADMIN_DASHBOARD_ROUTES) },
      { path: 'locations', loadChildren: () => import('@nexo/admin/feature-locations').then(m => m.ADMIN_LOCATIONS_ROUTES) },
      { path: 'products', loadChildren: () => import('@nexo/admin/feature-products').then(m => m.ADMIN_PRODUCTS_ROUTES) },
      { path: 'bookings', loadChildren: () => import('@nexo/admin/feature-bookings').then(m => m.ADMIN_BOOKINGS_ROUTES) },
      { path: 'users', canActivate: [AdminOnlyGuard], loadChildren: () => import('@nexo/admin/feature-users').then(m => m.ADMIN_USERS_ROUTES) },
      // vendor panel routes share the same libs but guard access
      { path: 'vendor', canActivate: [VendorGuard], children: [ /* vendor sub-routes */ ] },
    ],
  },
  { path: 'auth/login', component: LoginComponent },
  { path: '**', redirectTo: 'dashboard' },
];
```

### Guards

| Guard | Protects | Logic |
|-------|---------|-------|
| `AuthGuard` | All admin routes | Checks JWT is present and valid |
| `AdminOnlyGuard` | `/users`, `/settings` | Checks role === `admin` |
| `VendorGuard` | `/vendor/**` | Checks role === `admin` or `vendor` |
| `RedirectNormalUserGuard` | Entire admin app root | If role === `user`, redirects to client app URL |

---

## Vendor Mode Details

Vendor mode is **not** a separate app. The vendor logs into the same admin app and is routed to `/vendor/*`.

The vendor **cannot**:
- Access `/users`
- Access `/settings`
- See data belonging to other vendors

The vendor **can**:
- Manage their own location, products, schedules
- View and update booking/order status for their locations
- See their own revenue breakdown

Data scoping is enforced at the **API level** (JWT `vendorId` claim). The frontend also hides irrelevant nav items through a `role` signal, but the API is the security boundary.

---

## SSR Notes

The admin app is **fully auth-gated**, so search engine indexing is not a concern. SSR is still useful for:
- Fast initial paint on pages with large data tables
- Consistent rendering behavior shared with the client app

All routes that require authentication should be rendered as `RenderMode.Client` in `app.routes.server.ts`:

```typescript
export const serverRoutes: ServerRoute[] = [
  { path: '**', renderMode: RenderMode.Client },
];
```

Or selectively keep SSR for the login page to improve time-to-interactive on first load.

---

## Delivery Phases (Admin App)

### Phase 1 — Foundation
- App shell with sidebar layout, auth guard, login screen
- `libs/admin/data-access` with `AuthService` and HTTP interceptor

### Phase 2 — Marketplace Setup
- `libs/admin/feature-locations`: create/edit locations, assign vendor, set schedule
- `libs/admin/feature-products`: create/edit products, assign to locations

### Phase 3 — Operations
- `libs/admin/feature-bookings`: list, filter, status update
- `libs/admin/feature-dashboard`: booking count, revenue, active vendors summary

### Phase 4 — Users and Vendors
- `libs/admin/feature-users`: user list, role assignment (admin only)
- Vendor panel: reuse booking/product libs with vendorId scope applied

### Phase 5 — Advanced
- Revenue breakdown and export
- Notifications management
- Settings screen
