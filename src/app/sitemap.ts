import type { MetadataRoute } from "next";
import { getCatalogBrands, getCatalogVehicles } from "@/lib/database/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, vehicles] = await Promise.all([getCatalogBrands(), getCatalogVehicles()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/cars", "/compare", "/finance", "/promotions", "/showroom"];
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const })),
    ...brands.map((brand) => ({ url: `${base}/brands/${brand.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const })),
    ...vehicles.map((vehicle) => ({ url: `${base}/cars/${vehicle.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const })),
  ];
}
