import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function AdminAnalyticsPage() {
  await requireRole(["ADMIN", "SALES"]);
  const [total, won, sources, statuses, popular] = await Promise.all([
    prisma.lead.count(), prisma.lead.count({ where: { status: "WON" } }),
    prisma.lead.groupBy({ by: ["source"], _count: { _all: true }, orderBy: { _count: { source: "desc" } } }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.vehicleVariant.findMany({ include: { vehicle: { include: { model: { include: { brand: true } } } }, _count: { select: { leads: true } } }, orderBy: { leads: { _count: "desc" } }, take: 10 }),
  ]);
  return <div className="admin-page"><div className="admin-title"><div><p className="admin-breadcrumb">Trang chủ / Thống kê</p><h1>Thống kê kinh doanh</h1><p>Số liệu trực tiếp từ yêu cầu khách hàng trong Neon.</p></div></div>
    <section className="admin-metrics"><article><span>Tổng leads<strong>{total}</strong><small>Tất cả thời gian</small></span></article><article><span>Thành công<strong>{won}</strong><small>Lead đã chốt</small></span></article><article><span>Tỷ lệ chuyển đổi<strong>{total ? ((won / total) * 100).toFixed(1) : "0.0"}%</strong><small>Won / tổng lead</small></span></article><article><span>Nguồn khách<strong>{sources.length}</strong><small>Kênh ghi nhận</small></span></article></section>
    <section className="admin-module-grid admin-module-grid--equal"><article className="admin-card"><div className="admin-card__title"><strong>Lead theo nguồn</strong></div><div className="admin-stat-list">{sources.map((item) => <div key={item.source}><span>{item.source}</span><strong>{item._count._all}</strong></div>)}</div></article><article className="admin-card"><div className="admin-card__title"><strong>Lead theo trạng thái</strong></div><div className="admin-stat-list">{statuses.map((item) => <div key={item.status}><span>{item.status}</span><strong>{item._count._all}</strong></div>)}</div></article></section>
    <section className="admin-card admin-data-table admin-spaced"><div className="admin-card__title"><strong>Mẫu xe được quan tâm</strong></div><table><thead><tr><th>Xe</th><th>Phiên bản</th><th>Lượt yêu cầu</th></tr></thead><tbody>{popular.map((item) => <tr key={item.id}><td>{item.vehicle.model.brand.name} {item.vehicle.model.name}</td><td>{item.name}</td><td>{item._count.leads}</td></tr>)}</tbody></table></section>
  </div>;
}
