import type { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Car, Eye, Fuel, Search } from "lucide-react";
import { VehicleRowActions } from "@/features/admin/components/vehicle-row-actions";
import { toggleVehicleStatusAction } from "@/features/admin/actions/catalog";
import { prisma } from "@/lib/database/prisma";
import { formatCurrency } from "@/lib/utils";
import { requireRole } from "@/lib/auth/session";
import { vehicles as fallbackVehicles } from "@/data/vehicles";

interface Params { search?: string; brand?: string; body?: string; status?: string; success?: string; error?: string }

export default async function AdminCarsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const params = await searchParams;
  const where: Prisma.VehicleWhereInput = {
    ...(params.brand ? { model: { brandId: params.brand } } : {}),
    ...(params.body ? { bodyType: params.body } : {}),
    ...(params.status ? { status: params.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
    ...(params.search ? { OR: [
      { slug: { contains: params.search, mode: "insensitive" } },
      { model: { name: { contains: params.search, mode: "insensitive" } } },
      { model: { brand: { name: { contains: params.search, mode: "insensitive" } } } },
    ] } : {}),
  };
  const [records, brands, total, published, drafts] = await Promise.all([
    prisma.vehicle.findMany({ where, include: { model: { include: { brand: true } }, images: { orderBy: { position: "asc" }, take: 1 }, variants: { include: { inventory: true }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "PUBLISHED" } }),
    prisma.vehicle.count({ where: { status: "DRAFT" } }),
  ]);
  return (
    <div className="admin-page">
      <div className="admin-title"><div><p className="admin-breadcrumb">Trang chủ / Quản lý xe</p><h1>Quản lý xe</h1><p>Danh sách xe lấy trực tiếp từ Neon và đồng bộ với website.</p></div><Link href="/admin/cars/new" className="admin-button">＋ Thêm xe mới</Link></div>
      {(params.success || params.error) && <p className={params.error ? "admin-flash admin-flash--error" : "admin-flash"}>{params.error ?? params.success}</p>}
      <section className="admin-metrics admin-metrics--cars"><article><Car /><span>Tổng số xe<strong>{total}</strong><small>{brands.length} thương hiệu</small></span></article><article><Eye /><span>Đang hiển thị<strong>{published}</strong><small>Đã xuất bản</small></span></article><article><Fuel /><span>Bản nháp<strong>{drafts}</strong><small>Chưa hiển thị</small></span></article></section>
      <section className="admin-card cars-panel">
        <form className="cars-toolbar" method="get"><label><Search size={16} /><input name="search" defaultValue={params.search} placeholder="Tên xe, slug hoặc hãng..." /></label><select name="brand" defaultValue={params.brand ?? ""}><option value="">Hãng xe: Tất cả</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select><select name="body" defaultValue={params.body ?? ""}><option value="">Kiểu dáng: Tất cả</option>{["SUV", "Sedan", "Crossover", "MPV", "Hatchback", "Electric", "Luxury"].map((body) => <option key={body}>{body}</option>)}</select><select name="status" defaultValue={params.status ?? ""}><option value="">Trạng thái: Tất cả</option><option value="PUBLISHED">Đang hiển thị</option><option value="DRAFT">Bản nháp</option><option value="ARCHIVED">Đã lưu trữ</option></select><button type="submit">Lọc</button></form>
        <div className="cars-table">
          <div className="cars-table__row cars-table__head"><span>Xe</span><span>Hãng</span><span>Giá niêm yết</span><span>Năm</span><span>Tồn kho</span><span>Hiển thị</span><span>Nhiên liệu</span><span>Cập nhật</span><span>Thao tác</span></div>
          {records.map((vehicle) => {
            const variant = vehicle.variants[0];
            const stock = variant?.inventory.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
            const name = `${vehicle.model.brand.name} ${vehicle.model.name}`;
            return <div className="cars-table__row" key={vehicle.id}><span className="car-cell"><span className="car-thumb"><Image src={vehicle.images[0]?.url ?? fallbackVehicles[0]!.image} alt="" fill sizes="70px" /></span><span><strong>{vehicle.model.name}</strong><small>{variant?.sku ?? vehicle.slug}</small></span></span><span>{vehicle.model.brand.name}</span><span>{formatCurrency(Number(variant?.salePrice ?? variant?.price ?? 0))}</span><span>{vehicle.year}</span><span><b className={stock <= 3 ? "stock low" : "stock"}>{stock ? `${stock} xe` : "Hết hàng"}</b></span><span><form action={toggleVehicleStatusAction.bind(null, vehicle.id)}><button className="toggle" aria-label={`Thay đổi hiển thị ${name}`} aria-pressed={vehicle.status === "PUBLISHED"}><i /></button></form></span><span>{vehicle.fuelType}</span><span>{vehicle.updatedAt.toLocaleDateString("vi-VN")}<small>{vehicle.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}</small></span><VehicleRowActions id={vehicle.id} name={name} canDelete={session.role === "ADMIN"} /></div>;
          })}
        </div>
        {!records.length && <div className="admin-empty-state">Không có xe phù hợp bộ lọc.</div>}
        <div className="table-pagination"><span>Hiển thị {records.length} / {total} xe</span><Link href="/admin/cars/new" className="admin-button admin-button--light">Thêm xe</Link></div>
      </section>
    </div>
  );
}
