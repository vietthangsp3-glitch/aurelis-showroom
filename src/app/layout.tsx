import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./test-drive.css";

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "AURELIA — Tuyển chọn xe đa thương hiệu",
    template: "%s | AURELIA",
  },
  description:
    "Khám phá, so sánh và nhận tư vấn các mẫu xe được tuyển chọn từ tám thương hiệu hàng đầu.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
