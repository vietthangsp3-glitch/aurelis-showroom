export type BodyType =
  | "Sedan"
  | "SUV"
  | "Crossover"
  | "MPV"
  | "Hatchback"
  | "Electric"
  | "Luxury";

export type FuelType = "Xăng" | "Hybrid" | "Điện" | "Dầu";

export interface Vehicle {
  id: string;
  brand: string;
  brandSlug: string;
  model: string;
  variant: string;
  slug: string;
  bodyType: BodyType;
  segment: string;
  fuelType: FuelType;
  transmission: string;
  drivetrain: string;
  seats: number;
  year: number;
  price: number;
  salePrice?: number;
  status: "AVAILABLE" | "LOW_STOCK" | "PREORDER";
  stock: number;
  horsepower: number;
  torque: number;
  acceleration: number;
  engine: string;
  dimensions: string;
  description: string;
  exterior: string;
  interior: string;
  technology: string;
  safety: string;
  specifications: Record<string, string>;
  overviewTitle?: string;
  overviewQuote?: string;
  brochureUrl?: string;
  brandLogo?: string;
  image: string;
  gallery: string[];
  contentImages?: {
    exterior?: string;
    interior?: string;
    technology?: string;
    safety?: string;
  };
}
