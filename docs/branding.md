# Branding & Configuration Guide

This project is **fully white-label**. All company-specific assets—names, colours, URLs, e-mails, service-provider details—are controlled via configuration instead of hard-coding.

---

## 1. Environment Variables  (`.env`)

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_BRAND_COMPANY_NAME` | Primary company name displayed across UI & meta tags | `Your Company` |
| `VITE_BRAND_SHORT_NAME`   | Short/abbreviated name (used in logos) | `YourCo` |
| `VITE_BRAND_TAGLINE`      | One-line tagline | `A Modern Investment Platform` |
| `VITE_BRAND_BASE_URL`     | Canonical website URL | `https://yourcompany.com` |
| `VITE_BRAND_SUPPORT_EMAIL`| Support e-mail address | `support@yourcompany.com` |
| `VITE_BRAND_LEGAL_EMAIL`  | Legal/privacy e-mail address | `legal@yourcompany.com` |
| `VITE_BRAND_TWITTER_HANDLE`| Twitter/X handle | `@yourcompany` |
| `VITE_BRAND_DEFAULT_META_DESCRIPTION` | SEO meta description | *see `.env.example`* |

Service-providers (KYC, payments, storage):

| Variable | Purpose |
|----------|---------|
| `VITE_KYC_PROVIDER`  | e.g. `onfido`, `sumsub` |
| `VITE_KYC_API_KEY`   | API key for chosen KYC provider |
| `VITE_PAYMENT_PROVIDER` | e.g. `stripe`, `checkout` |
| `VITE_PAYMENT_API_KEY`  | Payment gateway key |
| `VITE_STORAGE_PROVIDER` | e.g. `supabase`, `s3` |
| `VITE_STORAGE_BUCKET`   | Storage bucket / container name |

> **Tip:** add any new brand values in the same `VITE_BRAND_*` namespace to expose them automatically.

---

## 2. Front-End Usage

`src/config/branding.config.ts` exports a typed object, `branding`, that merges environment variables with sensible fall-backs. Import it anywhere in React/TS files:

```tsx
import branding from '@/config/branding.config';

<h1>Welcome to {branding.companyName}</h1>
```

Tailwind/CSS variables such as `--gradient-brand`, `--primary` are also theme-agnostic and can be themed via CSS or configuration.

---

## 3. Service-Provider Configuration

`src/config/serviceProviders.config.ts` centralises third-party integrations:

```ts
const serviceProviders = {
  kycProvider: 'onfido',
  paymentProvider: 'stripe',
  // ...
};
```

Edge functions (e.g. KYC, e-mails) pull their credentials from `Deno.env` / `process.env`, so switching providers requires only `.env` edits—not code changes.

---

## 4. Back-End & E-mail Templates

Supabase edge functions (`supabase/functions/*`) dynamically replace brand & domain placeholders at runtime using `BRAND_COMPANY_NAME`, `BRAND_BASE_URL`, and `BRAND_FROM_EMAIL` env vars.

---

## 5. Smart-Contracts

Solidity contracts now use **brand-neutral role names** (`PLATFORM_ADMIN_ROLE`, `PLATFORM_ROLE`, etc.). Deprecated aliases remain for backward compatibility but will be removed in the next major version.

---

## 6. Shell & CI Scripts

All scripts read `$BRAND_NAME` (default: `"Your Company"`). Override it in your CI/CD pipeline:

```bash
export BRAND_NAME="AwesomeInvest"
./scripts/test.sh
```

---

## 7. Adding New Brand Assets

1. Upload images (logos, favicons) to `public/`.
2. Reference them via environment variables or CMS links.
3. Avoid committing binary assets with brand-specific filenames.

---

## 8. Admin / CMS Overrides

An admin dashboard or CMS can update brand values at runtime by writing to a JSON config table (e.g., `branding_settings`) in the DB. The front-end already consumes `branding` via React context, so changes propagate instantly.

---

**Enjoy building with flexibility!**