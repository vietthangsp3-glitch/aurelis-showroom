import type { Metadata } from "next";
import { prisma } from "@/lib/database/prisma";
import { getCatalogVehicles } from "@/lib/database/catalog";
import { TestDriveForm } from "@/features/test-drive/components/test-drive-form";

export const metadata: Metadata = {
  title: "Đăng ký lái thử | AURELIA",
  description:
    "Chọn mẫu xe, showroom và thời gian phù hợp để đăng ký lái thử cùng AURELIA.",
};

export default async function TestDrivePage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const [{ vehicle }, catalog, showrooms] = await Promise.all([
    searchParams,
    getCatalogVehicles(),
    prisma.showroom.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const vehicles = catalog.map((item) => ({
    id: item.id,
    label: `${item.brand} ${item.model} — ${item.variant}`,
  }));
  const initialVehicleId = vehicles.some((item) => item.id === vehicle)
    ? vehicle
    : undefined;

  return (
    <main className="test-drive-page">
      <section className="shell test-drive-hero">
        <div>
          <p className="eyebrow">Trải nghiệm thực tế</p>
          <h1>Đặt lịch lái thử</h1>
          <p>
            Chọn mẫu xe, showroom và khung giờ phù hợp. Chuyên viên AURELIA sẽ
            liên hệ xác nhận trước khi lịch được hoàn tất.
          </p>
        </div>
        <div className="test-drive-trust">
          <span>Xác nhận lịch trước khi đến</span>
          <span>Không phát sinh chi phí đăng ký</span>
          <span>Thông tin được bảo mật</span>
        </div>
      </section>
      <section className="shell test-drive-content">
        <TestDriveForm
          vehicles={vehicles}
          showrooms={showrooms}
          initialVehicleId={initialVehicleId}
        />
      </section>
    </main>
  );
}
