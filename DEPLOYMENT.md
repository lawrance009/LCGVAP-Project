# LCGVAP Deployment Guide (Render + Vercel)

This repo is set up for:
- Backend: Render Web Service
- Frontend: Vercel

## 1) GitHub Security Checklist (before first push)

- Ensure `.env` files are not tracked.
- Keep only `.env.example` files in Git.
- Rotate secrets if any were ever shared.
- Enable GitHub secret scanning + Dependabot alerts.

Quick check locally:

```bash
git status --short
```

If `.env` appears, stop and remove it from tracking before commit.

## 2) Backend on Render

### Service settings
- Root directory: `LCGVAP-Backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

### Required environment variables

- `NODE_ENV=production`
- `PORT=5000` (Render may override internally)
- `BASE_URL=https://<your-render-service>.onrender.com`
- `CORS_ORIGINS=https://<your-vercel-domain>`

- `DATABASE_URL=<render/supabase/neon postgres url>`
  - OR set `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`

- `JWT_ACCESS_SECRET=<strong random>`
- `JWT_REFRESH_SECRET=<strong random>`
- `JWT_ACCESS_EXPIRES=10m`
- `JWT_REFRESH_EXPIRES=7d`
- `FILE_ACCESS_SECRET=<strong random>`

- `ADMIN_CREATION_SECRET=<strong random>`
- `BOSS_ADMIN_MAX=3`

- `EMAIL_USER=<smtp user>`
- `EMAIL_PASS=<smtp password/app password>`

- `REDIS_URL=<upstash rediss url>`

### Optional tuning env vars
- `DB_POOL_MAX=10`
- `DB_POOL_MIN=2`
- `DB_CONNECT_TIMEOUT_MS=5000`
- `DB_IDLE_TIMEOUT_MS=30000`
- `DB_STATEMENT_TIMEOUT_MS=7000`
- `DB_QUERY_TIMEOUT_MS=7000`
- `AUTH_RATE_LIMIT_MAX=10`
- `MAX_UPLOAD_SIZE_MB=15`

## 3) Frontend on Vercel

### Project settings
- Root directory: `LCGVAP-Frontend`
- Build command: `npm run build`
- Output directory: `dist`

### Required environment variable
- `VITE_API_URL=https://<your-render-service>.onrender.com`

## 4) Post-deploy validation

Run backend smoke checks against production API:

```bash
cd LCGVAP-Backend
SMOKE_BASE_URL=https://<your-render-service>.onrender.com npm run smoke
```

Expected: all checks pass.

## 5) Ongoing workflow

- Commit to feature branch
- Open PR
- Let Vercel preview build run
- Merge to main for live deploy

