# Build Market – Construction Materials Store
## سوق مواد البناء لتجارة وتوريد مواد الإنشاءات والمقاولات

A complete, modern, professional, full-stack e-commerce store designed specifically for a construction materials trading business. The website allows customers to browse certified building materials (Cement, Steel Rebar, Bricks, Sand, Aggregates, Tools, etc.), add products to their shopping cart, and submit purchase orders with site delivery details. It includes a protected administrator dashboard for store and warehouse management.

---

## 🏗️ Technology Stack

- **Frontend:**
  - React.js with Vite
  - Tailwind CSS (Navy Blue `#0F172A`, Safety Construction Orange `#F97316`, White, Light Gray)
  - React Router DOM v7
  - Lucide React Icons
  - `i18next` for full bilingual support (English LTR & Arabic RTL)
  - Axios HTTP client

- **Backend:**
  - Node.js & Express.js REST API
  - MySQL with `mysql2/promise` connection pooling
  - JWT (JSON Web Tokens) authentication
  - `bcryptjs` password hashing
  - `multer` for product image uploads
  - ACID database transactions for order processing and inventory deductions

- **Database:**
  - MySQL (`building_materials_db`)
  - Ready for XAMPP / phpMyAdmin local management

---

## 🌐 Multilingual Support (Arabic & English)

- **Language Switcher:** Located in the main navigation bar.
- **Arabic (العربية):** Full RTL (`dir="rtl"`) layout, custom Cairo typography, right-aligned navigation, and accurate construction terminology.
- **English:** Full LTR (`dir="ltr"`) layout, modern Inter font, left-aligned layout.
- All customer pages, products, categories, cart, checkout, profile, and admin dashboard components are fully localized in both languages.

---

## 📦 Product Categories (9 Core Categories)

1. **Cement (إسمنت):** Ordinary Portland Cement (OPC), White Cement, Sulfate Resistant Cement (SRC).
2. **Steel and Iron (حديد وصلب):** Rebar 12mm & 16mm (Grade 60), Welded Wire Mesh.
3. **Bricks and Blocks (طوب وبلوك):** Hollow Concrete Blocks (20x20x40cm), Thermal Insulated Red Clay Bricks.
4. **Sand (رمل):** Washed Red Dune Sand (18m³ Truck), Pure Silica White Sand.
5. **Gravel and Aggregates (حصى وركام):** Crushed Rock 3/4", Subbase Road Base.
6. **Plumbing Supplies (مستلزمات سباكة):** PPR Pipes Class 5, PVC Drainage Pipes, Booster Pumps.
7. **Electrical Supplies (مستلزمات كهربائية):** Copper Cables 6mm², Main Distribution Boards (MDB).
8. **Paints (دهانات):** Weather-shield Exterior Paints, Washable Interior Acrylics.
9. **Construction Tools (أدوات بناء):** 260L Batch Mixers, Heavy Duty Wheelbarrows, 360° Laser Levels.

---

## 🔐 Credentials & Seed Accounts

All passwords in demo seed data are initialized to: **`admin123`**

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator (Owner)** | `admin@buildmarket.com` | `admin123` | Full Admin Dashboard & Customer Website |
| **Customer (Ahmed)** | `ahmed@example.com` | `admin123` | Customer Website & Order History |
| **Customer (Sarah)** | `sarah@example.com` | `admin123` | Customer Website & Order History |

---

## 🚀 Installation & Local Run Instructions

### Step 1: Start XAMPP & Create MySQL Database
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **Apache** and **MySQL**.
3. Open your browser and go to phpMyAdmin:
   ```
   http://localhost/phpmyadmin/
   ```
4. Click on **Databases** tab, type database name:
   ```
   building_materials_db
   ```
   and collation `utf8mb4_unicode_ci`, then click **Create**.
5. Select `building_materials_db`, click **Import** tab, choose the file:
   ```
   c:\Users\qusay\Downloads\BuildingMaterials\database\building_materials_db.sql
   ```
   and click **Import** (or **Go**).
   *(Alternatively, run `setup-database.bat` in the root folder).*

---

### Step 2: Start Backend Server (Port 5000)
1. Open a terminal / command prompt in `BuildingMaterials/backend`:
   ```bash
   cd backend
   npm install
   npm start
   ```
2. The backend server will start at:
   ```
   http://localhost:5000
   ```
   Verify health check at: `http://localhost:5000/api/health`

---

### Step 3: Start Frontend Website (Port 3000)
1. Open another terminal in `BuildingMaterials/frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser and access the store:
   ```
   http://localhost:3000
   ```

---

## 🛠️ Admin Dashboard Features (`/admin`)

- **Overview Dashboard:** Live KPI cards for Total Sales, Total Orders, Total Customers, Total Products, and Low-Stock Alerts.
- **Product Management:** Add new materials with bilingual names/descriptions, pricing, unit, image upload, SKU, and stock quantity. Edit and deactivate products.
- **Category Management:** Create, edit, and organize product categories.
- **Order Management:** View all incoming purchase orders with customer site details. Update status (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- **Inventory Control:** Monitor warehouse quantities, filter critical low-stock items, and perform manual stock adjustments with audit logging.
- **Financial Reports:** Daily & monthly sales aggregates, top 10 best-selling materials, and revenue by category.

---

## 📁 Project Structure

```
BuildingMaterials/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   ├── controllers/              # Business logic & SQL queries
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── customerController.js
│   │   ├── inventoryController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & Admin guards
│   │   └── upload.js             # Multer image upload
│   ├── routes/                   # REST API routes
│   ├── uploads/                  # Uploaded product photos
│   ├── .env                      # Environment config
│   ├── server.js                 # Express server entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # Axios client with JWT interceptor
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Footer, LanguageSwitcher, ProductCard
│   │   │   └── admin/            # Sidebar, Header, Modals, Status badges
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication state & role guard
│   │   │   └── CartContext.jsx   # Cart state & total calculations
│   │   ├── i18n/                 # Arabic & English translations
│   │   ├── layouts/              # Customer & Admin layout wrappers
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderSuccessPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   └── admin/            # 7 Protected Admin Pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   └── building_materials_db.sql # Full database schema & realistic seed data
│
├── API_DOCUMENTATION.md          # Complete REST API reference
└── README.md
```
