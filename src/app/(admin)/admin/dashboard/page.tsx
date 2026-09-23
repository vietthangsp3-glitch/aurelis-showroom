import Link from "next/link";
import { ArrowUpRight, Car, TrendingUp, UserRoundCheck, Users } from "lucide-react";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

const statusLabels: Record<string, string> = { NEW: "Mới", CONTACTED: "Đã liên hệ", QUALIFIED: "Tiềm năng", APPOINTMENT: "Đã hẹn", WON: "Thành công", LOST: "Không thành công" };

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN", "EDITOR", "SALES"]);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [todayLeads, monthLeads, wonLeads, publishedVehicles, brandCount, recentLeads, popularVariants] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.lead.count({ where: { status: "WON", createdAt: { gte: startOfMonth } } }),
    prisma.vehicle.count({ where: { status: "PUBLISHED" } }),
    prisma.brand.count(),
    prisma.lead.findMany({ include: { variant: { include: { vehicle: { include: { model: { include: { brand: true } } } } } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.vehicleVariant.findMany({ include: { vehicle: { include: { model: { include: { brand: true } } } }, _count: { select: { leads: true } } }, orderBy: { leads: { _count: "desc" } }, take: 4 }),
  ]);
  const conversion = monthLeads ? ((wonLeads / monthLeads) * 100).toFixed(1) : "0.0";
  const sourceCounts = recentLeads.reduce<Record<string, number>>((result, lead) => { result[lead.source] = (result[lead.source] ?? 0) + 1; return result; }, {});
  return (
    <div className="admin-page">
      <div className="admin-title"><div><h1>Tổng quan</h1><p>Dữ liệu trực tiếp từ Neon, cập nhật theo hoạt động website.</p></div><div><Link href="/admin/cars/new" className="admin-button">＋ Thêm xe mới</Link><Link href="/admin/brands" className="admin-button admin-button--light">Quản lý hãng</Link></div></div>
      <section className="admin-metrics">
        <article><Users /><span>Leads hôm nay<strong>{todayLeads}</strong><small>Yêu cầu mới trong ngày</small></span></article>
        <article><UserRoundCheck /><span>Yêu cầu trong tháng<strong>{monthLeads}</strong><small>Dữ liệu thực tế</small></span></article>
        <article><TrendingUp /><span>Tỷ lệ chuyển đổi<strong>{conversion}%</strong><small>{wonLeads} khách thành công</small></span></article>
        <article><Car /><span>Xe đang hiển thị<strong>{publishedVehicles}</strong><small>{brandCount} thương hiệu</small></span></article>
      </section>
      <section className="dashboard-grid">
        <article className="admin-card recent-leads"><div className="admin-card__title"><strong>Yêu cầu gần đây</strong><Link href="/admin/leads">Xem tất cả →</Link></div><div className="admin-table"><div className="admin-table__row admin-table__head"><span>Khách hàng</span><span>Xe quan tâm</span><span>Nguồn</span><span>Trạng thái</span><span>Thời gian</span></div>{recentLeads.map((lead) => <div className="admin-table__row" key={lead.id}><span>{lead.name}</span><span>{lead.variant ? `${lead.variant.vehicle.model.brand.name} ${lead.variant.vehicle.model.name}` : lead.brand || "Chưa chọn"}</span><span>{lead.source}</span><span className="status-pill">{statusLabels[lead.status]}</span><span>{lead.createdAt.toLocaleDateString("vi-VN")}</span></div>)}</div>{!recentLeads.length && <div className="admin-empty-state">Chưa có lead.</div>}</article>
        <article className="admin-card source-card"><div className="admin-card__title"><strong>Nguồn khách hàng gần đây</strong></div><div className="donut"><span><strong>{recentLeads.length}</strong> lead</span></div><ul>{Object.entries(sourceCounts).map(([source, count]) => <li key={source}>{source} <b>{count}</b></li>)}</ul></article>
        <article className="admin-card interest-list"><div className="admin-card__title"><strong>Mẫu xe được quan tâm</strong></div>{popularVariants.map((variant, index) => <Link key={variant.id} href={`/cars/${variant.vehicle.slug}`}><b>0{index + 1}</b><span>{variant.vehicle.model.brand.name} {variant.vehicle.model.name}<small>{variant._count.leads} yêu cầu</small></span><ArrowUpRight size={16} /></Link>)}</article>
      </section>
    </div>
  );
}
