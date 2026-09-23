"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/slugify";
import {
  brandFormSchema,
  firstVehicleFormError,
  modelFormSchema,
  parseVehicleForm,
} from "@/features/admin/schemas/catalog";
import { getRequestIpDigest, writeAuditLog } from "@/lib/security/audit";

const text = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();
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
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = brandFormSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    redirect(
      messageUrl(
        "/admin/brands",
        "error",
        parsed.error.issues[0]?.message ?? "Thông tin thương hiệu chưa hợp lệ.",
      ),
    );
  }

  const name = parsed.data.name;
  const slug = slugify(parsed.data.slug || name);
  const ipAddress = await getRequestIpDigest();
  let result: ["success" | "error", string] = [
    "success",
    "Đã thêm thương hiệu.",
  ];

  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.brand.create({
        data: {
          name,
          slug,
          logoUrl: parsed.data.logoUrl || null,
          description: parsed.data.description || null,
        },
      });
      await writeAuditLog(tx, {
        userId: session.userId,
        action: "BRAND_CREATE",
        entityType: "Brand",
        entityId: created.id,
        after: created,
        ipAddress,
      });
    });
  } catch (error) {
    result = [
      "error",
      error instanceof Error && error.message.includes("Unique")
        ? "Tên hoặc slug thương hiệu đã tồn tại."
        : "Không thể thêm thương hiệu.",
    ];
  }

  refreshCatalog();
  redirect(messageUrl("/admin/brands", ...result));
}

export async function updateBrandAction(brandId: string, formData: FormData) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = brandFormSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    redirect(
      messageUrl(
        "/admin/brands",
        "error",
        parsed.error.issues[0]?.message ?? "Thông tin thương hiệu chưa hợp lệ.",
      ),
    );
  }

  const ipAddress = await getRequestIpDigest();
  let result: ["success" | "error", string] = [
    "success",
    "Đã cập nhật thương hiệu.",
  ];

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.brand.findUniqueOrThrow({
        where: { id: brandId },
      });
      const after = await tx.brand.update({
        where: { id: brandId },
        data: {
          name: parsed.data.name,
          slug: slugify(parsed.data.slug || parsed.data.name),
          logoUrl: parsed.data.logoUrl || null,
          description: parsed.data.description || null,
        },
      });
      await writeAuditLog(tx, {
        userId: session.userId,
        action: "BRAND_UPDATE",
        entityType: "Brand",
        entityId: brandId,
        before,
        after,
        ipAddress,
      });
    });
  } catch {
    result = ["error", "Không thể cập nhật. Hãy kiểm tra tên và slug."];
  }

  refreshCatalog();
  redirect(messageUrl("/admin/brands", ...result));
}

export async function deleteBrandAction(brandId: string) {
  const session = await requireRole(["ADMIN"]);
  const ipAddress = await getRequestIpDigest();
  let result: ["success" | "error", string] = [
    "success",
    "Đã xóa thương hiệu.",
  ];
  try {
    await prisma.$transaction(async (tx) => {
      const modelCount = await tx.vehicleModel.count({ where: { brandId } });
      if (modelCount) throw new Error("HAS_MODELS");
      const before = await tx.brand.findUniqueOrThrow({
        where: { id: brandId },
      });
      await tx.brand.delete({ where: { id: brandId } });
      await writeAuditLog(tx, {
        userId: session.userId,
        action: "BRAND_DELETE",
        entityType: "Brand",
        entityId: brandId,
        before,
        ipAddress,
      });
    });
  } catch (error) {
    result = [
      "error",
      error instanceof Error && error.message === "HAS_MODELS"
        ? "Hãy xóa các dòng xe của hãng trước."
        : "Không thể xóa thương hiệu.",
    ];
  }
  refreshCatalog();
  redirect(messageUrl("/admin/brands", ...result));
}

export async function createModelAction(formData: FormData) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = modelFormSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    redirect(
      messageUrl(
        "/admin/brands",
        "error",
        parsed.error.issues[0]?.message ?? "Dòng xe chưa hợp lệ.",
      ),
    );
  }

  const brand = await prisma.brand.findUnique({
    where: { id: parsed.data.brandId },
    select: { slug: true },
  });
  const ipAddress = await getRequestIpDigest();
  let result: ["success" | "error", string] = ["success", "Đã thêm dòng xe."];

  try {
    if (!brand) throw new Error("INVALID");
    const slug = slugify(
      parsed.data.slug || `${brand.slug}-${parsed.data.name}`,
    );
    await prisma.$transaction(async (tx) => {
      const created = await tx.vehicleModel.create({
        data: { brandId: parsed.data.brandId, name: parsed.data.name, slug },
      });
      await writeAuditLog(tx, {
        userId: session.userId,
        action: "VEHICLE_MODEL_CREATE",
        entityType: "VehicleModel",
        entityId: created.id,
        after: created,
        ipAddress,
      });
    });
  } catch {
    result = ["error", "Dòng xe đã tồn tại hoặc thông tin chưa hợp lệ."];
  }

  refreshCatalog();
  redirect(messageUrl("/admin/brands", ...result));
}

export async function deleteModelAction(modelId: string) {
  const session = await requireRole(["ADMIN"]);
  const ipAddress = await getRequestIpDigest();
  let result: ["success" | "error", string] = ["success", "Đã xóa dòng xe."];
  try {
    await prisma.$transaction(async (tx) => {
      const vehicleCount = await tx.vehicle.count({ where: { modelId } });
      if (vehicleCount) throw new Error("HAS_VEHICLES");
      const before = await tx.vehicleModel.findUniqueOrThrow({
        where: { id: modelId },
      });
      await tx.vehicleModel.delete({ where: { id: modelId } });
      await writeAuditLog(tx, {
        userId: session.userId,
        action: "VEHICLE_MODEL_DELETE",
        entityType: "VehicleModel",
        entityId: modelId,
        before,
        ipAddress,
      });
    });
  } catch (error) {
    result = [
      "error",
      error instanceof Error && error.message === "HAS_VEHICLES"
        ? "Dòng xe đang có xe, không thể xóa."
        : "Không thể xóa dòng xe.",
    ];
  }
  refreshCatalog();
  redirect(messageUrl("/admin/brands", ...result));
}

function vehicleData(formData: FormData) {
  const status =
    text(formData, "status") === "PUBLISHED"
      ? ("PUBLISHED" as const)
      : ("DRAFT" as const);
  const coverImage = text(formData, "coverImage");
  const galleryImages = [
    coverImage,
    ...text(formData, "galleryImages")
      .split(/\r?\n/)
      .map((url) => url.trim()),
  ].filter((url, index, all) => url && all.indexOf(url) === index);
  const contentImages = [
    ["CONTENT_EXTERIOR", text(formData, "exteriorImage")],
    ["CONTENT_INTERIOR", text(formData, "interiorImage")],
    ["CONTENT_TECHNOLOGY", text(formData, "technologyImage")],
    ["CONTENT_SAFETY", text(formData, "safetyImage")],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const specificationKeys = [
    "displacement",
    "maxSpeed",
    "consumption",
    "wheelbase",
    "groundClearance",
    "curbWeight",
    "luggageCapacity",
    "energyCapacity",
    "centerScreen",
    "audio",
    "climate",
    "seatMaterial",
    "sunroof",
    "wirelessCharging",
    "connectivity",
    "ambientLighting",
    "driverAssist",
    "cruiseControl",
    "laneWarning",
    "laneKeepAssist",
    "blindSpot",
    "emergencyBrake",
    "camera",
    "sensors",
    "airbags",
  ];
  const specifications = Object.fromEntries(
    specificationKeys
      .map((key) => [key, text(formData, key)])
      .filter(([, value]) => value),
  );
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
    specifications,
    overviewTitle: text(formData, "overviewTitle") || null,
    overviewQuote: text(formData, "overviewQuote") || null,
    brochureUrl: text(formData, "brochureUrl") || null,
    seoTitle: text(formData, "seoTitle") || null,
    seoDescription: text(formData, "seoDescription") || null,
    status,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    variant: {
      name: text(formData, "variantName"),
      sku: text(formData, "sku").toUpperCase(),
      price: number(formData, "price"),
      salePrice: text(formData, "salePrice")
        ? number(formData, "salePrice")
        : null,
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
      ...galleryImages.map((url, position) => ({
        url,
        kind: position === 0 ? "COVER" : "GALLERY",
      })),
      ...contentImages.map(([kind, url]) => ({ url, kind })),
    ],
    galleryImages,
  };
}

export async function createVehicleAction(formData: FormData) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = parseVehicleForm(formData);
  if (!parsed.success) {
    redirect(
      messageUrl("/admin/cars/new", "error", firstVehicleFormError(parsed)),
    );
  }
  const input = vehicleData(formData);
  const ipAddress = await getRequestIpDigest();
  let result: ["success" | "error", string] = ["success", "Đã tạo xe mới."];
  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.vehicle.create({
        data: {
          modelId: input.modelId,
          slug: input.slug,
          year: input.year,
          bodyType: input.bodyType,
          segment: input.segment,
          fuelType: input.fuelType,
          seats: input.seats,
          description: input.description,
          exterior: input.exterior,
          interior: input.interior,
          technology: input.technology,
          safety: input.safety,
          specifications: input.specifications,
          overviewTitle: input.overviewTitle,
          overviewQuote: input.overviewQuote,
          brochureUrl: input.brochureUrl,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          status: input.status,
          publishedAt: input.publishedAt,
          images: {
            create: input.images.map((image, position) => ({
              url: image.url,
              alt: `${input.variant.name} - ảnh ${position + 1}`,
              kind: image.kind,
              position,
            })),
          },
          variants: {
            create: {
              ...input.variant,
              inventory: input.inventory.showroomId
                ? { create: input.inventory }
                : undefined,
            },
          },
        },
      });
      await writeAuditLog(tx, {
        userId: session.userId,
        action: "VEHICLE_CREATE",
        entityType: "Vehicle",
        entityId: created.id,
        after: { id: created.id, slug: created.slug, status: created.status },
        ipAddress,
      });
    });
  } catch (error) {
    console.error("createVehicleAction failed", error);
    result = [
      "error",
      "Không thể tạo xe. Hãy kiểm tra slug, SKU và dữ liệu nhập.",
    ];
  }
  refreshCatalog();
  redirect(
    messageUrl(
      result[0] === "success" ? "/admin/cars" : "/admin/cars/new",
      ...result,
    ),
  );
}

export async function updateVehicleAction(
  vehicleId: string,
  formData: FormData,
) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = parseVehicleForm(formData);
  if (!parsed.success) {
    redirect(
      messageUrl(
        `/admin/cars/${vehicleId}/edit`,
        "error",
        firstVehicleFormError(parsed),
      ),
    );
  }
  const input = vehicleData(formData);
  const variantId = text(formData, "variantId");
  const inventoryId = text(formData, "inventoryId");
  const ipAddress = await getRequestIpDigest();
  let result: ["success" | "error", string] = ["success", "Đã cập nhật xe."];
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.vehicle.findUniqueOrThrow({
        where: { id: vehicleId },
        include: { variants: { include: { inventory: true } }, images: true },
      });
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          modelId: input.modelId,
          slug: input.slug,
          year: input.year,
          bodyType: input.bodyType,
          segment: input.segment,
          fuelType: input.fuelType,
          seats: input.seats,
          description: input.description,
          exterior: input.exterior,
          interior: input.interior,
          technology: input.technology,
          safety: input.safety,
          specifications: input.specifications,
          overviewTitle: input.overviewTitle,
          overviewQuote: input.overviewQuote,
          brochureUrl: input.brochureUrl,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          status: input.status,
          publishedAt:
            input.status === "PUBLISHED"
              ? (existing.publishedAt ?? new Date())
              : null,
        },
      });
      const selectedVariant = variantId
        ? existing.variants.find((item) => item.id === variantId)
        : existing.variants[0];
      if (variantId && !selectedVariant) throw new Error("INVALID_VARIANT");
      const variant = selectedVariant
        ? await tx.vehicleVariant.update({
            where: { id: selectedVariant.id },
            data: input.variant,
          })
        : await tx.vehicleVariant.create({
            data: { vehicleId, ...input.variant },
          });
      await tx.vehicleImage.deleteMany({ where: { vehicleId } });
      await tx.vehicleImage.createMany({
        data: input.images.map((image, position) => ({
          vehicleId,
          url: image.url,
          alt: `${input.variant.name} - ảnh ${position + 1}`,
          kind: image.kind,
          position,
        })),
      });
      if (inventoryId) {
        const selectedInventory = await tx.vehicleInventory.findFirst({
          where: { id: inventoryId, variantId: variant.id },
        });
        if (!selectedInventory) throw new Error("INVALID_INVENTORY");
        if (input.inventory.showroomId) {
          await tx.vehicleInventory.update({
            where: { id: inventoryId },
            data: input.inventory,
          });
        } else {
          await tx.vehicleInventory.delete({ where: { id: inventoryId } });
        }
      } else if (input.inventory.showroomId) {
        await tx.vehicleInventory.create({
          data: { variantId: variant.id, ...input.inventory },
        });
      }

      const updated = await tx.vehicle.findUniqueOrThrow({
        where: { id: vehicleId },
        include: { variants: { include: { inventory: true } }, images: true },
      });
      await writeAuditLog(tx, {
        userId: session.userId,
        action: "VEHICLE_UPDATE",
        entityType: "Vehicle",
        entityId: vehicleId,
        before: existing,
        after: updated,
        ipAddress,
      });
    });
  } catch (error) {
    console.error("updateVehicleAction failed", error);
    result = [
      "error",
      "Không thể cập nhật xe. Hãy kiểm tra slug, SKU và dữ liệu nhập.",
    ];
  }
  refreshCatalog();
  redirect(
    messageUrl(
      result[0] === "success" ? "/admin/cars" : `/admin/cars/${vehicleId}/edit`,
      ...result,
    ),
  );
}

export async function deleteVehicleAction(vehicleId: string) {
  const session = await requireRole(["ADMIN"]);
  const ipAddress = await getRequestIpDigest();
  await prisma.$transaction(async (tx) => {
    const before = await tx.vehicle.findUniqueOrThrow({
      where: { id: vehicleId },
    });
    const after = await tx.vehicle.update({
      where: { id: vehicleId },
      data: { status: "ARCHIVED", publishedAt: null },
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: "VEHICLE_ARCHIVE",
      entityType: "Vehicle",
      entityId: vehicleId,
      before,
      after,
      ipAddress,
    });
  });
  refreshCatalog();
  redirect(messageUrl("/admin/cars", "success", "Đã lưu trữ xe."));
}

export async function toggleVehicleStatusAction(vehicleId: string) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const ipAddress = await getRequestIpDigest();
  await prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUniqueOrThrow({
      where: { id: vehicleId },
    });
    const published = vehicle.status !== "PUBLISHED";
    const updated = await tx.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: published ? "PUBLISHED" : "DRAFT",
        publishedAt: published ? new Date() : null,
      },
    });
    await writeAuditLog(tx, {
      userId: session.userId,
      action: published ? "VEHICLE_PUBLISH" : "VEHICLE_UNPUBLISH",
      entityType: "Vehicle",
      entityId: vehicleId,
      before: vehicle,
      after: updated,
      ipAddress,
    });
  });
  refreshCatalog();
}
