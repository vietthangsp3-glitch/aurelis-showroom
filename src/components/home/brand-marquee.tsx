import Image from "next/image";
import type { CatalogBrand } from "@/lib/database/catalog";
import { defaultBrandLogos } from "@/lib/brand-logos";

export function BrandMarquee({ brands }: { brands: CatalogBrand[] }) {
  return (
    <section className="brand-marquee" aria-label="Các thương hiệu được phân phối">
      <div className="brand-marquee__track">
        {[...brands, ...brands].map((brand, index) => {
          const logo = brand.logoUrl || defaultBrandLogos[brand.slug];
          return <span className={`brand-marquee__item brand-marquee__item--${brand.slug}`} key={`${brand.slug}-${index}`} aria-hidden={index >= brands.length}>
            {logo ? <Image src={logo} alt={index < brands.length ? `Logo ${brand.name}` : ""} width={160} height={58} unoptimized /> : <b>{brand.name}</b>}
          </span>;
        })}
      </div>
    </section>
  );
}
