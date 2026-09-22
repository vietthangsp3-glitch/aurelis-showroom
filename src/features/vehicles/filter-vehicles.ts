import type { Vehicle } from "@/types/vehicle";

export interface VehicleFilters {
  search?: string;
  brand?: string;
  body?: string;
  fuel?: string;
  maxPrice?: number;
}

export function filterVehicles(items: Vehicle[], filters: VehicleFilters) {
  const query = filters.search?.trim().toLocaleLowerCase("vi") ?? "";
  return items.filter((vehicle) => {
    const haystack = `${vehicle.brand} ${vehicle.model} ${vehicle.variant}`.toLocaleLowerCase("vi");
    return (
      (!query || haystack.includes(query)) &&
      (!filters.brand || vehicle.brandSlug === filters.brand) &&
      (!filters.body || vehicle.bodyType.toLowerCase() === filters.body.toLowerCase()) &&
      (!filters.fuel || vehicle.fuelType === filters.fuel) &&
      (!filters.maxPrice || (vehicle.salePrice ?? vehicle.price) <= filters.maxPrice)
    );
  });
}
