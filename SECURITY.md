# Security Practices

## Secrets Handling

- Never commit `.env` files.
- Keep only `.env.example` in source control.
- Store real secrets in deployment platforms:
  - Render environment variables
  - Vercel environment variables
- Rotate credentials if they are exposed.

## Recommended GitHub Settings

- Enable secret scanning.
- Enable push protection for secrets.
- Enable Dependabot security updates.
- Protect `main` branch with PR reviews.

## Operational Security

- Use strong unique values for:
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `FILE_ACCESS_SECRET`
  - `ADMIN_CREATION_SECRET`
- Keep `NODE_ENV=production` in production.
- Restrict `CORS_ORIGINS` to your actual frontend domains.
- Avoid logging sensitive payloads (tokens, passwords, IDs).

## Incident Response (minimum)

If a secret leaks:
1. Revoke/rotate the secret immediately.
2. Redeploy backend/frontend with new values.
3. Invalidate active sessions if JWT secrets changed.
4. Review audit logs for suspicious activity.

