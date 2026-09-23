import { describe, expect, it } from "vitest";
import { vehicleFormSchema } from "./catalog";

function validVehicle() {
  return {
    modelId: "model-1",
    slug: "bmw-x5",
    year: 2026,
    bodyType: "SUV",
    segment: "SUV hạng sang",
    fuelType: "Xăng",
    seats: 5,
    description: "",
    exterior: "",
    interior: "",
    technology: "",
    safety: "",
    overviewTitle: "",
    overviewQuote: "",
    brochureUrl: "",
    seoTitle: "",
    seoDescription: "",
    status: "DRAFT",
    variantName: "X5 xDrive40i",
    sku: "X5-40I-2026",
    price: 4_000_000_000,
    salePrice: "",
    engine: "3.0L",
    horsepower: 381,
    torque: 540,
    acceleration: 5.4,
    transmission: "8AT",
    drivetrain: "AWD",
    dimensions: "",
    showroomId: "",
    color: "",
    quantity: 0,
    inventoryStatus: "AVAILABLE",
    coverImage: "https://images.unsplash.com/car.jpg",
    galleryImages: "",
    exteriorImage: "",
    interiorImage: "",
    technologyImage: "",
    safetyImage: "",
  };
}

describe("vehicleFormSchema", () => {
  it("accepts a valid vehicle payload", () => {
    expect(vehicleFormSchema.safeParse(validVehicle()).success).toBe(true);
  });

  it("rejects a sale price greater than list price", () => {
    const result = vehicleFormSchema.safeParse({
      ...validVehicle(),
      salePrice: 5_000_000_000,
    });
    expect(result.success).toBe(false);
  });
  it("rejects remote images outside the allowlist", () => {
    const result = vehicleFormSchema.safeParse({
      ...validVehicle(),
      coverImage: "https://attacker.example/car.jpg",
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than twenty gallery images", () => {
    const galleryImages = Array.from(
      { length: 21 },
      (_, index) => `https://images.unsplash.com/car-${index}.jpg`,
    ).join("\n");
    const result = vehicleFormSchema.safeParse({
      ...validVehicle(),
      galleryImages,
    });
    expect(result.success).toBe(false);
  });
});
