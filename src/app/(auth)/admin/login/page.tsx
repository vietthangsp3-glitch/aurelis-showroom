import { BrandMark } from "@/components/shared/brand-mark";
import { LoginForm } from "@/features/auth/login-form";

export default function AdminLoginPage() {
  return (
    <main className="login-page">
      <div className="login-panel"><BrandMark admin /><p className="eyebrow">Hệ thống quản trị</p><h1>Chào mừng trở lại.</h1><p>Đăng nhập để quản lý xe, khách hàng tiềm năng và hoạt động showroom.</p><LoginForm /></div>
      <div className="login-image"><span>Không gian vận hành dành cho trải nghiệm khách hàng xuất sắc.</span></div>
    </main>
  );
}
