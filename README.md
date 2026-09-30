# Inventory Management System

> A soft dark inventory operations console — real-time stock tracking, role-based access, analytics, audit trails and one-click Excel export, powered by React + Supabase.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2-FF6B6B?style=flat-square)
![SheetJS](https://img.shields.io/badge/SheetJS-%28xlsx%29-2F6F4E?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)

---

## 📌 Project Overview

A full-featured inventory management dashboard for tracking products, stock levels, reorder thresholds and valuation in real time. Multiple tabs/devices stay in sync through Supabase Realtime, while role-based authentication separates **Admin** (read + write) from **Viewer** (read-only).

### ✨ Features List

| Area | Features |
| --- | --- |
| **Dashboard Metrics** | Total products, total valuation, low-stock count, out-of-stock count |
| **Product Management** | Add, edit, delete products with validated modal form |
| **Stock Control** | Inline `+1` / `-1` stock adjustments with automatic `stock_logs` audit entries |
| **Search & Filters** | Live search by name/SKU, dynamic category dropdown filter, quick-filter chips (All / Low Stock / Out of Stock) |
| **Audit Trail** | Slide-over stock history panel per product or global, newest first |
| **Analytics** | Top-5 valuation bar chart, category donut chart, 14-day stock movement area chart (Recharts) |
| **Alerts** | Expandable low-stock banner drawer with per-product **Jump** links (filters + scrolls to the row), plus Alert Manager row highlighting |
| **Excel Export** | One-click `.xlsx` export (SheetJS) with structured headers, auto-fitted column widths, autofilter and typed numeric/currency/date cells |
| **Navigation** | Responsive sidebar drawer — Dashboard, Analytics, Low-Stock Alerts, Audit Logs (persistent on desktop, hamburger overlay on mobile) |
| **Product IDs** | Auto-generated unique SKU (`PRD-YYYYMMDD-XXXX`) with manual override + regenerate |
| **Currency** | Philippine Peso (₱) formatting everywhere via `Intl.NumberFormat('en-PH')` |
| **Accessibility** | ≥14px body text, 44px touch targets, high-contrast focus rings, reduced-motion support |
| **Realtime** | `postgres_changes` subscriptions on `products` + `stock_logs` |
| **Authentication** | Supabase email/password auth with **Admin vs Viewer** role gate |
| **Responsive UI** | Soft dark neutral (slate) theme, mobile → ultrawide layouts |

---

## 🏗 Architecture & Tech Stack

```
InventorySystem/
├── index.html
├── vercel.json                 # SPA rewrite rules
├── .env.example
├── project_context.txt         # Architecture contract for agents
├── src/
│   ├── main.jsx                # React entry + AuthProvider
│   ├── App.jsx                 # Layout, sidebar wiring, route guards
│   ├── index.css               # Tailwind directives + a11y base styles
│   ├── assets/
│   ├── components/
│   │   ├── auth/               # AuthModal (dark login / signup modal)
│   │   ├── common/             # Header, ControlBar, AuthGate, LowStockBanner
│   │   ├── dashboard/          # MetricsBar, StatCard, AnalyticsView
│   │   ├── inventory/          # ProductTable, ProductModal, StockLogModal
│   │   └── layout/             # Sidebar (responsive nav drawer)
│   ├── context/AuthContext.jsx # user, role, login, signup, logout
│   ├── hooks/useInventory.js   # CRUD + filters + realtime
│   ├── lib/supabaseClient.js   # Supabase singleton
│   └── utils/
│       ├── currency.js         # ₱ PHP Intl formatter
│       └── exportExcel.js      # SheetJS (.xlsx) builder + download
```

**Flow:** `AuthProvider` gates the app → `Sidebar` drives view state (table / analytics / alerts / audit logs) → `useInventory` owns all product state (CRUD, filters, realtime) → presentational components render metrics, table, analytics and modals → every mutation is persisted to Supabase and mirrored back through realtime events.

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 5, Tailwind CSS 3, Lucide-React icons |
| Charts | Recharts 2 |
| Exports | SheetJS (`xlsx`) → native `.xlsx` workbooks |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Deployment | Vercel / Netlify (static SPA) |

---

## 🗄 Database Schema & Setup SQL

Run in the **Supabase SQL Editor** (the project already ships with seed rows):

```sql
-- 1. Products ------------------------------------------------------------
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  sku               varchar(50) unique not null,
  name              varchar(255) not null,
  category          varchar(100),
  quantity           int not null default 0,
  min_reorder_level  int not null default 0,
  unit_price        numeric(10,2) not null default 0,
  supplier          varchar(100),
  created_at        timestamptz not null default now()
);

-- 2. Stock audit log -----------------------------------------------------
create table if not exists stock_logs (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  change_amount int not null,
  type          varchar(50) not null,          -- 'increment' | 'decrement'
  created_at    timestamptz not null default now()
);

create index if not exists idx_stock_logs_product_id  on stock_logs(product_id);
create index if not exists idx_stock_logs_created_at  on stock_logs(created_at desc);
create index if not exists idx_products_category      on products(category);

-- 3. Realtime ------------------------------------------------------------
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table stock_logs;

-- 4. Row Level Security --------------------------------------------------
-- RLS is DISABLED for development (open dashboard access via anon key).
-- enable RLS for production hardening:
--   alter table products enable row level security;
--   alter table stock_logs enable row level security;
```

> **Roles** are stored in `auth.users.raw_user_meta_data->>'role'` (`admin` / `viewer`) and read client-side from `user.user_metadata.role`.

---

## ⚙️ Environment Variable Setup

Copy the example file and fill in your Supabase project values (**Project Settings → API**):

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-supabase-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-supabase-project.supabase.co:5432/postgres
```

Only `VITE_`-prefixed variables are exposed to the browser — never put service-role keys here. `DATABASE_URL` is optional and only needed for direct database tooling (migrations, seeds); it is never read by the frontend.

---

## 🚀 Local Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

1. Create a Supabase project and run the SQL above.
2. Configure `.env.local`.
3. Start the dev server and **sign up** from the auth gate — choose the **Admin** role to unlock write actions (Add / Edit / Delete / stock ±). **Viewer** accounts get a read-only experience.
4. If email confirmation is enabled in Supabase, confirm the link before signing in (or disable *Confirm email* for local dev).

---

## ☁️ Deployment

### Vercel

1. Push the repository to GitHub/GitLab.
2. **Add New Project → Import** the repo (framework auto-detected: *Vite*).
3. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy — `vercel.json` already rewrites all routes to `index.html` for SPA routing.

### Netlify

1. **Add new site → Import from Git**.
2. Build command `npm run build`, publish directory `dist`.
3. Add the two environment variables.
4. Create `public/_redirects` (or site settings → Redirect rules):

```
/*    /index.html   200
```

### Post-deploy checklist

- [ ] Supabase **Authentication → URL Configuration**: add the deployed domain to *Site URL* and *Redirect URLs*.
- [ ] Confirm `supabase_realtime` publication includes both tables.
- [ ] Decide whether to enable RLS with production policies.

---

## 🔐 Access Control

| Capability | Admin | Viewer |
| --- | :---: | :---: |
| View dashboard, analytics, audit logs | ✅ | ✅ |
| Search / filter / Excel export | ✅ | ✅ |
| Add / Edit / Delete products | ✅ | ❌ |
| Stock `+1` / `-1` adjustments | ✅ | ❌ |

---

## 📄 License

MIT — free to use, adapt and ship.
