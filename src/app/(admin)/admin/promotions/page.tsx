import { Trash2 } from "lucide-react";
import { createPromotionAction, deletePromotionAction, updatePromotionStatusAction } from "@/features/admin/actions/operations";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

const labels: Record<string, string> = { DRAFT: "Bản nháp", PUBLISHED: "Đang chạy", ARCHIVED: "Đã lưu trữ" };

export default async function AdminPromotionsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const [items, params] = await Promise.all([prisma.promotion.findMany({ include: { _count: { select: { vehicles: true } } }, orderBy: { createdAt: "desc" } }), searchParams]);
  return <div className="admin-page"><div className="admin-title"><div><p className="admin-breadcrumb">Trang chủ / Ưu đãi</p><h1>Quản lý ưu đãi</h1><p>Tạo chương trình và kiểm soát trạng thái hiển thị.</p></div></div>
    {params.success && <p className="admin-flash success">Đã tạo ưu đãi.</p>}{params.error && <p className="admin-flash error">Vui lòng nhập đủ thông tin và kiểm tra thời gian.</p>}
    <section className="admin-module-grid"><form action={createPromotionAction} className="admin-card admin-quick-form"><div className="admin-card__title"><strong>Thêm ưu đãi</strong></div><label>Tiêu đề<input name="title" required /></label><label>Mô tả<textarea name="description" required rows={4} /></label><div className="admin-form-grid"><label>Bắt đầu<input name="startsAt" type="datetime-local" required /></label><label>Kết thúc<input name="endsAt" type="datetime-local" required /></label></div><button className="admin-button" type="submit">Tạo ưu đãi</button></form>
    <section className="admin-card admin-data-table"><table><thead><tr><th>Chương trình</th><th>Thời gian</th><th>Xe áp dụng</th><th>Trạng thái</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.description}</small></td><td>{item.startsAt.toLocaleDateString("vi-VN")} – {item.endsAt.toLocaleDateString("vi-VN")}</td><td>{item._count.vehicles}</td><td><form action={updatePromotionStatusAction.bind(null, item.id)} className="admin-row-form"><select name="status" defaultValue={item.status}>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button type="submit">Lưu</button></form></td><td>{session.role === "ADMIN" && <form action={deletePromotionAction.bind(null, item.id)}><button className="icon-admin-button danger" aria-label={`Xóa ${item.title}`}><Trash2 size={15} /></button></form>}</td></tr>)}</tbody></table>{!items.length && <div className="admin-empty-state">Chưa có ưu đãi.</div>}</section></section>
  </div>;
}
