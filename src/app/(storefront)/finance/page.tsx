import type { Metadata } from "next";
import Image from "next/image";
import { Landmark, Percent, ShieldCheck } from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { FinanceCalculator } from "@/features/finance/components/finance-calculator";
import { LeadDialog } from "@/features/leads/components/lead-dialog";

export const metadata: Metadata = { title: "Tài chính", description: "Ước tính khoản vay mua xe và nhận phương án tài chính cá nhân hóa." };

export default function FinancePage() {
  return (
    <>
      <section className="finance-hero"><Image src={vehicles[2]!.image} alt="" fill priority sizes="100vw" /><div className="page-hero__veil" /><div className="shell page-hero__content"><p className="eyebrow">Tài chính linh hoạt</p><h1>Giải pháp tài chính<br />cho chiếc xe bạn mơ ước.</h1><p>Sở hữu xe sang dễ dàng hơn với các gói vay linh hoạt và tư vấn minh bạch.</p><div><LeadDialog label="Nhận tư vấn ngay" /><a href="#calculator" className="button button--outline">Xem ước tính</a></div></div></section>
      <section id="calculator" className="finance-section"><div className="shell"><FinanceCalculator vehicles={vehicles} /></div></section>
      <section className="finance-benefits"><div className="shell"><article><Percent /><strong>Lãi suất minh bạch</strong><span>Không phí ẩn, hỗ trợ so sánh nhiều phương án.</span></article><article><ShieldCheck /><strong>Hồ sơ đơn giản</strong><span>Đồng hành cùng bạn trong từng bước thẩm định.</span></article><article><Landmark /><strong>Đối tác uy tín</strong><span>Kết nối mạng lưới ngân hàng hàng đầu.</span></article></div></section>
      <section className="section section--light"><div className="shell"><p className="eyebrow">Quy trình mua xe trả góp</p><h2>4 bước đơn giản để sở hữu xe sang.</h2><div className="steps"><article><b>01</b><strong>Chọn xe</strong><span>Lựa chọn mẫu xe phù hợp nhu cầu và ngân sách.</span></article><article><b>02</b><strong>Tư vấn tài chính</strong><span>Nhận phương án tối ưu từ chuyên viên.</span></article><article><b>03</b><strong>Hoàn tất hồ sơ</strong><span>Chuẩn bị hồ sơ đơn giản và minh bạch.</span></article><article><b>04</b><strong>Nhận xe</strong><span>Ký hợp đồng và nhận xe trong thời gian sớm nhất.</span></article></div></div></section>
    </>
  );
}
