import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CarFront,
  CircleDollarSign,
  ExternalLink,
  Fuel,
  Gauge,
  MessageCircle,
  Monitor,
  Ruler,
  Settings2,
  Shield,
  ShieldCheck,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import {
  getCatalogVehicleBySlug,
  getCatalogVehicles,
} from "@/lib/database/catalog";
import { formatCurrency } from "@/lib/utils";
import { LeadDialog } from "@/features/leads/components/lead-dialog";
import { VehicleGallery } from "@/features/vehicles/components/vehicle-gallery";
import { VehicleCard } from "@/components/vehicles/vehicle-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const vehicle = await getCatalogVehicleBySlug((await params).slug);
  return vehicle
    ? {
        title: `${vehicle.brand} ${vehicle.model}`,
        description: vehicle.description,
        alternates: { canonical: `/cars/${vehicle.slug}` },
      }
    : {};
}

function SpecGroup({
  icon: Icon,
  title,
  rows,
}: {
  icon: typeof Gauge;
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <article className="technical-card">
      <h3>
        <Icon size={20} />
        {title}
      </h3>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || "Đang cập nhật"}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const vehicle = await getCatalogVehicleBySlug((await params).slug);
  if (!vehicle) notFound();
  const vehicles = await getCatalogVehicles();
  const related = vehicles
    .filter(
      (item) =>
        item.id !== vehicle.id &&
        (item.brand === vehicle.brand || item.bodyType === vehicle.bodyType),
    )
    .slice(0, 4);
  const spec = vehicle.specifications;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${vehicle.brand} ${vehicle.model}`,
    image: vehicle.gallery,
    brand: { "@type": "Brand", name: vehicle.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: vehicle.salePrice ?? vehicle.price,
      availability: "https://schema.org/InStock",
    },
  };
  const groups = [
    {
      icon: Settings2,
      title: "Động cơ & vận hành",
      rows: [
        ["Loại động cơ", vehicle.engine],
        ["Dung tích", spec.displacement],
        ["Công suất tối đa", `${vehicle.horsepower} mã lực`],
        ["Mô-men xoắn cực đại", `${vehicle.torque} Nm`],
        ["Hộp số", vehicle.transmission],
        ["Dẫn động", vehicle.drivetrain],
        ["Tăng tốc 0–100 km/h", `${vehicle.acceleration} giây`],
        ["Tốc độ tối đa", spec.maxSpeed],
        ["Mức tiêu thụ nhiên liệu", spec.consumption],
      ] as Array<[string, string]>,
    },
    {
      icon: Ruler,
      title: "Kích thước & trọng lượng",
      rows: [
        ["Dài × Rộng × Cao", vehicle.dimensions],
        ["Chiều dài cơ sở", spec.wheelbase],
        ["Khoảng sáng gầm xe", spec.groundClearance],
        ["Trọng lượng không tải", spec.curbWeight],
        ["Dung tích khoang hành lý", spec.luggageCapacity],
        ["Dung tích nhiên liệu / pin", spec.energyCapacity],
      ] as Array<[string, string]>,
    },
    {
      icon: Monitor,
      title: "Tiện nghi",
      rows: [
        ["Màn hình trung tâm", spec.centerScreen],
        ["Hệ điều hành / kết nối", spec.connectivity],
        ["Âm thanh", spec.audio],
        ["Điều hòa", spec.climate],
        ["Ghế ngồi", spec.seatMaterial],
        ["Cửa sổ trời", spec.sunroof],
        ["Sạc không dây", spec.wirelessCharging],
        ["Đèn viền nội thất", spec.ambientLighting],
      ] as Array<[string, string]>,
    },
    {
      icon: Shield,
      title: "An toàn",
      rows: [
        ["Hệ thống hỗ trợ lái", spec.driverAssist],
        ["Kiểm soát hành trình", spec.cruiseControl],
        ["Cảnh báo lệch làn", spec.laneWarning],
        ["Hỗ trợ giữ làn", spec.laneKeepAssist],
        ["Cảnh báo điểm mù", spec.blindSpot],
        ["Phanh khẩn cấp", spec.emergencyBrake],
        ["Camera", spec.camera],
        ["Cảm biến", spec.sensors],
        ["Túi khí", spec.airbags],
      ] as Array<[string, string]>,
    },
  ];
  const highlights = [
    [
      "Hệ dẫn động",
      vehicle.exterior,
      vehicle.contentImages?.exterior ?? vehicle.gallery[0],
    ],
    [
      "Không gian nội thất",
      vehicle.interior,
      vehicle.contentImages?.interior ?? vehicle.gallery[1],
    ],
    [
      "Công nghệ thông minh",
      vehicle.technology,
      vehicle.contentImages?.technology ?? vehicle.gallery[2],
    ],
    [
      "An toàn vượt trội",
      vehicle.safety,
      vehicle.contentImages?.safety ?? vehicle.image,
    ],
  ] as const;

  return (
    <main className="vehicle-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="shell detail-breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span>/</span>
        <Link href={`/brands/${vehicle.brandSlug}`}>{vehicle.brand}</Link>
        <span>/</span>
        <strong>{vehicle.model}</strong>
      </div>
      <section className="shell detail-product">
        <VehicleGallery
          images={vehicle.gallery}
          name={`${vehicle.brand} ${vehicle.model}`}
        />
        <aside className="detail-product__info">
          <div className="detail-product__brand">
            <p>{vehicle.segment || vehicle.bodyType}</p>
            {vehicle.brandLogo && (
              <Image
                src={vehicle.brandLogo}
                alt={`Logo ${vehicle.brand}`}
                width={54}
                height={54}
                unoptimized
              />
            )}
          </div>
          <h1>
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="detail-product__description">{vehicle.description}</p>
          <small>Giá từ</small>
          <strong className="detail-product__price">
            {formatCurrency(vehicle.salePrice ?? vehicle.price)}
          </strong>
          <LeadDialog vehicle={vehicle} label="Nhận báo giá →" />
          <div className="detail-product__actions">
            <Link
              href={`/test-drive?vehicle=${vehicle.id}`}
              className="button button--outline"
            >
              Đăng ký lái thử
            </Link>
            <a href="tel:19001234" className="button button--secondary">
              <MessageCircle size={17} /> Tư vấn ngay
            </a>
          </div>
          <div className="detail-product__trust">
            <span>
              <ShieldCheck />
              Bảo hành chính hãng
            </span>
            <span>
              <CircleDollarSign />
              Hỗ trợ trả góp
            </span>
            <span>
              <Truck />
              Giao xe toàn quốc
            </span>
          </div>
        </aside>
      </section>
      <section className="shell detail-quick-specs">
        <span>
          <Settings2 />
          <small>Động cơ</small>
          <strong>{vehicle.engine}</strong>
        </span>
        <span>
          <Gauge />
          <small>Công suất</small>
          <strong>{vehicle.horsepower} mã lực</strong>
        </span>
        <span>
          <Zap />
          <small>Mô-men xoắn</small>
          <strong>{vehicle.torque} Nm</strong>
        </span>
        <span>
          <Gauge />
          <small>0–100 km/h</small>
          <strong>{vehicle.acceleration} giây</strong>
        </span>
        <span>
          <CarFront />
          <small>Hộp số</small>
          <strong>{vehicle.transmission}</strong>
        </span>
        <span>
          <Settings2 />
          <small>Dẫn động</small>
          <strong>{vehicle.drivetrain}</strong>
        </span>
        <span>
          <Fuel />
          <small>Nhiên liệu</small>
          <strong>{vehicle.fuelType}</strong>
        </span>
        <span>
          <Users />
          <small>Số chỗ ngồi</small>
          <strong>{vehicle.seats} chỗ</strong>
        </span>
      </section>
      <section className="shell technical-section">
        <div className="detail-section-title">
          <p>Thông số kỹ thuật</p>
          {vehicle.brochureUrl && (
            <a href={vehicle.brochureUrl} target="_blank" rel="noreferrer">
              Xem brochure đầy đủ <ExternalLink size={14} />
            </a>
          )}
        </div>
        <div className="technical-grid">
          {groups.map((group) => (
            <SpecGroup key={group.title} {...group} />
          ))}
        </div>
      </section>
      <section className="shell highlights-section">
        <div className="detail-section-title">
          <p>Điểm nổi bật</p>
        </div>
        <div className="detail-highlight-grid">
          {highlights.map(([title, copy, image]) => (
            <article key={title}>
              <div>
                <Image src={image!} alt={title} fill sizes="25vw" />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span>→</span>
            </article>
          ))}
        </div>
      </section>
      <section className="shell detail-overview">
        <div>
          <p className="detail-kicker">Tổng quan</p>
          <h2>{vehicle.overviewTitle || "Khẳng định vị thế tiên phong."}</h2>
          <p>
            {vehicle.description} {vehicle.exterior}
          </p>
          <blockquote>
            “
            {vehicle.overviewQuote ||
              "Không chỉ là một chiếc xe, mà là tuyên ngôn của những người dẫn đầu."}
            ”
          </blockquote>
          <small>Đối tác chính thức của {vehicle.brand} tại Việt Nam</small>
        </div>
        <div className="detail-overview__image">
          <Image
            src={vehicle.gallery[1] ?? vehicle.image}
            alt={`${vehicle.model} tổng quan`}
            fill
            sizes="50vw"
          />
          <span>Vững vàng trên mọi hành trình.</span>
        </div>
      </section>
      <section className="shell detail-related">
        <div className="detail-section-title">
          <p>Xe liên quan</p>
        </div>
        <div className="vehicle-grid vehicle-grid--four">
          {related.map((item) => (
            <VehicleCard key={item.id} vehicle={item} light />
          ))}
        </div>
      </section>
      <section className="detail-bottom-cta">
        <div className="shell">
          <div>
            <p>Trải nghiệm đẳng cấp {vehicle.brand}</p>
            <h2>Đặt lịch lái thử ngay hôm nay.</h2>
            <span>
              Cảm nhận sự khác biệt và khám phá {vehicle.model} tại showroom của
              chúng tôi.
            </span>
          </div>
          <div>
            <Link
              href={`/test-drive?vehicle=${vehicle.id}`}
              className="button button--primary"
            >
              Đặt lịch lái thử →
            </Link>
            <a className="button button--outline" href="tel:19001234">
              Tư vấn ngay →
            </a>
          </div>
        </div>
      </section>
      <div className="mobile-sticky-cta">
        <LeadDialog vehicle={vehicle} label="Nhận báo giá" />
        <a href="tel:19001234" className="button button--outline">
          Gọi ngay
        </a>
      </div>
    </main>
  );
}
