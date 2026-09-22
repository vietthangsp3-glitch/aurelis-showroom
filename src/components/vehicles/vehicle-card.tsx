import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gauge, Heart, Users } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { formatCurrency } from "@/lib/utils";

export function VehicleCard({ vehicle, light = false }: { vehicle: Vehicle; light?: boolean }) {
  return (
    <article className={light ? "vehicle-card vehicle-card--light" : "vehicle-card"}>
      <div className="vehicle-card__image">
        <Image
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width: 760px) 88vw, (max-width: 1100px) 45vw, 25vw"
        />
        <button type="button" aria-label={`Yêu thích ${vehicle.model}`} className="vehicle-card__favorite">
          <Heart size={18} />
        </button>
      </div>
      <div className="vehicle-card__body">
        <p>{vehicle.brand}</p>
        <h3>{vehicle.model}</h3>
        <span className="vehicle-card__price">Từ {formatCurrency(vehicle.salePrice ?? vehicle.price)}</span>
        <div className="vehicle-card__specs">
          <span><Gauge size={14} /> {vehicle.horsepower} mã lực</span>
          <span><Users size={14} /> {vehicle.seats} chỗ</span>
          <span>{vehicle.fuelType}</span>
        </div>
        <Link href={`/cars/${vehicle.slug}`} className="vehicle-card__link">
          Xem chi tiết <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
