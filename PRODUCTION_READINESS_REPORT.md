# Production-Readiness & Security Audit Report
**Project Name:** Build Market – Construction Materials Store  
**Audit Date:** November 14, 2026  
**Auditor:** Senior DevOps Engineer & Full-Stack Application Security Auditor  
**Scope:** Full-stack assessment (React/Vite Frontend, Node.js/Express REST API, MySQL Schema, Architecture & Security)  
**Overall Readiness Verdict:** **NOT READY FOR PRODUCTION** (Critical security vulnerabilities and architectural gaps must be addressed before internet deployment).

---

## Executive Summary

The **Build Market** application features a well-architected foundational codebase, clean modular separation between customer and administrative interfaces, transactional database operations for inventory deductions, and bilingual support.

However, a production-readiness inspection reveals **critical security vulnerabilities**, **data leak vectors (IDOR)**, **ephemeral file-storage limitations**, **misconfigured CORS**, and **simulated payment handling** that would lead to immediate compromise, data loss, or service outage if exposed to the public internet in its current state.

This report documents all findings across 12 audit categories, details the exact code locations involved, and provides a clear deployment blueprint.

---

## Table of Contents
1. [Frontend Production Build Readiness](#1-frontend-production-build-readiness)
2. [Backend Production Readiness](#2-backend-production-readiness)
3. [MySQL Production Database Requirements](#3-mysql-production-database-requirements)
4. [Environment Variables Matrix](#4-environment-variables-matrix)
5. [API URL Configuration & CORS Settings](#5-api-url-configuration--cors-settings)
6. [JWT Security & Authentication Configuration](#6-jwt-security--authentication-configuration)
7. [Image Upload & Storage Architecture](#7-image-upload--storage-architecture)
8. [Database Backup & Restoration Procedures](#8-database-backup--restoration-procedures)
9. [Security Vulnerabilities & Exposed Credentials](#9-security-vulnerabilities--exposed-credentials)
10. [Payment Integration Status (Real vs. Simulated)](#10-payment-integration-status-real-vs-simulated)
11. [Separate Frontend & Backend Hosting Feasibility](#11-separate-frontend--backend-hosting-feasibility)
12. [Required Code Changes Before Deployment](#12-required-code-changes-before-deployment)
13. [Recommended Production Deployment Architecture](#13-recommended-production-deployment-architecture)

---

## 1. Frontend Production Build Readiness

### Current Status: ⚠️ PARTIALLY READY (Build succeeds, but requires optimizations and routing configurations)

- **Build Test:** Running `npm run build` in `frontend/` succeeds in **4.55s**, generating static assets in `frontend/dist/`.
- **Bundle Analysis:**
  - `dist/index.html`: `1.32 kB`
  - `dist/assets/index-BR1cKr6F.css`: `36.53 kB`
  - `dist/assets/index-DiJUhLje.js`: `512.30 kB` (gzip: `142.83 kB`)

### Identified Issues:
1. **Monolithic Bundle (Chunk Size Warning):**
   - The main JavaScript bundle exceeds Vite’s recommended `500 kB` threshold.
   - All 7 Admin Dashboard pages (`AdminDashboard`, `AdminProducts`, `AdminCategories`, `AdminOrders`, `AdminCustomers`, `AdminInventory`, `AdminReports`) are bundled together with public customer pages.
   - **Risk:** Regular customers download administrator dashboard code, increasing initial load latency and unnecessarily exposing admin component structures in client bundles.
2. **SPA Routing Fallback Missing on Static Hosts:**
   - As a single-page application using `react-router-dom`, direct navigation or refreshing on deep routes (`/products`, `/cart`, `/admin/orders`) on standard web servers (Nginx, Apache, S3, Netlify, Vercel) will return **404 Not Found** unless rewrite rules are configured to redirect all non-file requests to `/index.html`.
3. **HTTP Caching Configuration:**
   - Static assets with content hashes (`assets/index-*.js`) should be served with immutable cache headers (`Cache-Control: public, max-age=31536000, immutable`).
   - `index.html` must be served with `Cache-Control: no-cache` so users receive updates immediately upon new deployments.

---

## 2. Backend Production Readiness

### Current Status: ❌ NOT READY FOR PRODUCTION

### Identified Issues:
1. **Missing Process Management:**
   - The application is currently started using `node server.js` directly. In a production Linux/cloud environment:
     - Uncaught exceptions or memory spikes will terminate the entire process with no auto-restart.
     - Single-threaded Node.js cannot utilize multi-core CPU instances without a process manager like **PM2** (cluster mode) or Kubernetes/Docker orchestration.
2. **Missing Essential Production Security Middlewares:**
   - **No HTTP Security Headers:** `helmet` is not installed or configured. The app lacks `Content-Security-Policy`, `X-Frame-Options` (clickjacking protection), `Strict-Transport-Security` (HSTS), and `X-Content-Type-Options`.
   - **No Rate Limiting:** `express-rate-limit` is not implemented. The `/api/auth/login`, `/api/auth/register`, and `/api/orders` endpoints are susceptible to credential stuffing, brute-force attacks, and automated order spam.
   - **No Payload Compression:** `compression` (Gzip/Brotli) is not enabled, leading to increased bandwidth consumption on large JSON payloads (e.g., catalog queries and sales reports).
3. **Logging & Observability:**
   - Logs rely solely on unformatted `console.log` and `console.error`.
   - No structured logging (e.g., Winston, Pino) with log levels (`INFO`, `WARN`, `ERROR`), timestamps, correlation IDs, or centralized log ingestion (Datadog, CloudWatch, Logstash).
   - No HTTP request access logger (e.g., `morgan`).
4. **No Graceful Shutdown Handling:**
   - When a hosting provider sends a `SIGTERM` or `SIGINT` signal (during auto-scaling, rolling updates, or maintenance), the server cuts off immediately, terminating in-flight database transactions and active customer checkouts midway.
5. **Node.js Environment Switch:**
   - `NODE_ENV` is set to `development`. In production, Express must run with `NODE_ENV=production` to enable view caching, disable verbose stack traces in error responses, and optimize performance.

---

## 3. MySQL Production Database Requirements

### Current Status: ❌ CONFIGURED FOR LOCAL XAMPP ONLY

### Identified Requirements & Deficiencies:
1. **Privilege Separation (Root User Risk):**
   - The current configuration uses the `root` administrative user with no password (`DB_USER=root`, `DB_PASSWORD=`).
   - In production, a dedicated database user (e.g., `buildmarket_app`) must be created with the least privilege required (`SELECT, INSERT, UPDATE, DELETE`). Administrative privileges (`DROP, ALTER, GRANT, SUPER`) must be denied to the application user.
2. **Mandatory SSL/TLS Encryption:**
   - `backend/config/db.js` creates a pool without SSL configurations (`ssl: false`).
   - Managed cloud databases (AWS RDS, PlanetScale, DigitalOcean Managed MySQL, Google Cloud SQL, Azure Database for MySQL) mandate TLS connections. Without SSL, either the connection will be rejected or database credentials and customer records will travel across the internet in plain text.
3. **Connection Pool Sizing:**
   - The pool is statically configured to `connectionLimit: 15`.
   - On containerized or multi-instance deployments (e.g., 4 cluster instances), `4 × 15 = 60` connections will quickly exhaust database limits on smaller database tiers. The connection limit must be parameterized via `DB_CONNECTION_LIMIT`.
4. **Database Collation & Indexing:**
   - Schema uses `utf8mb4` with `utf8mb4_unicode_ci`, which properly supports Arabic text and emojis.
   - Foreign key constraints with `ON DELETE RESTRICT` for products and `ON DELETE CASCADE` for order items are configured properly.

---

## 4. Environment Variables Matrix

The following environment variables are required across environments:

### Backend Variables (`backend/.env`)

| Variable | Required In Production | Sample Production Value | Description |
|---|:---:|---|---|
| `NODE_ENV` | **YES** | `production` | Enables Express production optimizations |
| `PORT` | **YES** | `5000` (or assigned by host) | Port the HTTP server listens on |
| `FRONTEND_URL` | **YES** | `https://buildmarket.com` | Allowed CORS origin (comma-separated for multi-domain) |
| `DB_HOST` | **YES** | `db-mysql-fra1-xxxxx.managed.com` | Managed MySQL host address |
| `DB_PORT` | **YES** | `3306` | Managed MySQL port |
| `DB_USER` | **YES** | `buildmarket_prod_user` | Dedicated MySQL user (non-root) |
| `DB_PASSWORD` | **YES** | `[REDACTED_HIGH_ENTROPY_PASSWORD]` | Strong password (min 24 chars) |
| `DB_NAME` | **YES** | `building_materials_db` | Production database name |
| `DB_SSL` | **YES** | `true` | Enforces SSL/TLS for MySQL connection |
| `DB_CONNECTION_LIMIT`| NO | `20` | Max simultaneous pool connections |
| `JWT_SECRET` | **YES** | `[REDACTED_RANDOM_256BIT_SECRET]` | Cryptographically secure secret (min 64 chars) |
| `JWT_EXPIRES_IN` | **YES** | `7d` (or `24h` recommended) | Access token expiration period |
| `STORAGE_DRIVER` | **YES** | `s3` (or `local` with persistent volume) | Defines where uploaded media is stored |
| `AWS_ACCESS_KEY_ID` | Optional* | `AKIAIOSFODNN7EXAMPLE` | Required if using S3/R2 storage |
| `AWS_SECRET_ACCESS_KEY` | Optional* | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | Required if using S3/R2 storage |
| `AWS_REGION` | Optional* | `me-central-1` (or `eu-west-1`) | Cloud storage bucket region |
| `AWS_BUCKET_NAME` | Optional* | `buildmarket-prod-uploads` | S3 / R2 Bucket name |
| `CDN_URL` | Optional* | `https://cdn.buildmarket.com` | CloudFront / Cloudflare CDN base URL |

*\*Required if using Cloud Object Storage (S3 / Cloudflare R2 / Google Cloud Storage).*

### Frontend Variables (`frontend/.env`)

| Variable | Required In Production | Sample Production Value | Description |
|---|:---:|---|---|
| `VITE_API_BASE_URL` | **YES** | `https://api.buildmarket.com/api` | Public URL of the backend REST API |

> [!WARNING]
> In Vite, `import.meta.env.VITE_*` variables are statically embedded into client JavaScript bundles **at build time**. If `npm run build` is run while `VITE_API_BASE_URL=http://localhost:5000/api`, the production website will fail for all internet visitors.

---

## 5. API URL Configuration & CORS Settings

### Current Status: ❌ CRITICAL SECURITY FLAW & MISCONFIGURATION

#### A. CORS Misconfiguration (`backend/server.js:14-17`)
```javascript
// Current code in backend/server.js:
app.use(cors({
  origin: true, // Allow frontend during development
  credentials: true
}));
```
- **Vulnerability (CWE-942 / OWASP A01):** Setting `origin: true` dynamically reflects the `Origin` header from any incoming HTTP request while setting `Access-Control-Allow-Credentials: true`.
- **Impact:** Any malicious website visited by a logged-in administrator or customer can execute authenticated AJAX requests against the API and exfiltrate customer names, phone numbers, addresses, and order history.
- **Required Fix:** Restrict origins strictly to an approved whitelist using `FRONTEND_URL`.

#### B. Frontend API URL Hardcoding (`frontend/.env:1` & `frontend/src/api/client.js:3`)
```javascript
// Current code in frontend/src/api/client.js:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```
- In `frontend/.env`, the value is set to `http://localhost:5000/api`.
- When deployed on separate platforms (e.g., Frontend on Vercel, Backend on AWS EC2), the frontend will attempt to connect to `localhost:5000` on the end-user's device, causing instant connection failures.
- **Mixed Content Warning:** If the frontend is served via HTTPS (`https://buildmarket.com`) and points to an insecure HTTP API (`http://api.buildmarket.com`), modern browsers will block all requests due to browser Mixed Content policies. Both frontend and backend must use HTTPS.

---

## 6. JWT Security & Authentication Configuration

### Current Status: ❌ HIGH RISK (Hardcoded Fallback Secret & LocalStorage Storage)

#### A. Hardcoded Fallback Secret (`backend/middleware/auth.js:21 & :83`)
```javascript
// Current code in backend/middleware/auth.js:
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'build_market_super_secret_jwt_token_key_2026_xyz');
```
- **Vulnerability:** If `process.env.JWT_SECRET` is not set on the hosting server, the application silently defaults to the hardcoded string committed to the repository.
- **Impact:** An attacker can forge arbitrary JWT tokens with `{ role: "admin", userId: 1 }` and bypass all authentication completely.
- **Required Fix:** The server must validate that `process.env.JWT_SECRET` exists on startup and throw a fatal error if missing or shorter than 32 characters.

#### B. Storage of JWT in Browser `localStorage` (`frontend/src/api/client.js:15` & `frontend/src/context/AuthContext.jsx:31`)
- **Vulnerability:** Storing authentication tokens in `localStorage` makes them accessible to any JavaScript code executing on the page (including third-party scripts, analytics, or Cross-Site Scripting (XSS) vectors).
- **Production Standard:** For e-commerce and administrative applications, authentication tokens should preferably be stored in `httpOnly`, `Secure`, `SameSite=Strict` cookies, completely blocking client-side JavaScript access.

#### C. Long Expiration Period (7 Days) without Revocation:
- Tokens are valid for 7 days (`JWT_EXPIRES_IN=7d`).
- If an admin token is intercepted, the attacker retains access for a full week, even if the admin changes their password, because no token invalidation or blocklist (e.g., in Redis) exists.

---

## 7. Image Upload & Storage Architecture

### Current Status: ❌ ARCHITECTURALLY INCOMPATIBLE WITH CLOUD DEPLOYMENTS

### The Problem:
1. **Ephemeral Filesystem on Modern Cloud Hosts:**
   - In `backend/middleware/upload.js`, Multer stores uploaded files in `path.join(__dirname, '..', 'uploads')`.
   - On PaaS providers (Render, Heroku, Railway, Fly.io, AWS ECS Fargate, Google Cloud Run), the local disk is **ephemeral**. Every time the application auto-scales, restarts, or deploys a new commit, the local filesystem is reset to the Git state.
   - **Result:** All product photos uploaded by the store owner will be permanently lost.
2. **Relative URLs on Separate Frontend/Backend Hosting:**
   - In `backend/controllers/productController.js:409`:
     ```javascript
     const imageUrl = `/uploads/${req.file.filename}`;
     ```
   - When the frontend is hosted on `https://buildmarket.com` and the backend is on `https://api.buildmarket.com`, the frontend requests `https://buildmarket.com/uploads/...` which returns a 404 because the frontend server does not possess the file.
3. **Local Disk Exhaustion:**
   - No image resizing, optimization, or WebP conversion occurs before disk storage. High-resolution photos taken on modern mobile devices (5MB–15MB each) will rapidly consume server storage.

### Production Solution:
- Integrate **Cloud Object Storage** (AWS S3, Cloudflare R2, or Google Cloud Storage) using `multer-s3` or presigned URLs.
- Store the absolute CDN URL (`https://cdn.buildmarket.com/products/...`) in the database.

---

## 8. Database Backup & Restoration Procedures

### Current Status: ⚠️ MANUAL PROCEDURES ONLY

Currently, the project only provides a local Windows batch script (`setup-database.bat`) that calls local XAMPP `mysql.exe`. In production, automated backup and recovery mechanisms are mandatory.

### Recommended Backup Strategy:
1. **Automated Daily Backups:** Configure daily logical backups via `mysqldump` and automated snapshots via the cloud database provider.
2. **Point-In-Time Recovery (PITR):** Enable MySQL binary logging (`binlog`) with a minimum 7-day retention window to allow recovery to the exact second prior to any catastrophic corruption or accidental deletion.

### Production Backup Script (Linux Bash):
```bash
#!/bin/bash
# /opt/scripts/backup-database.sh
set -e

BACKUP_DIR="/var/backups/mysql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/building_materials_db_${TIMESTAMP}.sql.gz"

mkdir -p ${BACKUP_DIR}

# Perform compressed mysqldump with single-transaction for InnoDB consistency
mysqldump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  "${DB_NAME}" | gzip -9 > "${BACKUP_FILE}"

# Upload encrypted backup to isolated AWS S3 cold storage
aws s3 cp "${BACKUP_FILE}" "s3://${BACKUP_S3_BUCKET}/mysql/${TIMESTAMP}.sql.gz" --sse AES256

# Prune local backups older than 7 days
find ${BACKUP_DIR} -name "*.sql.gz" -type f -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}"
```

### Production Restoration Procedure:
```bash
# 1. Download target backup
aws s3 cp "s3://${BACKUP_S3_BUCKET}/mysql/20261114_030000.sql.gz" ./restore.sql.gz

# 2. Decompress and restore into database
gunzip < restore.sql.gz | mysql \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USER}" \
  --password="${DB_PASSWORD}" \
  "${DB_NAME}"
```

---

## 9. Security Vulnerabilities & Exposed Credentials

A comprehensive code audit identified **five high-severity vulnerabilities**:

### Vulnerability 1: Hardcoded Authentication Backdoor (CRITICAL)
- **File:** `backend/controllers/authController.js` (Lines 122–125)
- **Code:**
  ```javascript
  // Fallback convenience for demo environment if someone uses plain password directly
  if (!isMatch && (password === 'admin123' || password === 'customer123') && user.password.startsWith('$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW')) {
    isMatch = true;
  }
  ```
- **Risk:** This is a hardcoded authentication bypass. Anyone who knows this code exists can sign into any account that has this initial hash using the plain text password `admin123` or `customer123`.
- **Fix:** Remove this entire `if` statement block immediately. All password verifications must strictly go through `bcrypt.compare()`.

### Vulnerability 2: Admin Credentials Exposed on Public UI (HIGH)
- **Files:**
  - `frontend/src/pages/LoginPage.jsx` (Lines 119–148): Displays a "Quick Demo Credentials" card with the admin email (`admin@buildmarket.com`) and password (`admin123`) with an automated "Fill" button.
  - `frontend/src/components/common/Footer.jsx` (Line 125): Links to the login page displaying the text `Admin Demo: admin@buildmarket.com / admin123`.
  - `frontend/src/i18n/en.json` & `ar.json`: Contains the admin credentials inside public translation JSON bundles.
- **Risk:** Any visitor on the internet can click the button, log in as Super Admin, delete products, modify prices, and cancel customer orders.
- **Fix:** Strip the demo credential box and footer notice completely from production builds.

### Vulnerability 3: IDOR / Unauthenticated Customer Data Leak (HIGH)
- **File:** `backend/controllers/orderController.js` (Lines 223–242)
- **Code:**
  ```javascript
  async function getOrderDetails(req, res) {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user && req.user.role === 'admin';

    let orderQuery = 'SELECT * FROM orders WHERE id = ? OR order_number = ?';
    let params = [id, id];

    if (!isAdmin && userId) {
      orderQuery += ' AND user_id = ?';
      params.push(userId);
    }

    const [orders] = await pool.query(orderQuery, params);
  ```
- **Vulnerability:** Notice the condition: `if (!isAdmin && userId)`. If an unauthenticated user makes a request (`userId === null`), this condition evaluates to `false`!
- **Impact:** An unauthenticated visitor can query `/api/orders/1`, `/api/orders/2`, `/api/orders/3` and receive full customer names, phone numbers, email addresses, delivery site coordinates, and order items.
- **Fix:** If the requester is not an admin, require authentication and verify that `user_id === req.user.id`. For guest orders, lookup must require a secure random token or both order number and matching phone number.

### Vulnerability 4: Open CORS with Enabled Credentials (HIGH)
- **File:** `backend/server.js` (Line 14)
- **Detail:** Discussed in [Section 5](#5-api-url-configuration--cors-settings). Allows cross-origin credential harvesting.

### Vulnerability 5: Unbounded File Uploads & Missing Extension Renaming (MEDIUM)
- **File:** `backend/middleware/upload.js`
- **Detail:** While MIME types are checked, the file is not checked for embedded executable scripts (polyglot files), and SVG files (which can contain embedded JavaScript vectors) should be explicitly excluded.

---

## 10. Payment Integration Status (Real vs. Simulated)

### Current Status: ℹ️ ONLY SIMULATED / MANUAL ORDER RESERVATION

### Findings:
1. **No External Payment Gateway Integrated:**
   - In `backend/package.json`, there are no payment SDKs installed (e.g., `stripe`, `@moyasar/core`, `checkout-sdk-node`, `paypal-rest-sdk`, or `hyperpay`).
2. **Database Workflow:**
   - When a customer selects "Credit Card" or "Bank Transfer" or "Cash on Delivery" on the checkout page, the application creates an entry in the `payments` table with `status = 'Pending'`.
   - No payment modal opens, no card details are collected, and no bank redirection occurs.
3. **Operational Implication:**
   - The platform currently operates strictly as a **Purchase Order / Request-for-Quote (RFQ)** system.
   - For a construction trading business, this model is frequently used (site delivery with Cash on Delivery or official corporate bank transfer upon invoice inspection).
   - **However:** If you intend to accept online card payments (Mada, Visa, Mastercard) over the internet, a certified Payment Gateway (such as **Moyasar**, **Tap Payments**, or **Stripe**) must be integrated with webhook validation before production launch.

---

## 11. Separate Frontend & Backend Hosting Feasibility

### Current Status: ✅ ARCHITECTURALLY SUPPORTED (With Configuration Adjustments)

The project cleanly separates frontend and backend folders. You can deploy them independently:

- **Frontend Hosting Options:** Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront.
- **Backend Hosting Options:** Render, Railway, DigitalOcean App Platform, AWS EC2, Fly.io.

### Prerequisite Adjustments for Separate Hosting:
1. **CORS:** The backend must specify the exact frontend domain:
   ```javascript
   app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
   ```
2. **Environment URL:** The frontend build command must inject:
   ```env
   VITE_API_BASE_URL=https://api.buildmarket.com/api
   ```
3. **Asset URLs:** Uploaded images must be served from an absolute cloud storage URL (`https://cdn.buildmarket.com/...`) rather than relative backend paths (`/uploads/...`).
4. **HTTPS:** Both domains must use SSL certificates (e.g. Let's Encrypt or Cloudflare TLS) to prevent Mixed Content blocking.

---

## 12. Required Code Changes Before Deployment

### Critical Priority (Must Fix Before Launch)
1. **Remove Backdoor Bypass in `backend/controllers/authController.js`:** Delete lines 122–125.
2. **Remove Demo Credentials from Frontend:** Remove lines 119–148 in `frontend/src/pages/LoginPage.jsx` and line 125 in `frontend/src/components/common/Footer.jsx`.
3. **Fix IDOR Vulnerability in `backend/controllers/orderController.js`:** Require authorization or order access key verification in `getOrderDetails`.
4. **Lock Down CORS in `backend/server.js`:** Replace `origin: true` with strict whitelist from `process.env.FRONTEND_URL`.
5. **Enforce `JWT_SECRET` Presence:** Throw an error on server startup if `process.env.JWT_SECRET` is unset.
6. **Migrate Uploads to Cloud Storage:** Replace Multer `diskStorage` with S3/R2 cloud bucket storage.

### High Priority (Stability & Hardening)
1. **Add Security Middlewares in `backend/`:** Install and configure `helmet`, `compression`, and `express-rate-limit`.
2. **Enable MySQL SSL in `backend/config/db.js`:** Add SSL support for managed cloud databases.
3. **Implement SPA Rewrite Rules on Frontend Host:** Configure `_redirects` (Netlify), `vercel.json` (Vercel), or `nginx.conf`.
4. **Add Code Splitting in `frontend/src/App.jsx`:** Use `React.lazy()` for admin dashboard routes to reduce bundle size.

### Medium Priority (Operational Quality)
1. **Replace `console.log` with Structured Logger:** Integrate `pino` or `winston`.
2. **Implement Graceful Shutdown:** Listen to `SIGTERM` and `SIGINT` to close Express server and MySQL connection pool cleanly.
3. **Add Database Health Check:** Ensure `/api/health` validates database connectivity before responding.

---

## 13. Recommended Production Deployment Architecture

```mermaid
flowchart TD
    User["Client Browser (Desktop / Mobile)"] -->|HTTPS (Port 443)| Cloudflare["Cloudflare CDN & WAF / DDoS Protection"]
    
    subgraph Frontend_Tier["Frontend Tier (Vercel / Cloudflare Pages)"]
        Cloudflare -->|Static HTML / CSS / JS Chunks| StaticHosting["React Vite SPA Static Distribution"]
    end

    subgraph Backend_Tier["Backend Tier (Render / Railway / AWS EC2 / Docker)"]
        Cloudflare -->|REST API Requests: /api/*| APIGateway["Express.js Server (Node.js Cluster / PM2)"]
        APIGateway --> Helmet["Security Headers (Helmet)"]
        Helmet --> RateLimiter["Rate Limiter (Express-Rate-Limit)"]
        RateLimiter --> AuthMiddleware["JWT Verification & Role Guard"]
    end

    subgraph Media_Storage["Media Storage Tier"]
        APIGateway -->|Upload Media| S3Bucket["Cloud Object Storage (AWS S3 / Cloudflare R2)"]
        S3Bucket -->|Fast Image Delivery| Cloudflare
    end

    subgraph Database_Tier["Database Tier (Managed MySQL 8.0)"]
        APIGateway -->|Encrypted TLS / SSL Connection| CloudMySQL["Managed MySQL Database (AWS RDS / DigitalOcean)"]
        CloudMySQL -->|Automated Daily Snapshots & PITR| ColdBackups["Encrypted S3 Backup Bucket"]
    end
```

---

## Verification Summary Against Your Checklist

| Verification Requirement | Audit Result | Status |
|---|---|:---:|
| **Does frontend depend on localhost API URLs in production?** | Currently configured with `VITE_API_BASE_URL=http://localhost:5000/api` in `.env`. Must be changed at build time to production domain. | ⚠️ Action Required |
| **Are database credentials exposed in frontend code?** | Checked all frontend source files. **No database credentials** exist in client code. | ✅ Verified Secure |
| **Are admin routes properly protected?** | Protected by `authenticateToken` and `requireAdmin` on backend routes and `AdminProtectedRoute` on frontend. | ✅ Verified Secure |
| **Is customer data handled securely?** | Customer order queries have an IDOR leak on `/api/orders/:id` for unauthenticated requests. Must be patched. | ❌ Security Fix Required |
| **Will uploaded product images remain available after deployment?** | Local disk storage will lose files on container restarts or PaaS redeployments. Cloud bucket storage required. | ❌ Architecture Fix Required |

---
*Report generated and saved to [`PRODUCTION_READINESS_REPORT.md`](file:///c:/Users/qusay/Downloads/BuildingMaterials/PRODUCTION_READINESS_REPORT.md). No project code files have been modified.*
