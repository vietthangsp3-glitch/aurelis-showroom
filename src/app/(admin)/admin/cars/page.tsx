import Image from "next/image";
import Link from "next/link";
import { Car, Copy, Eye, MoreHorizontal, Pencil, Search } from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { formatCurrency } from "@/lib/utils";
import { requireRole } from "@/lib/auth/session";

export default async function AdminCarsPage() {
  await requireRole(["ADMIN", "EDITOR"]);
  return (
    <div className="admin-page">
      <div className="admin-title"><div><p className="admin-breadcrumb">Trang chủ / Quản lý xe</p><h1>Quản lý xe</h1><p>Quản lý danh sách xe hiển thị trên website, tồn kho và trạng thái xuất bản.</p></div><Link href="/admin/cars/new" className="admin-button">＋ Thêm xe mới</Link></div>
      <section className="admin-metrics admin-metrics--cars"><article><Car /><span>Tổng số xe<strong>{vehicles.length}</strong><small>8 thương hiệu</small></span></article><article><Eye /><span>Đang hiển thị<strong>{vehicles.length - 4}</strong><small>↑ 5% so với tháng trước</small></span></article><article><Car /><span>Hết hàng<strong>4</strong><small>Cần cập nhật tồn kho</small></span></article><article><Copy /><span>Xe chờ xét duyệt<strong>3</strong><small>5% tổng danh mục</small></span></article></section>
      <section className="admin-card cars-panel">
        <div className="cars-toolbar"><label><Search size={16} /><input placeholder="Tìm kiếm theo tên xe, mã xe, hãng..." /></label><select><option>Hãng xe: Tất cả</option></select><select><option>Kiểu dáng: Tất cả</option></select><select><option>Trạng thái: Tất cả</option></select><button>Lọc nâng cao</button></div>
        <div className="cars-table">
          <div className="cars-table__row cars-table__head"><span>Xe</span><span>Hãng</span><span>Giá niêm yết</span><span>Năm</span><span>Tồn kho</span><span>Hiển thị</span><span>Lượt xem</span><span>Ngày cập nhật</span><span>Thao tác</span></div>
          {vehicles.slice(0, 12).map((vehicle, index) => <div className="cars-table__row" key={vehicle.id}><span className="car-cell"><input type="checkbox" aria-label={`Chọn ${vehicle.model}`} /><span className="car-thumb"><Image src={vehicle.image} alt="" fill sizes="70px" /></span><span><strong>{vehicle.model}</strong><small>AR-{String(index + 1).padStart(4, "0")}</small></span></span><span>{vehicle.brand}</span><span>{formatCurrency(vehicle.salePrice ?? vehicle.price)}</span><span>{vehicle.year}</span><span><b className={vehicle.stock <= 3 ? "stock low" : "stock"}>{vehicle.stock <= 3 ? "Sắp hết" : "Còn hàng"}</b></span><span><button className="toggle" aria-label="Thay đổi trạng thái hiển thị" aria-pressed={index % 5 !== 0}><i /></button></span><span>{(12453 - index * 633).toLocaleString("vi-VN")}</span><span>22/09/2026<small>10:{20 + index}</small></span><span className="row-actions"><Link href={`/admin/cars/${vehicle.id}/edit`} aria-label="Chỉnh sửa"><Pencil size={15} /></Link><button aria-label="Nhân bản"><Copy size={15} /></button><button aria-label="Thêm thao tác"><MoreHorizontal size={15} /></button></span></div>)}
        </div>
        <div className="table-pagination"><span>Hiển thị 1–12 của {vehicles.length} xe</span><div><button>‹</button><button className="active">1</button><button>2</button><button>3</button><button>›</button></div></div>
      </section>
    </div>
  );
}
