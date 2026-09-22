import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="shell footer-grid">
        <div>
          <BrandMark />
          <p>Không gian tuyển chọn xe đa thương hiệu dành cho những hành trình nhiều cảm hứng.</p>
        </div>
        <div>
          <strong>Khám phá</strong>
          <Link href="/cars">Xe mới</Link>
          <Link href="/compare">So sánh xe</Link>
          <Link href="/finance">Tài chính</Link>
        </div>
        <div>
          <strong>Hỗ trợ</strong>
          <Link href="/showroom">Hệ thống showroom</Link>
          <Link href="/privacy">Chính sách bảo mật</Link>
          <a href="tel:19001234">Hotline 1900 1234</a>
        </div>
        <div>
          <strong>Nhận bản tin</strong>
          <p>Ưu đãi và những mẫu xe mới, gửi vừa đủ.</p>
          <form className="newsletter">
            <input type="email" aria-label="Email nhận bản tin" placeholder="Email của bạn" />
            <button type="submit" aria-label="Đăng ký nhận bản tin">→</button>
          </form>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Aurelia Automotive.</span>
        <span>Kiến tạo những hành trình đáng nhớ.</span>
      </div>
    </footer>
  );
}
