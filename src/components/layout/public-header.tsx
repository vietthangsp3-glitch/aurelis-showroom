"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/shared/brand-mark";
import { LeadDialog } from "@/features/leads/components/lead-dialog";

const links = [
  ["Xe mới", "/cars"],
  ["Thương hiệu", "/brands/mercedes-benz"],
  ["Ưu đãi", "/promotions"],
  ["Tài chính", "/finance"],
  ["So sánh", "/compare"],
  ["Showroom", "/showroom"],
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="public-header">
      <div className="shell public-header__inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/cars" aria-label="Tìm kiếm xe" className="icon-link">
            <Search size={18} />
          </Link>
          <div className="desktop-only">
            <LeadDialog label="Tư vấn ngay" />
          </div>
          <button
            className="menu-button"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Đóng menu" : "Mở menu"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Điều hướng di động">
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <LeadDialog label="Tư vấn ngay" />
        </nav>
      )}
    </header>
  );
}
