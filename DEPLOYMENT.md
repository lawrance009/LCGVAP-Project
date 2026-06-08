# LCGVAP Deployment Guide

**Production:** Netlify (frontend) + Railway (backend, Postgres, Redis)

| Service | URL |
|---------|-----|
| Frontend | https://lcgvap.netlify.app |
| Backend API | https://lcgvap-project-production.up.railway.app |

---

## 1) Railway project services

Create four services in one Railway project:

1. **Backend** — GitHub repo, root directory `LCGVAP-Backend`
2. **PostgreSQL** — Database → Add PostgreSQL
3. **Redis** — Database → Add Redis
4. *(Optional)* delete any duplicate frontend service on Railway if using Netlify

### Backend service settings

- Root directory: `LCGVAP-Backend`
- Build: `npm install`
- Start: `npm start`
- Health check: `/health`

---

## 2) Railway backend — variables

### References (do NOT type URLs manually)

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Reference → **Postgres** → `DATABASE_URL` |
| `REDIS_URL` | Reference → **Redis** → `REDIS_URL` |

### Typed values (copy exactly)

```
CORS_ORIGINS=https://lcgvap.netlify.app
BASE_URL=https://lcgvap-project-production.up.railway.app
NODE_ENV=production
```

### Secrets (generate your own)

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

| Variable | Notes |
|----------|--------|
| `JWT_ACCESS_SECRET` | 64-byte hex |
| `JWT_REFRESH_SECRET` | different 64-byte hex |
| `ADMIN_CREATION_SECRET` | 32-byte hex |
| `FILE_ACCESS_SECRET` | random string |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail app password (optional) |

### Do NOT put on Railway backend

- `VITE_API_URL` — Netlify only
- `REDIS_URL=redis://localhost:6379`
- Typed `DATABASE_URL` unless copied from Postgres Connect tab
- `NODE_ENV=development`

Redeploy backend after changing variables.

---

## 3) Initialize database (one time)

New Railway Postgres is empty. Run schema from your machine:

1. Railway → **Postgres** → **Connect** → copy **Public Network** URL
2. PowerShell:

```powershell
cd LCGVAP-Backend
$env:DATABASE_URL="postgresql://postgres:PASSWORD@HOST.railway.app:PORT/railway"
npm run db:init
```

Expected: `Database init complete — all tables created.`

---

## 4) Netlify frontend

1. Import repo from GitHub
2. `netlify.toml` at repo root configures build automatically
3. Environment variable:

```
VITE_API_URL=https://lcgvap-project-production.up.railway.app
```

Scopes: Production, Deploy Previews, Branch deploys

4. **Deploys** → **Clear cache and deploy site** (required after env changes)

---

## 5) Post-deploy checks

```powershell
cd LCGVAP-Backend
$env:SMOKE_BASE_URL="https://lcgvap-project-production.up.railway.app"
npm run smoke
```

Browser: open https://lcgvap.netlify.app — universities, slides, FAQ should load.

CORS test (browser console on Netlify site):

```javascript
fetch('https://lcgvap-project-production.up.railway.app/health').then(r=>r.json()).then(console.log)
```

---

## 6) Local development

```powershell
cp LCGVAP-Backend/.env.example LCGVAP-Backend/.env
cp LCGVAP-Frontend/.env.example LCGVAP-Frontend/.env
```

Never commit `.env` files.
