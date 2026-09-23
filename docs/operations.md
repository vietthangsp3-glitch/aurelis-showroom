# Production operations

## Monitoring

- Vercel deployment logs are the primary application log source.
- Monitor `/api/health`; HTTP 200 means the application can reach PostgreSQL, HTTP 503 means the database check failed.
- Configure an external uptime monitor to request `/api/health` every 5 minutes and alert after at least two consecutive failures.
- Never expose stack traces, database URLs, JWT/session secrets or customer PII in public health responses.

## Database backup

Neon/Supabase backup and point-in-time recovery settings should be enabled when the project moves beyond portfolio traffic.
Before a risky schema change, create a provider snapshot or a `pg_dump` backup.

Example manual backup from a trusted workstation:

```bash
pg_dump "$DIRECT_URL" --format=custom --file=aurelia-backup.dump
```

Restore to a separate database first:

```bash
pg_restore --clean --if-exists --no-owner --dbname="$RESTORE_DATABASE_URL" aurelia-backup.dump
```

Do not test restores against production. Perform a restore drill periodically and verify row counts and critical flows.

## Deployment

1. Run `pnpm audit --prod`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
2. Run `pnpm prisma migrate deploy` against the intended production database.
3. Run `pnpm build`.
4. Deploy to Vercel and verify `/api/health`, storefront, lead submission and admin login.
5. Roll back the application deployment if validation fails. Database rollbacks require an explicit migration/restore plan.
