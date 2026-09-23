import type { CatalogBrand } from "@/lib/database/catalog";

export function BrandMarquee({ brands }: { brands: CatalogBrand[] }) {
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
