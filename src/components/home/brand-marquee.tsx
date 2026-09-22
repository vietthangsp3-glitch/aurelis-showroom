import { brands } from "@/data/vehicles";

export function BrandMarquee() {
  return (
    <section className="brand-marquee" aria-label="Các thương hiệu được phân phối">
      <div className="brand-marquee__track">
        {[...brands, ...brands].map((brand, index) => (
          <span key={`${brand.slug}-${index}`} aria-hidden={index >= brands.length}>
            {brand.name}
          </span>
        ))}
      </div>
    </section>
  );
}
