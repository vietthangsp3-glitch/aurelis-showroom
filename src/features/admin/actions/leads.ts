"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";
import { getRequestIpDigest, writeAuditLog } from "@/lib/security/audit";

const statuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "APPOINTMENT",
  "WON",
  "LOST",
] as const;

export async function updateLeadStatusAction(
  leadId: string,
  formData: FormData,
) {
  const session = await requireRole(["ADMIN", "SALES"]);
  const status = String(formData.get("status") ?? "");
  if (!statuses.includes(status as (typeof statuses)[number])) return;
  const ipAddress = await getRequestIpDigest();

  await prisma.$transaction(async (tx) => {
    const before = await tx.lead.findUniqueOrThrow({
      where: { id: leadId },
      select: { status: true, assignedToId: true, interestType: true },
    });
    const after = await tx.lead.update({
      where: { id: leadId },
      data: { status: status as (typeof statuses)[number] },
      select: { status: true, assignedToId: true, interestType: true },
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "LEAD_STATUS_UPDATE",
      entityType: "Lead",
      entityId: leadId,
      before,
      after,
      ipAddress,
    });
  });
  revalidatePath("/admin/leads");
}

export async function deleteLeadAction(leadId: string) {
  const session = await requireRole(["ADMIN"]);
  const ipAddress = await getRequestIpDigest();

  await prisma.$transaction(async (tx) => {
    const before = await tx.lead.findUniqueOrThrow({
      where: { id: leadId },
      select: {
        status: true,
        assignedToId: true,
        interestType: true,
        createdAt: true,
      },
    });
    await tx.lead.delete({ where: { id: leadId } });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "LEAD_DELETE",
      entityType: "Lead",
      entityId: leadId,
      before,
      ipAddress,
    });
  });

  revalidatePath("/admin/leads");
}
