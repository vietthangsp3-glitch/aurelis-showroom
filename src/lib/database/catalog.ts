import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { brands as fallbackBrands, vehicles as fallbackVehicles } from "@/data/vehicles";
import type { Vehicle } from "@/types/vehicle";

export interface CatalogBrand {
  id?: string;
  name: string;
  slug: string;
}

export async function getCatalogBrands(): Promise<CatalogBrand[]> {
  noStore();
  try {
    return await prisma.brand.findMany({
      where: { models: { some: { vehicles: { some: { status: "PUBLISHED" } } } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("getCatalogBrands failed", error);
    return fallbackBrands;
  }
}

export async function getCatalogVehicles(): Promise<Vehicle[]> {
  noStore();
  try {
    const records = await prisma.vehicle.findMany({
      where: { status: "PUBLISHED" },
      include: {
        model: { include: { brand: true } },
        images: { orderBy: { position: "asc" } },
        variants: {
          orderBy: { createdAt: "asc" },
          take: 1,
          include: { inventory: true },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });

    if (!records.length) return fallbackVehicles;

    return records.map((record) => {
      const variant = record.variants[0];
      const gallery = record.images.map((image) => image.url);
      const image = gallery[0] ?? fallbackVehicles[0]!.image;
      const normalizedGallery = gallery.length ? [...gallery] : [image];
      while (normalizedGallery.length < 3) normalizedGallery.push(image);
      const stock = variant?.inventory.reduce((total, item) => total + item.quantity, 0) ?? 0;
      return {
        id: variant?.id ?? record.id,
        brand: record.model.brand.name,
        brandSlug: record.model.brand.slug,
        model: record.model.name,
        variant: variant?.name ?? record.model.name,
        slug: record.slug,
        bodyType: record.bodyType as Vehicle["bodyType"],
        segment: record.segment,
        fuelType: record.fuelType as Vehicle["fuelType"],
        transmission: variant?.transmission ?? "Đang cập nhật",
        drivetrain: variant?.drivetrain ?? "Đang cập nhật",
        seats: record.seats,
        year: record.year,
        price: Number(variant?.price ?? 0),
        salePrice: variant?.salePrice ? Number(variant.salePrice) : undefined,
        status: stock === 0 ? "PREORDER" : stock <= 3 ? "LOW_STOCK" : "AVAILABLE",
        stock,
        horsepower: variant?.horsepower ?? 0,
        torque: variant?.torque ?? 0,
        acceleration: Number(variant?.acceleration ?? 0),
        engine: variant?.engine ?? "Đang cập nhật",
        dimensions: variant?.dimensions ?? "Đang cập nhật",
        description: record.description,
        exterior: record.exterior,
        interior: record.interior,
        technology: record.technology,
        safety: record.safety,
        image,
        gallery: normalizedGallery,
      } satisfies Vehicle;
    });
  } catch (error) {
    console.error("getCatalogVehicles failed", error);
    return fallbackVehicles;
  }
}

export async function getCatalogVehicleBySlug(slug: string) {
  const catalog = await getCatalogVehicles();
  return catalog.find((vehicle) => vehicle.slug === slug);
}
