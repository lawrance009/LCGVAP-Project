# LCGVAP - Liberian Cyprus Graduates Veteran Alumina Platform

A production-grade, secure credential verification and alumni platform designed to verify and display the academic achievements of Liberian graduates who studied in Cyprus.

## Features

- **Secure Credential Verification**: Verify academic credentials using email or user ID
- **Digital Badge System**: Official badges representing verified academic degrees
- **Role-Based Admin Dashboard**: ADMIN and MASTER_ADMIN roles with granular permissions
- **Comprehensive Audit Logging**: Track all administrative actions
- **Public Alumni Directory**: Browse verified graduates and their achievements
- **Enterprise-Grade Security**: JWT authentication, rate limiting, encryption, and more

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Cache**: Redis
- **Authentication**: JWT with refresh tokens
- **Security**: bcrypt, Helmet, CORS, rate limiting

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **Routing**: React Router

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Process Management**: PM2 (production)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 15+ (for local development)
- Redis (for local development)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd lcgvap
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Edit `.env` with your configuration (see Environment Variables section)

4. Start all services:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Admin Dashboard: http://localhost:3000/admin/login

### Local Development

#### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp ../.env.example .env
```

4. Generate Prisma client and run migrations:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Start development server:
```bash
npm run dev
```

#### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

## Environment Variables

### Required Variables

```env
# System
NODE_ENV=development
SYSTEM_NAME=LCGVAP
SYSTEM_FULL_NAME=Liberian Cyprus Graduates Veteran Alumina Platform

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lcgvap_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars

# Default Admin Credentials
ADMIN_DEFAULT_EMAIL=admin@lcgvap.gov.lr
ADMIN_DEFAULT_PASSWORD=your_secure_password

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

See `.env.example` for complete list of environment variables.

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/admin/login | Admin login |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/verify | Verify by email |
| GET | /api/verify/:id | Verify by user ID |
| GET | /api/users/public | List alumni |
| GET | /api/badges | List badges |
| GET | /api/degrees | List degrees |

### Admin Endpoints (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Search users |
| POST | /api/users | Create user |
| GET | /api/users/:id | Get user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |
| POST | /api/admin/badges/assign | Assign badge |
| POST | /api/admin/badges/revoke/:id | Revoke badge |
| GET | /api/admin/statistics/dashboard | Dashboard stats |
| GET | /api/admin/audit-logs | Audit logs |

## Project Structure

```
lcgvap/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilities
│   ├── prisma/             # Database schema
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── Dockerfile
├── database/               # Database migrations
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## Security Features

- **Authentication**: JWT with short-lived access tokens and refresh tokens
- **Password Security**: bcrypt hashing with salt rounds 12+
- **Rate Limiting**: Redis-based rate limiting per IP and user
- **Brute Force Protection**: Account lockout after failed login attempts
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: Helmet security headers
- **CORS**: Configurable cross-origin resource sharing
- **Audit Logging**: Comprehensive logging of all admin actions

## Admin Roles

### ADMIN
- Manage users (create, update, delete)
- Assign and revoke badges
- View audit logs
- View statistics

### MASTER_ADMIN
- All ADMIN permissions
- Create and delete admins
- Promote/demote admins
- System configuration

## Default Login Credentials

After initial setup, use the default master admin credentials:
- Email: (set in `ADMIN_DEFAULT_EMAIL`)
- Password: (set in `ADMIN_DEFAULT_PASSWORD`)

**Important**: Change the default password immediately after first login.

## Database Schema

### Core Tables
- `users` - Graduate accounts
- `admins` - Administrator accounts
- `degrees` - Degree types
- `badges` - Badge templates
- `user_badges` - Badge assignments
- `audit_logs` - Administrative actions
- `refresh_tokens` - Token storage

## Deployment

### Production Deployment

1. Set all environment variables for production
2. Use strong, unique secrets for JWT
3. Enable HTTPS
4. Configure firewall rules
5. Set up monitoring and logging
6. Use Docker Compose with production profile:

```bash
docker-compose --profile production up -d
```

### Scaling

The architecture supports horizontal scaling:
- Stateless backend design
- Redis for session storage
- Database connection pooling
- Load balancer ready

## Monitoring

- Health check endpoint: `GET /api/health`
- Application logs: `backend/logs/`
- Audit logs: `backend/logs/audit-*.log`
- Security logs: `backend/logs/security-*.log`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Support

For support and inquiries, contact the LCGVAP administrative team.

---

**LCGVAP** - Liberian Cyprus Graduates Veteran Alumina Platform  
Securing Academic Credentials for Liberian Graduates
