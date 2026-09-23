"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { createVehicleAction, updateVehicleAction } from "@/features/admin/actions/catalog";
import { Button } from "@/components/ui/button";

export interface VehicleFormValue {
  id: string;
  brandId: string;
  modelId: string;
  variantName: string;
  sku: string;
  slug: string;
  year: number;
  bodyType: string;
  segment: string;
  fuelType: string;
  seats: number;
  description: string;
  exterior: string;
  interior: string;
  technology: string;
  safety: string;
  price: number;
  salePrice: number | null;
  engine: string;
  horsepower: number;
  torque: number;
  acceleration: number;
  transmission: string;
  drivetrain: string;
  dimensions: string;
  showroomId: string;
  color: string;
  quantity: number;
  inventoryStatus: string;
  coverImage: string;
  galleryImages: string;
  exteriorImage: string;
  interiorImage: string;
  technologyImage: string;
  safetyImage: string;
  seoTitle: string;
  seoDescription: string;
  status: string;
}

function VehicleImageManager({ coverImage = "", galleryImages = "" }: { coverImage?: string; galleryImages?: string }) {
  const [images, setImages] = useState(() => [coverImage, ...galleryImages.split(/\r?\n/)].map((url) => url.trim()).filter((url, index, all) => url && all.indexOf(url) === index));
  const [cover, setCover] = useState(coverImage);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const addImage = () => {
    const url = draft.trim();
    if (!/^https:\/\//i.test(url)) { setError("Ảnh phải dùng URL https:// hợp lệ."); return; }
    if (!images.includes(url)) setImages((current) => [...current, url]);
    if (!cover) setCover(url);
    setDraft("");
    setError("");
  };

  const removeImage = (url: string) => {
    const next = images.filter((image) => image !== url);
    setImages(next);
    if (cover === url) setCover(next[0] ?? "");
  };

  return <div className="vehicle-image-manager">
    <input type="hidden" name="coverImage" value={cover} />
    <input type="hidden" name="galleryImages" value={images.filter((url) => url !== cover).join("\n")} />
    <div className="vehicle-image-add"><input type="url" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Dán URL https:// của ảnh xe" /><button type="button" onClick={addImage}><ImagePlus size={16} /> Thêm ảnh</button></div>
    {error && <small className="vehicle-image-error">{error}</small>}
    <div className="vehicle-image-library">{images.map((url) => <article className={cover === url ? "is-cover" : ""} key={url}>
      <Image src={url} alt="Ảnh xe trong thư viện" width={320} height={200} unoptimized />
      <div><label><input type="radio" checked={cover === url} onChange={() => setCover(url)} /> <Star size={14} /> Ảnh đại diện</label><button type="button" onClick={() => removeImage(url)} aria-label="Xóa ảnh"><Trash2 size={15} /></button></div>
    </article>)}</div>
    {!images.length && <div className="upload-drop"><ImagePlus size={24} /><span>Chưa có ảnh xe</span><small>Thêm URL ảnh để chọn ảnh đại diện và tạo gallery.</small></div>}
  </div>;
}

interface VehicleFormProps {
  brands: Array<{ id: string; name: string; models: Array<{ id: string; name: string }> }>;
  showrooms: Array<{ id: string; name: string }>;
  vehicle?: VehicleFormValue;
  error?: string;
}

export function VehicleForm({ brands, showrooms, vehicle, error }: VehicleFormProps) {
  const firstBrandId = vehicle?.brandId ?? brands[0]?.id ?? "";
  const [brandId, setBrandId] = useState(firstBrandId);
  const availableModels = useMemo(() => brands.find((brand) => brand.id === brandId)?.models ?? [], [brandId, brands]);
  const [modelId, setModelId] = useState(vehicle?.modelId ?? availableModels[0]?.id ?? "");
  const action = vehicle ? updateVehicleAction.bind(null, vehicle.id) : createVehicleAction;

  const changeBrand = (nextBrandId: string) => {
    setBrandId(nextBrandId);
    setModelId(brands.find((brand) => brand.id === nextBrandId)?.models[0]?.id ?? "");
  };

  return (
    <form action={action} className="admin-card vehicle-form">
      <nav><a href="#basic">Thông tin cơ bản</a><a href="#pricing">Giá bán</a><a href="#specs">Thông số</a><a href="#content">Nội dung</a><a href="#inventory">Tồn kho</a><a href="#images">Hình ảnh</a><a href="#seo">SEO</a></nav>
      {error && <p className="admin-form-error">{error}</p>}
      <section id="basic">
        <h2>Thông tin cơ bản</h2>
        <div className="admin-form-grid">
          <label>Thương hiệu *<select value={brandId} onChange={(event) => changeBrand(event.target.value)} required><option value="" disabled>Chọn thương hiệu</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
          <label>Dòng xe *<select name="modelId" value={modelId} onChange={(event) => setModelId(event.target.value)} required><option value="" disabled>{availableModels.length ? "Chọn dòng xe" : "Hãng chưa có dòng xe"}</option>{availableModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select><small>Quản lý danh sách tại mục Thương hiệu.</small></label>
          <label>Tên phiên bản *<input name="variantName" required defaultValue={vehicle?.variantName} placeholder="Ví dụ: GLC 300 4MATIC" /></label>
          <label>Mã SKU *<input name="sku" required defaultValue={vehicle?.sku} placeholder="Ví dụ: AR-GLC300-2026" /></label>
          <label>Năm sản xuất *<input name="year" type="number" min="1990" max="2100" required defaultValue={vehicle?.year ?? new Date().getFullYear()} /></label>
          <label>Kiểu dáng *<select name="bodyType" required defaultValue={vehicle?.bodyType ?? "SUV"}><option>SUV</option><option>Sedan</option><option>Crossover</option><option>MPV</option><option>Hatchback</option><option>Electric</option><option>Luxury</option></select></label>
          <label>Loại nhiên liệu *<select name="fuelType" required defaultValue={vehicle?.fuelType ?? "Xăng"}><option>Xăng</option><option>Hybrid</option><option>Điện</option><option>Dầu</option></select></label>
          <label>Phân khúc *<input name="segment" required defaultValue={vehicle?.segment} placeholder="Ví dụ: SUV hạng sang" /></label>
          <label>Số chỗ *<input name="seats" type="number" min="1" max="50" required defaultValue={vehicle?.seats ?? 5} /></label>
        </div>
        <label>Mô tả ngắn<textarea name="description" rows={4} defaultValue={vehicle?.description} placeholder="Giới thiệu ngắn gọn về mẫu xe..." /></label>
      </section>
      <section id="pricing"><h2>Giá bán</h2><div className="admin-form-grid"><label>Giá niêm yết (VNĐ) *<input name="price" type="number" min="1" required defaultValue={vehicle?.price} /></label><label>Giá ưu đãi (VNĐ)<input name="salePrice" type="number" min="0" defaultValue={vehicle?.salePrice ?? ""} /></label></div></section>
      <section id="specs"><h2>Thông số kỹ thuật</h2><div className="admin-form-grid"><label>Động cơ<input name="engine" defaultValue={vehicle?.engine} /></label><label>Công suất (mã lực)<input name="horsepower" type="number" min="0" defaultValue={vehicle?.horsepower ?? 0} /></label><label>Mô-men xoắn (Nm)<input name="torque" type="number" min="0" defaultValue={vehicle?.torque ?? 0} /></label><label>Tăng tốc 0–100 (giây)<input name="acceleration" type="number" min="0" step="0.1" defaultValue={vehicle?.acceleration ?? 0} /></label><label>Hộp số<input name="transmission" defaultValue={vehicle?.transmission} /></label><label>Dẫn động<input name="drivetrain" defaultValue={vehicle?.drivetrain} /></label><label>Kích thước<input name="dimensions" defaultValue={vehicle?.dimensions} placeholder="Dài × Rộng × Cao" /></label></div></section>
      <section id="content"><h2>Nội dung chi tiết</h2><p className="admin-section-note">Mỗi phần có thể dùng một ảnh riêng để bài giới thiệu xe phong phú hơn.</p><div className="admin-form-grid content-editor-grid"><label>Ngoại thất<textarea name="exterior" rows={4} defaultValue={vehicle?.exterior} /><span>Ảnh phần Ngoại thất</span><input name="exteriorImage" type="url" defaultValue={vehicle?.exteriorImage} placeholder="https://..." /></label><label>Nội thất<textarea name="interior" rows={4} defaultValue={vehicle?.interior} /><span>Ảnh phần Nội thất</span><input name="interiorImage" type="url" defaultValue={vehicle?.interiorImage} placeholder="https://..." /></label><label>Công nghệ<textarea name="technology" rows={4} defaultValue={vehicle?.technology} /><span>Ảnh phần Công nghệ</span><input name="technologyImage" type="url" defaultValue={vehicle?.technologyImage} placeholder="https://..." /></label><label>An toàn<textarea name="safety" rows={4} defaultValue={vehicle?.safety} /><span>Ảnh phần An toàn</span><input name="safetyImage" type="url" defaultValue={vehicle?.safetyImage} placeholder="https://..." /></label></div></section>
      <section id="inventory"><h2>Tồn kho</h2><div className="admin-form-grid"><label>Showroom<select name="showroomId" defaultValue={vehicle?.showroomId ?? showrooms[0]?.id ?? ""}><option value="">Chưa gán showroom</option>{showrooms.map((showroom) => <option key={showroom.id} value={showroom.id}>{showroom.name}</option>)}</select></label><label>Màu xe<input name="color" defaultValue={vehicle?.color} placeholder="Ví dụ: Đen Obsidian" /></label><label>Số lượng<input name="quantity" type="number" min="0" defaultValue={vehicle?.quantity ?? 0} /></label><label>Trạng thái kho<select name="inventoryStatus" defaultValue={vehicle?.inventoryStatus ?? "AVAILABLE"}><option value="AVAILABLE">Còn hàng</option><option value="LOW_STOCK">Sắp hết</option><option value="PREORDER">Đặt trước</option><option value="OUT_OF_STOCK">Hết hàng</option></select></label></div></section>
      <section id="images"><h2>Thư viện hình ảnh</h2><p className="admin-section-note">Thêm nhiều ảnh, sau đó đánh dấu trực tiếp ảnh sẽ dùng làm ảnh đại diện của xe.</p><VehicleImageManager coverImage={vehicle?.coverImage} galleryImages={vehicle?.galleryImages} /><small>Ảnh được lưu bằng URL; không cần đưa secret key lên trình duyệt.</small></section>
      <section id="seo"><h2>SEO & đường dẫn</h2><div className="admin-form-grid"><label>SEO title<input name="seoTitle" defaultValue={vehicle?.seoTitle} /></label><label>Slug *<input name="slug" required defaultValue={vehicle?.slug} placeholder="mercedes-benz-glc-300" /></label></div><label>Meta description<textarea name="seoDescription" rows={3} defaultValue={vehicle?.seoDescription} /></label></section>
      <footer><Button variant="outline" type="submit" name="status" value="DRAFT">Lưu bản nháp</Button><Button type="submit" name="status" value="PUBLISHED">{vehicle?.status === "PUBLISHED" ? "Lưu và tiếp tục hiển thị" : "Lưu và xuất bản"}</Button></footer>
    </form>
  );
}
