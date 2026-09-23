import { updateShowroomAction } from "@/features/admin/actions/operations";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  await requireRole(["ADMIN"]);
  const [showrooms, params] = await Promise.all([prisma.showroom.findMany({ orderBy: { name: "asc" } }), searchParams]);
  return <div className="admin-page"><div className="admin-title"><div><p className="admin-breadcrumb">Trang chủ / Cài đặt</p><h1>Cài đặt showroom</h1><p>Cập nhật thông tin liên hệ và giờ hoạt động.</p></div></div>
    {params.success && <p className="admin-flash success">Đã cập nhật showroom.</p>}{params.error && <p className="admin-flash error">Vui lòng nhập đủ thông tin.</p>}
    <section className="admin-settings-list">{showrooms.map((showroom) => <form action={updateShowroomAction.bind(null, showroom.id)} className="admin-card admin-quick-form" key={showroom.id}><div className="admin-card__title"><strong>{showroom.name}</strong></div><div className="admin-form-grid"><label>Tên showroom<input name="name" defaultValue={showroom.name} required /></label><label>Thành phố<input name="city" defaultValue={showroom.city} required /></label></div><label>Địa chỉ<input name="address" defaultValue={showroom.address} required /></label><div className="admin-form-grid"><label>Điện thoại<input name="phone" defaultValue={showroom.phone} required /></label><label>Giờ mở cửa<input name="openingHours" defaultValue={showroom.openingHours} required /></label></div><button className="admin-button" type="submit">Lưu thay đổi</button></form>)}</section>
  </div>;
}
