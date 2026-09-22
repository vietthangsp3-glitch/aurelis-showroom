import { PrismaClient } from "@prisma/client";
import { brands, vehicles } from "../src/data/vehicles";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = process.env.ADMIN_SEED_PASSWORD_HASH;
  if (!passwordHash) {
    throw new Error("ADMIN_SEED_PASSWORD_HASH là bắt buộc để seed tài khoản quản trị.");
  }
  const admin = await prisma.user.upsert({
    where: { email: "admin@aurelia.vn" },
    update: {},
    create: { name: "Quản trị AURELIA", email: "admin@aurelia.vn", passwordHash, role: "ADMIN" },
  });

  const showroom = await prisma.showroom.upsert({
    where: { slug: "aurelia-quan-1" },
    update: {},
    create: {
      name: "AURELIA Quận 1",
      slug: "aurelia-quan-1",
      address: "88 Nguyễn Huệ, Phường Sài Gòn, TP. Hồ Chí Minh",
      city: "TP. Hồ Chí Minh",
      phone: "1900 1234",
      openingHours: "08:00–20:00, Thứ Hai–Chủ Nhật",
    },
  });

  for (const brandSeed of brands) {
    const brand = await prisma.brand.upsert({
      where: { slug: brandSeed.slug },
      update: { name: brandSeed.name },
      create: { name: brandSeed.name, slug: brandSeed.slug },
    });
    for (const item of vehicles.filter((vehicle) => vehicle.brandSlug === brandSeed.slug)) {
      const model = await prisma.vehicleModel.upsert({
        where: { slug: item.slug },
        update: { name: item.model },
        create: { brandId: brand.id, name: item.model, slug: item.slug },
      });
      await prisma.vehicle.upsert({
        where: { slug: item.slug },
        update: {},
        create: {
          id: `catalog-${item.id}`,
          modelId: model.id,
          slug: item.slug,
          year: item.year,
          bodyType: item.bodyType,
          segment: item.segment,
          fuelType: item.fuelType,
          seats: item.seats,
          description: item.description,
          exterior: item.exterior,
          interior: item.interior,
          technology: item.technology,
          safety: item.safety,
          seoTitle: `${item.brand} ${item.model} ${item.year}`,
          seoDescription: item.description,
          status: "PUBLISHED",
          publishedAt: new Date(),
          images: {
            create: item.gallery.map((url, index) => ({
              url,
              alt: `${item.brand} ${item.model} - ảnh ${index + 1}`,
              kind: index === 0 ? "COVER" : "GALLERY",
              position: index,
            })),
          },
          variants: {
            create: {
              id: item.id,
              name: item.variant,
              sku: `AR-${item.id.toUpperCase()}`,
              price: item.price,
              salePrice: item.salePrice,
              engine: item.engine,
              horsepower: item.horsepower,
              torque: item.torque,
              acceleration: item.acceleration,
              transmission: item.transmission,
              drivetrain: item.drivetrain,
              dimensions: item.dimensions,
              inventory: {
                create: {
                  showroomId: showroom.id,
                  color: "Đen Obsidian",
                  quantity: item.stock,
                  status: item.status,
                },
              },
            },
          },
        },
      });
    }
  }

  await prisma.promotion.upsert({
    where: { slug: "dac-quyen-lai-suat-thang-9" },
    update: {},
    create: {
      title: "Đặc quyền lãi suất tháng 9",
      slug: "dac-quyen-lai-suat-thang-9",
      description: "Lãi suất ưu đãi từ 0,99% cùng quà tặng bảo hiểm thân vỏ.",
      startsAt: new Date("2026-09-01"),
      endsAt: new Date("2026-09-30"),
      status: "PUBLISHED",
    },
  });

  for (const [index, item] of vehicles.slice(0, 6).entries()) {
    const submissionKey = `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
    await prisma.lead.upsert({
      where: { submissionKey },
      update: {},
      create: {
        name: ["Nguyễn Minh Hoàng", "Trần Thị Mai", "Lê Quang Huy", "Phạm Thu Trang", "Hoàng Anh Tuấn", "Vũ Minh Anh"][index]!,
        phone: `09000000${String(index).padStart(2, "0")}`,
        email: `lead${index + 1}@example.com`,
        variantId: item.id,
        brand: item.brand,
        interestType: index % 2 === 0 ? "QUOTE" : "TEST_DRIVE",
        preferredContactTime: "AFTERNOON",
        source: ["Google", "Facebook", "Website"][index % 3]!,
        status: index < 2 ? "NEW" : "CONTACTED",
        fingerprint: `seed-${index}`,
        submissionKey,
        assignedToId: admin.id,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
