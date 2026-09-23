import { BrandManager } from "@/features/admin/components/brand-manager";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function AdminBrandsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const params = await searchParams;
  const brands = await prisma.brand.findMany({
    include: { models: { include: { _count: { select: { vehicles: true } } }, orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });
  return (
    <div className="admin-page">
      <div className="admin-title"><div><p className="admin-breadcrumb">Trang chủ / Thương hiệu</p><h1>Thương hiệu & dòng xe</h1><p>Quản lý dữ liệu hãng và các dòng xe dùng trong form thêm xe.</p></div></div>
      {(params.success || params.error) && <p className={params.error ? "admin-flash admin-flash--error" : "admin-flash"}>{params.error ?? params.success}</p>}
      <BrandManager canDelete={session.role === "ADMIN"} brands={brands.map((brand) => ({ ...brand, models: brand.models.map((model) => ({ id: model.id, name: model.name, slug: model.slug, vehicleCount: model._count.vehicles })) }))} />
    </div>
  );
}
