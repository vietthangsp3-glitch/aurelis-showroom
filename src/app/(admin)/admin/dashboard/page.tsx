import Link from "next/link";
import { ArrowUpRight, CalendarDays, Car, TrendingUp, UserRoundCheck, Users } from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { requireRole } from "@/lib/auth/session";

const recentLeads = [
  ["Nguyễn Minh Hoàng", "Mercedes-Benz GLC 300", "Google", "Mới", "14:21"],
  ["Trần Thị Mai", "BMW X5 xDrive40i", "Facebook", "Đã liên hệ", "11:04"],
  ["Lê Quang Huy", "Lexus RX 350", "Website", "Đang tư vấn", "09:42"],
  ["Phạm Thu Trang", "VinFast VF 9", "Zalo", "Chốt lịch", "Hôm qua"],
];

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN", "EDITOR", "SALES"]);
  return (
    <div className="admin-page">
      <div className="admin-title"><div><h1>Tổng quan</h1><p>Theo dõi hiệu suất kinh doanh và quản lý hoạt động showroom AURELIA.</p></div><div><Link href="/admin/cars/new" className="admin-button">＋ Thêm xe mới</Link><button className="admin-button admin-button--light">Xuất báo cáo</button></div></div>
      <section className="admin-metrics">
        <article><Users /><span>Leads hôm nay<strong>28</strong><small>↑ 27% so với hôm qua</small></span></article>
        <article><UserRoundCheck /><span>Tổng yêu cầu trong tháng<strong>482</strong><small>↑ 12% so với tháng trước</small></span></article>
        <article><TrendingUp /><span>Tỷ lệ chuyển đổi<strong>18,6%</strong><small>↑ 3,2% so với tháng trước</small></span></article>
        <article><Car /><span>Xe đang hiển thị<strong>{vehicles.length}</strong><small>8 thương hiệu</small></span></article>
      </section>
      <section className="dashboard-grid">
        <article className="admin-card lead-chart"><div className="admin-card__title"><strong>Hiệu suất yêu cầu tư vấn</strong><select><option>30 ngày qua</option></select></div><svg viewBox="0 0 800 240" role="img" aria-label="Biểu đồ yêu cầu tư vấn tăng dần trong 30 ngày"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c69a45" stopOpacity=".3"/><stop offset="1" stopColor="#c69a45" stopOpacity="0"/></linearGradient></defs><path d="M10 202 L55 188 L100 194 L145 160 L190 172 L235 143 L280 164 L325 123 L370 138 L415 98 L460 130 L505 82 L550 102 L595 52 L640 88 L685 126 L730 76 L790 60 L790 225 L10 225 Z" fill="url(#area)"/><polyline points="10,202 55,188 100,194 145,160 190,172 235,143 280,164 325,123 370,138 415,98 460,130 505,82 550,102 595,52 640,88 685,126 730,76 790,60" fill="none" stroke="#bd9140" strokeWidth="3"/></svg></article>
        <article className="admin-card source-card"><div className="admin-card__title"><strong>Nguồn khách hàng</strong></div><div className="donut"><span><strong>482</strong> tổng lead</span></div><ul><li>Google <b>38%</b></li><li>Facebook <b>24%</b></li><li>Zalo <b>16%</b></li><li>Trực tiếp <b>12%</b></li></ul></article>
        <article className="admin-card recent-leads"><div className="admin-card__title"><strong>Yêu cầu gần đây</strong><Link href="/admin/leads">Xem tất cả →</Link></div><div className="admin-table"><div className="admin-table__row admin-table__head"><span>Khách hàng</span><span>Xe quan tâm</span><span>Nguồn</span><span>Trạng thái</span><span>Thời gian</span></div>{recentLeads.map((row) => <div className="admin-table__row" key={row[0]}>{row.map((cell, index) => <span key={cell} className={index === 3 ? "status-pill" : ""}>{cell}</span>)}</div>)}</div></article>
        <article className="admin-card interest-list"><div className="admin-card__title"><strong>Mẫu xe được quan tâm nhiều</strong></div>{vehicles.slice(0, 4).map((vehicle, index) => <Link key={vehicle.id} href={`/cars/${vehicle.slug}`}><b>0{index + 1}</b><span>{vehicle.brand} {vehicle.model}<small>{80 - index * 13} yêu cầu</small></span><ArrowUpRight size={16} /></Link>)}</article>
        <article className="admin-card appointments"><div className="admin-card__title"><strong>Lịch hẹn hôm nay</strong><CalendarDays size={18} /></div>{recentLeads.slice(0, 3).map((lead, index) => <div key={lead[0]}><time>{9 + index * 2}:00</time><span><strong>{lead[0]}</strong><small>{lead[1]}</small></span><b>{index === 1 ? "Sắp diễn ra" : "Đã xác nhận"}</b></div>)}</article>
      </section>
    </div>
  );
}
