import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { digestIdentifier } from "@/lib/security/digest";

type AuditDb = Pick<Prisma.TransactionClient, "auditLog">;

export function toAuditJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function getRequestIpDigest() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const ip = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  const digest = digestIdentifier(ip);
  return `sha256:${digest}`;
}

export async function writeAuditLog(
  db: AuditDb,
  input: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    before?: unknown;
    after?: unknown;
    ipAddress?: string | null;
  },
) {
  await db.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      before: toAuditJson(input.before),
      after: toAuditJson(input.after),
      ipAddress: input.ipAddress ?? null,
    },
  });
}
