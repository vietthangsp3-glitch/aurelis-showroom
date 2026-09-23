"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";

const publishStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const bookingStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateTestDriveStatusAction(id: string, formData: FormData) {
  await requireRole(["ADMIN", "SALES"]);
  const status = text(formData, "status");
  if (!bookingStatuses.includes(status as (typeof bookingStatuses)[number])) return;
  await prisma.testDriveBooking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/test-drives");
}

export async function createPromotionAction(formData: FormData) {
  await requireRole(["ADMIN", "EDITOR"]);
  const title = text(formData, "title");
  const description = text(formData, "description");
  const startsAt = new Date(text(formData, "startsAt"));
  const endsAt = new Date(text(formData, "endsAt"));
  if (!title || !description || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt < startsAt) {
    redirect("/admin/promotions?error=invalid");
  }
  const baseSlug = slugify(title);
  const exists = await prisma.promotion.findUnique({ where: { slug: baseSlug } });
  await prisma.promotion.create({ data: { title, description, startsAt, endsAt, slug: exists ? `${baseSlug}-${Date.now()}` : baseSlug } });
  revalidatePath("/admin/promotions");
  redirect("/admin/promotions?success=created");
}

export async function updatePromotionStatusAction(id: string, formData: FormData) {
  await requireRole(["ADMIN", "EDITOR"]);
  const status = text(formData, "status");
  if (!publishStatuses.includes(status as (typeof publishStatuses)[number])) return;
  await prisma.promotion.update({ where: { id }, data: { status: status as (typeof publishStatuses)[number] } });
  revalidatePath("/admin/promotions");
}

export async function deletePromotionAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.promotion.delete({ where: { id } });
  revalidatePath("/admin/promotions");
}

export async function createArticleAction(formData: FormData) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const title = text(formData, "title");
  const excerpt = text(formData, "excerpt");
  const content = text(formData, "content");
  if (!title || !excerpt || !content) redirect("/admin/articles?error=invalid");
  const baseSlug = slugify(title);
  const exists = await prisma.article.findUnique({ where: { slug: baseSlug } });
  await prisma.article.create({ data: { authorId: session.userId, title, excerpt, content, slug: exists ? `${baseSlug}-${Date.now()}` : baseSlug } });
  revalidatePath("/admin/articles");
  redirect("/admin/articles?success=created");
}

export async function updateArticleStatusAction(id: string, formData: FormData) {
  await requireRole(["ADMIN", "EDITOR"]);
  const status = text(formData, "status");
  if (!publishStatuses.includes(status as (typeof publishStatuses)[number])) return;
  await prisma.article.update({ where: { id }, data: { status: status as (typeof publishStatuses)[number], publishedAt: status === "PUBLISHED" ? new Date() : null } });
  revalidatePath("/admin/articles");
}

export async function deleteArticleAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/articles");
}

export async function updateShowroomAction(id: string, formData: FormData) {
  await requireRole(["ADMIN"]);
  const name = text(formData, "name");
  const address = text(formData, "address");
  const city = text(formData, "city");
  const phone = text(formData, "phone");
  const openingHours = text(formData, "openingHours");
  if (!name || !address || !city || !phone || !openingHours) redirect("/admin/settings?error=invalid");
  await prisma.showroom.update({ where: { id }, data: { name, address, city, phone, openingHours } });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?success=updated");
}
