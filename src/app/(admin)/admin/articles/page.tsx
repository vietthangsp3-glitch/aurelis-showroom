import { Trash2 } from "lucide-react";
import { createArticleAction, deleteArticleAction, updateArticleStatusAction } from "@/features/admin/actions/operations";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";

const labels: Record<string, string> = { DRAFT: "Bản nháp", PUBLISHED: "Đã đăng", ARCHIVED: "Đã lưu trữ" };

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const [items, params] = await Promise.all([prisma.article.findMany({ include: { author: true }, orderBy: { createdAt: "desc" } }), searchParams]);
  return <div className="admin-page"><div className="admin-title"><div><p className="admin-breadcrumb">Trang chủ / Tin tức</p><h1>Quản lý tin tức</h1><p>Soạn nội dung và xuất bản bài viết showroom.</p></div></div>
    {params.success && <p className="admin-flash success">Đã tạo bài viết.</p>}{params.error && <p className="admin-flash error">Vui lòng nhập đủ nội dung.</p>}
    <section className="admin-module-grid"><form action={createArticleAction} className="admin-card admin-quick-form"><div className="admin-card__title"><strong>Viết bài mới</strong></div><label>Tiêu đề<input name="title" required /></label><label>Mô tả ngắn<textarea name="excerpt" required rows={3} /></label><label>Nội dung<textarea name="content" required rows={8} /></label><button className="admin-button" type="submit">Lưu bản nháp</button></form>
    <section className="admin-card admin-data-table"><table><thead><tr><th>Bài viết</th><th>Tác giả</th><th>Ngày tạo</th><th>Trạng thái</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.excerpt}</small></td><td>{item.author.name}</td><td>{item.createdAt.toLocaleDateString("vi-VN")}</td><td><form action={updateArticleStatusAction.bind(null, item.id)} className="admin-row-form"><select name="status" defaultValue={item.status}>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button type="submit">Lưu</button></form></td><td>{session.role === "ADMIN" && <form action={deleteArticleAction.bind(null, item.id)}><button className="icon-admin-button danger" aria-label={`Xóa ${item.title}`}><Trash2 size={15} /></button></form>}</td></tr>)}</tbody></table>{!items.length && <div className="admin-empty-state">Chưa có bài viết.</div>}</section></section>
  </div>;
}
