# Egypt Services Super App – Full Architecture Plan

## Overview

The project consists of two separate applications:

1. Admin App
2. Client App

The same account can access both applications, depending on the assigned role:
- Admin
- Vendor / Service Provider
- Normal Client

---

# 1. Roles

```text
Account
├── Normal Client
├── Vendor / Service Provider
└── Admin
```

### Permissions

| Role | Client App | Admin App |
|------|-----------|-----------|
| Normal Client | Yes | No |
| Vendor | Yes | Yes (limited access) |
| Admin | Yes | Yes (full access) |

---

# 2. Applications

## A) Client App

The application used by the end customer.

### Main Modules

```text
Client App
├── Home
├── Booking
├── Home Services
├── Vendor Stores
├── Products
├── Cart
├── Orders
├── Profile
└── Notifications
```

---

## B) Admin App

The application that controls all data and settings used by the Client App.

```text
Admin App
├── Dashboard
├── Clients Management
├── Vendors Management
├── Categories Management
├── Booking Management
├── Products Management
├── Menu Management
├── Locations Management
├── Schedule Management
├── Orders Management
├── Payments
├── Notifications
└── Settings
```

---

# 3. Booking Module with Optional Order

The client can book anything such as:
- Restaurant
- Cafe
- Barber
- Football Field
- Wedding Hall
- Home Service

During the booking flow, there is an optional step:

```text
Would you like to place an order?
[ Yes ] [ No ]
```

If the client selects Yes:
- Show the menu or products linked to the selected place
- Allow the client to choose products
- Save the order together with the booking

Example:

```text
Restaurant Booking
├── Select Date
├── Select Time
├── Number of People
├── Add Order?
│   ├── Burger
│   ├── Drinks
│   └── Dessert
└── Confirm
```

Or:

```text
Football Field Booking
├── Date
├── Time
├── Add Extras?
│   ├── Water
│   ├── Drinks
│   └── Ball Rental
└── Confirm
```

---

# 4. Menu / Products are Managed from the Admin App

All menus, products, and extras are created only from the Admin App.

```text
Admin App
└── Menu Management
    ├── Create Category
    ├── Create Menu Item
    ├── Set Price
    ├── Assign Available Locations
    ├── Assign Available Times
    └── Activate / Deactivate
```

Example:

```text
Menu Item
Name: Burger Meal
Price: 150 EGP
Available For:
- Restaurant A
- Restaurant B
Available Time:
- 12 PM → 11 PM
```

---

# 5. Locations and Schedules

Every location, branch, and available time slot is created from the Admin App.

```text
Locations Management
├── Restaurants
├── Cafes
├── Barber Shops
├── Football Fields
├── Wedding Halls
└── Home Service Areas
```

```text
Schedule Management
├── Working Days
├── Available Time Slots
├── Closed Dates
├── Holidays
└── Maximum Capacity
```

Example:

```text
Restaurant A
├── Friday
│   ├── 4:00 PM
│   ├── 6:00 PM
│   └── 8:00 PM
└── Saturday
```

---

# 6. Vendor / Service Provider Access

The vendor can access the Admin App, but only with limited permissions.

The vendor can:
- Edit their place information
- Edit their products
- Set available schedules
- View bookings and orders
- Update order status

The vendor cannot:
- View other vendors
- Control global app settings
- Manage clients

```text
Vendor Panel
├── My Store
├── My Products
├── My Schedule
├── My Bookings
├── My Orders
└── My Revenue
```

---

# 7. Core Data Structure

```text
Category
├── Restaurant
├── Cafe
├── Barber
├── Football Field
├── Wedding Hall
├── Home Service
└── Vendor Store
```

```text
Location
├── id
├── categoryId
├── name
├── address
├── coordinates
├── schedule
└── menu
```

```text
Booking
├── clientId
├── locationId
├── date
├── time
├── guests
├── optionalOrder
└── status
```

```text
Order
├── bookingId
├── items
├── totalPrice
└── status
```

---

# 8. Suggested Screens – Client App

```text
Home
├── Categories
├── Nearby Places
├── Recommended
└── Search
```

```text
Place Details
├── Images
├── Description
├── Available Times
├── Menu / Products
├── Reviews
└── Book Now
```

```text
Checkout
├── Booking Details
├── Ordered Items
├── Payment Method
└── Confirm
```

---

# 9. Suggested Screens – Admin App

```text
Dashboard
├── Total Bookings
├── Total Orders
├── Revenue
└── Active Vendors
```

```text
Management
├── Clients
├── Vendors
├── Categories
├── Locations
├── Menus
├── Products
├── Bookings
└── Orders
```

---

# 10. Recommended MVP

Start only with:

```text
Modules
├── Booking
├── Restaurant / Cafe
├── Barber
├── Football Fields
├── Home Services
└── Vendor Store + Products
```

And in the Admin App:

```text
Admin Features
├── Create Locations
├── Create Time Slots
├── Create Menu Items
├── Create Products
├── Assign Products to Locations
└── Manage Bookings
```

---

# 11. Suggested Technical Architecture

```text
Frontend
├── Client App (Angular + Capacitor)
└── Admin App (Angular)
```

```text
Backend
├── Auth Service
├── Clients Service
├── Booking Service
├── Products Service
├── Locations Service
├── Orders Service
└── Notifications Service
```

```text
Database
├── Clients
├── Roles
├── Vendors
├── Locations
├── Categories
├── Products
├── Menus
├── Bookings
├── Orders
└── Notifications
```

---

# 12. Future Expansion

Later, you can add:
- Cars
- Health
- Wedding Services
- Price Comparison
- Delivery
- Community

All of them will reuse the same:
- Client accounts
- Booking Engine
- Products
- Orders
- Locations

---

# 13. Main System Flowchart

```text
                          ┌─────────────────┐
                          │     Login       │
                          └────────┬────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
              ┌──────▼───────┐           ┌───────▼───────┐
              │  Client App │           │   Admin App   │
              └──────┬───────┘           └───────┬───────┘
                     │                           │
         ┌───────────┼────────────┐      ┌───────┼─────────────────┐
         │           │            │      │       │                 │
 ┌───────▼──────┐ ┌──▼───────┐ ┌──▼───┐  │ ┌─────▼─────┐ ┌────────▼────────┐
 │ Home Services│ │ Booking  │ │Store │  │ │ Locations │ │ Menus/Products  │
 └───────┬──────┘ └────┬─────┘ └──┬───┘  │ └─────┬─────┘ └────────┬────────┘
         │             │           │      │       │                │
         │             │           │      │ ┌─────▼─────┐ ┌────────▼────────┐
         │             │           │      │ │Schedules  │ │ Categories      │
         │             │           │      │ └─────┬─────┘ └────────┬────────┘
         │             │           │      │       │                │
         └─────────────┴───────────┴──────┴───────┴────────────────┘
                                   │
                                   ▼
                       Data is reflected in Client App
```

---

# 14. Booking + Optional Order Flow

```text
┌───────────────┐
│ Select Place  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Select Date   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Select Time   │
└───────┬───────┘
        │
        ▼
┌─────────────────────────┐
│ Would you like to order?│
└───────┬─────────┬───────┘
        │Yes      │No
        │         │
        ▼         ▼
┌───────────────┐  ┌────────────────┐
│ Show Menu /   │  │ Go to Checkout │
│ Products      │  └────────┬───────┘
└───────┬───────┘           │
        │                   │
        ▼                   │
┌───────────────┐           │
│ Select Items  │           │
└───────┬───────┘           │
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │ Confirm Booking + │
        │ Optional Order    │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │ Payment / Success │
        └───────────────────┘
```

---

# 15. Admin Management Flow

```text
Admin / Vendor
       │
       ▼
┌─────────────────┐
│ Create Category │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Location │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Set Schedule    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Menu /   │
│ Products        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Assign Menu to  │
│ Location        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Publish / Active│
└─────────────────┘
```
