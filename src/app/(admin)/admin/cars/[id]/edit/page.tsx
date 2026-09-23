import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleForm, type VehicleFormValue } from "@/features/admin/components/vehicle-form";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function EditCarPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  await requireRole(["ADMIN", "EDITOR"]);
  const { id } = await params;
  const [{ error }, brands, showrooms, vehicle] = await Promise.all([
    searchParams,
    prisma.brand.findMany({ include: { models: { select: { id: true, name: true }, orderBy: { name: "asc" } } }, orderBy: { name: "asc" } }),
    prisma.showroom.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.vehicle.findUnique({ where: { id }, include: { model: true, variants: { include: { inventory: true }, take: 1 }, images: { orderBy: { position: "asc" } } } }),
  ]);
  if (!vehicle) notFound();
  const variant = vehicle.variants[0];
  const inventory = variant?.inventory[0];
  const value: VehicleFormValue = {
    id: vehicle.id, brandId: vehicle.model.brandId, modelId: vehicle.modelId,
    variantName: variant?.name ?? "", sku: variant?.sku ?? "", slug: vehicle.slug,
    year: vehicle.year, bodyType: vehicle.bodyType, segment: vehicle.segment, fuelType: vehicle.fuelType,
    seats: vehicle.seats, description: vehicle.description, exterior: vehicle.exterior, interior: vehicle.interior,
    technology: vehicle.technology, safety: vehicle.safety, price: Number(variant?.price ?? 0),
    salePrice: variant?.salePrice ? Number(variant.salePrice) : null, engine: variant?.engine ?? "",
    horsepower: variant?.horsepower ?? 0, torque: variant?.torque ?? 0,
    acceleration: Number(variant?.acceleration ?? 0), transmission: variant?.transmission ?? "",
    drivetrain: variant?.drivetrain ?? "", dimensions: variant?.dimensions ?? "",
    showroomId: inventory?.showroomId ?? "", color: inventory?.color ?? "", quantity: inventory?.quantity ?? 0,
    inventoryStatus: inventory?.status ?? "AVAILABLE", coverImage: vehicle.images[0]?.url ?? "",
    galleryImages: vehicle.images.slice(1).map((image) => image.url).join("\n"),
    seoTitle: vehicle.seoTitle ?? "", seoDescription: vehicle.seoDescription ?? "", status: vehicle.status,
  };
  return <div className="admin-page"><div className="admin-title"><div><p className="admin-breadcrumb"><Link href="/admin/cars">Quản lý xe</Link> / Chỉnh sửa</p><h1>Chỉnh sửa {vehicle.model.name}</h1></div></div><VehicleForm brands={brands} showrooms={showrooms} vehicle={value} error={error} /></div>;
}
