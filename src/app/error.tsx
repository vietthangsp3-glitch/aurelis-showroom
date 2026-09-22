"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="system-page"><p className="eyebrow">Đã có lỗi xảy ra</p><h1>Chúng tôi chưa thể hoàn tất yêu cầu.</h1><p>Vui lòng thử lại. Nếu lỗi vẫn tiếp diễn, hãy liên hệ hotline 1900 1234.</p><Button onClick={reset}>Thử lại</Button></main>;
}
