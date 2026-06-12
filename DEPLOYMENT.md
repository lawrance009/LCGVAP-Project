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

### Uploads volume (required for images)

Railway wipes container disk on every redeploy. Without a volume, slide/university logos return **404** after redeploy.

Volumes are **not** inside backend Settings on most Railway UIs. Create from the **project canvas**:

1. Open your Railway **project** (the graph with Backend, Postgres, Redis boxes)
2. **Right-click empty space** on the canvas → **New Volume**  
   **OR** press **Ctrl+K** (Windows) / **Cmd+K** (Mac) → type **New Volume** → Enter
3. When prompted, select your **backend** service
4. Set **mount path**: `/app/uploads`
5. Add variable on **backend** (if uploads fail to save): `RAILWAY_RUN_UID=0`
6. **Redeploy** backend
7. **Re-upload** slides and university logos in admin (old files are gone)

You should see a **Volume** box on the canvas connected to the backend service.

After this, uploads persist across redeploys.

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
| `EMAIL_USER` | Full Gmail address, e.g. `lcgvap@gmail.com` — **not** `EMAIL` |
| `EMAIL_PASS` | Gmail **App Password** (16 chars, no spaces) — **not** `EMAIL_PASSWORD` |

### Do NOT put on Railway backend

- `VITE_API_URL` — Netlify only
- `REDIS_URL=redis://localhost:6379`
- Typed `DATABASE_URL` unless copied from Postgres Connect tab
- `NODE_ENV=development`

Redeploy backend after changing variables.

### Email on Railway

Gmail App Passwords **often fail on Railway** even when copied correctly. If you keep seeing `SMTP verification FAILED`, use **Brevo (recommended)** below.

#### Option A — Brevo (free, works reliably on Railway)

1. Sign up at [https://www.brevo.com](https://www.brevo.com) (free tier)
2. **Senders & IP** → **Senders** → add and verify your email (they email you a confirmation link)
3. **SMTP & API** → copy your **SMTP key** (not your Brevo login password)
4. Railway **backend** → **Variables**:

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
EMAIL_USER=your-brevo-login-email@gmail.com
EMAIL_PASS=your-brevo-smtp-key
EMAIL_FROM=the-verified-sender@gmail.com
```

5. **Redeploy** → logs should show `SMTP connection verified`
6. Check: `/health` should show `"smtp": "verified"`

#### Option B — Gmail (often problematic on cloud hosts)

1. Google Account → **Security** → **2-Step Verification** ON
2. [App passwords](https://myaccount.google.com/apppasswords) → create for Mail
3. Railway variables: `EMAIL_USER` + `EMAIL_PASS` (16-char app password; spaces OK)
4. **Redeploy** → look for `SMTP connection verified`

**Do not** use your normal Gmail login password.

Test locally before Railway:

```powershell
cd LCGVAP-Backend
$env:EMAIL_USER="you@gmail.com"
$env:EMAIL_PASS="your-app-password"
npm run email:test
```

If local test fails too, the password is wrong. If local works but Railway fails, switch to Brevo.

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
