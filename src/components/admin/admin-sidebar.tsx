import Link from "next/link";
import { BarChart3, Car, Gauge, Gift, LogOut, MessageSquareText, Newspaper, Settings, Store, Tags, Users } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { logout } from "@/features/auth/actions";
import type { AppSession } from "@/lib/auth/session";

const items = [
  ["Tổng quan", "/admin/dashboard", Gauge],
  ["Quản lý xe", "/admin/cars", Car],
  ["Thương hiệu", "/admin/brands", Tags],
  ["Yêu cầu / Leads", "/admin/leads", MessageSquareText],
  ["Đặt lịch lái thử", "/admin/test-drives", Store],
  ["Ưu đãi", "/admin/promotions", Gift],
  ["Tin tức", "/admin/articles", Newspaper],
  ["Khách hàng", "/admin/customers", Users],
  ["Thống kê", "/admin/analytics", BarChart3],
  ["Cài đặt", "/admin/settings", Settings],
] as const;

export function AdminSidebar({ session }: { session: AppSession }) {
  return (
    <aside className="admin-sidebar">
      <BrandMark admin />
      <nav>{items.map(([label, href, Icon]) => <Link key={href} href={href}><Icon size={17} />{label}</Link>)}</nav>
      <div className="admin-sidebar__foot"><small>{session.role}</small><strong>{session.name}</strong><form action={logout}><button type="submit"><LogOut size={16} /> Đăng xuất</button></form></div>
    </aside>
  );
}
