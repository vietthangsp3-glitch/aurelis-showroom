import { Button } from "@/components/ui/button";

export function VehicleForm() {
  return (
    <form className="admin-card vehicle-form">
      <nav><a href="#basic">Thông tin cơ bản</a><a href="#pricing">Giá bán</a><a href="#specs">Thông số</a><a href="#inventory">Tồn kho</a><a href="#images">Hình ảnh</a><a href="#seo">SEO</a></nav>
      <section id="basic"><h2>Thông tin cơ bản</h2><div className="admin-form-grid"><label>Thương hiệu<select><option>Mercedes-Benz</option><option>BMW</option><option>Toyota</option></select></label><label>Dòng xe<input placeholder="Ví dụ: GLC" /></label><label>Tên phiên bản<input placeholder="Ví dụ: GLC 300 4MATIC" /></label><label>Năm sản xuất<input type="number" defaultValue="2025" /></label><label>Kiểu dáng<select><option>SUV</option><option>Sedan</option><option>Crossover</option></select></label><label>Số chỗ<input type="number" defaultValue="5" /></label></div><label>Mô tả<textarea rows={5} placeholder="Giới thiệu ngắn gọn về mẫu xe..." /></label></section>
      <section id="pricing"><h2>Giá bán</h2><div className="admin-form-grid"><label>Giá niêm yết<input type="number" /></label><label>Giá ưu đãi<input type="number" /></label></div></section>
      <section id="specs"><h2>Thông số kỹ thuật</h2><div className="admin-form-grid"><label>Động cơ<input /></label><label>Công suất<input type="number" /></label><label>Mô-men xoắn<input type="number" /></label><label>Hộp số<input /></label></div></section>
      <section id="inventory"><h2>Tồn kho</h2><div className="admin-form-grid"><label>Showroom<select><option>AURELIA Quận 1</option></select></label><label>Số lượng<input type="number" /></label></div></section>
      <section id="images"><h2>Hình ảnh</h2><div className="upload-drop">Kéo thả hình ảnh vào đây hoặc chọn từ máy tính<small>JPG, PNG, WebP — tối đa 10 MB</small></div></section>
      <section id="seo"><h2>SEO & xuất bản</h2><div className="admin-form-grid"><label>SEO title<input /></label><label>Slug<input /></label></div><label>Meta description<textarea rows={3} /></label></section>
      <footer><Button variant="outline" type="button">Lưu bản nháp</Button><Button type="submit">Lưu và xuất bản</Button></footer>
    </form>
  );
}
