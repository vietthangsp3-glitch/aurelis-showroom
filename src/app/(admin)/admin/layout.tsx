import { Bell, Search } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["ADMIN", "EDITOR", "SALES"]);
  return (
    <div className="admin-shell">
      <AdminSidebar session={session} />
      <div className="admin-main">
        <header className="admin-topbar"><label><Search size={17} /><input placeholder="Tìm kiếm xe, khách hàng, yêu cầu..." /></label><button aria-label="Thông báo"><Bell size={19} /></button><div><span>{session.name}</span><small>Quản trị viên</small></div></header>
        {children}
      </div>
    </div>
  );
}
