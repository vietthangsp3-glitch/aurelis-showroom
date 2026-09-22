import Link from "next/link";

export function BrandMark({ admin = false }: { admin?: boolean }) {
  return (
    <Link href={admin ? "/admin/dashboard" : "/"} className="brand-mark" aria-label="AURELIA">
      <span className="brand-mark__monogram">A</span>
      <span>
        <strong>AURELIA</strong>
        <small>{admin ? "ADMIN CONSOLE" : "ĐẲNG CẤP TẠO NÊN HÀNH TRÌNH"}</small>
      </span>
    </Link>
  );
}
