# TechVault — Modern Enterprise E-Commerce Platform

![.NET 8 LTS](https://img.shields.io/badge/.NET%20Core-v8.0%20LTS-purple)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16%20%7C%20Supabase-336791)
![Vite](https://img.shields.io/badge/Vite-v5.4-646CFF)
![React](https://img.shields.io/badge/React-v18.3-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.5-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3.4-38B2AC)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-FF4154)
![Zustand](https://img.shields.io/badge/Zustand-v4.5-orange)

An ultra-modern, high-performance E-Commerce platform rebuilt from the ground up with **ASP.NET Core 8 LTS**, **Supabase (PostgreSQL)**, and **Vite + React + Tailwind CSS v3**.

---

## 📖 Technical Documentation

Hệ thống cung cấp bộ tài liệu kỹ thuật chi tiết bằng Tiếng Việt tại thư mục [**`docs/`**](file:///c:/project/ecommerce-react-postgresql-dotnet-main/docs/README.md):
- 🏗️ [**Kiến trúc hệ thống (Architecture)**](file:///c:/project/ecommerce-react-postgresql-dotnet-main/docs/architecture.md)
- 🗄️ [**Thiết kế Cơ sở dữ liệu & Sơ đồ ERD (Database Schema)**](file:///c:/project/ecommerce-react-postgresql-dotnet-main/docs/database-schema.md)
- 📡 [**Đặc tả API Reference (Endpoints & DTOs)**](file:///c:/project/ecommerce-react-postgresql-dotnet-main/docs/api-reference.md)
- 🎨 [**Cấu trúc & Hướng dẫn Frontend (Frontend Guide)**](file:///c:/project/ecommerce-react-postgresql-dotnet-main/docs/frontend-guide.md)
- 🚀 [**Hướng dẫn Triển khai & Vận hành (Deployment Guide)**](file:///c:/project/ecommerce-react-postgresql-dotnet-main/docs/deployment-guide.md)

---

## 🌟 Key Features

### 🛒 Customer Storefront
- **Modern Hero & Collections**: High-res responsive showcase, trending categories, and featured flagship recommendations.
- **Instant Live Search**: Debounced instant search dropdown matching products in real-time.
- **Advanced Filtering & Sorting**: Filter by category, interactive price range slider ($50 – $3,000+), sort by price, rating, or alphabetical order.
- **Product Showcase**: Detailed specs, verified ratings, stock indicator, quantity stepper, and related product recommendations.
- **Slide-over Mini-Cart**: Quick access cart drawer with interactive item stepper and Free Shipping progress bar (threshold $150).
- **Checkout & Mock Payment**: Multi-step checkout with instant address validation and choice of 3 payment methods (Credit Card, QR Code, COD).
- **Order Tracking**: Order confirmation page and personal order history page with real-time status badges (*Processing*, *Shipped*, *Delivered*).
- **Theme Switcher**: Smooth Dark Mode & Light Mode transitions synchronized across all pages.
- **Toast Notifications**: Crisp toasts via Sonner for cart additions and orders.

### 🛡️ Admin Management Portal (`/admin`)
- **Protected Route**: Restricted exclusively to users with `role: Admin`.
- **KPI Metrics Dashboard**: Real-time business indicators (Total Revenue, Total Orders, Active Catalog Items, Categories).
- **Product Inventory Management**: Searchable data table, Create new product modal with live image URL preview, Edit specifications, and safe Delete confirmation.
- **Order Lifecycle Management**: View all customer orders and update status (*Processing* ➔ *Shipped* ➔ *Delivered* / *Cancelled*) on the fly.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@webstore.com` | `Admin@123` | Full access to Storefront + Admin Dashboard (`/admin`) |
| **Customer** | `customer@webstore.com` | `Customer@123` | Storefront, Cart, Checkout, Order History |

*(Both accounts are automatically seeded into your PostgreSQL / Supabase database on first backend run!)*

---

## 🚀 Getting Started

### 1. Database Configuration (Supabase or Local PostgreSQL)

1. Open `backend/appsettings.Development.json` (or `backend/appsettings.json`).
2. Insert your Supabase connection string:
```json
{
  "ConnectionStrings": {
    "WebApiDatabase": "Host=aws-0-ap-southeast-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.[YOUR-PROJECT-REF];Password=[YOUR-PASSWORD];SSL Mode=Require;Trust Server Certificate=true;"
  },
  "AppSettings": {
    "Token": "Ecommerce_Super_Secret_Key_For_Jwt_Auth_Token_2026_Enterprise_Secure_Key_!@#$"
  }
}
```
*(If using local PostgreSQL, set `"Host=localhost;Port=5432;Database=ecommerce_db;Username=postgres;Password=postgres;SSL Mode=Prefer;"`)*.

---

### 2. Run Backend (.NET 8 LTS)

```bash
cd backend
dotnet restore
dotnet run
```
- API will start on: **`http://localhost:57967`**
- Interactive Swagger UI: **`http://localhost:57967/swagger`**
- *Note: On startup, `DbInitializer` will automatically create all missing tables and seed 13+ flagship tech products, categories, and demo accounts!*

---

### 3. Run Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```
- Storefront will launch instantly at: **`http://localhost:5173`**
- Production bundle: `npm run build`

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/Auths` | User & Admin Login (Returns JWT + Role) | No |
| **POST** | `/api/v1/Users` | Register customer account | No |
| **GET** | `/api/v1/Products` | Get all products | No |
| **GET** | `/api/v1/Products/{id}` | Get product details by ID | No |
| **POST** | `/api/v1/Products` | Create product | **Admin (Bearer Token)** |
| **PUT** | `/api/v1/Products` | Update product | **Admin (Bearer Token)** |
| **DELETE**| `/api/v1/Products/{id}` | Delete product | **Admin (Bearer Token)** |
| **GET** | `/api/v1/Categories` | Get all categories | No |
| **POST** | `/api/v1/Orders` | Place customer order | Optional |
| **GET** | `/api/v1/Orders/my-orders`| Get authenticated user's orders | **Bearer Token** |
| **GET** | `/api/v1/Orders` | Get all customer orders | **Admin (Bearer Token)** |
| **PATCH**| `/api/v1/Orders/{id}/status`| Update order status | **Admin (Bearer Token)** |
