import type { Metadata } from "next";
export const metadata: Metadata = { title: "Chính sách bảo mật" };
export default function PrivacyPage() {
  return <article className="legal-page shell"><p className="eyebrow">Chính sách</p><h1>Bảo mật thông tin khách hàng</h1><p>AURELIA chỉ thu thập thông tin cần thiết để tư vấn, cung cấp dịch vụ và cải thiện trải nghiệm của bạn.</p><h2>Thông tin được thu thập</h2><p>Họ tên, số điện thoại, email, mẫu xe quan tâm và thông tin nguồn truy cập khi bạn chủ động gửi yêu cầu.</p><h2>Mục đích sử dụng</h2><p>Thông tin được dùng để phản hồi yêu cầu, sắp xếp lịch lái thử, chuẩn bị báo giá và phương án tài chính.</p><h2>Quyền của bạn</h2><p>Bạn có thể yêu cầu truy cập, điều chỉnh hoặc xóa thông tin bằng cách liên hệ hotline 1900 1234.</p></article>;
}
