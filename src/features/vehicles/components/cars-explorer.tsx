"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { filterVehicles } from "@/features/vehicles/filter-vehicles";
import type { CatalogBrand } from "@/lib/database/catalog";
import type { Vehicle } from "@/types/vehicle";

export function CarsExplorer({ vehicles, brands }: { vehicles: Vehicle[]; brands: CatalogBrand[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");

  const update = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (searchTerm) next.set("search", searchTerm);
      else next.delete("search");
      if (next.toString() !== searchParams.toString()) {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [pathname, router, searchParams, searchTerm]);

  const filtered = useMemo(() => {
    const result = filterVehicles(vehicles, {
      search: searchTerm,
      brand: searchParams.get("brand") ?? "",
      body: searchParams.get("body") ?? "",
      fuel: searchParams.get("fuel") ?? "",
      maxPrice: Number(searchParams.get("maxPrice")) || undefined,
    });
    const sort = searchParams.get("sort");
    return [...result].sort((a, b) => {
      if (sort === "price-asc") return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
      if (sort === "price-desc") return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      return a.brand.localeCompare(b.brand, "vi");
    });
  }, [searchParams, searchTerm, vehicles]);

  const filters = (
    <div className="filters">
      <div className="filters__title"><SlidersHorizontal size={18} /><div><strong>Bộ lọc tìm kiếm</strong><small>Tinh chỉnh lựa chọn phù hợp nhất.</small></div></div>
      <label>Thương hiệu<select value={searchParams.get("brand") ?? ""} onChange={(event) => update("brand", event.target.value)}><option value="">Tất cả thương hiệu</option>{brands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}</select></label>
      <label>Kiểu dáng<select value={searchParams.get("body") ?? ""} onChange={(event) => update("body", event.target.value)}><option value="">Tất cả kiểu dáng</option><option value="SUV">SUV</option><option value="Sedan">Sedan</option><option value="Crossover">Crossover</option><option value="Electric">Xe điện</option><option value="Luxury">Hạng sang</option></select></label>
      <label>Mức giá<select value={searchParams.get("maxPrice") ?? ""} onChange={(event) => update("maxPrice", event.target.value)}><option value="">Tất cả mức giá</option><option value="1000000000">Dưới 1 tỷ</option><option value="2000000000">Dưới 2 tỷ</option><option value="4000000000">Dưới 4 tỷ</option></select></label>
      <label>Nhiên liệu<select value={searchParams.get("fuel") ?? ""} onChange={(event) => update("fuel", event.target.value)}><option value="">Tất cả nhiên liệu</option><option value="Xăng">Xăng</option><option value="Hybrid">Hybrid</option><option value="Điện">Điện</option></select></label>
      <button type="button" className="button button--outline" onClick={() => router.replace(pathname)}>Đặt lại</button>
    </div>
  );

  return (
    <div className="catalog-layout">
      <aside className="catalog-sidebar">{filters}<div className="advisor-box"><h3>Cần tư vấn trực tiếp?</h3><p>Chuyên viên AURELIA sẵn sàng đồng hành cùng bạn.</p><a href="tel:19001234" className="button button--primary">Gọi 1900 1234</a></div></aside>
      <div className="catalog-results">
        <div className="catalog-toolbar">
          <label className="search-box"><Search size={18} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm theo tên xe..." aria-label="Tìm theo tên xe" /></label>
          <strong>{filtered.length} mẫu xe</strong>
          <select aria-label="Sắp xếp" value={searchParams.get("sort") ?? ""} onChange={(event) => update("sort", event.target.value)}><option value="">Nổi bật</option><option value="price-asc">Giá tăng dần</option><option value="price-desc">Giá giảm dần</option></select>
          <button type="button" className="filter-trigger" onClick={() => setDrawerOpen(true)}><Filter size={18} /> Bộ lọc</button>
        </div>
        {filtered.length ? (
          <div className="vehicle-grid catalog-grid">{filtered.slice(0, 18).map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
        ) : (
          <div className="empty-state"><Search size={34} /><h2>Chưa tìm thấy mẫu xe phù hợp</h2><p>Hãy thử bỏ bớt bộ lọc hoặc mở rộng khoảng giá.</p><button type="button" className="button button--primary" onClick={() => { setSearchTerm(""); router.replace(pathname); }}>Xóa bộ lọc</button></div>
        )}
      </div>
      {drawerOpen && <div className="filter-drawer-backdrop" onMouseDown={() => setDrawerOpen(false)}><div className="filter-drawer" onMouseDown={(event) => event.stopPropagation()}><button type="button" className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Đóng bộ lọc"><X /></button>{filters}</div></div>}
    </div>
  );
}
