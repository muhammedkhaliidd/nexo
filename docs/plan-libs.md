# Libs Plan — Shared Library Structure

## What libs are (and are not)

Libraries in this Nx workspace are **shared source code compiled into apps at build time**. They are never deployed on their own, never run as a separate server, and never published to npm.

When `client-app` imports `@nexo/user/feature-booking`, the build tool bundles that code directly into the client app. Same for `admin-app` and the API.

**Libs exist to:**
- Share code between two or more places without duplication
- Make features independently testable
- Enforce clear ownership and boundaries

**Do not create a lib for:**
- A component or service used only in one app and never reused
- Very small utilities that do not justify their own project

---

## Why `libs/user/` and `libs/admin/` subfolders

`libs/user/` means **customer-domain** libraries for **client-app** (not the old `user-app` project name). `libs/admin/` is for the admin/vendor console.

Without subfolders, as you add features you get:

```
libs/
  shared-types/
  shared-auth/
  shared-ui/
  feature-home/        ← client-app or admin-app?
  feature-booking/     ← unclear
  feature-dashboard/   ← unclear
  data-access/         ← whose?
```

With subfolders, ownership is immediately clear:

```
libs/
  shared-types/        ← everyone
  shared-auth/         ← everyone
  shared-ui/           ← both frontends
  user/
    data-access/       ← client-app only
    feature-home/      ← client-app only
    feature-booking/   ← client-app only
  admin/
    data-access/       ← admin-app only
    feature-dashboard/ ← admin-app only
```

Nx can also **enforce these boundaries** so that an admin lib can never be accidentally imported in the client app, and vice versa.

---

## Full Planned Layout

```
libs/
  shared-types/                    (exists)   @nexo/shared-types
  shared-auth/                     (exists)   @nexo/shared-auth
  shared-ui/                       (exists)   @nexo/shared-ui
  user/
    data-access/                   (pending)  @nexo/user/data-access
    feature-home/                  (pending)  @nexo/user/feature-home
    feature-booking/               (pending)  @nexo/user/feature-booking
    feature-orders/                (pending)  @nexo/user/feature-orders
    feature-profile/               (pending)  @nexo/user/feature-profile
  admin/
    data-access/                   (pending)  @nexo/admin/data-access
    feature-dashboard/             (pending)  @nexo/admin/feature-dashboard
    feature-locations/             (pending)  @nexo/admin/feature-locations
    feature-products/              (pending)  @nexo/admin/feature-products
    feature-bookings/              (pending)  @nexo/admin/feature-bookings
    feature-users/                 (pending)  @nexo/admin/feature-users
```

---

## Existing Libraries

### `libs/shared-types` — `@nexo/shared-types`

Pure TypeScript. No Angular, no Node. No framework deps.

Currently exports:

```typescript
export type UserRole = 'user' | 'vendor' | 'admin';
```

Will grow to include: DTOs, enums (`BookingStatus`, `OrderStatus`, `CategoryType`), request/response payload shapes shared between frontend and backend.

### `libs/shared-auth` — `@nexo/shared-auth`

Pure TypeScript. Depends only on `@nexo/shared-types`.

Currently exports:

```typescript
export function canAccessAdminApp(role: UserRole): boolean {
  return role === 'admin' || role === 'vendor';
}
```

Will grow to include: permission checks, role comparison helpers, JWT payload types.

### `libs/shared-ui` — `@nexo/shared-ui`

Angular library. Used by both frontends.

Currently exports `NexoPanel` component.

Will grow to include: shared layout wrappers, status badges, loading states, PrimeNG-based form field wrappers, and Tailwind utility components — anything both apps use in the same way.

---

## Nx Tag Convention and Boundary Rules

### Tags to assign

Each project (app or lib) should carry a `scope` tag so Nx can enforce import rules.

| Project | Tag |
|---------|-----|
| `apps/client-app` | `scope:user` |
| `apps/admin-app` | `scope:admin` |
| `apps/api` | `scope:api` |
| `libs/shared-types` | `scope:shared` |
| `libs/shared-auth` | `scope:shared` |
| `libs/shared-ui` | `scope:shared` |
| `libs/user/*` | `scope:user` |
| `libs/admin/*` | `scope:admin` |

Add tags in each `project.json`:

```json
"tags": ["scope:user"]
```

### Boundary rules in `eslint.config.mjs`

```javascript
{
  rules: {
    "@nx/enforce-module-boundaries": [
      "error",
      {
        "depConstraints": [
          {
            "sourceTag": "scope:user",
            "onlyDependOnLibsWithTags": ["scope:user", "scope:shared"]
          },
          {
            "sourceTag": "scope:admin",
            "onlyDependOnLibsWithTags": ["scope:admin", "scope:shared"]
          },
          {
            "sourceTag": "scope:api",
            "onlyDependOnLibsWithTags": ["scope:api", "scope:shared"]
          },
          {
            "sourceTag": "scope:shared",
            "onlyDependOnLibsWithTags": ["scope:shared"]
          }
        ]
      }
    ]
  }
}
```

This makes it a **lint error** if, for example, `admin-app` imports a `libs/user/feature-booking` component.

---

## Import Path Convention

All import paths are registered in `tsconfig.base.json` under `paths`. They are added automatically when you use `nx g` with `--importPath`.

Current paths:

```json
"@nexo/shared-types": ["libs/shared-types/src/index.ts"],
"@nexo/shared-auth":  ["libs/shared-auth/src/index.ts"],
"@nexo/shared-ui":    ["libs/shared-ui/src/index.ts"]
```

Future paths (added as libs are generated):

```json
"@nexo/user/data-access":      ["libs/user/data-access/src/index.ts"],
"@nexo/user/feature-home":     ["libs/user/feature-home/src/index.ts"],
"@nexo/user/feature-booking":  ["libs/user/feature-booking/src/index.ts"],
"@nexo/user/feature-orders":   ["libs/user/feature-orders/src/index.ts"],
"@nexo/user/feature-profile":  ["libs/user/feature-profile/src/index.ts"],
"@nexo/admin/data-access":     ["libs/admin/data-access/src/index.ts"],
"@nexo/admin/feature-dashboard": ["libs/admin/feature-dashboard/src/index.ts"],
"@nexo/admin/feature-locations": ["libs/admin/feature-locations/src/index.ts"],
"@nexo/admin/feature-products":  ["libs/admin/feature-products/src/index.ts"],
"@nexo/admin/feature-bookings":  ["libs/admin/feature-bookings/src/index.ts"],
"@nexo/admin/feature-users":     ["libs/admin/feature-users/src/index.ts"]
```

Each lib exposes its public API through `libs/.../src/index.ts`. Nothing outside the lib should import from deep paths like `@nexo/user/feature-home/src/lib/my-component`.

---

## When to create a lib vs keep code in the app

| Situation | Decision |
|-----------|---------|
| Component used in both client-app and admin-app | Lib under `libs/shared-ui` |
| Feature used only in client-app, but complex enough to test in isolation | Lib under `libs/user/` |
| Feature used only in admin-app | Lib under `libs/admin/` |
| HTTP service that calls the same API from multiple places | Lib under `libs/user/data-access` or `libs/admin/data-access` |
| Small one-off component used in one screen | Keep inside the app, no lib needed |
| Shared DTO or type interface between frontend and backend | `libs/shared-types` |

---

## Generating Libs

### Angular feature lib

```bash
npx nx g @nx/angular:library \
  --name=feature-booking \
  --directory=libs/user/feature-booking \
  --importPath=@nexo/user/feature-booking \
  --buildable=false \
  --style=css \
  --tags=scope:user
```

### Angular data-access lib

```bash
npx nx g @nx/angular:library \
  --name=data-access \
  --directory=libs/user/data-access \
  --importPath=@nexo/user/data-access \
  --buildable=false \
  --style=none \
  --tags=scope:user
```

### Pure TypeScript lib (no Angular)

```bash
npx nx g @nx/js:library \
  --name=shared-utils \
  --directory=libs/shared-utils \
  --importPath=@nexo/shared-utils \
  --bundler=tsc \
  --tags=scope:shared
```
