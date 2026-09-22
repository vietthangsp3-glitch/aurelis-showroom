import type { Metadata } from "next";
import { Clock3, MapPin, Phone } from "lucide-react";
import { LeadDialog } from "@/features/leads/components/lead-dialog";

export const metadata: Metadata = { title: "Showroom", description: "Hệ thống showroom AURELIA và lịch hẹn tư vấn." };

const showrooms = [
  ["AURELIA Quận 1", "88 Nguyễn Huệ, Phường Sài Gòn, TP. Hồ Chí Minh"],
  ["AURELIA Thủ Đức", "35 Mai Chí Thọ, Phường An Khánh, TP. Hồ Chí Minh"],
  ["AURELIA Hà Nội", "168 Phạm Hùng, Phường Từ Liêm, Hà Nội"],
];

export default function ShowroomPage() {
  return <><section className="page-hero showroom-hero"><div className="page-hero__veil" /><div className="shell page-hero__content"><p className="eyebrow">Không gian AURELIA</p><h1>Chạm vào trải nghiệm khác biệt.</h1><p>Khám phá xe và nhận tư vấn riêng trong không gian được thiết kế cho bạn.</p></div></section><section className="section section--light"><div className="shell showroom-grid">{showrooms.map(([name, address]) => <article key={name}><MapPin /><h2>{name}</h2><p>{address}</p><span><Clock3 />08:00–20:00, mỗi ngày</span><a href="tel:19001234"><Phone />1900 1234</a><LeadDialog label="Đặt lịch hẹn" /></article>)}</div></section></>;
}
