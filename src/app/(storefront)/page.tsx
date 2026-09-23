import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, ShieldCheck, Sparkles } from "lucide-react";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { CategoryScrollGallery } from "@/components/home/category-scroll-gallery";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { LeadDialog } from "@/features/leads/components/lead-dialog";
import { LeadInlineForm } from "@/features/leads/components/lead-inline-form";
import { getCatalogBrands, getCatalogVehicles } from "@/lib/database/catalog";

const categories = [
  ["SUV", "Mạnh mẽ cho mọi hành trình"],
  ["Sedan", "Tinh tế trong chuyển động"],
  ["Crossover", "Linh hoạt và đa dụng"],
  ["MPV", "Không gian cho cả gia đình"],
  ["Electric", "Tương lai vận hành xanh"],
  ["Luxury", "Trải nghiệm đỉnh cao"],
] as const;

export default async function HomePage() {
  const [vehicles, brands] = await Promise.all([getCatalogVehicles(), getCatalogBrands()]);
  const featured = vehicles.filter((vehicle) =>
    ["mercedes-benz", "bmw", "lexus", "vinfast"].includes(vehicle.brandSlug),
  ).slice(0, 4);

  return (
    <>
      <section className="hero">
        <Image
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90"
          alt="Mẫu xe thể thao cao cấp trên cung đường núi"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero__veil" />
        <div className="shell hero__content">
          <p className="eyebrow">Biểu tượng được tái định nghĩa</p>
          <h1>Mercedes-Benz<br />S-Class</h1>
          <p className="hero__lede">Phi thường, trong từng cảm xúc.</p>
          <div className="hero__specs">
            <span><strong>496 HP</strong>Công suất tối đa</span>
            <span><strong>4,9 giây</strong>Tăng tốc 0–100 km/h</span>
            <span><strong>4MATIC</strong>Dẫn động 4 bánh</span>
          </div>
          <div className="hero__actions">
            <Link href="/cars/mercedes-benz-s-450-l" className="button button--primary button--lg">
              Khám phá xe →
            </Link>
            <LeadDialog label="Đặt lịch lái thử" variant="outline" />
          </div>
        </div>
        <a href="#featured" className="hero__scroll">Cuộn xuống để khám phá ↓</a>
      </section>

      <BrandMarquee brands={brands} />

      <section className="section section--dark" id="featured">
        <div className="shell">
          <div className="section-heading">
            <div><p className="eyebrow">Xe nổi bật</p><h2>Những mẫu xe đặc biệt.<br />Sẵn sàng cho bạn.</h2></div>
            <Link href="/cars">Xem tất cả xe <ArrowRight size={16} /></Link>
          </div>
          <div className="vehicle-grid vehicle-grid--four">
            {featured.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
          </div>
        </div>
      </section>

      <section className="finder">
        <div className="shell finder__inner">
          <div>
            <p className="eyebrow">Công cụ tìm xe thông minh</p>
            <h2>Tìm chiếc xe phù hợp cho bạn.</h2>
          </div>
          <form action="/cars" className="finder__form">
            <label>Thương hiệu<select name="brand"><option value="">Tất cả</option>{brands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}</select></label>
            <label>Kiểu dáng<select name="body"><option value="">Tất cả</option><option>SUV</option><option>Sedan</option><option>Electric</option></select></label>
            <label>Ngân sách<select name="maxPrice"><option value="">Mọi mức giá</option><option value="1000000000">Dưới 1 tỷ</option><option value="3000000000">Dưới 3 tỷ</option></select></label>
            <button className="button button--primary button--lg" type="submit">Tìm xe ngay →</button>
          </form>
        </div>
      </section>

      <CategoryScrollGallery items={categories.map(([name, description], index) => ({ name, description, image: vehicles[index]?.image ?? vehicles[0]!.image }))} />

      <section className="experience">
        <div className="shell experience__grid">
          <div className="experience__copy">
            <p className="eyebrow">Trải nghiệm vượt trội</p>
            <h2>Hiệu suất. Nghệ thuật chế tác.<br />Một tương lai tốt đẹp hơn.</h2>
            <p>Chúng tôi mang đến nhiều hơn một chiếc xe — chúng tôi kiến tạo hành trình bằng sự am hiểu, minh bạch và tiêu chuẩn dịch vụ khác biệt.</p>
            <Link href="/showroom" className="button button--primary">Khám phá trải nghiệm →</Link>
          </div>
          <div className="experience__tiles">
            <article><Sparkles /><strong>Hiệu suất mạnh mẽ</strong><span>Được chế tác để chinh phục.</span></article>
            <article><BadgePercent /><strong>Nghệ thuật chi tiết</strong><span>Từng chi tiết tạo nên huyền thoại.</span></article>
            <article><ShieldCheck /><strong>An tâm vượt trội</strong><span>Bảo hành và hậu mãi toàn diện.</span></article>
          </div>
        </div>
      </section>

      <section className="lead-strip">
        <div className="shell lead-strip__inner">
          <div><p className="eyebrow">Để chúng tôi tìm chiếc xe phù hợp cho bạn</p><h2>Bắt đầu hành trình<br />cùng AURELIA.</h2></div>
          <LeadInlineForm />
        </div>
      </section>
    </>
  );
}
