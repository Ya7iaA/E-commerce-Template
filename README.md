# Tacti8ai — E-Commerce Store

A modern, fully-featured e-commerce storefront built with React, TypeScript, and Tailwind CSS. Designed for fashion/clothing brands selling in Egypt with cash-on-delivery and governorate-based shipping fees.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Image Resolution Guide](#image-resolution-guide)
- [Routes](#routes)
- [Backend Integration](#backend-integration)
- [Getting Started](#getting-started)

---

## Features

### Storefront (Customer-Facing)

| Feature | Description |
|---|---|
| **Hero Slider** | Auto-rotating image carousel with animated transitions (Framer Motion). Supports 3 slides with title & subtitle overlays. |
| **Product Catalog** | Fetches products dynamically from a webhook API. Displays product cards with image, name, pricing (original + discounted), size selector, quantity picker, and "Add to Order" button. Shows discount percentage badge and "Out of Stock" overlay when applicable. |
| **Order Form** | Full checkout form with fields for Full Name, Phone Number, Governorate (with shipping fee), and Address. Includes real-time order summary sidebar with item list, subtotal, shipping, and grand total. Form validation for all fields. |
| **Order Confirmation** | After placing an order, displays a thank-you message with a unique Order ID for tracking. |
| **Order Tracker** | Floating chat-style widget (bottom-left) where customers paste their Order ID to check order status via a webhook. |
| **WhatsApp Button** | Floating WhatsApp button (bottom-right) linking directly to the store's WhatsApp number for customer support. |
| **Governorate-Based Shipping** | Shipping fees are calculated based on the selected Egyptian governorate. |
| **Responsive Design** | Fully responsive layout for mobile, tablet, and desktop. |

### Admin Panel (`/admin`)

| Feature | Description |
|---|---|
| **Admin Login** | Secure login page with username/password authentication via n8n webhook. Session stored in `sessionStorage`. |
| **Product Management** | Full CRUD operations — add, edit, delete products. Vertical card layout with image preview, pricing, sizes, and stock status. Fields: name, image (upload with preview), original price, discounted price, sizes (size:quantity string), in-stock toggle. Product images stored in external Supabase bucket. Client-side image optimization: resized to 800px max, converted to WebP, compressed to 75% quality. |
| **Order Management** | View all orders in vertical card layout. Each card shows: order ID, date, customer name, phone, governorate, address, items, subtotal, shipping fee, total, and status. Icon-only action buttons for edit, print, and WhatsApp. |
| **Inline Status Editing** | Edit order status inline with a dropdown (pending, confirmed, shipped, delivered, cancelled). |
| **Print Order as PDF** | Print any order as a clean, formatted receipt in a new browser window with customer info, items, totals, and status. |
| **WhatsApp Order Confirmation** | Each order card has a WhatsApp icon button that opens a pre-filled message to the customer containing: name, governorate, address, items, total, and confirmation text. |
| **Analytics Dashboard** | Visual analytics section with stat cards and charts. Cancelled orders are excluded from all calculations. |
| **Collapsible Sidebar** | Admin sidebar with icon-only collapsed mode. Sections: Products, Orders, Analytics. |

### Analytics Metrics

| Metric | Description |
|---|---|
| Total Products | Count of all products in the store |
| Orders Today | Number of non-cancelled orders placed today |
| Orders This Month | Number of non-cancelled orders placed this month |
| Revenue Today | Subtotal (without shipping) of today's orders |
| Revenue This Month | Subtotal (without shipping) of this month's orders |
| Grand Total Today | Total (with shipping) of today's orders |
| Grand Total This Month | Total (with shipping) of this month's orders |

### Analytics Charts

| Chart | Type | Description |
|---|---|---|
| Revenue - Last 7 Days | Line Chart | Daily revenue trend |
| Orders - Last 7 Days | Bar Chart | Daily order volume |
| Orders by Status | Pie Chart | Distribution across all statuses (includes cancelled) |
| Top Governorates | Horizontal Bar Chart | Top 5 governorates by order count |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Pre-built UI components |
| Framer Motion | Animations & transitions |
| Recharts | Charts & data visualization |
| React Router v6 | Client-side routing |
| TanStack React Query | Data fetching (available) |
| n8n Webhooks | Backend API (orders, products, auth, analytics) |

---

## Project Structure

```
src/
├── assets/                  # Static images (logo, hero slides)
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx       # Collapsible sidebar navigation
│   │   ├── AnalyticsSection.tsx   # Stats cards & charts
│   │   ├── OrdersManager.tsx      # Order cards with status editing, print & WhatsApp
│   │   └── ProductsManager.tsx    # Product CRUD vertical cards & dialog
│   ├── ui/                        # shadcn/ui components
│   ├── HeroSlider.tsx             # Auto-rotating hero carousel
│   ├── NavLink.tsx                # Navigation link component
│   ├── OrderForm.tsx              # Checkout form & order summary
│   ├── OrderTracker.tsx           # Floating order tracking chat
│   ├── ProductCard.tsx            # Individual product card
│   ├── ProductCatalog.tsx         # Product grid with API fetch
│   ├── StoreHeader.tsx            # Top header with logo & social links
│   └── WhatsAppButton.tsx         # Floating WhatsApp support button
├── config/
│   └── webhooks.ts                # Centralized webhook URLs with env var support
├── data/
│   ├── admin.ts                   # Admin webhook URLs (legacy)
│   ├── governorates.ts            # Egyptian governorates & shipping fees
│   └── products.ts                # Product webhook URLs (legacy)
├── pages/
│   ├── AdminDashboard.tsx         # Admin dashboard layout
│   ├── AdminLogin.tsx             # Admin login page
│   ├── Index.tsx                  # Main storefront page
│   └── NotFound.tsx               # 404 page
├── types/
│   ├── admin.ts                   # Admin TypeScript types
│   └── store.ts                   # Store TypeScript types (Product, CartItem, etc.)
└── App.tsx                        # Root app with routing
```

---

## Environment Variables

All webhook URLs are centralized in `src/config/webhooks.ts` and can be overridden via environment variables. See `.env.example` for the full list.

| Variable | Purpose |
|---|---|
| `VITE_WEBHOOK_GET_PRODUCTS` | Fetch products for storefront |
| `VITE_WEBHOOK_POST_ORDER` | Submit a new customer order |
| `VITE_WEBHOOK_TRACK_ORDER` | Track order status by ID |
| `VITE_WEBHOOK_LOGIN` | Admin authentication |
| `VITE_WEBHOOK_ADMIN_GET_PRODUCTS` | Fetch products for admin |
| `VITE_WEBHOOK_ADD_PRODUCT` | Add a new product |
| `VITE_WEBHOOK_UPDATE_PRODUCT` | Update an existing product |
| `VITE_WEBHOOK_DELETE_PRODUCT` | Delete a product |
| `VITE_WEBHOOK_GET_ORDERS` | Fetch all orders |
| `VITE_WEBHOOK_UPDATE_ORDER_STATUS` | Update order status |
| `VITE_WEBHOOK_GET_ANALYTICS` | Fetch analytics data |

---

## Image Resolution Guide

### Hero Slider Images (`src/assets/hero-*.jpg`)

| Property | Value |
|---|---|
| **Recommended Resolution** | **1920 × 1080 px** |
| Minimum Resolution | 1280 × 720 px |
| Aspect Ratio | 16:9 |
| Format | JPG or WebP |
| Max File Size | 500 KB (optimize for web) |
| Display Behavior | `object-cover`, fills 70–85vh viewport height |
| Notes | Image is cropped from center on mobile. Keep key content centered. |

### Store Logo (`src/assets/logo.png`)

| Property | Value |
|---|---|
| **Recommended Resolution** | **200 × 80 px** (or proportional) |
| Format | PNG (transparent background) |
| Max File Size | 50 KB |
| Display Height | 40px in header, 64px on admin login, 24px in sidebar |

### Product Images (uploaded via Admin Panel)

| Property | Value |
|---|---|
| **Recommended Resolution** | **800 × 800 px** |
| Minimum Resolution | 400 × 400 px |
| Aspect Ratio | 1:1 (square) |
| Format | Auto-converted to WebP at 75% quality |
| Max File Size | 5 MB (enforced by upload) |
| Display Behavior | `object-cover` in square `aspect-square` container |

### Summary Table

| Image | Resolution | Aspect Ratio | Format |
|---|---|---|---|
| Hero Slides | 1920 × 1080 px | 16:9 | JPG/WebP |
| Logo | 200 × 80 px | Landscape | PNG |
| Product Images | 800 × 800 px | 1:1 (Square) | WebP (auto) |
| Favicon | 512 × 512 px | 1:1 | PNG |

---

## Routes

| Route | Page | Access |
|---|---|---|
| `/` | Storefront (home) | Public |
| `/admin` | Admin Login | Public |
| `/admin/dashboard` | Admin Dashboard | Protected (session token) |
| `*` | 404 Not Found | Public |

---

## Deployment

### Apache / Hostinger (Shared Hosting)

An `.htaccess` file is included in `public/` to handle SPA routing on Apache servers. All non-file requests are redirected to `index.html`.

### Netlify / Vercel

Set environment variables in the hosting dashboard using the keys from `.env.example`.

---

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# (Optional) Copy and fill environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## License

© 2025 LUBB GO. All rights reserved.
