# Free-Tier Production Deployment Audit & Blueprint

**Project:** Build Market – Construction Materials E-Commerce Platform  
**Target Stack:**
- **Frontend:** Cloudflare Pages (React + Vite + Tailwind CSS)
- **Backend:** Render Free Web Service (Node.js + Express)
- **Database:** TiDB Cloud Serverless (MySQL-compatible)
- **Source Control:** GitHub
**Date:** November 15, 2026  
**Auditor:** Senior DevOps & Cloud Infrastructure Engineer  
**Status:** **NOT READY FOR PRODUCTION WITHOUT CRITICAL CODE & ARCHITECTURAL ADJUSTMENTS**

---

## 1. Executive Summary & Readiness Verdict

| Component | Target Service | Current Readiness | Blockers / Critical Requirements |
| :--- | :--- | :---: | :--- |
| **Source Control** | GitHub | ❌ **Blocked** | No `.gitignore` file exists. Initial commit would push secrets (`.env`), portable Windows binaries (`tools/` > 100MB), and `node_modules/`. |
| **Frontend** | Cloudflare Pages | ⚠️ **Needs Config** | Builds cleanly (`dist/`), but lacks SPA fallback (`_redirects`), requires production API base URL injection, and admin bundle code splitting. |
| **Backend** | Render Free Web Service | ⚠️ **Needs Changes** | Requires `engines` definition, production CORS hardening, TiDB SSL support, and mitigation for 15-minute cold starts. |
| **Database** | TiDB Cloud Serverless | ⚠️ **Needs SSL** | MySQL schema is largely compatible, but `mysql2` pool lacks mandatory SSL/TLS configuration (`ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }`). |
| **Image Storage** | Ephemeral / Disk | ❌ **Non-Viable** | Render free tier disks are ephemeral. **Uploaded images will be permanently wiped on every restart or idle spin-down.** Requires external cloud storage (Cloudinary or Cloudflare R2). |
| **API Security** | Node.js / Express | ❌ **Vulnerable** | Critical IDOR vulnerability in guest order retrieval; hardcoded demo password bypass in `authController.js`; permissive `cors({ origin: true })`. |

---

## 2. Comprehensive 12-Point Technical Audit

### Point 1: Frontend Production Build Configuration
- **Build Status:** Verified via `npm run build`. Compiles successfully in ~32 seconds into `frontend/dist/`.
- **Assets Generated:**
  - `dist/index.html` (1.32 kB)
  - `dist/assets/index-BR1cKr6F.css` (36.53 kB)
  - `dist/assets/index-DiJUhLje.js` (512.30 kB)
- **Cloudflare Pages Routing Issue:** The app uses `react-router-dom` in `BrowserRouter` mode. When hosted on Cloudflare Pages, direct navigation or browser refresh on non-root paths (`/products`, `/cart`, `/admin/*`) will return HTTP **404 Not Found** because Cloudflare Pages searches for static files.
  - *Fix:* Must place a `_redirects` file in `frontend/public/` with rule: `/* /index.html 200`.
- **Bundle Optimization:** The single JavaScript bundle exceeds Vite’s recommended 500 kB chunk limit. Heavy admin dashboard pages should use `React.lazy()` so public shoppers do not download admin code.

### Point 2: Backend Deployment Configuration
- **Runtime:** Node.js 20.x, Express 4.21.2.
- **Port Handling:** `backend/server.js` uses `process.env.PORT || 5000`. Render injects its own `PORT` variable (typically 10000), which will be bound properly.
- **Process Management:** Render manages the container lifecycle. In `backend/package.json`, specify `"engines": { "node": ">=20.0.0" }` to ensure Render selects the correct LTS runtime.
- **Root Directory:** In Render Web Service settings, the Root Directory must be set to `backend` with Build Command `npm install` and Start Command `node server.js`.

### Point 3: Localhost URLs to Replace
The following occurrences of `localhost` must be replaced or parameterized:
1. **Frontend API Client (`frontend/.env` & `frontend/src/api/client.js`):**
   - Current: `VITE_API_BASE_URL=http://localhost:5000/api`
   - Production (Cloudflare Pages): `VITE_API_BASE_URL=https://<your-render-app>.onrender.com/api`
2. **Vite Dev Proxy (`frontend/vite.config.js`):**
   - Proxies `/api` and `/uploads` to `http://localhost:5000`. This is dev-only and does not affect production builds, but relative image URLs in code will break in production without an absolute storage URL or proxy.
3. **Backend Database Host (`backend/.env` & `backend/config/db.js`):**
   - Current: `DB_HOST=localhost`, `DB_PORT=3306`
   - Production: Set to TiDB Cloud Host (`gateway01.us-east-1.prod.aws.tidbcloud.com`), `DB_PORT=4000`.

### Point 4: MySQL Compatibility with TiDB Cloud
- **Wire Protocol:** TiDB Cloud Serverless is wire-compatible with MySQL 5.7 and MySQL 8.0.
- **SSL/TLS Requirement:** **CRITICAL.** TiDB Cloud Serverless rejects any unencrypted connection. `backend/config/db.js` currently does not specify SSL options.
  - *Fix:* Must add `ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }` in `mysql.createPool()`.
- **Collation:** `database/building_materials_db.sql` specifies `utf8mb4_unicode_ci`. TiDB natively supports `utf8mb4_bin` (default) and `utf8mb4_general_ci`. For optimal performance and compatibility in TiDB Serverless, use `utf8mb4` with `utf8mb4_general_ci` or default.
- **Distributed Auto-Increment:** TiDB uses distributed `AUTO_INCREMENT`. IDs are guaranteed unique and increasing, but consecutive sequential numbers (1, 2, 3...) may have gaps across distributed transactions. The application does not rely on gapless IDs.

### Point 5: Database Schema & SQL Migration Requirements
- **Structure:** 9 relational tables (`users`, `admins`, `categories`, `products`, `addresses`, `orders`, `order_items`, `payments`, `inventory`).
- **Foreign Keys:** Handled with standard `ON DELETE CASCADE`, `ON DELETE RESTRICT`, and `ON DELETE SET NULL`. Fully valid in TiDB Serverless.
- **Migration Execution:** The existing file `database/building_materials_db.sql` can be imported directly into TiDB Cloud using the TiDB Cloud Web SQL Editor or standard MySQL CLI command.

### Point 6: JWT Authentication & Environment Variables
- **Current Vulnerability:** In `backend/middleware/auth.js` (lines 21 & 83) and `backend/controllers/authController.js` (line 13), there is a fallback to a hardcoded secret:
  `process.env.JWT_SECRET || 'build_market_super_secret_jwt_token_key_2026_xyz'`
  If `JWT_SECRET` is accidentally omitted in Render's environment settings, tokens will be signed with the publicly readable key.
  - *Fix:* Throw an error during application startup if `process.env.JWT_SECRET` is undefined or weak in `NODE_ENV=production`.
- **Token Validity:** Default `7d` expiration is set via `JWT_EXPIRES_IN`.

### Point 7: CORS Configuration
- **Current Vulnerability:** `backend/server.js` lines 14-17:
  ```javascript
  app.use(cors({
    origin: true,
    credentials: true
  }));
  ```
  `origin: true` dynamically mirrors any requesting `Origin` header. Any origin can trigger authenticated requests.
- **Production Fix:** Restrict origins via environment variable:
  ```javascript
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:3000'];
  
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true
  }));
  ```

### Point 8 & 9: Image Upload Storage & Render Restarts
- **Current Architecture:** `multer.diskStorage` saves uploaded images to the local directory `backend/uploads/`.
- **Render Free Tier Reality:** **Render Free Web Services use ephemeral container disks.**
  - Whenever Render spins down (after 15 minutes of inactivity), restarts, or redeploys a new commit, **the entire local filesystem is completely reset**.
  - **Result:** Any image uploaded by the admin will be permanently erased. Product images will immediately return HTTP 404.
- **Cloudflare Pages Separation Issue:** Cloudflare Pages hosts the frontend at `https://buildmarket.pages.dev`. The frontend expects `/uploads/<file>` locally if relative paths are stored.
- **Recommended Free Solution:** Integrate **Cloudinary Free Tier** (25 GB storage, global CDN, auto-format optimization) using `multer-storage-cloudinary`, or **Cloudflare R2 Free Tier** (10 GB storage, zero egress fees).

### Point 10: Database Transactions Verification
- **Audit:** `orderController.js` (`createOrder`) and `productController.js` (`createProduct`, `updateProduct`) use proper database transaction workflows:
  - Connection acquired from pool (`pool.getConnection()`).
  - `beginTransaction()` invoked.
  - Pessimistic locking: `SELECT ... FOR UPDATE` is used in `createOrder` to prevent inventory race conditions.
  - Inventory audit trail (`inventory` table) recorded atomically with order creation.
  - `commit()` on success, `rollback()` on failure.
  - `connection.release()` strictly guaranteed in `finally {}` blocks.
- **TiDB Compatibility:** TiDB supports pessimistic transactions by default (v3.0.8+). Row-level locking with `SELECT ... FOR UPDATE` behaves correctly.

### Point 11: Admin Authentication & Authorization
- **Role Verification:** `requireAdmin` middleware checks `req.user.role === 'admin'`. Routes under `/api/customers`, `/api/inventory`, `/api/reports`, and admin operations under `/api/products`, `/api/categories`, and `/api/orders` are guarded.
- **CRITICAL BACKDOOR FINDING:** In `backend/controllers/authController.js` (lines 122-126):
  ```javascript
  // Fallback convenience for demo environment if someone uses plain password directly
  if (!isMatch && (password === 'admin123' || password === 'customer123') && user.password.startsWith('$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW')) {
    isMatch = true;
  }
  ```
  This creates an unauthenticated password bypass backdoor in production. **Must be removed immediately.**

### Point 12: Security Risks & Exposed Credentials
1. **Missing `.gitignore` (HIGH SEVERITY):** No `.gitignore` file exists in the repository. Committing now will push:
   - `backend/.env` (leaks JWT secrets & database credentials).
   - `frontend/.env`.
   - `tools/nodejs/` (> 100MB portable Windows binary, violates GitHub file limit).
   - `node_modules/` in both backend and frontend.
2. **Critical IDOR in Order Details (`orderController.js` line 229-237):**
   ```javascript
   let orderQuery = 'SELECT * FROM orders WHERE id = ? OR order_number = ?';
   let params = [id, id];

   if (!isAdmin && userId) {
     orderQuery += ' AND user_id = ?';
     params.push(userId);
   }
   ```
   If a request is unauthenticated (`userId == null`), the condition `!isAdmin && userId` is **falsy**. The query executes without checking ownership! Anyone can scrape customer names, addresses, phone numbers, and purchased items for every order by looping `GET /api/orders/1`, `GET /api/orders/2`.
   - *Fix:* If `!isAdmin && !userId`, reject the request with `401 Unauthorized` or require matching customer email/phone verification for guest order lookup.
3. **Hardcoded Seed Credentials:**
   Default admin `admin@buildmarket.com` with password `admin123` is public in `database/building_materials_db.sql`. Production admin credentials must be generated freshly with a strong password.

---

## 3. Required Code Changes (Exact Blueprint)

Do not apply these changes until approved. These represent the exact modifications needed.

### 3.1 Create `.gitignore` at Project Root
```gitignore
# Dependencies
node_modules/
*/node_modules/

# Environment Variables
.env
.env.local
.env.production
*/.env
*/.env.local
*/.env.production

# Build Artifacts
dist/
*/dist/
build/
*/build/

# Ephemeral uploads & cache
uploads/
*/uploads/
.cache/
*.log

# Windows portable tools & IDE files
tools/
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.DS_Store
Thumbs.db
```

### 3.2 Add SPA Routing Redirect for Cloudflare Pages
Create `frontend/public/_redirects`:
```text
/*    /index.html   200
```

### 3.3 Update `backend/config/db.js` for TiDB SSL
Modify connection pool parameters:
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'building_materials_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' 
    ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } 
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  charset: 'utf8mb4'
});
```

### 3.4 Fix IDOR Vulnerability in `backend/controllers/orderController.js`
Update `getOrderDetails`:
```javascript
async function getOrderDetails(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user && req.user.role === 'admin';

    // Disallow unauthenticated guests from querying arbitrary orders by ID
    if (!isAdmin && !userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view order details.'
      });
    }

    let orderQuery = 'SELECT * FROM orders WHERE (id = ? OR order_number = ?)';
    let params = [id, id];

    if (!isAdmin) {
      orderQuery += ' AND user_id = ?';
      params.push(userId);
    }

    const [orders] = await pool.query(orderQuery, params);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    // ... rest of item retrieval
```

### 3.5 Remove Backdoor & Enforce Strict JWT in `backend/controllers/authController.js`
- Remove lines 122-126 (`if (!isMatch && (password === 'admin123' ...))`).
- Ensure `JWT_SECRET` is mandatory:
```javascript
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}
```

### 3.6 Secure CORS in `backend/server.js`
Replace lines 14-17 with environment-driven CORS:
```javascript
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));
```

### 3.7 Add Engines in `backend/package.json`
```json
"engines": {
  "node": ">=20.0.0"
}
```

---

## 4. Required Environment Variables Matrix

### Render Free Web Service (Backend)
| Variable Name | Required Value / Description | Sensitive |
| :--- | :--- | :---: |
| `NODE_ENV` | `production` | No |
| `PORT` | `10000` (Render provides this automatically) | No |
| `DB_HOST` | TiDB Cloud Gateway host (e.g., `gateway01.us-east-1.prod.aws.tidbcloud.com`) | Yes |
| `DB_PORT` | `4000` | No |
| `DB_USER` | TiDB user (e.g. `234abcd.root`) | Yes |
| `DB_PASSWORD` | Strong password generated in TiDB Cloud Console | Yes |
| `DB_NAME` | `building_materials_db` | No |
| `DB_SSL` | `true` | No |
| `JWT_SECRET` | 64+ char random hex string (`openssl rand -hex 32`) | **Yes (Critical)** |
| `JWT_EXPIRES_IN` | `7d` | No |
| `CORS_ORIGIN` | Cloudflare Pages domain (e.g. `https://buildmarket.pages.dev`) | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name (for persistent images) | No |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | **Yes** |

### Cloudflare Pages (Frontend)
| Variable Name | Required Value / Description | Sensitive |
| :--- | :--- | :---: |
| `VITE_API_BASE_URL` | `https://<your-render-service>.onrender.com/api` | No |

---

## 5. Step-by-Step Deployment Guide

```
+-----------------------------------------------------------------------------------------+
|                                    DEPLOYMENT FLOW                                      |
|                                                                                         |
|   1. GitHub Repo Setup                                                                  |
|      + Create .gitignore (exclude .env, tools/, node_modules/)                          |
|      + Push source code to private GitHub repository                                    |
|                               |                                                         |
|               +---------------+---------------+                                         |
|               |                               |                                         |
|               v                               v                                         |
|   2. TiDB Cloud (Serverless)      3. Render Web Service (Backend)                       |
|      + Provision free cluster        + Root directory: 'backend'                        |
|      + Import SQL schema & seed      + Set TiDB & JWT env variables                     |
|      + Note port 4000 & SSL          + Copy backend public URL                          |
|                                               |                                         |
|                                               v                                         |
|                                   4. Cloudflare Pages (Frontend)                        |
|                                      + Framework preset: Vite                           |
|                                      + Root directory: 'frontend'                       |
|                                      + Output directory: 'dist'                         |
|                                      + Env: VITE_API_BASE_URL                           |
|                                      + SPA Rewrite: public/_redirects                   |
+-----------------------------------------------------------------------------------------+
```

### Step 1: GitHub Repository Initialization
1. Ensure `.gitignore` is in place at project root.
2. Verify that `tools/`, `node_modules/`, and `.env` are untracked:
   ```bash
   git init
   git add .
   git status
   ```
   *(Ensure no `.env` or files inside `tools/` are staged).*
3. Commit and push:
   ```bash
   git commit -m "feat: initial commit for free tier cloud deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/build-market.git
   git push -u origin main
   ```

### Step 2: Database Setup on TiDB Cloud Serverless
1. Sign up at [https://tidbcloud.com](https://tidbcloud.com) (No credit card required).
2. Click **Create Cluster** -> Select **Serverless** (Free Tier).
3. Choose your nearest cloud provider region (e.g. `AWS us-east-1` or `GCP us-central1`).
4. In **Security Settings**, set a strong root password and allow connections from anywhere (`0.0.0.0/0`).
5. Open the **SQL Editor** tab inside TiDB Cloud Console:
   - Run: `CREATE DATABASE building_materials_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
   - Paste and execute the contents of `database/building_materials_db.sql`.
   - Update the default admin password hash with a freshly hashed password.
6. Copy the connection string details:
   - Host, Port (`4000`), User (`<prefix>.root`), Password.

### Step 3: Backend Deployment on Render Free Web Service
1. Sign up at [https://render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Name:** `buildmarket-api`
   - **Region:** Match closest to TiDB cluster region.
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
5. Open **Environment Variables** and enter the variables listed in Section 4.
6. Click **Deploy Web Service**.
7. Test the health check endpoint once deployed:
   `https://buildmarket-api.onrender.com/api/health`

### Step 4: Frontend Deployment on Cloudflare Pages
1. Sign up / log in to [https://dash.cloudflare.com](https://dash.cloudflare.com).
2. Navigate to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select your GitHub repository.
4. Set Build Configuration:
   - **Project Name:** `buildmarket`
   - **Production branch:** `main`
   - **Framework preset:** `Vite`
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Under **Environment variables (Production)**:
   - `VITE_API_BASE_URL` = `https://buildmarket-api.onrender.com/api`
6. Click **Save and Deploy**.
7. Once deployed, copy your Pages URL (e.g. `https://buildmarket.pages.dev`).
8. Return to Render and update `CORS_ORIGIN` to include `https://buildmarket.pages.dev`.

---

## 6. Image Storage Architecture Recommendations

| Storage Option | Free Tier Limit | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- | :---: |
| **Local Render Disk** | Ephemeral | Zero setup | **Data deleted on restart/idle** | ❌ **Unusable** |
| **Cloudinary** | 25 GB storage / 25 credits/mo | Drop-in `multer` storage plugin, automated thumbnails, CDN | Requires adding `cloudinary` & `multer-storage-cloudinary` | ⭐ **Best & Easiest** |
| **Cloudflare R2** | 10 GB storage, zero egress fees | Native S3 API, fast edge delivery | Requires AWS S3 SDK integration | ⭐ **Best for Scale** |
| **Supabase Storage** | 1 GB storage | S3 compatible, easy dashboard | Smaller capacity on free tier | ✔️ Alternative |

### Cloudinary Integration Path (Recommended)
1. Install `cloudinary` and `multer-storage-cloudinary` in `backend/`.
2. Configure storage directly in `backend/middleware/upload.js`.
3. The uploaded image URL returned from Cloudinary (`https://res.cloudinary.com/...`) is saved in the database.
4. Images persist permanently regardless of Render restarts or redeployments.

---

## 7. Free-Tier Limitations & Mitigations

### 1. Render Free Cold Starts (15-Minute Sleep)
- **Behavior:** The free web service spins down after 15 minutes of inactivity.
- **Impact:** The next incoming visitor experiences a **45–60 second delay** while the container wakes up.
- **Mitigation:**
  - Setup a free external ping monitor using [UptimeRobot](https://uptimerobot.com) or [Cron-job.org](https://cron-job.org) to ping `https://buildmarket-api.onrender.com/api/health` every 12–14 minutes.
  - Implement a friendly frontend loading screen in React when initial requests take longer than 3 seconds ("Waking up server, please wait a moment...").

### 2. Render Free Compute Quota
- **Limit:** 750 free instance hours per calendar month per account.
- **Impact:** One single service running 24/7 consumes 744 hours in a 31-day month. Running more than one service on the same account will exhaust hours before month-end.
- **Mitigation:** Run only the backend web service on this Render account.

### 3. TiDB Cloud Serverless Inactivity Pause
- **Limit:** 5 GiB row storage, 50 Million Request Units (RUs) per month.
- **Auto-Pause:** If a cluster receives no traffic for 30 consecutive days, TiDB pauses the cluster.
- **Mitigation:** Regular health-check queries or UptimeRobot pings keep the database active.

### 4. Cloudflare Pages Build Limits
- **Limit:** 500 builds per month, unlimited requests and bandwidth.
- **Impact:** Ample for production and typical team updates.

---

## 8. Backup and Recovery Procedures

### 1. Automated Logical Database Backup
Because TiDB Cloud free tier does not include point-in-time recovery exports:
- Create a simple GitHub Actions workflow (running weekly or on demand) or a local script utilizing `mysqldump`:
  ```bash
  mysqldump --host=<tidb-host> --port=4000 --user=<tidb-user> --password=<tidb-pass> --ssl-mode=REQUIRED building_materials_db > backup_$(date +%F).sql
  ```
- Store encrypted database dumps securely offsite.

### 2. Disaster Recovery Protocol
If database corruption or accidental data deletion occurs:
1. Access the TiDB Cloud Console SQL Editor.
2. Run `SET FOREIGN_KEY_CHECKS = 0;` followed by `DROP TABLE IF EXISTS ...` for affected tables.
3. Import the latest valid SQL backup file.
4. Verify table counts and re-enable `SET FOREIGN_KEY_CHECKS = 1;`.

---

## 9. Immediate Action Items Summary

Before modifying any files or deploying:
1. **Approve this audit report.**
2. Once approved, perform the following targeted file operations:
   - Add `.gitignore` to protect credentials and block heavy local binaries.
   - Add `frontend/public/_redirects` for Cloudflare SPA routing.
   - Update `backend/config/db.js` with TiDB SSL configuration.
   - Remove the authentication backdoor and enforce `JWT_SECRET` in `backend/controllers/authController.js`.
   - Fix the IDOR vulnerability in `backend/controllers/orderController.js`.
   - Update CORS configuration in `backend/server.js`.
   - Replace local disk Multer upload with Cloudinary or Cloudflare R2.
