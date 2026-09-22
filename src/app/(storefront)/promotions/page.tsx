import type { Metadata } from "next";
import Image from "next/image";
import { vehicles } from "@/data/vehicles";
import { LeadDialog } from "@/features/leads/components/lead-dialog";

export const metadata: Metadata = { title: "Ưu đãi", description: "Đặc quyền tài chính và dịch vụ dành cho khách hàng AURELIA." };

const offers = [
  ["Đặc quyền lãi suất 0,99%", "Hỗ trợ lãi suất trong 12 tháng đầu cho các mẫu xe được chọn."],
  ["Bảo hiểm thân vỏ năm đầu", "An tâm tận hưởng hành trình với gói bảo hiểm toàn diện."],
  ["Đặc quyền bảo dưỡng", "Gói chăm sóc định kỳ và cứu hộ 24/7 trong ba năm."],
];

export default function PromotionsPage() {
  return <><section className="page-hero"><Image src={vehicles[15]!.image} alt="" fill priority sizes="100vw" /><div className="page-hero__veil" /><div className="shell page-hero__content"><p className="eyebrow">Ưu đãi nổi bật</p><h1>Đặc quyền dành riêng cho bạn.</h1><p>Những quyền lợi được thiết kế để hành trình sở hữu xe thêm trọn vẹn.</p></div></section><section className="section section--light"><div className="shell offer-grid">{offers.map(([title, description], index) => <article key={title}><b>0{index + 1}</b><h2>{title}</h2><p>{description}</p><LeadDialog label="Nhận ưu đãi" /></article>)}</div></section></>;
}
