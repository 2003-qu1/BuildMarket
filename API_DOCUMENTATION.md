# Build Market – Construction Materials Store
## REST API Documentation

Base URL: `http://localhost:5000/api`

---

### Authentication Headers
For protected endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 1. Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/register`
Register a new customer account.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Eng. Khalid Al-Mansoor",
    "email": "khalid@contractor.com",
    "password": "Password123!",
    "phone": "+966555112233"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "token": "eyJhbGciOi...",
    "user": {
      "id": 4,
      "name": "Eng. Khalid Al-Mansoor",
      "email": "khalid@contractor.com",
      "phone": "+966555112233",
      "role": "customer"
    }
  }
  ```

#### `POST /api/auth/login`
Sign in as a Customer or Administrator.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@buildmarket.com",
    "password": "admin123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "Admin Qusay",
      "email": "admin@buildmarket.com",
      "phone": "+966501234567",
      "role": "admin"
    }
  }
  ```

#### `GET /api/auth/profile`
Get authenticated user profile, addresses, and order counts.
- **Access:** Customer / Admin (`Bearer Token`)

#### `PUT /api/auth/profile`
Update user name, phone, or password.
- **Access:** Customer / Admin (`Bearer Token`)

---

### 2. Product Endpoints (`/api/products`)

#### `GET /api/products`
Fetch all active products with optional filters, search, and sorting.
- **Access:** Public
- **Query Parameters:**
  - `category`: category slug or ID (e.g. `cement`, `steel-and-iron`, `1`)
  - `search`: string to search in Arabic & English names, descriptions, or SKU
  - `sort`: `price-asc`, `price-desc`, `name-asc`, `stock`, `newest`
  - `featured`: `true` / `false`
  - `minPrice`: numeric minimum price
  - `maxPrice`: numeric maximum price
  - `limit`: number of records
  - `offset`: pagination offset
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 22,
    "products": [
      {
        "id": 1,
        "sku": "CEM-001",
        "name_en": "Ordinary Portland Cement (OPC Type 1) 50kg",
        "name_ar": "أسمنت بورتلاندي عادي (نوع 1) 50 كجم",
        "price": "22.50",
        "sale_price": null,
        "stock_quantity": 450,
        "unit": "Bag",
        "category_name_en": "Cement",
        "category_name_ar": "إسمنت"
      }
    ]
  }
  ```

#### `GET /api/products/:id`
Get single product details and related products from same category.
- **Access:** Public

#### `GET /api/products/admin/all`
Get all products (including inactive and low stock items).
- **Access:** Admin only

#### `POST /api/products`
Create a new product and log initial inventory.
- **Access:** Admin only
- **Request Body:**
  ```json
  {
    "category_id": 1,
    "sku": "CEM-004",
    "name_en": "Rapid Hardening Cement 50kg",
    "name_ar": "أسمنت سريع التصلد 50 كجم",
    "description_en": "Early strength development cement...",
    "description_ar": "أسمنت عالي المقاومة المبكرة...",
    "price": 26.00,
    "sale_price": null,
    "stock_quantity": 200,
    "low_stock_threshold": 30,
    "unit": "Bag",
    "image_url": "https://images.unsplash.com/...",
    "is_featured": 1,
    "is_active": 1,
    "brand": "Yamama Cement"
  }
  ```

#### `PUT /api/products/:id`
Update an existing product. If stock is updated, logs an inventory adjustment.
- **Access:** Admin only

#### `DELETE /api/products/:id`
Delete product permanently (or deactivate if referenced by past orders).
- **Access:** Admin only

#### `POST /api/products/upload`
Upload a product image file (multipart/form-data).
- **Access:** Admin only
- **Response:**
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully.",
    "imageUrl": "/uploads/product-1731427891234.jpg"
  }
  ```

---

### 3. Category Endpoints (`/api/categories`)

#### `GET /api/categories`
Get active categories with product count.
- **Access:** Public

#### `GET /api/categories/admin/all`
Get all categories for admin management.
- **Access:** Admin only

#### `POST /api/categories`
Create category.
- **Access:** Admin only

#### `PUT /api/categories/:id`
Update category.
- **Access:** Admin only

#### `DELETE /api/categories/:id`
Delete category.
- **Access:** Admin only

---

### 4. Order Endpoints (`/api/orders`)

#### `POST /api/orders`
Submit / Place a purchase order.
- **Access:** Public or Authenticated (Optional Bearer token)
- **Features:**
  - Atomically verifies stock for each product with `SELECT ... FOR UPDATE`.
  - Calculates line totals and grand total.
  - Inserts `orders` and `order_items`.
  - Deducts `stock_quantity` from `products`.
  - Creates an audit record in `inventory` table (`order_deduct`).
- **Request Body:**
  ```json
  {
    "customer_name": "Eng. Tariq Al-Hassan",
    "customer_email": "tariq@contractor.com",
    "customer_phone": "+966551234567",
    "city": "Riyadh",
    "shipping_address": "Al-Narjis District, Project Site #14",
    "notes": "Truck delivery scheduled for 7:00 AM",
    "payment_method": "Cash on Delivery",
    "items": [
      { "id": 1, "quantity": 50 },
      { "id": 4, "quantity": 2 }
    ]
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Order placed successfully.",
    "order": {
      "id": 5,
      "order_number": "BM-20261112-7482",
      "total_amount": 6625.00,
      "status": "Pending",
      "payment_method": "Cash on Delivery"
    }
  }
  ```

#### `GET /api/orders/my-orders`
Get current customer's order history.
- **Access:** Authenticated Customer

#### `GET /api/orders/:id`
Get full order details with ordered items.
- **Access:** Customer (own order) or Admin

#### `GET /api/orders/admin/all`
Get all orders with filter by status and customer search.
- **Access:** Admin only

#### `PUT /api/orders/admin/:id/status`
Update order status (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- If status is changed to `Cancelled`, items are automatically restocked in `products` and logged in `inventory`!
- **Access:** Admin only

---

### 5. Customer Management (`/api/customers`)

#### `GET /api/customers`
List all registered customers with order counts and total spent.
- **Access:** Admin only

#### `GET /api/customers/:id`
Customer profile and order history.
- **Access:** Admin only

#### `PUT /api/customers/:id/status`
Toggle customer status (`active` / `suspended`).
- **Access:** Admin only

---

### 6. Inventory & Warehouse (`/api/inventory`)

#### `GET /api/inventory`
Live stock levels with low-stock warnings.
- **Access:** Admin only

#### `GET /api/inventory/movements`
Audit log of stock movements (initial, restock, deduction, cancellation).
- **Access:** Admin only

#### `POST /api/inventory/adjust`
Adjust stock quantity manually (Restock or Deduct).
- **Access:** Admin only
- **Request Body:**
  ```json
  {
    "productId": 1,
    "adjustmentQuantity": 100,
    "reason": "Shipment #SH-884 arrived from Yamama factory"
  }
  ```

---

### 7. Reports & Analytics (`/api/reports`)

#### `GET /api/reports/overview`
High-level KPIs: Total Sales, Total Orders, Total Customers, Total Products, Low-Stock Alerts, Recent Orders.
- **Access:** Admin only

#### `GET /api/reports/analytics`
Detailed financial reports: Daily sales, monthly revenue, top selling construction materials, and category revenue distribution.
- **Access:** Admin only
