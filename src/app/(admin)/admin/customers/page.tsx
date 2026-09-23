import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function AdminCustomersPage() {
  await requireRole(["ADMIN", "SALES"]);
  const leads = await prisma.lead.findMany({ include: { variant: { include: { vehicle: { include: { model: { include: { brand: true } } } } } } }, orderBy: { createdAt: "desc" } });
  const customerMap = new Map<string, { lead: (typeof leads)[number]; requests: number }>();
  for (const lead of leads) { const current = customerMap.get(lead.phone); customerMap.set(lead.phone, { lead: current?.lead ?? lead, requests: (current?.requests ?? 0) + 1 }); }
  const customers = [...customerMap.values()];
  return <div className="admin-page"><div className="admin-title"><div><p className="admin-breadcrumb">Trang chủ / Khách hàng</p><h1>Khách hàng</h1><p>Danh sách được tổng hợp tự động từ các yêu cầu tư vấn.</p></div></div>
    <section className="admin-metrics admin-metrics--leads"><article><span>Tổng khách hàng<strong>{customers.length}</strong><small>Không trùng số điện thoại</small></span></article><article><span>Tổng yêu cầu<strong>{leads.length}</strong><small>Mọi nhu cầu</small></span></article><article><span>Khách quay lại<strong>{customers.filter((item) => item.requests > 1).length}</strong><small>Có nhiều hơn một yêu cầu</small></span></article></section>
    <section className="admin-card admin-data-table"><table><thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Xe gần nhất</th><th>Số yêu cầu</th><th>Lần gần nhất</th><th>Trạng thái</th></tr></thead><tbody>{customers.map(({ lead, requests }) => <tr key={lead.phone}><td><strong>{lead.name}</strong></td><td>{lead.phone}<small>{lead.email}</small></td><td>{lead.variant ? `${lead.variant.vehicle.model.brand.name} ${lead.variant.vehicle.model.name}` : lead.brand || "Chưa chọn"}</td><td>{requests}</td><td>{lead.createdAt.toLocaleDateString("vi-VN")}</td><td><span className="status-pill">{lead.status}</span></td></tr>)}</tbody></table>{!customers.length && <div className="admin-empty-state">Chưa có khách hàng.</div>}</section>
  </div>;
}
