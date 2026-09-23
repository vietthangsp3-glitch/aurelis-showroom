"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import {
  createBrandAction,
  createModelAction,
  deleteBrandAction,
  deleteModelAction,
  updateBrandAction,
} from "@/features/admin/actions/catalog";

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  models: Array<{ id: string; name: string; slug: string; vehicleCount: number }>;
}

export function BrandManager({ brands, canDelete }: { brands: BrandRow[]; canDelete: boolean }) {
  return (
    <div className="brand-admin-layout">
      <section className="admin-card brand-create-card">
        <div className="admin-card__title"><strong>Thêm thương hiệu</strong></div>
        <form action={createBrandAction} className="brand-create-form">
          <label>Tên thương hiệu *<input name="name" required placeholder="Ví dụ: Porsche" /></label>
          <label>Slug<input name="slug" placeholder="Tự tạo nếu để trống" /></label>
          <label>URL logo<input name="logoUrl" type="url" placeholder="https://.../logo.svg" /></label>
          <label>Mô tả<textarea name="description" rows={3} placeholder="Giới thiệu ngắn về thương hiệu" /></label>
          <button className="admin-button" type="submit"><Plus size={15} /> Thêm thương hiệu</button>
        </form>
      </section>

      <section className="brand-list">
        {brands.map((brand) => (
          <article className="admin-card brand-card" key={brand.id}>
            <div className="brand-card__summary">
              <div><strong>{brand.name}</strong><small>{brand.models.length} dòng xe · {brand.models.reduce((total, model) => total + model.vehicleCount, 0)} xe</small></div>
              {canDelete && <form action={deleteBrandAction.bind(null, brand.id)} onSubmit={(event) => { if (!confirm(`Xóa thương hiệu ${brand.name}?`)) event.preventDefault(); }}>
                <button className="icon-admin-button danger" type="submit" aria-label={`Xóa ${brand.name}`}><Trash2 size={16} /></button>
              </form>}
            </div>
            <form action={updateBrandAction.bind(null, brand.id)} className="brand-edit-form">
              <label>Tên<input name="name" required defaultValue={brand.name} /></label>
              <label>Slug<input name="slug" required defaultValue={brand.slug} /></label>
              <label>URL logo<input name="logoUrl" type="url" defaultValue={brand.logoUrl ?? ""} placeholder="Để trống để dùng logo mặc định" /></label>
              <label className="brand-edit-form__description">Mô tả<textarea name="description" rows={2} defaultValue={brand.description ?? ""} /></label>
              <button className="admin-button admin-button--light" type="submit"><Save size={14} /> Lưu thay đổi</button>
            </form>
            <div className="model-manager">
              <div className="model-manager__title"><strong>Dòng xe của {brand.name}</strong><small>Danh sách này sẽ tự động xuất hiện khi thêm xe.</small></div>
              <div className="model-list">
                {brand.models.map((model) => (
                  <div key={model.id}><span><strong>{model.name}</strong><small>{model.slug} · {model.vehicleCount} xe</small></span>{canDelete && <form action={deleteModelAction.bind(null, model.id)} onSubmit={(event) => { if (!confirm(`Xóa dòng xe ${model.name}?`)) event.preventDefault(); }}><button className="icon-admin-button danger" type="submit" aria-label={`Xóa ${model.name}`}><Trash2 size={14} /></button></form>}</div>
                ))}
                {!brand.models.length && <p className="admin-empty-copy">Chưa có dòng xe.</p>}
              </div>
              <form action={createModelAction} className="model-create-form">
                <input type="hidden" name="brandId" value={brand.id} />
                <label>Tên dòng xe *<input name="name" required placeholder="Ví dụ: Cayenne" /></label>
                <label>Slug<input name="slug" placeholder="Tự tạo nếu để trống" /></label>
                <button className="admin-button" type="submit"><Plus size={14} /> Thêm dòng xe</button>
              </form>
            </div>
          </article>
        ))}
        {!brands.length && <div className="admin-card admin-empty-state">Chưa có thương hiệu. Hãy tạo thương hiệu đầu tiên.</div>}
      </section>
    </div>
  );
}
