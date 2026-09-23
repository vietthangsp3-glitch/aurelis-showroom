"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";
import {
  articleFormSchema,
  bookingStatusSchema,
  promotionFormSchema,
  publishStatusSchema,
  showroomFormSchema,
} from "@/features/admin/schemas/operations";
import { getRequestIpDigest, writeAuditLog } from "@/lib/security/audit";

function formObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function updateTestDriveStatusAction(
  id: string,
  formData: FormData,
) {
  const session = await requireRole(["ADMIN", "SALES"]);
  const parsed = bookingStatusSchema.safeParse(
    String(formData.get("status") ?? ""),
  );
  if (!parsed.success) return;
  const ipAddress = await getRequestIpDigest();
  await prisma.$transaction(async (tx) => {
    const before = await tx.testDriveBooking.findUniqueOrThrow({
      where: { id },
      select: {
        status: true,
        scheduledAt: true,
        showroomId: true,
        variantId: true,
      },
    });
    const after = await tx.testDriveBooking.update({
      where: { id },
      data: { status: parsed.data },
      select: {
        status: true,
        scheduledAt: true,
        showroomId: true,
        variantId: true,
      },
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "TEST_DRIVE_STATUS_UPDATE",
      entityType: "TestDriveBooking",
      entityId: id,
      before,
      after,
      ipAddress,
    });
  });

  revalidatePath("/admin/test-drives");
}

export async function createPromotionAction(formData: FormData) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = promotionFormSchema.safeParse(formObject(formData));
  if (!parsed.success) redirect("/admin/promotions?error=invalid");

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);
  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime()) ||
    endsAt < startsAt
  ) {
    redirect("/admin/promotions?error=invalid");
  }

  const baseSlug = slugify(parsed.data.title);
  const exists = await prisma.promotion.findUnique({
    where: { slug: baseSlug },
  });
  const ipAddress = await getRequestIpDigest();

  await prisma.$transaction(async (tx) => {
    const created = await tx.promotion.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        startsAt,
        endsAt,
        slug: exists ? `${baseSlug}-${Date.now()}` : baseSlug,
      },
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "PROMOTION_CREATE",
      entityType: "Promotion",
      entityId: created.id,
      after: created,
      ipAddress,
    });
  });

  revalidatePath("/admin/promotions");
  redirect("/admin/promotions?success=created");
}

export async function updatePromotionStatusAction(
  id: string,
  formData: FormData,
) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = publishStatusSchema.safeParse(
    String(formData.get("status") ?? ""),
  );
  if (!parsed.success) return;
  const ipAddress = await getRequestIpDigest();

  await prisma.$transaction(async (tx) => {
    const before = await tx.promotion.findUniqueOrThrow({ where: { id } });
    const after = await tx.promotion.update({
      where: { id },
      data: { status: parsed.data },
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "PROMOTION_STATUS_UPDATE",
      entityType: "Promotion",
      entityId: id,
      before,
      after,
      ipAddress,
    });
  });

  revalidatePath("/admin/promotions");
}

export async function deletePromotionAction(id: string) {
  const session = await requireRole(["ADMIN"]);
  const ipAddress = await getRequestIpDigest();

  await prisma.$transaction(async (tx) => {
    const before = await tx.promotion.findUniqueOrThrow({ where: { id } });
    const after = await tx.promotion.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "PROMOTION_ARCHIVE",
      entityType: "Promotion",
      entityId: id,
      before,
      after,
      ipAddress,
    });
  });

  revalidatePath("/admin/promotions");
}

export async function createArticleAction(formData: FormData) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = articleFormSchema.safeParse(formObject(formData));
  if (!parsed.success) redirect("/admin/articles?error=invalid");

  const baseSlug = slugify(parsed.data.title);
  const exists = await prisma.article.findUnique({ where: { slug: baseSlug } });
  const ipAddress = await getRequestIpDigest();

  await prisma.$transaction(async (tx) => {
    const created = await tx.article.create({
      data: {
        authorId: session.userId,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        slug: exists ? `${baseSlug}-${Date.now()}` : baseSlug,
      },
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "ARTICLE_CREATE",
      entityType: "Article",
      entityId: created.id,
      after: created,
      ipAddress,
    });
  });

  revalidatePath("/admin/articles");
  redirect("/admin/articles?success=created");
}

export async function updateArticleStatusAction(
  id: string,
  formData: FormData,
) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = publishStatusSchema.safeParse(
    String(formData.get("status") ?? ""),
  );
  if (!parsed.success) return;
  const ipAddress = await getRequestIpDigest();

  await prisma.$transaction(async (tx) => {
    const before = await tx.article.findUniqueOrThrow({ where: { id } });
    const after = await tx.article.update({
      where: { id },
      data: {
        status: parsed.data,
        publishedAt: parsed.data === "PUBLISHED" ? new Date() : null,
      },
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "ARTICLE_STATUS_UPDATE",
      entityType: "Article",
      entityId: id,
      before,
      after,
      ipAddress,
    });
  });

  revalidatePath("/admin/articles");
}

export async function deleteArticleAction(id: string) {
  const session = await requireRole(["ADMIN"]);
  const ipAddress = await getRequestIpDigest();

  await prisma.$transaction(async (tx) => {
    const before = await tx.article.findUniqueOrThrow({ where: { id } });
    const after = await tx.article.update({
      where: { id },
      data: { status: "ARCHIVED", publishedAt: null },
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "ARTICLE_ARCHIVE",
      entityType: "Article",
      entityId: id,
      before,
      after,
      ipAddress,
    });
  });

  revalidatePath("/admin/articles");
}

export async function updateShowroomAction(id: string, formData: FormData) {
  const session = await requireRole(["ADMIN"]);
  const parsed = showroomFormSchema.safeParse(formObject(formData));
  if (!parsed.success) redirect("/admin/settings?error=invalid");
  const ipAddress = await getRequestIpDigest();

  await prisma.$transaction(async (tx) => {
    const before = await tx.showroom.findUniqueOrThrow({ where: { id } });
    const after = await tx.showroom.update({
      where: { id },
      data: parsed.data,
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "SHOWROOM_UPDATE",
      entityType: "Showroom",
      entityId: id,
      before,
      after,
      ipAddress,
    });
  });

  revalidatePath("/admin/settings");
  redirect("/admin/settings?success=updated");
}
