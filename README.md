# LCGVAP — Liberian Cyprus Graduates Veteran Alumni Platform

Monorepo: **LCGVAP-Backend** (Express API) + **LCGVAP-Frontend** (React/Vite).

## Production stack

| Part | Host | URL |
|------|------|-----|
| Frontend | Netlify | https://lcgvap.netlify.app |
| Backend API | Railway | https://lcgvap-project-production.up.railway.app |
| Database | Railway Postgres | linked via `DATABASE_URL` reference |
| Cache | Railway Redis | linked via `REDIS_URL` reference |

## Deploy checklist

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full steps.

**Railway backend variables (typed):**
- `CORS_ORIGINS=https://lcgvap.netlify.app`
- `BASE_URL=https://lcgvap-project-production.up.railway.app`
- `NODE_ENV=production`

**Railway backend references:** `DATABASE_URL` → Postgres, `REDIS_URL` → Redis

**Netlify:** `VITE_API_URL=https://lcgvap-project-production.up.railway.app`

**One-time DB setup (local):**
```powershell
cd LCGVAP-Backend
$env:DATABASE_URL="postgresql://..."   # Railway Postgres → Connect → Public URL
npm run db:init
```

## Local development

```powershell
cd LCGVAP-Backend && npm install && npm run dev
cd LCGVAP-Frontend && npm install && npm run dev
```

Copy `.env.example` to `.env` in each folder.
