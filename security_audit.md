# Security Audit Report
**Project:** connecting_scripts dashboard  
**Audited:** 2026-07-12  
**Scope:** All backend routes, middleware, frontend auth, file uploads, and configuration

---

## Severity Legend
| Level | Meaning |
|---|---|
| 🔴 Critical | Exploitable right now — fix before anything else |
| 🟠 High | Significant risk in a real environment |
| 🟡 Medium | Should be fixed before production |
| 🟢 Low | Best-practice improvements |

---

## 🔴 Critical

### C-1 · Hardcoded JWT fallback secret
**Files:** [`middleware/auth.js:22`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/middleware/auth.js), [`routes/auth.js:85,140`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/auth.js)

```js
// Current — fallback is public knowledge
jwt.sign(..., process.env.JWT_SECRET || 'super_secret_jwt_key_please_change_in_production', ...)
```
If the `.env` is ever missing or `JWT_SECRET` is not set, every signed token uses a well-known public string. Anyone can forge valid tokens for **any user, any role**.

**Fix:** Remove the fallback. Crash on startup if it's missing:
```js
if (!process.env.JWT_SECRET) throw new Error('FATAL: JWT_SECRET must be set in .env');
jwt.sign(..., process.env.JWT_SECRET, ...)
```

---

### C-2 · `.env` with live credentials must never be in Git
**File:** [`.env`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/.env)

Your `.env` contains live `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. If this file is pushed to Git those credentials are compromised permanently.

**Fix:**
1. Add `.env` to `.gitignore` now if not already there
2. Create a `.env.example` with placeholder values
3. Run `git rm --cached backend/.env` if it was ever committed

---

### C-3 · OTP is stored plain-text in the database
**File:** [`routes/auth.js:65`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/auth.js)

```js
await db.query('UPDATE users SET otp_code = ?, ...', [otpCode, otpExpires, user.id]);
```
The raw 6-digit OTP is stored directly in `users.otp_code`. A database breach exposes all pending OTPs, bypassing 2FA entirely.

**Fix:** Store a bcrypt hash of the OTP, then `bcrypt.compare()` on verification:
```js
const hashedOtp = await bcrypt.hash(otpCode, 8); // cost 8 is fine for short-lived codes
```

---

### C-4 · OTP is logged plain-text to the server console
**File:** [`routes/auth.js:68-70`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/auth.js)

```js
console.log(`[2FA OTP CODE DISPATCHED FOR ${email}]: ${otpCode}`);
```
Console output is captured in server log files. Anyone with log access can harvest 2FA codes and bypass MFA. This was added for local dev convenience but must be removed.

**Fix:** Remove it, or gate with `if (process.env.NODE_ENV === 'development')`.

---

## 🟠 High

### H-1 · No rate limiting on login or 2FA endpoints
**File:** [`routes/auth.js`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/auth.js)

Both `/api/auth/login` and `/api/auth/verify-2fa` have no rate limiting. An attacker can brute-force passwords at thousands of attempts per second, or enumerate all 1,000,000 OTP combinations within the 5-minute window. The `failed_login_attempts` column exists in the DB but is **never used to block anything**.

**Fix:** Add `express-rate-limit`:
```js
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
router.post('/login', loginLimiter, ...);
```
Also increment `failed_login_attempts` on failure and lock the account after 5–10 bad attempts.

---

### H-2 · Any authenticated user can manage (and delete) any other user
**File:** [`routes/users.js`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/users.js)

All `/api/users` endpoints only require `verifyToken`. There is no role check. A `Viewer` can call `DELETE /api/users/1` and remove the Super Admin.

**Fix:** Add a role guard to all `/api/users` routes:
```js
function requireAdmin(req, res, next) {
  if (!['Super Admin', 'Admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }
  next();
}
router.get('/', verifyToken, requireAdmin, ...);
router.delete('/:id', verifyToken, requireAdmin, ...);
```

---

### H-3 · Any logged-in user can escalate their own role to Super Admin
**File:** [`routes/profile.js:208-246`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/profile.js)

`PUT /api/profile/rbac` lets the currently logged-in user set their own `role` and full permissions matrix to anything — including `Super Admin` with all permissions.

**Fix:** Require Admin or Super Admin to call this endpoint, and prevent assigning the Super Admin role unless the caller is already a Super Admin.

---

### H-4 · Company email is still writable via the profile update API
**File:** [`routes/profile.js:183`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/profile.js)

```js
SET ..., company_email = ?, ...
```
The frontend marks company email as read-only, but a direct API call via curl or Postman can still overwrite it. A user could claim another user's email address.

**Fix:** Remove `company_email` from the `PUT /api/profile` UPDATE query. It should only be changeable by an Admin via the users API.

---

### H-5 · File upload accepts any file type
**File:** [`routes/assets.js:24`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/assets.js)

```js
resource_type: 'auto' // handles images, video, pdfs automatically
```
No MIME type validation. Users can upload scripts, HTML, or executables.

**Fix for avatar uploads:** Restrict to images only in the multer filter:
```js
fileFilter: (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Images only'), false);
  cb(null, true);
}
```

---

## 🟡 Medium

### M-1 · Full permissions object embedded in JWT (stale after revocation)
**File:** [`routes/auth.js:84`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/auth.js)

If an Admin revokes a user's permission, the user's existing token still carries the old permissions for up to 7 days. **Fix:** Store only `userId` and `role` in the token; fetch live permissions from DB on each request.

---

### M-2 · 7-day JWT with no revocation mechanism
**File:** [`.env`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/.env)

A stolen token is valid for 7 full days. There is no token blacklist or logout invalidation. **Fix:** Reduce to `1d`. Long-term: implement a refresh token + DB revocation list.

---

### M-3 · `bcrypt.compareSync` blocks the Node.js event loop
**Files:** [`routes/auth.js:51`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/auth.js), [`routes/profile.js:150`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/profile.js)

`compareSync` is CPU-intensive and blocks all other requests for ~100ms. **Fix:** Use `await bcrypt.compare()` everywhere.

---

### M-4 · No server-side input length validation on profile fields
**File:** [`routes/profile.js:174`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/profile.js)

The frontend caps bio at 100 chars, but the backend accepts unlimited-length strings. **Fix:** Validate lengths server-side (bio ≤ 100 chars, firstName/lastName ≤ 60 chars, etc.).

---

### M-5 · No JSON body size limit
**File:** [`app.js:20`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/app.js)

```js
app.use(express.json()); // no limit
```
An attacker can send a very large JSON body and cause memory exhaustion. **Fix:**
```js
app.use(express.json({ limit: '50kb' }));
```

---

### M-6 · Cloudinary credentials must not appear in any frontend env var
**File:** [`backend/.env`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/.env)

Confirm no `NEXT_PUBLIC_CLOUDINARY_*` variables exist in `dashboard/.env`. Any `NEXT_PUBLIC_` variable is bundled into client-side JavaScript and publicly readable.

---

## 🟢 Low

### L-1 · Suspended users stay authenticated until token expires
**File:** [`middleware/auth.js`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/middleware/auth.js)

The status check only happens at login. A suspended user keeps their valid token. **Fix:** Add a live DB `status` check inside `verifyToken`.

---

### L-2 · No OTP attempt counter — brute-forceable within 5 minutes
**File:** [`routes/auth.js:108`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/auth.js)

After 5 failed OTP attempts, clear the OTP and force re-login.

---

### L-3 · `require('crypto')` called inside a route handler
**File:** [`routes/users.js:71`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/routes/users.js)

Move `const crypto = require('crypto')` to the top of the file.

---

### L-4 · JWT stored in `localStorage` is vulnerable to XSS
**File:** All frontend fetch calls

Any malicious script injected into the page can read `localStorage.getItem('seoc_jwt_token')`. **Recommended for production:** Move to httpOnly cookie-based auth where JavaScript cannot read the token at all.

---

### L-5 · Public health endpoint reveals server timestamp
**File:** [`app.js:39-42`](file:///d:/xampp/htdocs/freelance/connecting_scripts/backend/src/app.js)

Minor information disclosure. Consider removing the `timestamp` field or requiring auth.

---

## Summary Table

| ID | Issue | Severity |
|---|---|---|
| C-1 | Hardcoded JWT fallback secret | 🔴 Critical |
| C-2 | `.env` with live credentials in Git risk | 🔴 Critical |
| C-3 | OTP stored plain-text in DB | 🔴 Critical |
| C-4 | OTP logged plain-text to console | 🔴 Critical |
| H-1 | No rate limiting on login / 2FA | 🟠 High |
| H-2 | No role check on user management API | 🟠 High |
| H-3 | Users can escalate their own role | 🟠 High |
| H-4 | Company email writable via profile API | 🟠 High |
| H-5 | File upload accepts any file type | 🟠 High |
| M-1 | Full permissions in JWT (stale on revocation) | 🟡 Medium |
| M-2 | 7-day JWT with no revocation | 🟡 Medium |
| M-3 | `bcrypt.compareSync` blocks event loop | 🟡 Medium |
| M-4 | No server-side input length validation | 🟡 Medium |
| M-5 | No JSON body size limit | 🟡 Medium |
| M-6 | Cloudinary credentials possibly in frontend | 🟡 Medium |
| L-1 | Suspended users stay authenticated | 🟢 Low |
| L-2 | OTP brute-forceable (no attempt counter) | 🟢 Low |
| L-3 | `require()` inside route function | 🟢 Low |
| L-4 | JWT in localStorage (XSS risk) | 🟢 Low |
| L-5 | Health endpoint reveals timestamp | 🟢 Low |

---

## Fix Priority

**Must fix before going live:**
C-1 · C-2 · C-4 · H-1 · H-2 · H-3 · H-4 · M-5

**Fix before production launch:**
C-3 · H-5 · M-1 · M-2 · M-3 · M-4 · L-1 · L-2
