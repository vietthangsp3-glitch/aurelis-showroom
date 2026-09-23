ALTER TABLE "User"
ADD COLUMN "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lockedUntil" TIMESTAMP(3),
ADD COLUMN "lastLoginAt" TIMESTAMP(3);

CREATE TABLE "AuthSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuthSession_userId_expiresAt_idx" ON "AuthSession"("userId", "expiresAt");
CREATE INDEX "AuthSession_revokedAt_expiresAt_idx" ON "AuthSession"("revokedAt", "expiresAt");

ALTER TABLE "AuthSession"
ADD CONSTRAINT "AuthSession_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
