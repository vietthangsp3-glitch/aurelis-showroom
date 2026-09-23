"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";

const text = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();
const number = (formData: FormData, name: string, fallback = 0) => {
  const value = Number(text(formData, name));
  return Number.isFinite(value) ? value : fallback;
};

function messageUrl(path: string, type: "success" | "error", message: string) {
  return `${path}?${type}=${encodeURIComponent(message)}`;
}

function refreshCatalog() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function createBrandAction(formData: FormData) {
  await requireRole(["ADMIN", "EDITOR"]);
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  let result: ["success" | "error", string] = ["success", "Đã thêm thương hiệu."];
  try {
    if (!name || !slug) throw new Error("Tên thương hiệu không hợp lệ.");
    await prisma.brand.create({ data: { name, slug, logoUrl: text(formData, "logoUrl") || null, description: text(formData, "description") || null } });
  } catch (error) {
    result = ["error", error instanceof Error && error.message.includes("Unique") ? "Tên hoặc slug thương hiệu đã tồn tại." : "Không thể thêm thương hiệu."];
  }
  refreshCatalog();
  redirect(messageUrl("/admin/brands", ...result));
}

export async function updateBrandAction(brandId: string, formData: FormData) {
  await requireRole(["ADMIN", "EDITOR"]);
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  let result: ["success" | "error", string] = ["success", "Đã cập nhật thương hiệu."];
  try {
    await prisma.brand.update({ where: { id: brandId }, data: { name, slug, logoUrl: text(formData, "logoUrl") || null, description: text(formData, "description") || null } });
  } catch {
    result = ["error", "Không thể cập nhật. Hãy kiểm tra tên và slug."];
  }
  refreshCatalog();
  redirect(messageUrl("/admin/brands", ...result));
}

export async function deleteBrandAction(brandId: string) {
  await requireRole(["ADMIN"]);
  let result: ["success" | "error", string] = ["success", "Đã xóa thương hiệu."];
  try {
    const modelCount = await prisma.vehicleModel.count({ where: { brandId } });
    if (modelCount) throw new Error("HAS_MODELS");
    await prisma.brand.delete({ where: { id: brandId } });
  } catch (error) {
    result = ["error", error instanceof Error && error.message === "HAS_MODELS" ? "Hãy xóa các dòng xe của hãng trước." : "Không thể xóa thương hiệu."];
  }
  refreshCatalog();
  redirect(messageUrl("/admin/brands", ...result));
}

export async function createModelAction(formData: FormData) {
  await requireRole(["ADMIN", "EDITOR"]);
  const brandId = text(formData, "brandId");
  const name = text(formData, "name");
  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { slug: true } });
  let result: ["success" | "error", string] = ["success", "Đã thêm dòng xe."];
  try {
    if (!brand || !name) throw new Error("INVALID");
    const slug = slugify(text(formData, "slug") || `${brand.slug}-${name}`);
    await prisma.vehicleModel.create({ data: { brandId, name, slug } });
  } catch {
    result = ["error", "Dòng xe đã tồn tại hoặc thông tin chưa hợp lệ."];
  }
  refreshCatalog();
  redirect(messageUrl("/admin/brands", ...result));
}

export async function deleteModelAction(modelId: string) {
  await requireRole(["ADMIN"]);
  let result: ["success" | "error", string] = ["success", "Đã xóa dòng xe."];
  try {
    const vehicleCount = await prisma.vehicle.count({ where: { modelId } });
    if (vehicleCount) throw new Error("HAS_VEHICLES");
    await prisma.vehicleModel.delete({ where: { id: modelId } });
  } catch (error) {
    result = ["error", error instanceof Error && error.message === "HAS_VEHICLES" ? "Dòng xe đang có xe, không thể xóa." : "Không thể xóa dòng xe."];
  }
  refreshCatalog();
  redirect(messageUrl("/admin/brands", ...result));
}

function vehicleData(formData: FormData) {
  const status = text(formData, "status") === "PUBLISHED" ? "PUBLISHED" as const : "DRAFT" as const;
  const coverImage = text(formData, "coverImage");
  const galleryImages = [coverImage, ...text(formData, "galleryImages").split(/\r?\n/).map((url) => url.trim())]
    .filter((url, index, all) => url && all.indexOf(url) === index);
  const contentImages = [
    ["CONTENT_EXTERIOR", text(formData, "exteriorImage")],
    ["CONTENT_INTERIOR", text(formData, "interiorImage")],
    ["CONTENT_TECHNOLOGY", text(formData, "technologyImage")],
    ["CONTENT_SAFETY", text(formData, "safetyImage")],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  return {
    modelId: text(formData, "modelId"),
    slug: slugify(text(formData, "slug")),
    year: number(formData, "year", new Date().getFullYear()),
    bodyType: text(formData, "bodyType"),
    segment: text(formData, "segment"),
    fuelType: text(formData, "fuelType"),
    seats: number(formData, "seats", 5),
    description: text(formData, "description"),
    exterior: text(formData, "exterior"),
    interior: text(formData, "interior"),
    technology: text(formData, "technology"),
    safety: text(formData, "safety"),
    seoTitle: text(formData, "seoTitle") || null,
    seoDescription: text(formData, "seoDescription") || null,
    status,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    variant: {
      name: text(formData, "variantName"),
      sku: text(formData, "sku").toUpperCase(),
      price: number(formData, "price"),
      salePrice: text(formData, "salePrice") ? number(formData, "salePrice") : null,
      engine: text(formData, "engine"),
      horsepower: number(formData, "horsepower"),
      torque: number(formData, "torque"),
      acceleration: number(formData, "acceleration"),
      transmission: text(formData, "transmission"),
      drivetrain: text(formData, "drivetrain"),
      dimensions: text(formData, "dimensions"),
    },
    inventory: {
      showroomId: text(formData, "showroomId"),
      color: text(formData, "color") || "Chưa xác định",
      quantity: Math.max(0, number(formData, "quantity")),
      status: text(formData, "inventoryStatus") || "AVAILABLE",
    },
    images: [
      ...galleryImages.map((url, position) => ({ url, kind: position === 0 ? "COVER" : "GALLERY" })),
      ...contentImages.map(([kind, url]) => ({ url, kind })),
    ],
    galleryImages,
  };
}

function validateVehicle(input: ReturnType<typeof vehicleData>) {
  if (!input.modelId || !input.slug || !input.bodyType || !input.segment || !input.fuelType) return "Vui lòng điền đủ thông tin cơ bản.";
  if (!input.variant.name || !input.variant.sku || input.variant.price <= 0) return "Phiên bản, SKU và giá niêm yết là bắt buộc.";
  if (!input.galleryImages.length) return "Cần ít nhất một URL ảnh đại diện.";
  return null;
}

export async function createVehicleAction(formData: FormData) {
  await requireRole(["ADMIN", "EDITOR"]);
  const input = vehicleData(formData);
  const validation = validateVehicle(input);
  if (validation) redirect(messageUrl("/admin/cars/new", "error", validation));
  let result: ["success" | "error", string] = ["success", "Đã tạo xe mới."];
  try {
    await prisma.vehicle.create({
      data: {
        modelId: input.modelId, slug: input.slug, year: input.year, bodyType: input.bodyType,
        segment: input.segment, fuelType: input.fuelType, seats: input.seats,
        description: input.description, exterior: input.exterior, interior: input.interior,
        technology: input.technology, safety: input.safety, seoTitle: input.seoTitle,
        seoDescription: input.seoDescription, status: input.status, publishedAt: input.publishedAt,
        images: { create: input.images.map((image, position) => ({ url: image.url, alt: `${input.variant.name} - ảnh ${position + 1}`, kind: image.kind, position })) },
        variants: { create: { ...input.variant, inventory: input.inventory.showroomId ? { create: input.inventory } : undefined } },
      },
    });
  } catch (error) {
    console.error("createVehicleAction failed", error);
    result = ["error", "Không thể tạo xe. Hãy kiểm tra slug, SKU và dữ liệu nhập."];
  }
  refreshCatalog();
  redirect(messageUrl(result[0] === "success" ? "/admin/cars" : "/admin/cars/new", ...result));
}

export async function updateVehicleAction(vehicleId: string, formData: FormData) {
  await requireRole(["ADMIN", "EDITOR"]);
  const input = vehicleData(formData);
  const validation = validateVehicle(input);
  if (validation) redirect(messageUrl(`/admin/cars/${vehicleId}/edit`, "error", validation));
  let result: ["success" | "error", string] = ["success", "Đã cập nhật xe."];
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.vehicle.findUniqueOrThrow({ where: { id: vehicleId }, include: { variants: { take: 1 } } });
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          modelId: input.modelId, slug: input.slug, year: input.year, bodyType: input.bodyType,
          segment: input.segment, fuelType: input.fuelType, seats: input.seats,
          description: input.description, exterior: input.exterior, interior: input.interior,
          technology: input.technology, safety: input.safety, seoTitle: input.seoTitle,
          seoDescription: input.seoDescription, status: input.status, publishedAt: input.publishedAt,
        },
      });
      const variant = existing.variants[0]
        ? await tx.vehicleVariant.update({ where: { id: existing.variants[0].id }, data: input.variant })
        : await tx.vehicleVariant.create({ data: { vehicleId, ...input.variant } });
      await tx.vehicleImage.deleteMany({ where: { vehicleId } });
      await tx.vehicleImage.createMany({ data: input.images.map((image, position) => ({ vehicleId, url: image.url, alt: `${input.variant.name} - ảnh ${position + 1}`, kind: image.kind, position })) });
      await tx.vehicleInventory.deleteMany({ where: { variantId: variant.id } });
      if (input.inventory.showroomId) await tx.vehicleInventory.create({ data: { variantId: variant.id, ...input.inventory } });
    });
  } catch (error) {
    console.error("updateVehicleAction failed", error);
    result = ["error", "Không thể cập nhật xe. Hãy kiểm tra slug, SKU và dữ liệu nhập."];
  }
  refreshCatalog();
  redirect(messageUrl(result[0] === "success" ? "/admin/cars" : `/admin/cars/${vehicleId}/edit`, ...result));
}

export async function deleteVehicleAction(vehicleId: string) {
  await requireRole(["ADMIN"]);
  await prisma.vehicle.delete({ where: { id: vehicleId } });
  refreshCatalog();
  redirect(messageUrl("/admin/cars", "success", "Đã xóa xe."));
}

export async function toggleVehicleStatusAction(vehicleId: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  const vehicle = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId }, select: { status: true } });
  const published = vehicle.status !== "PUBLISHED";
  await prisma.vehicle.update({ where: { id: vehicleId }, data: { status: published ? "PUBLISHED" : "DRAFT", publishedAt: published ? new Date() : null } });
  refreshCatalog();
}
