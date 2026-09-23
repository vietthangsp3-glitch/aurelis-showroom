# AURELIA Automotive Commerce Platform

AURELIA là nền tảng showroom ô tô đa thương hiệu, tập trung vào hành trình chuyển đổi từ khám phá xe đến tư vấn, lái thử và phương án tài chính. Giao diện public theo hướng premium automotive, còn khu vực admin tối ưu cho vận hành bán hàng.

## Tính năng chính

- Homepage cinematic, logo marquee và Smart Car Finder.
- Catalog 40 xe thuộc 8 thương hiệu, filter lưu trên URL.
- Trang chi tiết xe, gallery, thông số, xe liên quan và structured data.
- Lead modal lưu PostgreSQL, chống gửi lặp, honeypot và rate limit.
- So sánh tối đa 4 xe.
- Calculator trả góp theo công thức amortization.
- Admin dashboard, quản lý xe và form create/edit.
- Session authentication bằng signed JWT cookie và RBAC ADMIN, EDITOR, SALES.
- Sitemap, robots, metadata động và schema Product/Offer.

## Kiến trúc

Ứng dụng là modular monolith trên Next.js App Router:

    App Router
    ├── Storefront routes
    ├── Protected admin routes
    ├── Server Actions / Route Handlers
    └── Feature modules
        ├── vehicles
        ├── leads
        ├── compare
        ├── finance
        ├── auth
        └── admin
            └── Prisma → PostgreSQL

Server Components là mặc định. Client Components chỉ được dùng cho trạng thái giao diện như modal, filter, gallery, compare và calculator.

## Công nghệ

- Next.js 15, React 19, TypeScript strict
- Tailwind CSS và design tokens trong src/app/globals.css
- Prisma ORM và Neon PostgreSQL
- Zod, React Hook Form
- jose và bcrypt cho session authentication
- Vitest và Playwright
- Husky, lint-staged, ESLint và Prettier

## Cấu trúc

    src/
    ├── app/                 Routes, metadata và layouts
    ├── components/          UI, layout, storefront và admin components
    ├── data/                Catalog seed độc lập với UI
    ├── features/            Business modules
    ├── lib/                 Database, auth, analytics, security helpers
    └── types/
    prisma/
    ├── schema.prisma
    └── seed.ts
    tests/e2e/

## Cài đặt

Yêu cầu Node.js 20+ và pnpm.

    pnpm install
    cp .env.example .env.local
    pnpm exec prisma generate
    pnpm exec prisma migrate dev
    pnpm exec prisma db seed
    pnpm dev

Trên Windows, sao chép .env.example thủ công thành .env.local.

## Biến môi trường

- DATABASE_URL: Neon pooled connection string có hostname chứa -pooler, dùng cho runtime trên Vercel.
- DIRECT_URL: Neon direct connection string không có -pooler, dùng cho migration và Prisma Studio.
- SESSION_SECRET: chuỗi ngẫu nhiên tối thiểu 32 ký tự, dùng ký và xác minh session.
- IP_HASH_SECRET: secret độc lập tối thiểu 32 ký tự, dùng HMAC địa chỉ mạng và fingerprint chống spam.
- ADMIN_SEED_PASSWORD_HASH: bcrypt hash được lưu cho tài khoản admin trong database khi chạy seed.
- REQUIRE_ADMIN_MFA, ADMIN_TOTP_SECRET: bật và cấu hình TOTP cho tài khoản ADMIN trên production.
- ALLOWED_MEDIA_HOSTS: danh sách hostname HTTPS bổ sung được phép dùng cho ảnh/brochure, phân tách bằng dấu phẩy.
- NEXT_PUBLIC_SITE_URL: canonical production URL.
- NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_CLARITY_ID: analytics tùy chọn.
- CLOUDINARY_*: media production.

Không đặt mật khẩu plaintext hoặc secret vào repository. Hãy tạo bcrypt hash bằng công cụ nội bộ đáng tin cậy và lưu trong secret manager của môi trường triển khai.

## Database và seed

Database production sử dụng Neon PostgreSQL. DATABASE_URL đi qua Neon connection pooler để tránh cạn kết nối khi Vercel scale; DIRECT_URL kết nối trực tiếp cho Prisma CLI.

Schema gồm Brand, VehicleModel, Vehicle, VehicleVariant, VehicleImage, Inventory, Lead, LeadActivity, TestDriveBooking, Promotion, Article, Showroom, Media và AuditLog.

Seed tạo 8 hãng, 40 xe, showroom, promotion, leads mẫu và một admin. ADMIN_SEED_PASSWORD_HASH là bắt buộc.

    pnpm exec prisma migrate dev --name init
    pnpm exec prisma db seed

## Kiểm tra chất lượng

    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm test:e2e
    pnpm build

Unit tests bao phủ finance calculation, vehicle filters và RBAC. Playwright bao phủ browse/filter/detail, compare, finance, lead validation và admin protection.

## Security

- Validation tại server boundary bằng Zod.
- Cookie session HttpOnly, Secure production, SameSite=Lax.
- RBAC được kiểm tra server-side.
- Origin check cho mutation, rate limit, honeypot và duplicate lead detection.
- Prisma parameterization chống SQL injection.
- Security headers và robots chặn admin/API indexing.
- AuditLog sẵn sàng ghi cùng transaction cho mutation admin.

## SEO và hiệu năng

- Metadata động, canonical, sitemap và robots.
- Product/Offer structured data cho trang xe.
- next/image với AVIF/WebP, responsive sizes và lazy loading.
- Server Components giúp giảm JavaScript gửi xuống trình duyệt.
- Animation tôn trọng prefers-reduced-motion.

## Triển khai

Hạ tầng mục tiêu là Vercel cho Next.js, Neon PostgreSQL và Cloudinary cho media.

Trong Neon Console, chọn Connect và sao chép riêng pooled URL cùng direct URL. Đặt cả DATABASE_URL và DIRECT_URL trong Vercel Environment Variables; không commit hai giá trị này.

Chạy migration production bằng prisma migrate deploy, sau đó deploy lên Vercel. Không chạy seed production nếu không chủ động muốn thêm dữ liệu mẫu.
