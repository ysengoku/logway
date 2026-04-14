# LogWay Production Deployment Runbook

Purpose:
- Provide a repeatable release process for production deployment
- Prioritize reliability on unstable mobile networks
- Support a public demo link for GitHub and portfolio

Public repository note:
- This document should contain process and operational steps only.
- Do not include credentials, tokens, private URLs, or personal data.

## 0. Scope and Decisions (Day 0)

- [ ] Decide hosting for frontend (Vercel or Netlify)
- [ ] Decide hosting for server API (Render, Fly.io, Railway, or similar)
- [ ] Keep Supabase as managed backend
- [ ] Decide whether to keep demo and personal environments separated
- [x] Domain strategy: start with provider default domain, add custom domain later after stable operation
- [x] Git branch strategy: `main` = production deploy branch, `dev` = daily development branch

Acceptance:
- Frontend URL and API URL are fixed
- Production environment owner accounts are secured (MFA enabled)

Note:
- A custom domain is optional for this phase. Prioritize reliability and mobile access first.

Release flow:
- Work in `dev`
- Merge `dev` into `main` when ready
- Deploy production from `main` only

## 1. Environment and Secrets (Day 1)

### Server

- [ ] Copy server/.env.example to server/.env for local confirmation
- [ ] Set production secrets in hosting provider dashboard (not in git):
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - PORT

### Frontend

- [ ] Set production frontend variables in hosting provider dashboard:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_API_URL

Acceptance:
- No secrets committed
- Local and production variables are clearly separated

## 2. Production Readiness Fixes (Day 1-2)

### CORS is currently localhost-only

Current server CORS origin is hardcoded to localhost. Before production:
- [ ] Add env-based allowlist (for example ALLOWED_ORIGINS)
- [ ] Allow local origin in development and deployed frontend origin in production

### Health and runtime checks

- [ ] Keep /api/health available in production
- [ ] Ensure server build/start scripts run in hosting environment

Acceptance:
- Production frontend can call production API without CORS errors
- Health endpoint returns status ok

## 3. Database Safety and Migrations (Day 2)

- [ ] Confirm all migrations under supabase/migrations are applied to production
- [ ] Validate RLS and policy behavior for:
  - events
  - trips
  - members
  - profiles
- [ ] Verify service role usage is limited to server-side only

Commands (from repo root):
- pnpm supabase login
- pnpm supabase link --project-ref YOUR_PROJECT_REF
- pnpm supabase db push

Acceptance:
- Migration history is in sync
- Authenticated users can only read/write permitted data

## 4. Quality Gate Before Deploy (Day 2)

Run before each deploy:
- [ ] pnpm --filter ./frontend run lint:ci
- [ ] pnpm --filter ./frontend run type-check
- [ ] pnpm --filter ./frontend run test:unit
- [ ] pnpm --filter ./server run lint
- [ ] pnpm --filter ./server run build
- [ ] pnpm --filter ./server run test:unit

Acceptance:
- All CI-equivalent checks pass

## 5. Deploy and Verify (Day 3)

- [ ] Deploy server first, then frontend
- [ ] Set VITE_API_URL to production API URL
- [ ] Open app from mobile network and verify:
  - sign in / sign up
  - trip list load
  - create / edit / delete event
  - join trip by invite code

Acceptance:
- Core user flow works on desktop and mobile
- No auth or CORS regressions

## 6. Travel Reliability Hardening (Day 3-4)

- [ ] Add request timeout and retry policy for transient network failure
- [ ] Improve user-facing error messages for offline and timeout cases
- [ ] Keep payload sizes small on initial screen
- [ ] Verify behavior under throttled network

Acceptance:
- Temporary network loss does not break session irrecoverably
- User can retry and continue without reloading repeatedly

## 7. Monitoring and Recovery (Day 4)

- [ ] Enable host logs and error monitoring
- [ ] Add uptime check for frontend URL and /api/health
- [ ] Define fallback procedure:
  - rollback to last known good deploy
  - clear bad env var and redeploy

Acceptance:
- You can detect failure quickly and recover in minutes

## 8. Public Demo Preparation (Day 5)

- [ ] Create a separate demo environment (recommended)
- [ ] Seed demo-safe data (no personal/private data)
- [ ] Add screenshot + live demo URL + architecture notes in README
- [ ] Prepare short portfolio write-up (problem, approach, trade-offs)

Acceptance:
- Demo is stable and safe to share publicly

## 9. JSDoc Priority After Deploy

Do not block deploy for full JSDoc coverage. Prioritize:
1. frontend/src/api/http.ts and API wrappers
2. server/src/routes/profileValidation.ts and shared validators
3. Store modules with non-trivial state transitions
4. Shared domain types where intent is unclear

Acceptance:
- High-risk logic paths are documented
- New contributors can understand API contracts quickly

## Suggested Timeline (1 Week)

- Day 0: Scope and hosting decisions
- Day 1: Env/secrets and CORS readiness
- Day 2: DB policy checks and quality gate
- Day 3: First production deploy and smoke test
- Day 4: Reliability hardening + monitoring
- Day 5: Demo publish and portfolio update

## Immediate Next Actions

- [ ] Choose frontend host and create project
- [ ] Choose server host and create project
- [ ] Add production environment variables in both hosts
- [ ] Implement env-based CORS allowlist in server
- [ ] Deploy server, then frontend, then run mobile-network smoke test

## Git Setup for First Production Release

Current strategy:
- `main` = production deploy branch
- `dev` = daily development branch

One-time setup:
- [ ] Set default branch to `main` on GitHub repository settings
- [ ] Configure hosting provider to deploy production from `main` only

First release flow:
1. Commit changes on `dev`
2. Push `dev` to origin
3. Merge `dev` into `main` (PR merge or local merge)
4. Push `main`
5. Confirm production deployment completed

## Go/No-Go Checklist

Go when all are true:
- [ ] Production CORS configured
- [ ] Environment variables configured correctly
- [ ] Migrations synced
- [ ] Lint/typecheck/tests/build pass
- [ ] Mobile smoke test passes on non-Wi-Fi network
- [ ] Monitoring and rollback path are confirmed
