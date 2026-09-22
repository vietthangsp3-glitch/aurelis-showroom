"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { formatCurrency } from "@/lib/utils";
import { LeadDialog } from "@/features/leads/components/lead-dialog";

const rows: Array<[string, keyof Vehicle, (value: Vehicle[keyof Vehicle]) => string]> = [
  ["Giá niêm yết", "price", (value) => formatCurrency(Number(value))],
  ["Động cơ", "engine", String],
  ["Công suất", "horsepower", (value) => `${value} mã lực`],
  ["Mô-men xoắn", "torque", (value) => `${value} Nm`],
  ["Tăng tốc 0–100 km/h", "acceleration", (value) => `${value} giây`],
  ["Hộp số", "transmission", String],
  ["Dẫn động", "drivetrain", String],
  ["Số chỗ", "seats", (value) => `${value} chỗ`],
  ["Kích thước", "dimensions", String],
  ["Nhiên liệu", "fuelType", String],
  ["Công nghệ", "technology", String],
  ["An toàn", "safety", String],
];

export function CompareWorkspace({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedIds, setSelectedIds] = useState(() => vehicles.slice(0, 3).map((vehicle) => vehicle.id));
  const selected = useMemo(() => selectedIds.map((id) => vehicles.find((vehicle) => vehicle.id === id)).filter(Boolean) as Vehicle[], [selectedIds, vehicles]);

  const remove = (id: string) => setSelectedIds((current) => current.filter((item) => item !== id));
  const add = (id: string) => {
    if (id && selectedIds.length < 4 && !selectedIds.includes(id)) setSelectedIds((current) => [...current, id]);
  };

  if (!selected.length) {
    return <div className="empty-state compare-empty"><Plus /><h2>Chưa có xe để so sánh</h2><p>Chọn tối đa bốn xe để xem khác biệt về giá, hiệu suất và trang bị.</p><select onChange={(event) => add(event.target.value)} defaultValue=""><option value="" disabled>Chọn xe đầu tiên</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model}</option>)}</select></div>;
  }

  return (
    <div className="compare-scroll">
      <div className="compare-table" style={{ "--compare-count": selected.length } as React.CSSProperties}>
        <div className="compare-label compare-label--intro"><p className="eyebrow">So sánh xe</p><h2>{selected.length} xe được chọn</h2><span>So sánh chính xác để đưa ra quyết định thông minh.</span></div>
        {selected.map((vehicle) => <article key={vehicle.id} className="compare-vehicle"><button type="button" onClick={() => remove(vehicle.id)} aria-label={`Xóa ${vehicle.model}`}><X size={16} /></button><div><Image src={vehicle.image} alt="" fill sizes="260px" /></div><small>{vehicle.brand}</small><strong>{vehicle.model}</strong><span>{formatCurrency(vehicle.salePrice ?? vehicle.price)}</span></article>)}
        {selected.length < 4 && <label className="compare-add"><Plus /><span>Thêm xe để so sánh</span><select value="" onChange={(event) => add(event.target.value)} aria-label="Thêm xe"><option value="">Chọn một mẫu xe</option>{vehicles.filter((vehicle) => !selectedIds.includes(vehicle.id)).map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model}</option>)}</select></label>}
        {rows.map(([label, key, formatter]) => (
          <div className="compare-row" key={key}>
            <strong className="compare-label">{label}</strong>
            {selected.map((vehicle) => <span key={vehicle.id}>{formatter(vehicle[key])}</span>)}
            {selected.length < 4 && <span />}
          </div>
        ))}
        <div className="compare-row compare-row--cta"><strong className="compare-label">Tư vấn</strong>{selected.map((vehicle) => <span key={vehicle.id}><LeadDialog vehicle={vehicle} label="Nhận báo giá" /></span>)}{selected.length < 4 && <span />}</div>
      </div>
    </div>
  );
}
