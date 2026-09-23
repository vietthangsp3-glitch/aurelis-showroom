import { updateTestDriveStatusAction } from "@/features/admin/actions/operations";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

const statusLabels: Record<string, string> = { PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", COMPLETED: "Hoàn thành", CANCELLED: "Đã hủy" };

export default async function AdminTestDrivesPage() {
  await requireRole(["ADMIN", "SALES"]);
  const bookings = await prisma.testDriveBooking.findMany({ include: { lead: true, showroom: true, variant: { include: { vehicle: { include: { model: { include: { brand: true } } } } } } }, orderBy: { scheduledAt: "desc" }, take: 100 });
  return <div className="admin-page">
    <div className="admin-title"><div><p className="admin-breadcrumb">Trang chủ / Lái thử</p><h1>Lịch lái thử</h1><p>Quản lý lịch hẹn phát sinh từ yêu cầu khách hàng.</p></div></div>
    <section className="admin-metrics admin-metrics--leads"><article><span>Tổng lịch hẹn<strong>{bookings.length}</strong><small>Tất cả lịch</small></span></article><article><span>Chờ xác nhận<strong>{bookings.filter((item) => item.status === "PENDING").length}</strong><small>Cần xử lý</small></span></article><article><span>Sắp tới<strong>{bookings.filter((item) => item.scheduledAt >= new Date() && item.status !== "CANCELLED").length}</strong><small>Lịch còn hiệu lực</small></span></article></section>
    <section className="admin-card admin-data-table"><table><thead><tr><th>Khách hàng</th><th>Xe</th><th>Showroom</th><th>Thời gian</th><th>Trạng thái</th></tr></thead><tbody>{bookings.map((item) => <tr key={item.id}><td><strong>{item.lead.name}</strong><small>{item.lead.phone}</small></td><td>{item.variant.vehicle.model.brand.name} {item.variant.vehicle.model.name}</td><td>{item.showroom.name}</td><td>{item.scheduledAt.toLocaleString("vi-VN")}</td><td><form action={updateTestDriveStatusAction.bind(null, item.id)} className="admin-row-form"><select name="status" defaultValue={item.status}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="submit">Lưu</button></form></td></tr>)}</tbody></table>{!bookings.length && <div className="admin-empty-state">Chưa có lịch lái thử.</div>}</section>
  </div>;
}
