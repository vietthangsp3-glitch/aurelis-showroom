# Security notes

- Secrets belong in local/Vercel environment variables and must never be committed.
- `SESSION_SECRET` must be at least 32 random characters.
- `IP_HASH_SECRET` should be a separate random value of at least 32 characters.
- Production admin MFA can be enforced with `REQUIRE_ADMIN_MFA=true` and a TOTP secret in `ADMIN_TOTP_SECRET`.
- Allowed remote media hosts are restricted; extend `ALLOWED_MEDIA_HOSTS` only for trusted HTTPS hosts.
- Admin sessions are server-side revocable and checked against the active database user.
- Login and public lead/test-drive submissions are rate limited.
- High-risk admin changes are written to `AuditLog`.
- CSP and security headers are configured in `next.config.ts`.

Before enabling MFA, generate the TOTP secret locally and add it to both the authenticator app and the deployment environment. Do not paste that secret into chat, source code or Git history.

Admin login verifies the bcrypt hash stored in the `User` table. To rotate the
seeded admin password, update `ADMIN_SEED_PASSWORD_HASH`, run the seed from a
trusted environment, and revoke active sessions.
