import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gauge, Settings2, Users, Zap } from "lucide-react";
import { getCatalogVehicleBySlug, getCatalogVehicles } from "@/lib/database/catalog";
import { formatCurrency } from "@/lib/utils";
import { LeadDialog } from "@/features/leads/components/lead-dialog";
import { VehicleGallery } from "@/features/vehicles/components/vehicle-gallery";
import { VehicleCard } from "@/components/vehicles/vehicle-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getCatalogVehicleBySlug(slug);
  if (!vehicle) return {};
  return {
    title: `${vehicle.brand} ${vehicle.model}`,
    description: vehicle.description,
    alternates: { canonical: `/cars/${vehicle.slug}` },
  };
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getCatalogVehicleBySlug(slug);
  if (!vehicle) notFound();
  const vehicles = await getCatalogVehicles();
  const related = vehicles.filter((item) => item.brand === vehicle.brand && item.id !== vehicle.id).slice(0, 4);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${vehicle.brand} ${vehicle.model}`,
    image: vehicle.gallery,
    brand: { "@type": "Brand", name: vehicle.brand },
    offers: { "@type": "Offer", priceCurrency: "VND", price: vehicle.salePrice ?? vehicle.price, availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />
      <section className="detail-hero">
        <div className="detail-hero__media"><VehicleGallery images={vehicle.gallery} name={`${vehicle.brand} ${vehicle.model}`} /></div>
        <div className="detail-hero__info"><p className="eyebrow">{vehicle.bodyType} {vehicle.year}</p><h1>{vehicle.brand}<br />{vehicle.model}</h1><p>{vehicle.description}</p><small>Giá từ</small><strong>{formatCurrency(vehicle.salePrice ?? vehicle.price)}</strong><LeadDialog vehicle={vehicle} label="Nhận báo giá" /><div className="detail-actions"><LeadDialog vehicle={vehicle} label="Đăng ký lái thử" variant="outline" /><a href="tel:19001234" className="button button--outline">Tư vấn ngay</a></div></div>
      </section>
      <section className="quick-specs"><div className="shell"><span><Settings2 /> <small>Động cơ</small><strong>{vehicle.engine}</strong></span><span><Gauge /><small>Công suất</small><strong>{vehicle.horsepower} mã lực</strong></span><span><Zap /><small>0–100 km/h</small><strong>{vehicle.acceleration} giây</strong></span><span><Users /><small>Số chỗ</small><strong>{vehicle.seats} chỗ</strong></span></div></section>
      <section className="detail-story"><div className="shell detail-story__grid"><nav><a href="#overview">Tổng quan</a><a href="#exterior">Ngoại thất</a><a href="#interior">Nội thất</a><a href="#technology">Công nghệ</a><a href="#safety">An toàn</a></nav><div id="overview"><p className="eyebrow">Tổng quan</p><h2>Tinh hoa của sự hoàn hảo.</h2><p>{vehicle.description} Mỗi chi tiết được chăm chút để tạo nên trải nghiệm di chuyển bình tĩnh, chính xác và đầy cảm xúc.</p><blockquote>“Sang trọng không chỉ là điểm đến, mà là cách bạn trải nghiệm hành trình.”</blockquote></div><div className="detail-story__image"><Image src={vehicle.gallery[1] ?? vehicle.image} alt={`${vehicle.model} nhìn từ phía sau`} fill sizes="40vw" /></div></div>
        <div className="shell detail-features"><article id="exterior"><Image src={vehicle.contentImages?.exterior ?? vehicle.gallery[0]!} alt="Ngoại thất xe" fill sizes="25vw" /><span><strong>Thiết kế ngoại thất</strong><small>{vehicle.exterior}</small></span></article><article id="interior"><Image src={vehicle.contentImages?.interior ?? vehicle.gallery[1]!} alt="Nội thất xe" fill sizes="25vw" /><span><strong>Không gian nội thất</strong><small>{vehicle.interior}</small></span></article><article id="technology"><Image src={vehicle.contentImages?.technology ?? vehicle.gallery[2]!} alt="Công nghệ trên xe" fill sizes="25vw" /><span><strong>Công nghệ tiên tiến</strong><small>{vehicle.technology}</small></span></article><article id="safety"><Image src={vehicle.contentImages?.safety ?? vehicle.image} alt="Trang bị an toàn" fill sizes="25vw" /><span><strong>An toàn vượt trội</strong><small>{vehicle.safety}</small></span></article></div>
      </section>
      <section className="section section--light related"><div className="shell"><div className="section-heading section-heading--dark"><div><p className="eyebrow">Có thể bạn quan tâm</p><h2>Các mẫu xe liên quan</h2></div><Link href="/cars">Xem tất cả xe →</Link></div><div className="vehicle-grid vehicle-grid--four">{related.map((item) => <VehicleCard key={item.id} vehicle={item} light />)}</div></div></section>
      <div className="mobile-sticky-cta"><LeadDialog vehicle={vehicle} label="Nhận báo giá" /><a href="tel:19001234" className="button button--outline">Gọi ngay</a></div>
    </>
  );
}
