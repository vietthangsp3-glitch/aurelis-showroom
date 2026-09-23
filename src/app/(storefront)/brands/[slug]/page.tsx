import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { getCatalogBrands, getCatalogVehicles } from "@/lib/database/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brands = await getCatalogBrands();
  const brand = brands.find((item) => item.slug === slug);
  return brand ? { title: brand.name, description: `Khám phá các mẫu xe ${brand.name} tại AURELIA.` } : {};
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [brands, vehicles] = await Promise.all([getCatalogBrands(), getCatalogVehicles()]);
  const brand = brands.find((item) => item.slug === slug);
  if (!brand) notFound();
  const catalog = vehicles.filter((vehicle) => vehicle.brandSlug === slug);
  if (!catalog.length) notFound();
  return <>
    <section className="page-hero"><Image src={catalog[0]!.image} alt="" fill priority sizes="100vw" /><div className="page-hero__veil" /><div className="shell page-hero__content"><p className="eyebrow">Thương hiệu tuyển chọn</p><h1>{brand.name}</h1><p>Di sản thiết kế, công nghệ và hiệu suất trong từng mẫu xe.</p></div></section>
    <section className="section section--dark"><div className="shell"><div className="section-heading"><div><p className="eyebrow">Bộ sưu tập</p><h2>{catalog.length} mẫu xe {brand.name}</h2></div></div><div className="vehicle-grid catalog-grid">{catalog.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div></div></section>
  </>;
}
