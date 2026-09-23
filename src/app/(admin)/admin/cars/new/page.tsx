import Link from "next/link";
import { VehicleForm } from "@/features/admin/components/vehicle-form";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function NewCarPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireRole(["ADMIN", "EDITOR"]);
  const [{ error }, brands, showrooms] = await Promise.all([
    searchParams,
    prisma.brand.findMany({ include: { models: { select: { id: true, name: true }, orderBy: { name: "asc" } } }, orderBy: { name: "asc" } }),
    prisma.showroom.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return <div className="admin-page"><div className="admin-title"><div><p className="admin-breadcrumb"><Link href="/admin/cars">Quản lý xe</Link> / Thêm xe</p><h1>Thêm xe mới</h1><p>Chọn hãng, dòng xe và nhập đầy đủ dữ liệu để xuất bản lên website.</p></div></div><VehicleForm brands={brands} showrooms={showrooms} error={error} /></div>;
}
