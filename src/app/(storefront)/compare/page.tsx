import type { Metadata } from "next";
import Image from "next/image";
import { vehicles } from "@/data/vehicles";
import { CompareWorkspace } from "@/features/compare/components/compare-workspace";

export const metadata: Metadata = { title: "So sánh xe", description: "So sánh tối đa bốn mẫu xe theo giá, hiệu suất và trang bị." };

export default function ComparePage() {
  return (
    <>
      <section className="page-hero page-hero--short"><Image src={vehicles[8]!.image} alt="" fill priority sizes="100vw" /><div className="page-hero__veil" /><div className="shell page-hero__content"><p className="eyebrow">Công cụ lựa chọn</p><h1>So sánh để chọn đúng chiếc xe dành cho bạn.</h1><p>Đặt từng thông số cạnh nhau và tìm ra mẫu xe phù hợp nhất.</p></div></section>
      <section className="compare-section"><div className="shell"><CompareWorkspace vehicles={vehicles} /></div></section>
    </>
  );
}
