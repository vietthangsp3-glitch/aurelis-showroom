import Link from "next/link";

export default function NotFound() {
  return <main className="system-page"><p className="eyebrow">404</p><h1>Hành trình này chưa tồn tại.</h1><p>Trang bạn tìm có thể đã được di chuyển hoặc không còn khả dụng.</p><Link href="/" className="button button--primary">Về trang chủ</Link></main>;
}
