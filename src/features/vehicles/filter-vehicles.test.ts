import { describe, expect, it } from "vitest";
import { vehicles } from "@/data/vehicles";
import { filterVehicles } from "./filter-vehicles";

describe("filterVehicles", () => {
  it("filters by brand and maximum price", () => {
    const result = filterVehicles(vehicles, { brand: "toyota", maxPrice: 2_000_000_000 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((vehicle) => vehicle.brandSlug === "toyota")).toBe(true);
  });

  it("searches by model name", () => {
    expect(filterVehicles(vehicles, { search: "S 450" })[0]?.brand).toBe("Mercedes-Benz");
  });
});
