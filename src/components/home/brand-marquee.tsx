import Image from "next/image";
import type { CatalogBrand } from "@/lib/database/catalog";

const defaultLogos: Record<string, string> = {
  "mercedes-benz": "https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg",
  bmw: "https://cdn.simpleicons.org/bmw/FFFFFF",
  toyota: "https://cdn.simpleicons.org/toyota/FFFFFF",
  mazda: "https://cdn.simpleicons.org/mazda/FFFFFF",
  vinfast: "https://upload.wikimedia.org/wikipedia/commons/4/43/VinFast_logo_%28simple_variant%29.svg",
  hyundai: "https://cdn.simpleicons.org/hyundai/FFFFFF",
  kia: "https://cdn.simpleicons.org/kia/FFFFFF",
  lexus: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Lexus_Logo.svg",
};

export function BrandMarquee({ brands }: { brands: CatalogBrand[] }) {
  return (
    <section className="brand-marquee" aria-label="Các thương hiệu được phân phối">
      <div className="brand-marquee__track">
        {[...brands, ...brands].map((brand, index) => {
          const logo = brand.logoUrl || defaultLogos[brand.slug];
          return <span className={`brand-marquee__item brand-marquee__item--${brand.slug}`} key={`${brand.slug}-${index}`} aria-hidden={index >= brands.length}>
            {logo ? <Image src={logo} alt={index < brands.length ? `Logo ${brand.name}` : ""} width={160} height={58} unoptimized /> : <b>{brand.name}</b>}
          </span>;
        })}
      </div>
    </section>
  );
}
