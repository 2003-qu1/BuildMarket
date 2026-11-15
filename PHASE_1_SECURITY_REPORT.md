# Phase 1: Security Fixes and Git Preparation Report

**Project:** Build Market – Construction Materials E-Commerce Platform  
**Phase:** Phase 1 – Security Fixes and Git Preparation  
**Date:** November 15, 2026  
**Auditor / Engineer:** Senior Full-Stack Security & DevOps Engineer  
**Status:** **PHASE 1 COMPLETE – ALL CRITICAL VULNERABILITIES REMOVED & VERIFIED**

---

## 1. Executive Summary

In accordance with Phase 1 directives, all identified security vulnerabilities in authentication, authorization (IDOR), secret management, and CORS have been resolved without altering website design, removing existing functionality, or breaking database schemas. A comprehensive git security barrier has been established to protect intellectual property and prevent secret leakage.

All fixes were tested against a sequential 12-test automated security suite with a **100% pass rate (12/12)**.

---

## 2. Files Modified & Created

### Modified Files:
1. `backend/controllers/orderController.js`
   - Fixed Insecure Direct Object Reference (IDOR) in `getOrderDetails`.
   - Enforced strict authentication and ownership checks (unauthenticated users receive `401 Unauthorized`; cross-customer queries receive `403 Forbidden`; administrators receive full access).
2. `backend/controllers/authController.js`
   - Removed hardcoded demo password bypass logic (`admin123` / `customer123` shortcut).
   - Removed all fallback JWT secrets in `generateToken`.
   - Enforced strict `bcrypt.compare` verification for all authentications.
3. `backend/middleware/auth.js`
   - Removed hardcoded fallback secrets (`build_market_super_secret_jwt_token_key_2026_xyz`).
   - Added environment variable validation for `JWT_SECRET`; fails safely with HTTP `500` if undefined.
   - Enforced role validation in `requireAdmin`.
4. `backend/server.js`
   - Added boot-time validation: terminates server immediately with exit code 1 if `JWT_SECRET` is missing.
   - Replaced permissive `cors({ origin: true })` with an environment-driven, origin-validated CORS policy.
   - Configured clean HTTP `403 Forbidden` error handling for rejected CORS requests.
5. `backend/routes/orderRoutes.js`
   - Promoted `GET /api/orders/:id` from `optionalAuth` to `authenticateToken` middleware for defense-in-depth.
6. `backend/package.json`
   - Added `"engines": { "node": ">=20.0.0" }` specification for cloud hosting parity.
7. `backend/.env.example` & `backend/.env`
   - Replaced default hardcoded JWT secret with instructional guidance.
   - Added `CORS_ORIGIN` configuration.
8. `frontend/.env.example`
   - Added deployment documentation for Cloudflare Pages production API URL binding.
9. `database/building_materials_db.sql`
   - Updated seeded default accounts (`admin@buildmarket.com`, `ahmed@example.com`, `sarah@example.com`) with real, cryptographically valid bcrypt hashes (10 rounds) so users can log in without requiring any bypass code.

### Created Files:
1. `.gitignore` (Root level)
   - Excludes all `.env` files, `tools/` binaries (>100MB), `node_modules/`, `uploads/`, `dist/`, logs, and backup folders.
2. `backend/uploads/.gitkeep`
   - Ensures the directory exists when cloned without tracking uploaded images.
3. `tools/security-test.js`
   - Automated sequential security test suite verifying all 8 security requirements.
4. `_backup_phase1/`
   - Isolated local backup of all modified files prior to changes (excluded from git tracking).

---

## 3. Vulnerabilities Fixed

### Vulnerability 1: Critical IDOR in Customer Order Access (CWE-639 / OWASP A01:2021)
- **Previous State:** `getOrderDetails` in `orderController.js` only filtered by `user_id` if `!isAdmin && userId`. When an unauthenticated visitor requested `/api/orders/:id`, `userId` was `null`, meaning the `WHERE user_id = ?` clause was skipped entirely. Any guest could enumerate every customer's name, phone, address, and purchase records.
- **Remediation:**
  - Route now enforces `authenticateToken`.
  - Controller requires `req.user`. If absent, immediately returns `401 Unauthorized`.
  - Non-admin users are strictly validated: `if (order.user_id !== req.user.id)` returns `403 Forbidden`.
  - Administrators (`role === 'admin'`) retain access to inspect orders.

### Vulnerability 2: Hardcoded Authentication Bypass / Backdoor (CWE-287 / CWE-798)
- **Previous State:** `authController.js` contained an explicit bypass:
  ```javascript
  if (!isMatch && (password === 'admin123' || password === 'customer123') && user.password.startsWith('$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW')) {
    isMatch = true;
  }
  ```
- **Remediation:**
  - Deleted the bypass block entirely.
  - All logins now strictly require `await bcrypt.compare(password, user.password) === true`.
  - Fixed seed password hashes in `database/building_materials_db.sql` so sample accounts authenticate legitimately via bcrypt.

### Vulnerability 3: Public Fallback JWT Secret (CWE-321 / CWE-330)
- **Previous State:** If `JWT_SECRET` was omitted from the environment, `authController.js` and `auth.js` fell back to `'build_market_super_secret_jwt_token_key_2026_xyz'`. An attacker could sign arbitrary admin tokens and forge identities.
- **Remediation:**
  - Removed all fallback strings from code.
  - Added boot-time check in `server.js` that halts process startup if `JWT_SECRET` is unset.
  - Added runtime safety check in `generateToken` and `authenticateToken` returning HTTP 500 configuration errors rather than using defaults.

### Vulnerability 4: Overly Permissive CORS (CWE-942)
- **Previous State:** `app.use(cors({ origin: true, credentials: true }))` mirrored any requesting origin, allowing malicious sites to execute authenticated cross-origin requests.
- **Remediation:**
  - Implemented dynamic whitelist function based on `process.env.CORS_ORIGIN`.
  - Allows local development origins (`localhost:3000`, `127.0.0.1:3000`, `localhost:5173`) in non-production.
  - Enforces strict origin checking in production (`NODE_ENV === 'production'`).
  - Added CORS error handling returning HTTP `403 Forbidden`.

### Vulnerability 5: Git Secret & Binary Exposure
- **Previous State:** No `.gitignore` existed. Pushing to GitHub would have leaked `.env` (database credentials, JWT secret) and failed on GitHub's 100MB file limit due to Windows binaries in `tools/`.
- **Remediation:**
  - Created root `.gitignore` blocking `.env*`, `node_modules/`, `tools/`, `uploads/`, `dist/`, and `_backup_*/`.
  - Verified with `git status` that no sensitive files or heavy binaries are tracked.

---

## 4. Tests Performed & Results

The test suite (`tools/security-test.js`) executed the following verifications:

| Test ID | Test Description | Expected Behavior | Actual Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **1.1** | Missing `JWT_SECRET` on token generation | Throws fatal error | Caught fatal error | ✅ **PASS** |
| **1.2** | Missing `JWT_SECRET` on `authenticateToken` | Returns HTTP `500` safely | Status: `500` | ✅ **PASS** |
| **2.0** | Legacy demo password bypass removal | Plain `admin123` fails against mismatched hash | Match: `false` | ✅ **PASS** |
| **3.0** | Customer login verification | Valid password matches bcrypt; wrong password fails | Match: `true` / `false` | ✅ **PASS** |
| **4.0** | Admin login verification | Valid password matches bcrypt; wrong password fails | Match: `true` / `false` | ✅ **PASS** |
| **5.0** | Customer access to own order | Customer A queries Order belonging to Customer A | Status: `200 OK` | ✅ **PASS** |
| **6.0** | Customer attempts cross-order access (IDOR) | Customer A queries Order belonging to Customer B | Status: `403 Forbidden` | ✅ **PASS** |
| **7.0** | Unauthenticated order access | Guest queries customer order with no token | Status: `401 Unauthorized` | ✅ **PASS** |
| **8.1** | Administrator order access | Admin user inspects customer order | Status: `200 OK` | ✅ **PASS** |
| **8.2** | Admin route protection (`requireAdmin`) | Admin allowed (`next()`); Customer blocked with `403` | Admin: `next()` / Cust: `403` | ✅ **PASS** |
| **9.1** | Development CORS policy | Localhost origins permitted | Allowed: `true` | ✅ **PASS** |
| **9.2** | Production CORS policy | Authorized domain allowed; attacker domain blocked | Auth: `true` / Evil: `false` | ✅ **PASS** |

**Summary: 12 / 12 Tests Passed (100%)**

---

## 5. Remaining Security Risks (To Address in Subsequent Phases)

The following items are outside the scope of Phase 1 and are scheduled for resolution in Phase 2 and Phase 3:

1. **Ephemeral Local Image Storage (Phase 2):**
   - Multer currently stores uploaded images to `backend/uploads/`. Because Render Free Tier instances use an ephemeral filesystem, images will be wiped on restart/idle. Migration to Cloudinary or Cloudflare R2 is required in Phase 2.
2. **TiDB Cloud SSL Requirement (Phase 2):**
   - `backend/config/db.js` currently connects to MySQL without SSL. TiDB Serverless requires `ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }`.
3. **HTTP Security Headers & Rate Limiting (Phase 2):**
   - Express server currently does not use `helmet` or `express-rate-limit`. Adding rate limiting to `/api/auth/login` and `/api/orders` is recommended to prevent brute-force attacks.
4. **Cloudflare Pages SPA Routing (Phase 3):**
   - Client-side routing requires `public/_redirects` before deploying frontend to Cloudflare Pages.

---

## 6. Phase 1 Sign-Off

Phase 1 (Security Fixes and Git Preparation) is **complete and verified**.  
No files have been pushed to GitHub, no cloud deployments have been initiated, and no designs or functional flows have been disrupted.

Awaiting your approval before proceeding to Phase 2.
