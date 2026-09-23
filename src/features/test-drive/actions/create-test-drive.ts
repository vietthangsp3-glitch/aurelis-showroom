"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/database/prisma";
import {
  scheduledAtFromInput,
  testDriveSchema,
} from "@/features/test-drive/schemas/test-drive";
import { digestIdentifier } from "@/lib/security/digest";

export interface TestDriveActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function createTestDrive(
  _previousState: TestDriveActionState,
  formData: FormData,
): Promise<TestDriveActionState> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("host");
  try {
    if (origin && host && new URL(origin).host !== host) {
      return { ok: false, message: "Nguồn gửi yêu cầu không hợp lệ." };
    }
  } catch {
    return { ok: false, message: "Nguồn gửi yêu cầu không hợp lệ." };
  }

  const parsed = testDriveSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin đặt lịch.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let scheduledAt: Date;
  try {
    scheduledAt = scheduledAtFromInput(parsed.data);
  } catch {
    return {
      ok: false,
      message: "Thời gian lái thử phải nằm trong 90 ngày tới.",
    };
  }

  const forwardedFor =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown";
  const ipHash = digestIdentifier(forwardedFor);
  const fingerprint = digestIdentifier(
    `${parsed.data.phone}:${parsed.data.variantId}:${parsed.data.date}`,
  );
  const now = new Date();
  const bucketKey = `test-drive:${ipHash}:${now.toISOString().slice(0, 13)}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.rateLimitBucket.deleteMany({ where: { resetAt: { lt: now } } });
      const bucket = await tx.rateLimitBucket.upsert({
        where: { key: bucketKey },
        create: {
          key: bucketKey,
          count: 1,
          resetAt: new Date(now.getTime() + 60 * 60 * 1000),
        },
        update: { count: { increment: 1 } },
      });
      if (bucket.count > 5) throw new Error("RATE_LIMIT");

      const duplicate = await tx.lead.findFirst({
        where: {
          fingerprint,
          interestType: "TEST_DRIVE",
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
        select: { id: true },
      });
      if (duplicate) return { duplicate: true };
      const [variant, showroom] = await Promise.all([
        tx.vehicleVariant.findUnique({
          where: { id: parsed.data.variantId },
          include: {
            vehicle: { include: { model: { include: { brand: true } } } },
          },
        }),
        tx.showroom.findUnique({ where: { id: parsed.data.showroomId } }),
      ]);
      if (!variant || variant.vehicle.status !== "PUBLISHED" || !showroom) {
        throw new Error("INVALID_REFERENCE");
      }

      const lead = await tx.lead.create({
        data: {
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email || null,
          variantId: variant.id,
          brand: variant.vehicle.model.brand.name,
          interestType: "TEST_DRIVE",
          preferredContactTime: scheduledAt.toISOString(),
          note: parsed.data.note || null,
          source: parsed.data.source,
          landingPage: parsed.data.landingPage || null,
          referrer: parsed.data.referrer || null,
          status: "APPOINTMENT",
          fingerprint,
          submissionKey: parsed.data.submissionKey,
        },
      });
      await tx.testDriveBooking.create({
        data: {
          leadId: lead.id,
          variantId: variant.id,
          showroomId: showroom.id,
          scheduledAt,
          status: "PENDING",
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "TEST_DRIVE_REQUESTED",
          metadata: {
            showroomId: showroom.id,
            scheduledAt: scheduledAt.toISOString(),
          },
        },
      });

      return { duplicate: false };
    });

    return {
      ok: true,
      message: result.duplicate
        ? "Lịch lái thử này đã được ghi nhận trước đó."
        : "Đã ghi nhận lịch lái thử. Chuyên viên AURELIA sẽ xác nhận lại với bạn.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT") {
      return {
        ok: false,
        message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
      };
    }
    if (error instanceof Error && error.message === "INVALID_REFERENCE") {
      return {
        ok: false,
        message: "Xe hoặc showroom đã chọn không còn khả dụng.",
      };
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { ok: true, message: "Yêu cầu của bạn đã được ghi nhận." };
    }

    console.error("createTestDrive failed", error);
    return {
      ok: false,
      message: "Không thể tạo lịch lái thử lúc này. Vui lòng thử lại.",
    };
  }
}
