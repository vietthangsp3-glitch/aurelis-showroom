import type { BodyType, FuelType, Vehicle } from "@/types/vehicle";

const images = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1800&q=85",
];

interface BrandSeed {
  brand: string;
  slug: string;
  models: string[];
  basePrice: number;
  body: BodyType;
  fuel?: FuelType;
}

const brandSeeds: BrandSeed[] = [
  {
    brand: "Mercedes-Benz",
    slug: "mercedes-benz",
    models: ["C 300 AMG", "E 300 AMG", "S 450 L", "GLC 300 4MATIC", "GLE 450 4MATIC", "GLS 450"],
    basePrice: 2099000000,
    body: "Luxury",
  },
  {
    brand: "BMW",
    slug: "bmw",
    models: ["320i Sport Line", "520i M Sport", "740Li Pure Excellence", "X3 xDrive20i", "X5 xDrive40i"],
    basePrice: 1499000000,
    body: "Luxury",
  },
  {
    brand: "Toyota",
    slug: "toyota",
    models: ["Vios G", "Camry 2.5Q", "Corolla Cross HEV", "Fortuner Legender", "Land Cruiser", "Innova Cross"],
    basePrice: 545000000,
    body: "Sedan",
  },
  {
    brand: "Mazda",
    slug: "mazda",
    models: ["Mazda2 Premium", "Mazda3 Signature", "Mazda6 Premium", "CX-5 Luxury", "CX-8 Premium"],
    basePrice: 420000000,
    body: "Crossover",
  },
  {
    brand: "VinFast",
    slug: "vinfast",
    models: ["VF 5 Plus", "VF 6 Plus", "VF 7 Plus", "VF 8 Lux", "VF 9 Plus"],
    basePrice: 529000000,
    body: "Electric",
    fuel: "Điện",
  },
  {
    brand: "Hyundai",
    slug: "hyundai",
    models: ["Accent Cao cấp", "Elantra N-Line", "Tucson Đặc biệt", "Santa Fe Prestige", "Palisade Exclusive"],
    basePrice: 439000000,
    body: "SUV",
  },
  {
    brand: "Kia",
    slug: "kia",
    models: ["K3 Premium", "K5 GT-Line", "Seltos GT-Line", "Sportage Signature", "Sorento Hybrid", "Carnival Signature"],
    basePrice: 579000000,
    body: "SUV",
  },
  {
    brand: "Lexus",
    slug: "lexus",
    models: ["ES 250", "LS 500h", "NX 350h", "RX 350 Luxury", "GX 550", "LX 600 Urban"],
    basePrice: 2620000000,
    body: "Luxury",
  },
];

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const vehicles: Vehicle[] = brandSeeds
  .flatMap((brand, brandIndex) =>
    brand.models.map((model, modelIndex) => {
      const index = brandIndex * 6 + modelIndex;
      const bodyType =
        brand.body === "Luxury"
          ? model.match(/GL|X\d|NX|RX|GX|LX/)
            ? "SUV"
            : "Sedan"
          : brand.body;
      const price = brand.basePrice + modelIndex * (brand.basePrice * 0.19);
      const hp = brand.fuel === "Điện" ? 174 + modelIndex * 68 : 150 + modelIndex * 37;

      return {
        id: `vehicle-${index + 1}`,
        brand: brand.brand,
        brandSlug: brand.slug,
        model,
        variant: model,
        slug: `${brand.slug}-${slugify(model)}`,
        bodyType,
        segment: bodyType === "Sedan" ? "Sedan cao cấp" : "SUV đa dụng",
        fuelType: brand.fuel ?? (model.includes("Hybrid") || model.includes("HEV") ? "Hybrid" : "Xăng"),
        transmission: brand.fuel === "Điện" ? "Tự động 1 cấp" : "Tự động 8 cấp",
        drivetrain: model.match(/4MATIC|xDrive|Land Cruiser|GX|LX/) ? "AWD" : "FWD",
        seats: model.match(/GLS|GLE|Fortuner|Innova|Santa Fe|Palisade|Sorento|Carnival|GX|LX/) ? 7 : 5,
        year: 2025,
        price: Math.round(price / 1000000) * 1000000,
        salePrice: modelIndex % 3 === 0 ? Math.round((price * 0.96) / 1000000) * 1000000 : undefined,
        status: modelIndex % 5 === 0 ? "LOW_STOCK" : "AVAILABLE",
        stock: 2 + ((brandIndex + modelIndex) % 9),
        horsepower: hp,
        torque: Math.round(hp * 1.55),
        acceleration: Number((9.2 - Math.min(modelIndex, 4) * 0.65).toFixed(1)),
        engine: brand.fuel === "Điện" ? "Động cơ điện hiệu suất cao" : "Động cơ tăng áp thế hệ mới",
        dimensions: "4.750 × 1.920 × 1.650 mm",
        description:
          "Sự cân bằng giữa hiệu suất tinh tế, tiện nghi cao cấp và công nghệ hỗ trợ người lái hiện đại.",
        exterior:
          "Tỷ lệ thân xe cân đối, hệ thống chiếu sáng LED thích ứng và những đường nét được hoàn thiện sắc sảo.",
        interior:
          "Khoang lái tập trung vào người dùng, vật liệu tuyển chọn và không gian yên tĩnh cho mọi hành trình.",
        technology:
          "Màn hình trung tâm độ phân giải cao, kết nối không dây và hệ thống hỗ trợ lái chủ động.",
        safety:
          "Gói an toàn toàn diện với cảnh báo điểm mù, hỗ trợ giữ làn và phanh khẩn cấp tự động.",
        image: images[index % images.length] ?? images[0]!,
        gallery: [
          images[index % images.length] ?? images[0]!,
          images[(index + 1) % images.length] ?? images[1]!,
          images[(index + 2) % images.length] ?? images[2]!,
        ],
      } satisfies Vehicle;
    }),
  )
  .slice(0, 40);

export const brands = brandSeeds.map(({ brand, slug }) => ({ name: brand, slug }));

export function getVehicleBySlug(slug: string) {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}
