import Link from "next/link";
import { Car, Gauge, LogOut, MessageSquareText, Tags } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";
import { logout } from "@/features/auth/actions";
import type { AppSession } from "@/lib/auth/session";

type SidebarItem = readonly [
  label: string,
  href: string,
  icon: typeof Gauge,
  roles: readonly AppSession["role"][],
];

const items: readonly SidebarItem[] = [
  ["Tổng quan", "/admin/dashboard", Gauge, ["ADMIN", "EDITOR", "SALES"]],
  ["Quản lý xe", "/admin/cars", Car, ["ADMIN", "EDITOR"]],
  ["Thương hiệu", "/admin/brands", Tags, ["ADMIN", "EDITOR"]],
  ["Yêu cầu / Leads", "/admin/leads", MessageSquareText, ["ADMIN", "SALES"]],
];

export function AdminSidebar({ session }: { session: AppSession }) {
  return (
    <aside className="admin-sidebar">
      <BrandMark admin />
      <nav>{items.filter(([, , , roles]) => roles.includes(session.role)).map(([label, href, Icon]) => <Link key={href} href={href}><Icon size={17} />{label}</Link>)}</nav>
      <div className="admin-sidebar__foot"><small>{session.role}</small><strong>{session.name}</strong><form action={logout}><button type="submit"><LogOut size={16} /> Đăng xuất</button></form></div>
    </aside>
  );
}
