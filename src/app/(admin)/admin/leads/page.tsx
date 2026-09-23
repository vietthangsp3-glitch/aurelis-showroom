import { Trash2 } from "lucide-react";
import { deleteLeadAction, updateLeadStatusAction } from "@/features/admin/actions/leads";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

const statusLabels: Record<string, string> = { NEW: "Mới", CONTACTED: "Đã liên hệ", QUALIFIED: "Tiềm năng", APPOINTMENT: "Đã hẹn", WON: "Thành công", LOST: "Không thành công" };
const interestLabels: Record<string, string> = { QUOTE: "Báo giá", TEST_DRIVE: "Lái thử", FINANCE: "Trả góp", CAR_SELECTION: "Chọn xe", PROMOTION: "Ưu đãi" };

export default async function AdminLeadsPage() {
  const session = await requireRole(["ADMIN", "SALES"]);
  const [leads, total, newCount] = await Promise.all([
    prisma.lead.findMany({ include: { variant: { include: { vehicle: { include: { model: { include: { brand: true } } } } } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
  ]);
  return (
    <div className="admin-page">
      <div className="admin-title"><div><p className="admin-breadcrumb">Trang chủ / Leads</p><h1>Yêu cầu tư vấn</h1><p>Theo dõi khách hàng gửi từ form website và cập nhật tiến độ xử lý.</p></div></div>
      <section className="admin-metrics admin-metrics--leads"><article><span>Tổng yêu cầu<strong>{total}</strong><small>Tất cả nguồn</small></span></article><article><span>Chưa xử lý<strong>{newCount}</strong><small>Cần liên hệ sớm</small></span></article><article><span>Đã xử lý<strong>{total - newCount}</strong><small>Đang trong quy trình</small></span></article></section>
      <section className="admin-card leads-panel">
        <div className="leads-table">
          <div className="leads-table__row leads-table__head"><span>Khách hàng</span><span>Nhu cầu</span><span>Xe quan tâm</span><span>Nguồn</span><span>Ngày gửi</span><span>Trạng thái</span><span /></div>
          {leads.map((lead) => <div className="leads-table__row" key={lead.id}><span><strong>{lead.name}</strong><small>{lead.phone}</small><small>{lead.email}</small></span><span>{interestLabels[lead.interestType]}</span><span>{lead.variant ? `${lead.variant.vehicle.model.brand.name} ${lead.variant.vehicle.model.name}` : lead.brand || "Chưa chọn xe"}</span><span>{lead.source}</span><span>{lead.createdAt.toLocaleDateString("vi-VN")}<small>{lead.preferredContactTime}</small></span><span><form action={updateLeadStatusAction.bind(null, lead.id)} className="lead-status-form"><select name="status" defaultValue={lead.status}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="submit">Lưu</button></form></span><span>{session.role === "ADMIN" && <form action={deleteLeadAction.bind(null, lead.id)}><button className="icon-admin-button danger" type="submit" aria-label={`Xóa lead ${lead.name}`}><Trash2 size={15} /></button></form>}</span></div>)}
        </div>
        {!leads.length && <div className="admin-empty-state">Chưa có yêu cầu tư vấn.</div>}
      </section>
    </div>
  );
}
