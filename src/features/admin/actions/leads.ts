"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "APPOINTMENT", "WON", "LOST"] as const;

export async function updateLeadStatusAction(leadId: string, formData: FormData) {
  await requireRole(["ADMIN", "SALES"]);
  const status = String(formData.get("status") ?? "");
  if (!statuses.includes(status as (typeof statuses)[number])) return;
  await prisma.lead.update({ where: { id: leadId }, data: { status: status as (typeof statuses)[number] } });
  revalidatePath("/admin/leads");
}

export async function deleteLeadAction(leadId: string) {
  await requireRole(["ADMIN"]);
  await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/admin/leads");
}
