# Deployment & Infrastructure Checklist

## Vercel + AWS EC2 Alignment
- [ ] Audit for duplicate hosting (Vercel and EC2). If both serve the frontend, consolidate to one to reduce cost/complexity.
- [ ] Use Vercel for static frontend and Supabase Edge Functions for backend unless a specific EC2 use case exists.

## CI/CD Pipeline Review
- [ ] Ensure all tests (unit, integration, e2e, contract) run on every PR and block merges on failure.
- [ ] Add automated Lighthouse/a11y checks to CI if not already present.
- [ ] Use environment-specific secrets and config in CI/CD (never hardcode keys).

## Environment Variable Management
- [ ] Use Supabase's secrets management for backend.
- [ ] For frontend, use Vercel's environment variable dashboard.
- [ ] Document all required environment variables and their purpose in the README or a dedicated config doc.