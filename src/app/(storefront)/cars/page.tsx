import type { Metadata } from "next";
import Image from "next/image";
import { CarsExplorer } from "@/features/vehicles/components/cars-explorer";
import { getCatalogBrands, getCatalogVehicles } from "@/lib/database/catalog";

export const metadata: Metadata = {
  title: "Khám phá xe",
  description: "Tìm và so sánh 40 mẫu xe được tuyển chọn từ tám thương hiệu hàng đầu.",
};

export default async function CarsPage() {
  const [vehicles, brands] = await Promise.all([getCatalogVehicles(), getCatalogBrands()]);
  return (
    <>
      <section className="page-hero page-hero--catalog">
        <Image src={vehicles[3]!.image} alt="" fill priority sizes="100vw" />
        <div className="page-hero__veil" />
        <div className="shell page-hero__content"><p className="eyebrow">Bộ sưu tập AURELIA</p><h1>Khám phá bộ sưu tập xe</h1><p>Lựa chọn chiếc xe lý tưởng từ những thương hiệu danh tiếng hàng đầu thế giới.</p></div>
      </section>
      <section className="catalog-section"><div className="shell"><CarsExplorer vehicles={vehicles} brands={brands} /></div></section>
    </>
  );
}
