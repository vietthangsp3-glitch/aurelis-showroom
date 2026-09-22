"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import { calculateFinance } from "@/features/finance/calculate-finance";
import { formatCurrency } from "@/lib/utils";
import { LeadDialog } from "@/features/leads/components/lead-dialog";

export function FinanceCalculator({ vehicles }: { vehicles: Vehicle[] }) {
  const [vehicleId, setVehicleId] = useState(vehicles[2]?.id ?? "");
  const [downPayment, setDownPayment] = useState(30);
  const [term, setTerm] = useState(48);
  const [rate, setRate] = useState(8.5);
  const vehicle = vehicles.find((item) => item.id === vehicleId) ?? vehicles[0]!;
  const price = vehicle.salePrice ?? vehicle.price;
  const initialCosts = price * 0.11;
  const result = useMemo(() => calculateFinance({ vehiclePrice: price, downPaymentPercent: downPayment, termMonths: term, annualInterestRate: rate, initialCosts }), [price, downPayment, term, rate, initialCosts]);

  return (
    <div className="finance-calculator">
      <section className="finance-car"><p className="eyebrow">Xe bạn đang chọn</p><h2>{vehicle.brand}<br />{vehicle.model}</h2><div className="finance-car__image"><Image src={vehicle.image} alt="" fill sizes="380px" /></div><label>Thay đổi mẫu xe<select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>{vehicles.map((item) => <option key={item.id} value={item.id}>{item.brand} {item.model}</option>)}</select></label><strong>{formatCurrency(price)}</strong></section>
      <section className="finance-inputs"><p className="eyebrow">Tính toán trả góp</p><h2>Chủ động kế hoạch tài chính.</h2><label>Giá xe niêm yết <output>{formatCurrency(price)}</output></label><label>Tỷ lệ trả trước <output>{downPayment}%</output><input type="range" min="10" max="80" step="5" value={downPayment} onChange={(event) => setDownPayment(Number(event.target.value))} /></label><label>Thời hạn vay<select value={term} onChange={(event) => setTerm(Number(event.target.value))}><option value="12">12 tháng</option><option value="24">24 tháng</option><option value="36">36 tháng</option><option value="48">48 tháng</option><option value="60">60 tháng</option><option value="72">72 tháng</option></select></label><label>Lãi suất dự kiến (%) <input type="number" min="0" max="30" step=".1" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label><small>Kết quả mang tính tham khảo, không phải cam kết tín dụng.</small></section>
      <section className="finance-result"><p className="eyebrow">Kết quả dự kiến</p><span>Khoản vay dự kiến<strong>{formatCurrency(result.principal)}</strong></span><div className="monthly-payment"><small>Số tiền trả hàng tháng</small><strong>{formatCurrency(result.monthlyPayment)}</strong></div><span>Tổng tiền lãi tạm tính<strong>{formatCurrency(result.totalInterest)}</strong></span><span>Chi phí ban đầu<strong>{formatCurrency(initialCosts)}</strong></span><span>Tổng chi phí dự kiến<strong>{formatCurrency(result.totalCost)}</strong></span><LeadDialog vehicle={vehicle} label="Nhận phương án tài chính" /></section>
    </div>
  );
}
