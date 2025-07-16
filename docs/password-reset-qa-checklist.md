# Password Reset QA Checklist (Staging)

Use this checklist to verify the **Forgot/Reset Password** flow works end-to-end in the staging environment.

> NOTE: All actions below assume the staging URL is stored in the environment variable `STAGING_URL` (e.g. https://staging.nexus-mint.com). Replace references accordingly.

---

## 1 — Preparation

1. Ensure the following environment variables are configured in **staging**:
   * `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`
   * `SENDGRID_API_KEY` & `SENDGRID_FROM_EMAIL` (or email-capture service)
   * `FRONTEND_URL` → `https://staging.nexus-mint.com`
2. Clean-up: delete any stale records from `password_reset_tokens` for the test user.
3. Test user:
   * `email`: **qa.reset+t<timestamp>@example.com** (unique per run)
   * `password`: **Test1234!**
   * Make sure the user exists in Supabase **auth.users** (create if needed).

---

## 2 — Generate & Store Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Navigate to `${STAGING_URL}/auth/forgot-password`. | Forgot-Password form renders with Email field & “Send reset link” button. |
| 2.2 | Enter the **test user’s** email & click **Send reset link**. | • HTTP **POST** `/api/auth/forgot-password` returns **200**.<br>• In **Supabase** table `password_reset_tokens` a new row exists:<br>  – `user_id` matches test user<br>  – `token` is UUID<br>  – `expires_at` is ~1 hour in future |

---

## 3 — Email Template & URL

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | Open the inbox/service for the test email. | Reset e-mail arrives within 30 seconds. |
| 3.2 | Inspect HTML body. | • Subject: “Reset your Nexus Mint password”<br>• Contains **single** link: `https://staging.nexus-mint.com/auth/reset?token=<uuid>`<br>• Mentions link expires in 1 hour |

---

## 4 — Reset Form Rendering

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Click the link from the e-mail (opens in browser). | Page loads **/auth/reset?token=…** with **Reset-Password** form. |
| 4.2 | DevTools → Network tab → observe `GET /api/auth/validate-reset?token=…`. | Returns `{ valid: true }` (200). No visible error banner. |

---

## 5 — Submit New Password

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Enter **New Password** (e.g. `NewTest1234!`) & Confirm. Click **Update password**. | • HTTP **POST** `/api/auth/reset-password` with body `{ token, password }` returns **200**.<br>• Row for that token is **deleted** from `password_reset_tokens`. |
| 5.2 | UI shows success card → auto-redirects to `/auth/signin` after ≤3 s. | Sign-In page loads with banner: “Your password has been reset”. |

---

## 6 — Post-Reset Login

| Step | Action | Expected Result |
|------|--------|-----------------|
| 6.1 | Sign-in using **test email** & **new password**. | Login succeeds; user lands on Dashboard (200). |
| 6.2 | Attempt sign-in with **old password**. | Login fails with “Invalid credentials” error. |

---

## 7 — Negative Scenarios

| Step | Action | Expected Result |
|------|--------|-----------------|
| N1 | Visit `/auth/reset?token=<expired or random uuid>` | `GET /api/auth/validate-reset` ⇒ `{ valid:false }`; UI shows “Link expired or invalid”. |
| N2 | Submit Reset form with mismatched passwords. | Client-side validation blocks submit; error “Passwords do not match”. |
| N3 | Submit new password shorter than 6 chars. | UI error: “Password must be at least 6 characters long”. |
| N4 | Re-use an already-used token URL. | POST returns 400 “Invalid or expired token”; UI displays error banner. |

---

## 8 — Security & Logging

* Ensure logs do **not** include full tokens.
* Confirm `password_reset_tokens` table is cleared of used/expired tokens via cron/retention job.

---

## 9 — Automation Notes (optional)

A Playwright script (`tests/e2e/password-reset.spec.ts`) can automate steps 2, 4, 5, 6 with mocked e-mail capture (Mailosaur, Mailhog, or SendGrid inbound parse). See template below:

```ts
import { test, expect } from '@playwright/test';
import { supabaseAdmin } from '../../api/_lib/supabaseAdmin';

test('password reset flow', async ({ page }) => {
  const email = `qa.reset+${Date.now()}@example.com`;
  const password = 'Test1234!';
  // Create test user via Supabase Admin
  await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true });

  // 1. Request reset
  await page.goto('/auth/forgot-password');
  await page.fill('#email', email);
  await page.click('text=Send reset link');
  // … wait for DB entry & capture email link …
});
```
The automation requires an e-mail capture service or direct DB inspection to fetch the token.

---

**Result:** When all tests pass, the password reset flow is considered production-ready.  
Last updated: {{DATE}}